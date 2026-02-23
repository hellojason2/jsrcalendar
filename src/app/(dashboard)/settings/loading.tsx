export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page title */}
      <div className="h-9 w-28 bg-white/5 rounded animate-pulse mb-8" />

      <div className="space-y-6">
        {/* Timezone Section */}
        <div className="glass-card animate-pulse">
          <div className="h-6 bg-white/5 rounded w-24 mb-4" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="h-7 bg-white/5 rounded w-40 mb-1.5" />
              <div className="h-4 bg-white/5 rounded w-24" />
            </div>
            <div className="h-6 bg-white/5 rounded-full w-24" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 bg-white/5 rounded-lg flex-1" />
            <div className="h-10 bg-white/5 rounded-lg w-16" />
          </div>
        </div>

        {/* Profile Section */}
        <div className="glass-card animate-pulse">
          <div className="h-6 bg-white/5 rounded w-16 mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-white/5 rounded w-20 mb-1.5" />
                <div className="h-10 bg-white/5 rounded-lg w-full" />
              </div>
              <div>
                <div className="h-4 bg-white/5 rounded w-20 mb-1.5" />
                <div className="h-10 bg-white/5 rounded-lg w-full" />
              </div>
            </div>
            <div>
              <div className="h-4 bg-white/5 rounded w-12 mb-1.5" />
              <div className="h-10 bg-white/5 rounded-lg w-full" />
            </div>
            <div className="flex justify-end pt-1">
              <div className="h-9 bg-white/5 rounded-lg w-28" />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="glass-card animate-pulse">
          <div className="h-6 bg-white/5 rounded w-36 mb-4" />
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-white/5 rounded w-32 mb-1.5" />
              <div className="h-10 bg-white/5 rounded-lg w-full" />
            </div>
            <div>
              <div className="h-4 bg-white/5 rounded w-28 mb-1.5" />
              <div className="h-10 bg-white/5 rounded-lg w-full" />
            </div>
            <div>
              <div className="h-4 bg-white/5 rounded w-40 mb-1.5" />
              <div className="h-10 bg-white/5 rounded-lg w-full" />
            </div>
            <div className="flex justify-end pt-1">
              <div className="h-9 bg-white/5 rounded-lg w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
