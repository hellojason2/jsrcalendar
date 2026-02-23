export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      {/* Section: Upcoming Meetings */}
      <section>
        <div className="h-8 w-56 bg-white/5 rounded animate-pulse mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <MeetingCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Section: Pending Responses */}
      <section>
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <MeetingCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Section: Your Meetings */}
      <section>
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <MeetingCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MeetingCardSkeleton() {
  return (
    <div className="glass-card animate-pulse flex flex-col gap-3">
      {/* Title + status badge */}
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
  );
}
