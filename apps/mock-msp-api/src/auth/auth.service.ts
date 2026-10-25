import { ConflictException, ForbiddenException, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseService } from '../database/database.service';

const scryptAsync = promisify(scrypt);
export type AuthRole = 'admin' | 'user';
export type AuthPrincipal = { id: string; email: string; role: AuthRole };
type StoredUser = { id: string; email: string; password_salt: string; password_hash: string; role: AuthRole; created_at: string; last_login: string | null };

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async onModuleInit() {
    const count = this.database.db.prepare('SELECT COUNT(*) AS count FROM auth_users').get() as { count?: number } | undefined;
    if (Number(count?.count || 0) > 0) return;
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!email || !password) throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD before starting the mock API for the first time.');
    this.validateCredentials(email, password);
    await this.insertUser(email, password, 'admin');
  }

  async login(emailInput: unknown, passwordInput: unknown) {
    const email = typeof emailInput === 'string' ? emailInput.trim().toLowerCase() : '';
    const password = typeof passwordInput === 'string' ? passwordInput : '';
    const user = this.database.db.prepare('SELECT * FROM auth_users WHERE email = ?').get(email) as StoredUser | undefined;
    if (!user || !await this.verifyPassword(password, user.password_salt, user.password_hash)) throw new UnauthorizedException('Email or password is incorrect.');
    this.database.db.prepare('UPDATE auth_users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), user.id);
    return this.issueKey({ id: user.id, email: user.email, role: user.role });
  }

  authenticate(apiKey: string): AuthPrincipal {
    const tokenHash = this.hashApiKey(apiKey);
    const row = this.database.db.prepare(
      'SELECT t.id AS token_id, t.expires_at, u.id, u.email, u.role FROM api_tokens t JOIN auth_users u ON u.id = t.user_id WHERE t.token_hash = ?',
    ).get(tokenHash) as (AuthPrincipal & { token_id: string; expires_at: string }) | undefined;
    if (!row || Date.parse(row.expires_at) <= Date.now()) {
      if (row) this.database.db.prepare('DELETE FROM api_tokens WHERE id = ?').run(row.token_id);
      throw new UnauthorizedException('A valid X-API-Key is required.');
    }
    return { id: row.id, email: row.email, role: row.role };
  }

  async changePassword(user: AuthPrincipal, currentPassword: unknown, newPassword: unknown) {
    const stored = this.database.db.prepare('SELECT * FROM auth_users WHERE id = ?').get(user.id) as StoredUser | undefined;
    if (!stored || !await this.verifyPassword(String(currentPassword || ''), stored.password_salt, stored.password_hash)) throw new UnauthorizedException('Current password is incorrect.');
    this.validateCredentials(stored.email, newPassword);
    const salt = randomBytes(16).toString('hex');
    const passwordHash = await this.hashPassword(String(newPassword), salt);
    this.database.db.prepare('UPDATE auth_users SET password_salt = ?, password_hash = ? WHERE id = ?').run(salt, passwordHash, user.id);
    this.database.db.prepare('DELETE FROM api_tokens WHERE user_id = ?').run(user.id);
    return this.issueKey(user);
  }

  async addUser(requester: AuthPrincipal, input: { email?: unknown; password?: unknown; role?: unknown }) {
    this.requireAdmin(requester);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const role = input.role === 'admin' ? 'admin' : 'user';
    this.validateCredentials(email, input.password);
    const user = await this.insertUser(email, String(input.password), role);
    return { id: user.id, email: user.email, role: user.role, createdAt: user.created_at };
  }

  listUsers(requester: AuthPrincipal) {
    this.requireAdmin(requester);
    const rows = this.database.db.prepare('SELECT id, email, role, created_at, last_login FROM auth_users ORDER BY email').all() as Array<{ id: string; email: string; role: AuthRole; created_at: string; last_login: string | null }>;
    return rows.map((row) => ({ id: row.id, email: row.email, role: row.role, createdAt: row.created_at, lastLogin: row.last_login }));
  }

  deleteUser(requester: AuthPrincipal, userId: string) {
    this.requireAdmin(requester);
    if (userId === requester.id) throw new ForbiddenException('Use a different administrator account to remove this user.');
    const target = this.database.db.prepare('SELECT id, role FROM auth_users WHERE id = ?').get(userId) as { id: string; role: AuthRole } | undefined;
    if (!target) return false;
    if (target.role === 'admin') {
      const count = this.database.db.prepare("SELECT COUNT(*) AS count FROM auth_users WHERE role = 'admin'").get() as { count?: number } | undefined;
      if (Number(count?.count || 0) <= 1) throw new ForbiddenException('The last administrator cannot be removed.');
    }
    this.database.db.prepare('DELETE FROM auth_users WHERE id = ?').run(userId);
    return true;
  }

  currentUser(user: AuthPrincipal) {
    const row = this.database.db.prepare('SELECT id, email, role, created_at, last_login FROM auth_users WHERE id = ?').get(user.id) as { id: string; email: string; role: AuthRole; created_at: string; last_login: string | null } | undefined;
    if (!row) throw new UnauthorizedException('The account no longer exists.');
    return { id: row.id, email: row.email, role: row.role, createdAt: row.created_at, lastLogin: row.last_login };
  }

  private async insertUser(email: string, password: string, role: AuthRole): Promise<StoredUser> {
    const salt = randomBytes(16).toString('hex');
    const passwordHash = await this.hashPassword(password, salt);
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    try {
      this.database.db.prepare('INSERT INTO auth_users (id, email, password_salt, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, email, salt, passwordHash, role, createdAt);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('unique')) throw new ConflictException('An account with this email already exists.');
      throw error;
    }
    return { id, email, password_salt: salt, password_hash: passwordHash, role, created_at: createdAt, last_login: null };
  }

  private async issueKey(user: AuthPrincipal) {
    const key = randomBytes(32).toString('base64url');
    const ttlDays = Math.max(1, Math.min(365, Number.parseInt(process.env.API_KEY_TTL_DAYS || '30', 10) || 30));
    const expiresAt = new Date(Date.now() + ttlDays * 86400000).toISOString();
    this.database.db.prepare('INSERT INTO api_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)').run(randomUUID(), user.id, this.hashApiKey(key), expiresAt, new Date().toISOString());
    return { apiKey: key, headerName: 'X-API-Key', expiresAt, user: this.currentUser(user) };
  }

  private hashApiKey(key: string) { return createHash('sha256').update(key).digest('hex'); }

  private async hashPassword(password: string, salt: string) {
    const derived = await scryptAsync(password, salt, 64) as Buffer;
    return derived.toString('hex');
  }

  private async verifyPassword(password: string, salt: string, expectedHex: string) {
    const actual = Buffer.from(await this.hashPassword(password, salt), 'hex');
    const expected = Buffer.from(expectedHex, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private validateCredentials(email: string, password: unknown): asserts password is string {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ConflictException('A valid email address is required.');
    if (typeof password !== 'string' || password.length < 12) throw new ConflictException('Passwords must be at least 12 characters long.');
  }

  private requireAdmin(user: AuthPrincipal) {
    if (user.role !== 'admin') throw new ForbiddenException('Administrator API key required.');
  }
}
