import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { modeConfigs } from '../config/modes';

interface HeartbeatTrackerProps {
  onHeartbeat?: () => void;
}

export default function HeartbeatTracker({ onHeartbeat }: HeartbeatTrackerProps) {
  const { currentMode, heartbeatLastUpdate, updateHeartbeat } = useStore();
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [progress, setProgress] = useState(0);

  const config = modeConfigs[currentMode];
  const intervalMs = config.heartbeat.interval * 60 * 1000;

  useEffect(() => {
    const calculateProgress = () => {
      const now = Date.now();
      const elapsed = now - heartbeatLastUpdate;
      const remaining = Math.max(0, intervalMs - elapsed);
      const progressPercent = Math.min(100, (elapsed / intervalMs) * 100);

      setTimeUntilNext(remaining);
      setProgress(progressPercent);

      // 触发心跳
      if (elapsed >= intervalMs) {
        updateHeartbeat();
        onHeartbeat?.();
      }
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 1000);

    return () => clearInterval(timer);
  }, [heartbeatLastUpdate, intervalMs, updateHeartbeat, onHeartbeat]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 获取心跳状态的视觉表现
  const getHeartbeatVisual = () => {
    const intensity = progress / 100;

    switch (currentMode) {
      case 'cultivation':
        return {
          icon: '☯️',
          pulseColor: `rgba(255, 215, 0, ${0.3 + intensity * 0.7})`,
          label: '灵气凝聚中',
        };
      case 'study':
        return {
          icon: '📚',
          pulseColor: `rgba(37, 99, 235, ${0.3 + intensity * 0.7})`,
          label: '知识吸收中',
        };
      case 'parenting':
        return {
          icon: '💖',
          pulseColor: `rgba(255, 107, 157, ${0.3 + intensity * 0.7})`,
          label: '爱心积累中',
        };
      case 'hell':
        return {
          icon: '🔥',
          pulseColor: `rgba(220, 38, 38, ${0.3 + intensity * 0.7})`,
          label: '痛苦累积中',
        };
    }
  };

  const visual = getHeartbeatVisual();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        padding: '16px 20px',
        background: config.color.background,
        border: `2px solid ${config.color.accent}`,
        borderRadius: '16px',
        boxShadow: `0 4px 20px ${config.color.primary}40`,
        minWidth: '200px',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          color: config.color.text,
        }}
      >
        <motion.span
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          style={{ fontSize: '1.5rem' }}
        >
          {visual.icon}
        </motion.span>
        <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
          Heartbeat · {config.heartbeat.interval}min
        </span>
      </div>

      {/* 进度条 */}
      <div
        style={{
          height: '8px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${config.color.primary}, ${config.color.accent})`,
            borderRadius: '4px',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 状态信息 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: config.color.text,
        }}
      >
        <span style={{ opacity: 0.8 }}>{visual.label}</span>
        <span style={{ fontWeight: 'bold' }}>{formatTime(timeUntilNext)}</span>
      </div>

      {/* 脉冲效果 */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          transform: 'translate(-50%, -50%)',
          background: visual.pulseColor,
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* 奖励预览 */}
      {progress > 80 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '12px',
            padding: '8px',
            background: `${config.color.accent}20`,
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: config.color.text,
          }}
        >
          <strong>即将获得:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
            {config.heartbeat.rewards.map((reward, index) => (
              <span
                key={index}
                style={{
                  padding: '2px 8px',
                  background: config.color.primary,
                  borderRadius: '4px',
                  color: '#fff',
                }}
              >
                {reward}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
