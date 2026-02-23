export default function MeetingsLoading() {
  return (
    <div>
      {/* Page title */}
      <div className="h-9 w-36 bg-white/5 rounded animate-pulse mb-8" />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['All', 'Created', 'Invited'].map((tab) => (
          <div
            key={tab}
            className="h-8 bg-white/5 rounded-full w-20 animate-pulse"
          />
        ))}
      </div>

      {/* Meeting cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card animate-pulse flex flex-col gap-3">
            {/* Title + status */}
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 bg-white/5 rounded w-3/4" />
              <div className="h-5 bg-white/5 rounded-full w-16 shrink-0" />
            </div>

            {/* Meta pills */}
            <div className="flex gap-2">
              <div className="h-6 bg-white/5 rounded-full w-14" />
              <div className="h-6 bg-white/5 rounded-full w-24" />
              <div className="h-6 bg-white/5 rounded-full w-12" />
            </div>

            {/* Time + creator */}
            <div className="mt-auto pt-2 border-t border-white/5">
              <div className="h-4 bg-white/5 rounded w-2/3 mb-1.5" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
