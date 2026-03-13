import clsx from 'clsx'

type Status = 'RUNNING' | 'STOPPED' | 'ERROR' | 'STARTING'

const config: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  RUNNING: { label: 'Running', dot: 'bg-success animate-pulse-dot', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  STOPPED: { label: 'Stopped', dot: 'bg-surface-400', bg: 'bg-surface-100', text: 'text-surface-600' },
  ERROR: { label: 'Error', dot: 'bg-danger', bg: 'bg-red-50', text: 'text-red-700' },
  STARTING: { label: 'Starting', dot: 'bg-warning animate-pulse-dot', bg: 'bg-amber-50', text: 'text-amber-700' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const c = config[status] || config.STOPPED
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', c.bg, c.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}
