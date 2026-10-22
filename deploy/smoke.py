"""Checks only a disposable local Docker stack, never a remote deployment."""
import http.cookiejar
import json
import ssl
import sys
import urllib.error
import urllib.request

BASE = 'https://localhost:18443'
# Caddy's local CA is intentionally isolated from the machine trust store.
context = ssl._create_unverified_context()
jar = http.cookiejar.CookieJar()
client = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(jar),
    urllib.request.HTTPSHandler(context=context),
)
credentials = {'email': 'docker-smoke@example.com', 'password': 'SmokeTest123!'}


def call(path, method='GET', payload=None, origin=BASE):
    request = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        method=method,
        headers={'Origin': origin, 'Content-Type': 'application/json'},
    )
    try:
        with client.open(request, timeout=20) as response:
            body = response.read()
            return response.status, body, response.headers
    except urllib.error.HTTPError as error:
        return error.code, error.read(), error.headers


if '--check-persistence' in sys.argv:
    assert call('/api/auth/sign-in', 'POST', credentials)[0] == 200
    assert call('/api/auth/me')[0] == 200
    print('PASS: user data survived a MongoDB container restart')
else:
    assert call('/api/health')[0] == 200
    for path in ['/', '/sign-in', '/sign-up']:
        status, body, _ = call(path)
        assert status == 200 and b'<div id="root">' in body
    assert call('/api/auth/me')[0] == 401
    assert call('/api/auth/sign-up', 'POST', {**credentials, 'name': 'Docker Smoke User'})[0] == 201
    status, _, headers = call('/api/auth/sign-in', 'POST', credentials)
    assert status == 200
    assert 'HttpOnly' in headers['Set-Cookie'] and 'Secure' in headers['Set-Cookie']
    assert call('/api/auth/me')[0] == 200
    assert call('/api/auth/application')[0] == 200
    assert call('/api/auth/sign-out', 'POST', origin='https://invalid.example')[0] == 403
    assert call('/api/auth/sign-out', 'POST')[0] == 204
    assert call('/api/auth/me')[0] == 401
    print('PASS: SPA routing, HTTPS proxy, secure cookies, registration, login, protected API, CSRF and logout')
