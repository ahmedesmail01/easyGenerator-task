# Hostinger production deployment

Target: **https://easygenerator.ahmed-esmail.tech** on **186.240.155.111**.

This setup hosts the client, NestJS API, and MongoDB on one VPS. It does not import the database from your laptop automatically. Use an x86-64 Ubuntu/Debian VPS; 2 vCPU and 4 GB RAM are recommended for MongoDB plus memory-hard password hashing. Allow disk space for database growth, backups, and at least two releases of Docker images.

## Architecture

- On this VPS, the existing host Nginx terminates HTTPS using Certbot and proxies this domain to Caddy at `127.0.0.1:3020`. Caddy serves React and proxies `/api/*` to NestJS. Other Nginx sites remain independent.
- On a dedicated server without an existing proxy, the base Compose file supports Caddy automatic HTTPS.
- Only ports 80 and 443 are published. MongoDB 27017 and API 3000 are private to Docker.
- MongoDB uses a named persistent volume, root authentication, and a separate application user with `readWrite` access only to `easygenerator`.
- Passwords are generated on the VPS and mounted as Compose secrets. They are never part of image builds or GitHub artifacts.
- Caddy certificates are stored in persistent volumes. Deployments and rollbacks do not delete database/certificate volumes.
- The API runs as a non-root user, with a read-only filesystem, dropped Linux capabilities, and a readiness check that pings MongoDB. It trusts exactly one reverse-proxy hop; never expose its container port directly to the internet.
- One Compose project, `easygenerator`, is reused across release directories. This is a single-VPS deployment with brief container replacement downtime, not a zero-downtime or high-availability design.

## 1. DNS in Hostinger

Open **Domains → ahmed-esmail.tech → DNS / Nameservers** and add:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `easygenerator` | `186.240.155.111` | Default or 300 |

Do not change the nameservers or the root domain's existing records. Remove a conflicting CNAME for this exact subdomain if one exists. Do not add an AAAA record unless the VPS also has working public IPv6. An incorrect AAAA can break HTTPS validation even if the A record is correct.

```sh
dig +short easygenerator.ahmed-esmail.tech A
```

The result must be the VPS IP before deploying. Allow inbound TCP 80/443 and the actual SSH port in both the Hostinger firewall and the OS firewall. UDP 443 is optional for HTTP/3. Keep the existing SSH session open when adjusting firewall rules. If another app already uses ports 80/443, integrate this domain into that reverse proxy instead of stopping it or starting a second proxy.

## 2. Initial VPS preparation

Use Hostinger's VPS browser terminal or SSH. If SSH credentials are forgotten, authorize a new public key through the browser terminal rather than sharing the root password. Never paste a private key into chat or commit it.

First inspect existing services, OS, architecture, disk, and ports; this deployment must not overwrite another hosted application. Install Git if needed, clone this repository, and run the official-repository Docker installer if Docker is not already present:

```sh
git clone https://github.com/ahmedesmail01/easyGenerator-task.git
cd easyGenerator-task
sudo bash deploy/install-docker.sh
```

Prefer a dedicated SSH account such as `deploy`. Docker group membership is effectively root-level access: protect this SSH key accordingly. Provision the account and its public key, then give it access to its own deployment directory:

```sh
# Replace deploy if using a different, existing deployment account.
sudo mkdir -p /opt/easygenerator
sudo chown deploy:deploy /opt/easygenerator
sudo usermod -aG docker deploy
```

Reconnect as the deployment account so its Docker group membership takes effect. Then, from the checkout:

```sh
bash deploy/init.sh --host-nginx
nano /opt/easygenerator/shared/.env
```

Verify `DOMAIN` and `SHARED_DIR`. For this VPS, bootstrap a new HTTP-only site with the ACME location from `deploy/nginx.conf`. Obtain a certificate with Certbot webroot `/var/www/easygenerator-acme` once DNS resolves, then install the complete `deploy/nginx.conf`, test with `nginx -t`, and reload Nginx. Certbot renewal must reload Nginx. The `--host-nginx` marker enables `compose.nginx.yml`, keeping Caddy bound to localhost. `init.sh` is idempotent: it does not regenerate existing database passwords. Do not regenerate or edit password files after the MongoDB volume has initialized; password rotation requires updating the MongoDB users too.

The shared directory is mode 0700. Secret files inside are readable by their intended non-root containers through mounted secret paths; they cannot be reached by other host users through the protected parent directory.

## 3. GitHub Actions configuration

Repository: `ahmedesmail01/easyGenerator-task`.

