import { getAdminAuth } from '../lib/firebase.js';
import prisma from '../lib/prisma.js';

// In-memory cache — avoids DB check on every request after first sync
const knownUsers = new Set<string>();

export async function syncUser(userId: string, emailFromToken?: string): Promise<void> {
  if (knownUsers.has(userId)) return;

  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    // First time — get email from token claim if available, else fetch from Firebase
    const email = emailFromToken ?? (await getAdminAuth().getUser(userId)).email ?? '';

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email },
    });
  }

  knownUsers.add(userId);
}

export async function getProfileService(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      _count: { select: { jobs: true } },
    },
  });

  if (!user) throw new Error('User not found');

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    jobCount: user._count.jobs,
  };
}

