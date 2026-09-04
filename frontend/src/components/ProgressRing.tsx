interface Props {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'from-primary-500 to-purple-500',
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={`text-${color.split(' ')[0].replace('from-', '')}`} style={{ stopColor: 'var(--tw-gradient-from, #6366f1)' }} />
            <stop offset="100%" className={`text-${color.split(' ')[1].replace('to-', '')}`} style={{ stopColor: 'var(--tw-gradient-to, #a855f7)' }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(value)}%</span>
        {label && <span className="text-xs text-white/40 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
