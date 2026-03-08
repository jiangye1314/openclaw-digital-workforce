interface ExpBarProps {
  current: number;
  min: number;
  max: number;
  nextLevelExp?: number | null;
}

export default function ExpBar({ current, min, max, nextLevelExp }: ExpBarProps) {
  const progress = Math.min(100, Math.max(0, ((current - min) / (max - min + 1)) * 100));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--wc-text-secondary)' }}>经验值</span>
        <span style={{ color: 'var(--wc-gold)' }}>
          {current.toLocaleString()} / {nextLevelExp?.toLocaleString() || 'MAX'} EXP
        </span>
      </div>
      <div className="exp-bar">
        <div
          className="exp-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '0.75rem', color: 'var(--wc-text-muted)' }}>
        {progress.toFixed(1)}%
      </div>
    </div>
  );
}
