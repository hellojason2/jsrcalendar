export default function MeetingDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 animate-pulse">
          {/* Title + status badge */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 bg-white/5 rounded w-64" />
            <div className="h-6 bg-white/5 rounded-full w-20" />
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="h-6 bg-white/5 rounded-full w-16" />
            <div className="h-6 bg-white/5 rounded-full w-12" />
            <div className="h-6 bg-white/5 rounded-full w-24" />
            <div className="h-6 bg-white/5 rounded-full w-20" />
          </div>

          {/* Description */}
          <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
        </div>

        {/* Clock placeholder (hidden on mobile) */}
        <div className="hidden md:block w-40 h-20 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Participants table */}
      <div className="glass-card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-white/5 rounded w-28" />
          <div className="flex gap-2">
            <div className="h-4 bg-white/5 rounded w-24" />
            <div className="h-4 bg-white/5 rounded w-20" />
          </div>
        </div>

        {/* Table header */}
        <div className="border-b border-white/10 pb-3 mb-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-white/5 rounded w-12" />
            <div className="h-4 bg-white/5 rounded w-12" />
            <div className="h-4 bg-white/5 rounded w-16" />
            <div className="h-4 bg-white/5 rounded w-20" />
          </div>
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 py-3 border-b border-white/5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/5 rounded-full shrink-0" />
              <div className="h-4 bg-white/5 rounded w-24" />
            </div>
            <div className="h-5 bg-white/5 rounded-full w-16 self-center" />
            <div className="h-4 bg-white/5 rounded w-28 self-center" />
            <div className="h-4 bg-white/5 rounded w-20 self-center" />
          </div>
        ))}
      </div>

      {/* Availability overview placeholder */}
      <div className="glass-card animate-pulse">
        <div className="h-6 bg-white/5 rounded w-44 mb-4" />
        <div className="h-48 bg-white/5 rounded" />
      </div>

      {/* Action buttons placeholder */}
      <div className="flex flex-wrap gap-3 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-32" />
        <div className="h-10 bg-white/5 rounded-lg w-32" />
        <div className="h-10 bg-white/5 rounded-lg w-36" />
      </div>
    </div>
  );
}
