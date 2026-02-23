export const dynamic = 'force-dynamic';

import { CreateMeetingForm } from '@/components/meetings/CreateMeetingForm';
import { PageTransition } from '@/components/ui/page-transition';

export default function NewMeetingPage() {
  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Create Meeting</h1>
        <CreateMeetingForm />
      </div>
    </PageTransition>
  );
}
