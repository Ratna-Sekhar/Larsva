/* ── OLV Auth Utilities ── */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { JWT_COOKIE_NAME, SALT_ROUNDS } from './config';
import { getUserById } from './db';
import type { OLVUserPublic } from './types';

function getJWTSecret(): Uint8Array {
  const secret = process.env.OLV_JWT_SECRET;
  if (!secret) throw new Error('OLV_JWT_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
}

// ── Password ──

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ──

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJWTSecret());
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

// ── Cookie Helpers ──

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_COOKIE_NAME)?.value;
}

// ── Get Current User ──

export async function getCurrentUser(): Promise<OLVUserPublic | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  const user = getUserById(userId);
  if (!user) return null;

  // Strip sensitive fields
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    company: user.company,
    jobTitle: user.jobTitle,
    plan: user.plan,
    monthlyLimit: user.monthlyLimit,
    createdAt: user.createdAt,
  };
}

// ── Validate from Request (for API routes) ──

export async function getUserFromRequest(): Promise<OLVUserPublic | null> {
  return getCurrentUser();
}

// ── ID Generator ──

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
