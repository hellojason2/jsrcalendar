'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { TimezoneSelector } from '@/components/timezone/TimezoneSelector';
import { useTimezone } from '@/hooks/useTimezone';
import { getTimezoneCityName, getTimezoneOffset } from '@/lib/timezone';
import { updateProfile, updateTimezone, changePassword } from '@/actions/settings';

interface SettingsFormProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    timezone: string;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { timezone } = useTimezone();

  // Profile state
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [profileLoading, setProfileLoading] = useState(false);

  // Timezone state
  const [tzLoading, setTzLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const cityName = getTimezoneCityName(timezone);
  const offset = getTimezoneOffset(timezone);
  const isAutoDetected = timezone === user.timezone;

  async function handleSaveTimezone() {
    setTzLoading(true);
    try {
      await updateTimezone(timezone);
      toast.success('Timezone updated');
    } catch {
      toast.error('Failed to update timezone');
    } finally {
      setTzLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('All fields are required');
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile({ firstName, lastName, email });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  }

  const inputClass =
    'w-full bg-surface border border-border text-text-primary rounded-lg px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors';

  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  const saveButtonClass =
    'gradient-bg text-white font-medium text-sm px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity';

  return (
    <div className="space-y-6">
      {/* Timezone Section */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Timezone</h2>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-text-primary">{cityName}</p>
            <p className="text-text-secondary text-sm mt-0.5">{offset}</p>
          </div>
          <span className="glass-pill border-border text-text-secondary text-xs">
            {isAutoDetected ? 'Auto-detected' : 'Manually set'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <TimezoneSelector />
          <button
            onClick={handleSaveTimezone}
            disabled={tzLoading}
            className={saveButtonClass}
          >
            {tzLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </GlassCard>

      {/* Profile Section */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Email address"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={profileLoading} className={saveButtonClass}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Password Section */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Repeat new password"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={passwordLoading} className={saveButtonClass}>
              {passwordLoading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
