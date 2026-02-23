export default function NewMeetingLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page title */}
      <div className="h-9 w-44 bg-white/5 rounded animate-pulse mb-8" />

      {/* Form card */}
      <div className="glass-card p-0 overflow-hidden animate-pulse">
        {/* Step indicator */}
        <div className="flex border-b border-white/10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 py-3 flex justify-center">
              <div className="h-4 bg-white/5 rounded w-20" />
            </div>
          ))}
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-5 min-h-[360px]">
          {/* Title field */}
          <div>
            <div className="h-4 bg-white/5 rounded w-10 mb-1.5" />
            <div className="h-10 bg-white/5 rounded-lg w-full" />
          </div>

          {/* Description field */}
          <div>
            <div className="h-4 bg-white/5 rounded w-20 mb-1.5" />
            <div className="h-24 bg-white/5 rounded-lg w-full" />
          </div>

          {/* Location field */}
          <div>
            <div className="h-4 bg-white/5 rounded w-16 mb-1.5" />
            <div className="h-10 bg-white/5 rounded-lg w-full" />
          </div>

          {/* Duration field */}
          <div>
            <div className="h-4 bg-white/5 rounded w-16 mb-1.5" />
            <div className="h-10 bg-white/5 rounded-lg w-full" />
          </div>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-surface/30">
          <div className="h-9 bg-white/5 rounded-lg w-16" />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="w-1.5 h-1.5 bg-white/5 rounded-full" />
            ))}
          </div>
          <div className="h-9 bg-white/5 rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}
