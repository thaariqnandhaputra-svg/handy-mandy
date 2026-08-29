import { prisma } from '$lib/server/db';
import type { Role } from '../../generated/prisma/client';
import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'sh_session_token';
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Hash password using @node-rs/argon2 if available, with crypto scrypt fallback
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const { hash } = await import('@node-rs/argon2');
    return await hash(password);
  } catch {
    // Cryptographically secure fallback using native Node.js crypto
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
      });
    });
  }
}

/**
 * Verify password against stored hash (supporting Argon2 and scrypt fallback)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('scrypt$')) {
      const [, salt, originalKey] = hash.split('$');
      return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(crypto.timingSafeEqual(Buffer.from(originalKey, 'hex'), derivedKey));
        });
      });
    }

    if (hash.includes('fallback_')) {
      const fallbackHash = crypto.createHash('sha256').update(password).digest('hex');
      return hash.endsWith(fallbackHash);
    }

    const { verify } = await import('@node-rs/argon2');
    return await verify(hash, password);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Create a new persistent session in database
 */
export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt
    }
  });

  return { id: sessionId, expiresAt };
}

/**
 * Validate and extend session if close to expiry
 */
export async function validateSession(sessionId: string): Promise<{
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone: string | null;
  };
} | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true
        }
      }
    }
  });

  if (!session) return null;

  // Check if session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  // If less than 15 days left, extend by 30 days
  const fifteenDays = 1000 * 60 * 60 * 24 * 15;
  if (Date.now() >= session.expiresAt.getTime() - fifteenDays) {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpiresAt }
    }).catch(() => {});
  }

  return {
    id: session.id,
    user: session.user
  };
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}
