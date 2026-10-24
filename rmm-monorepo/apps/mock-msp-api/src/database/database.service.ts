import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createFakeDataset } from '../resources/fake-data';
import type { ODataRecord, ResourceName } from '../resources/resource-types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly db: DatabaseSync;

  constructor() {
    const filePath = process.env.MOCK_DB_PATH || resolve(process.cwd(), 'data', 'msp-mock.sqlite');
    if (filePath !== ':memory:') mkdirSync(dirname(resolve(filePath)), { recursive: true });
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS mock_records (resource TEXT NOT NULL CHECK(resource IN ('users','tickets','company','contacts','customers','issueTypes','locations','serviceItems','ticketCustomStatuses')), id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(resource, id)); " +
      "CREATE TABLE IF NOT EXISTS auth_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_salt TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','user')), created_at TEXT NOT NULL, last_login TEXT); " +
      'CREATE TABLE IF NOT EXISTS api_tokens (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL); ' +
      'CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);',
    );
  }

  onModuleInit() {
    const row = this.db.prepare('SELECT COUNT(*) AS count FROM mock_records').get() as { count?: number } | undefined;
    if (Number(row?.count || 0) > 0) return;
    const insert = this.db.prepare('INSERT INTO mock_records (resource, id, payload) VALUES (?, ?, ?)');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const item of createFakeDataset()) insert.run(item.resource, item.id, JSON.stringify(item.data));
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  onModuleDestroy() { this.db.close(); }

  list(resource: ResourceName): ODataRecord[] {
    const rows = this.db.prepare('SELECT payload FROM mock_records WHERE resource = ? ORDER BY rowid').all(resource) as Array<{ payload: string }>;
    return rows.map((row) => JSON.parse(row.payload) as ODataRecord);
  }

  get(resource: ResourceName, id: string): ODataRecord | undefined {
    const row = this.db.prepare('SELECT payload FROM mock_records WHERE resource = ? AND id = ?').get(resource, id) as { payload: string } | undefined;
    return row ? JSON.parse(row.payload) as ODataRecord : undefined;
  }

  save(resource: ResourceName, id: string, data: ODataRecord): void {
    this.db.prepare('INSERT INTO mock_records (resource, id, payload) VALUES (?, ?, ?) ON CONFLICT(resource, id) DO UPDATE SET payload = excluded.payload').run(resource, id, JSON.stringify(data));
  }

  delete(resource: ResourceName, id: string): boolean {
    return this.db.prepare('DELETE FROM mock_records WHERE resource = ? AND id = ?').run(resource, id).changes > 0;
  }
}