Create a GitHub environment named **production**. Add these environment or repository secrets:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | `186.240.155.111` |
| `VPS_USER` | Your deployment SSH account, preferably `deploy` |
| `VPS_PORT` | SSH port; optional, defaults to `22` |
| `VPS_SSH_KEY` | The dedicated CI private key authorized for that account |
| `VPS_KNOWN_HOSTS` | Verified SSH host-key lines for this VPS |

Verify the host-key fingerprint using a trusted existing SSH connection or Hostinger's console before trusting an `ssh-keyscan` result. The workflow uses strict host-key checking and does not blindly accept unknown host keys.

Add a **repository variable** (not an environment-only variable) named `DEPLOY_ENABLED` with value `true` only after DNS, server access, secrets, and shared configuration are ready. Without it, CI still runs but deployment is skipped.

The workflow `.github/workflows/deploy.yml`:

1. Runs client lint/build and server lint/build/unit/MongoDB integration tests.
2. Builds production images using frozen lockfiles, smoke-tests the complete disposable HTTPS/API/MongoDB stack (including persistence across a database restart), and generates a release artifact without `.env` files.
3. Transfers those exact tested images and deployment scripts over SSH. No container-registry credentials are needed.
4. Starts the stack, waits for container health, and checks the public HTTPS API.
5. Points `/opt/easygenerator/current` to the new release only on success. On failure, attempts to restore the previous application images.

Push to `main` or manually run the workflow on `main`. Pull requests run checks without deployment secrets. Deployments are serialized. Action dependencies are pinned to commit SHAs. Restrict the production environment to the `main` branch in GitHub settings.

## 4. Verify the live site

```sh
curl --fail https://easygenerator.ahmed-esmail.tech/api/health
# Expected: {"status":"ok"}
```

Open `/sign-up`, create a test account, sign in, reload `/`, and sign out. Verify that the cookie is HttpOnly and Secure. The frontend always builds against `/api`, so no localhost address or database credentials appear in the production browser bundle. Caddy preserves the browser Origin for the server's CSRF check.

The root page requires authentication. Authenticated users visiting sign-in/sign-up return to `/`. The API's readiness route is public but returns no database details or credentials.

## Operations

From the deployment account on the VPS:

```sh
cd /opt/easygenerator/current
export IMAGE_TAG=$(basename "$(pwd -P)")
# The shared env file contains only operational settings, not database passwords.
bash deploy/compose.sh ps
bash deploy/compose.sh logs --tail=100 api web
```

Never run `docker compose down -v` for this production project: that deletes persistent volumes. Do not run global Docker pruning commands on a VPS hosting other applications. Retain the current and previous release's images for rollback; remove older application-specific image tags and release directories deliberately when disk usage needs it. Keep OS and Docker patched, and review/pull supported MongoDB 8.0 patch releases during planned maintenance.

### Backups

```sh
bash /opt/easygenerator/current/deploy/backup.sh
```

This creates a compressed MongoDB archive in `/opt/easygenerator/shared/backups` and retains this application's completed archives for 14 days. To schedule it daily, add a crontab entry for the deployment account:

```cron
17 2 * * * /bin/bash /opt/easygenerator/current/deploy/backup.sh >> /opt/easygenerator/shared/backup.log 2>&1
```

This is 02:17 in the VPS timezone. Copy backups to a separate machine or storage account; a backup on the same VPS does not protect against VPS loss. Back up the shared secrets/configuration separately and securely. Test restoration in a separate MongoDB instance before relying on backups. The script backs up only `easygenerator`, not admin credentials; a restored deployment must provision its database user with the corresponding secret. Enable Hostinger snapshots as an additional recovery layer if included in the plan; no paid backup service is enabled automatically.

### Rollback

Choose an existing previous release SHA whose images are still present:

```sh
cd /opt/easygenerator/releases/PREVIOUS_SHA
IMAGE_TAG=PREVIOUS_SHA docker compose --env-file /opt/easygenerator/shared/.env -f deploy/compose.yml -f deploy/compose.nginx.yml up -d --wait
curl --fail https://easygenerator.ahmed-esmail.tech/api/health
ln -sfn /opt/easygenerator/releases/PREVIOUS_SHA /opt/easygenerator/current
```

Rollback changes application containers, not database contents. Future incompatible database changes need a separate migration/backup plan. Secret/password rotation is independent of application release rollback.

## References

- [Docker Compose production](https://docs.docker.com/compose/how-tos/production/)
- [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/)
- [GitHub deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments)
- [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https)
