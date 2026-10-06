/* ── OLV Data Access Layer ──
 *
 * Development implementation using JSON files.
 * The abstraction boundary is clean — swap to Postgres/Mongo/Firebase by
 * replacing only this file.
 */

import fs from 'fs';
import path from 'path';
import type { OLVUser, OLVUsageRecord, OLVVerificationRecord } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'olv');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(file: string, fallback: T): T {
  ensureDir();
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(file: string, data: T): void {
  ensureDir();
  const fp = path.join(DATA_DIR, file);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Users ──

export function getAllUsers(): OLVUser[] {
  return readJSON<OLVUser[]>('users.json', []);
}

export function getUserById(id: string): OLVUser | undefined {
  return getAllUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): OLVUser | undefined {
  return getAllUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(user: OLVUser): void {
  const users = getAllUsers();
  users.push(user);
  writeJSON('users.json', users);
}

export function updateUser(id: string, updates: Partial<OLVUser>): void {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJSON('users.json', users);
}

// ── Usage ──

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getUsage(userId: string): OLVUsageRecord {
  const month = currentMonth();
  const all = readJSON<OLVUsageRecord[]>('usage.json', []);
  const record = all.find((r) => r.userId === userId && r.month === month);
  return record || { userId, month, count: 0 };
}

export function incrementUsage(userId: string): OLVUsageRecord {
  const month = currentMonth();
  const all = readJSON<OLVUsageRecord[]>('usage.json', []);
  const idx = all.findIndex((r) => r.userId === userId && r.month === month);
  if (idx >= 0) {
    all[idx].count++;
  } else {
    all.push({ userId, month, count: 1 });
  }
  writeJSON('usage.json', all);
  return all[idx >= 0 ? idx : all.length - 1];
}

// ── Verification History ──

export function getHistory(userId: string): OLVVerificationRecord[] {
  const all = readJSON<OLVVerificationRecord[]>('history.json', []);
  return all
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addHistoryRecord(record: OLVVerificationRecord): void {
  const all = readJSON<OLVVerificationRecord[]>('history.json', []);
  all.push(record);
  writeJSON('history.json', all);
}

// ── Admin / Analytics (foundation) ──

export function getAdminStats() {
  const users = getAllUsers();
  const history = readJSON<OLVVerificationRecord[]>('history.json', []);
  const companies = new Set(users.map((u) => u.company.toLowerCase()));

  return {
    totalUsers: users.length,
    totalCompanies: companies.size,
    totalVerifications: history.length,
    resultDistribution: {
      low_risk: history.filter((h) => h.riskLevel === 'low_risk').length,
      review_recommended: history.filter((h) => h.riskLevel === 'review_recommended').length,
      high_risk: history.filter((h) => h.riskLevel === 'high_risk').length,
    },
  };
}
