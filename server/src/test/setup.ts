import path from 'node:path';
import { execSync } from 'node:child_process';

const prismaDir = path.resolve(__dirname, '../../prisma');
const testDb = path.join(prismaDir, 'test-integration.db');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret';
process.env.DATABASE_URL = `file:${testDb}`;

execSync('npx prisma db push --skip-generate', {
  cwd: path.resolve(__dirname, '../..'),
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  stdio: 'ignore',
});
