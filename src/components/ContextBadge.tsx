// "OAC Detected Context" badge — the signature element that replaces a manual
// "Account Type" field. It always reads as AI-generated, never user-selected.

export function ContextBadge({
  context,
  confidence,
  size = 'md',
}: {
  context: string
  confidence?: number
  size?: 'sm' | 'md'
}) {
  const sm = size === 'sm'
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-violet-50 dark:bg-none dark:bg-brand-500/15 ${
        sm ? 'px-2.5 py-1' : 'px-3 py-1.5'
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" />
        </svg>
      </span>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold text-brand-800 ${sm ? 'text-[11px]' : 'text-xs'}`}>
            {context}
          </span>
        </div>
        {!sm && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-brand-500/80">
            OAC Detected Context
            {confidence != null && ` · ${confidence}% confidence`}
          </span>
        )}
      </div>
    </div>
  )
}
