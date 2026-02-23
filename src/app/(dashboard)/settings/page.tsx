export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { PageTransition } from '@/components/ui/page-transition';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true, timezone: true },
  });

  if (!user) redirect('/login');

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Settings</h1>
        <SettingsForm user={user} />
      </div>
    </PageTransition>
  );
}
