import { cn } from '@/lib/utils';

type BadgeVariant = 'creator' | 'confirmed' | 'pending' | 'guest' | 'responded' | 'unavailable';

const variantStyles: Record<BadgeVariant, string> = {
  creator: 'bg-primary/20 text-primary-light border-primary/30',
  confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  guest: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  responded: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  unavailable: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const dotColors: Record<BadgeVariant, string> = {
  creator: 'bg-primary',
  confirmed: 'bg-emerald-400',
  pending: 'bg-amber-400',
  guest: 'bg-violet-400',
  responded: 'bg-emerald-400',
  unavailable: 'bg-red-400',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ variant, children, showDot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn('glass-pill inline-flex items-center gap-1.5', variantStyles[variant], className)}>
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
