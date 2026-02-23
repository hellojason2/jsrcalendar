'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: { firstName: string; lastName: string; email: string }) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
    },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateTimezone(timezone: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timezone },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');

  const newHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
