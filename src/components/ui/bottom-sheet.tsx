'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onOpenChange, title, description, children, className }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'bg-[#0B1120]/95 backdrop-blur-[20px] border-t border-white/10 rounded-t-[24px] max-h-[85vh]',
          className
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>
        {title && (
          <SheetHeader className="pb-4">
            <SheetTitle className="text-text-primary text-xl font-semibold">{title}</SheetTitle>
            {description && <SheetDescription className="text-text-secondary">{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
