interface LevelBadgeProps {
  level: string;
  showName?: boolean;
}

const levelConfig: Record<string, { name: string; icon: string; className: string }> = {
  apprentice: { name: '学徒', icon: '🌱', className: 'level-apprentice' },
  junior: { name: '初级', icon: '🦐', className: 'level-junior' },
  intermediate: { name: '中级', icon: '🦞', className: 'level-intermediate' },
  advanced: { name: '高级', icon: '🏆', className: 'level-advanced' },
  expert: { name: '专家', icon: '👨‍🔬', className: 'level-expert' },
  master: { name: '大师', icon: '👑', className: 'level-master' },
  legendary: { name: '传奇', icon: '🔥', className: 'level-legendary' },
};

export default function LevelBadge({ level, showName = true }: LevelBadgeProps) {
  const config = levelConfig[level] || levelConfig.apprentice;

  return (
    <span className={`level-badge ${config.className}`}>
      <span>{config.icon}</span>
      {showName && <span>{config.name}</span>}
    </span>
  );
}
