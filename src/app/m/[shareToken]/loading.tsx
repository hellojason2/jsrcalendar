export default function SharePageLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-surface-hover rounded w-2/3 mb-4" />
          <div className="h-4 bg-surface-hover rounded w-1/3 mb-2" />
          <div className="h-4 bg-surface-hover rounded w-1/4" />
        </div>
        <div className="glass-card p-6 animate-pulse">
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-surface-hover rounded-full w-32" />
            ))}
          </div>
        </div>
        <div className="glass-card p-6 animate-pulse h-64" />
      </div>
    </div>
  );
}
