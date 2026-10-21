import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const OPTIONS = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, OPTIONS, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

@Injectable()
export class PasswordService implements OnModuleInit {
  private dummyHash: string;

  async onModuleInit() {
    this.dummyHash = await this.hash(randomBytes(32).toString('hex'));
  }

  async hash(password: string) {
    const salt = randomBytes(16);
    const key = await derive(password, salt);
    return `scrypt$v1$${salt.toString('hex')}$${key.toString('hex')}`;
  }

  async verify(password: string, storedHash?: string) {
    const hash = storedHash ?? this.dummyHash;
    const [algorithm, version, saltHex, keyHex] = hash.split('$');
    if (algorithm !== 'scrypt' || version !== 'v1' || !saltHex || !keyHex)
      return false;
    const key = await derive(password, Buffer.from(saltHex, 'hex'));
    const expected = Buffer.from(keyHex, 'hex');
    return (
      key.length === expected.length &&
      timingSafeEqual(key, expected) &&
      storedHash !== undefined
    );
  }
}
