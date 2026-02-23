'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface FormData {
  title: string;
  description: string;
  location: string;
  duration: string;
  meetingType: 'FIXED' | 'POLL';
  fixedDate: string;
  fixedTime: string;
  pollStartDate: string;
  pollEndDate: string;
  invitees: string[];
  openLink: boolean;
}

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function CreateMeetingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    duration: '30',
    meetingType: 'POLL',
    fixedDate: '',
    fixedTime: '',
    pollStartDate: '',
    pollEndDate: '',
    invitees: [],
    openLink: true,
  });

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function addInvitee() {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (formData.invitees.includes(email)) {
      setEmailInput('');
      return;
    }
    update('invitees', [...formData.invitees, email]);
    setEmailInput('');
  }

  function removeInvitee(email: string) {
    update('invitees', formData.invitees.filter((e) => e !== email));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        duration: parseInt(formData.duration, 10),
        type: formData.meetingType,
        invitees: formData.invitees,
        openLink: formData.openLink,
      };

      if (formData.meetingType === 'FIXED' && formData.fixedDate && formData.fixedTime) {
        body.proposedTime = new Date(`${formData.fixedDate}T${formData.fixedTime}`).toISOString();
      } else if (formData.meetingType === 'POLL') {
        if (formData.pollStartDate) body.dateRangeStart = new Date(formData.pollStartDate).toISOString();
        if (formData.pollEndDate) body.dateRangeEnd = new Date(formData.pollEndDate).toISOString();
      }

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create meeting');
      }

      const meeting = await res.json();
      toast.success('Meeting created successfully!');
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:bg-surface-hover transition-colors text-sm';

  const selectClass =
    'w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer';

  return (
    <div className="glass-card p-0 overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-white/10">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'flex-1 py-3 text-center text-xs font-medium transition-colors',
              s === step
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : s < step
                ? 'text-text-secondary'
                : 'text-text-muted'
            )}
          >
            Step {s}
            {s === 1 && ': Details'}
            {s === 2 && ': Time'}
            {s === 3 && ': Invite'}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden min-h-[360px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="p-6 space-y-5"
          >
            {/* Step 1: Details */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="Team sync, coffee chat..."
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="What's this meeting about?"
                    rows={3}
                    className={cn(inputClass, 'resize-none')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Zoom link, address, etc."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      value={formData.duration}
                      onChange={(e) => update('duration', e.target.value)}
                      className={selectClass}
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Time */}
            {step === 2 && (
              <>
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-3">How do you want to schedule?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['POLL', 'FIXED'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => update('meetingType', type)}
                        className={cn(
                          'glass-card p-4 text-left transition-all',
                          formData.meetingType === type
                            ? 'border-primary/40 bg-primary/10 shadow-glow'
                            : 'hover:border-border-hover hover:bg-surface-hover'
                        )}
                      >
                        <p className="font-medium text-text-primary text-sm">
                          {type === 'POLL' ? 'Find Best Time' : 'Set Specific Time'}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {type === 'POLL'
                            ? 'Let participants vote on availability'
                            : 'Pick a fixed date and time'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.meetingType === 'FIXED' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Date</label>
                      <input
                        type="date"
                        value={formData.fixedDate}
                        onChange={(e) => update('fixedDate', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Time</label>
                      <input
                        type="time"
                        value={formData.fixedTime}
                        onChange={(e) => update('fixedTime', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.pollStartDate}
                        onChange={(e) => update('pollStartDate', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.pollEndDate}
                        onChange={(e) => update('pollEndDate', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Invite */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Invite by email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInvitee();
                        }
                      }}
                      placeholder="colleague@example.com"
                      className={cn(inputClass, 'flex-1')}
                    />
                    <button
                      type="button"
                      onClick={addInvitee}
                      className="px-4 py-2.5 rounded-lg bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {formData.invitees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.invitees.map((email) => (
                      <span
                        key={email}
                        className="glass-pill border-border bg-surface text-text-secondary flex items-center gap-1.5"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeInvitee(email)}
                          className="text-text-muted hover:text-danger transition-colors ml-0.5"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.openLink}
                      onChange={(e) => update('openLink', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full bg-surface border border-border peer-checked:bg-primary/80 peer-checked:border-primary/50 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-text-muted peer-checked:bg-white peer-checked:translate-x-4 transition-all" />
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Anyone with the link can respond
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-surface/30">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                s === step ? 'bg-primary' : s < step ? 'bg-primary/40' : 'bg-surface-hover'
              )}
            />
          ))}
        </div>

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={step === 1 && !formData.title.trim()}
            className="gradient-bg text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !formData.title.trim()}
            className="gradient-bg text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Creating...' : 'Create Meeting'}
          </button>
        )}
      </div>
    </div>
  );
}
