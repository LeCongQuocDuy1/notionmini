export function SidebarSkeleton() {
  return (
    <div className="px-2 py-1 space-y-1 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
          <div className="w-4 h-4 rounded shrink-0" style={{ background: 'var(--bg-active)' }} />
          <div
            className="h-3 rounded"
            style={{ width: `${55 + i * 10}%`, background: 'var(--bg-active)' }}
          />
        </div>
      ))}
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex-1 flex flex-col px-16 pt-8 pb-4 animate-pulse">
      <div className="w-full h-40 rounded-lg mb-8" style={{ background: 'var(--bg-hover)' }} />
      <div className="w-12 h-12 rounded mb-4" style={{ background: 'var(--bg-active)' }} />
      <div className="h-10 rounded w-2/3 mb-6" style={{ background: 'var(--bg-active)' }} />
      <div className="space-y-3">
        {['full', '5/6', '4/5', '3/4'].map((w) => (
          <div key={w} className={`h-4 rounded w-${w}`} style={{ background: 'var(--bg-hover)' }} />
        ))}
      </div>
    </div>
  );
}
