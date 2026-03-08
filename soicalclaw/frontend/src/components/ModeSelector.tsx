import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { modeConfigs, modeList, type ExamMode } from '../config/modes';

export default function ModeSelector() {
  const { currentMode, setMode, crawfishName, crawfishAvatar } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<ExamMode | null>(null);

  const currentConfig = modeConfigs[currentMode];
  const displayMode = hoveredMode || currentMode;
  const displayConfig = modeConfigs[displayMode];

  const handleModeChange = (mode: ExamMode) => {
    setMode(mode);
    setIsOpen(false);
    setHoveredMode(null);
  };

  return (
    <div className="mode-selector">
      {/* 当前模式显示按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="mode-selector-button"
        style={{
          background: `linear-gradient(135deg, ${currentConfig.color.primary} 0%, ${currentConfig.color.secondary} 100%)`,
          border: `2px solid ${currentConfig.color.accent}`,
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: `0 4px 15px ${currentConfig.color.primary}66`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span style={{ fontSize: '1.5rem' }}>{currentConfig.icon}</span>
        <span>{currentConfig.name}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* 模式选择弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 999,
              }}
            />

            {/* 选择面板 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              {/* 标题 */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                  color: '#fff',
                }}
              >
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                  🦞 选择你的修炼模式
                </h2>
                <p style={{ opacity: 0.8 }}>
                  不同模式，不同体验。{crawfishAvatar} {crawfishName} 在等待你！
                </p>
              </div>

              {/* 模式卡片网格 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                {modeList.map((mode) => {
                  const config = modeConfigs[mode];
                  const isSelected = currentMode === mode;
                  const isHovered = hoveredMode === mode;

                  return (
                    <motion.div
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      onMouseEnter={() => setHoveredMode(mode)}
                      onMouseLeave={() => setHoveredMode(null)}
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        background: isSelected
                          ? `linear-gradient(135deg, ${config.color.primary} 0%, ${config.color.secondary} 100%)`
                          : 'rgba(255, 255, 255, 0.1)',
                        border: `3px solid ${
                          isSelected
                            ? config.color.accent
                            : isHovered
                            ? config.color.primary
                            : 'transparent'
                        }`,
                        transition: 'all 0.3s ease',
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* 模式图标 */}
                      <div
                        style={{
                          fontSize: '3rem',
                          textAlign: 'center',
                          marginBottom: '12px',
                        }}
                      >
                        {config.icon}
                      </div>

                      {/* 模式名称 */}
                      <h3
                        style={{
                          textAlign: 'center',
                          color: isSelected ? '#fff' : config.color.primary,
                          marginBottom: '8px',
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {config.name}
                      </h3>

                      {/* 简短描述 */}
                      <p
                        style={{
                          textAlign: 'center',
                          color: isSelected ? 'rgba(255,255,255,0.9)' : '#666',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {config.slogan}
                      </p>

                      {/* 选中标记 */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: config.color.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                          }}
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* 预览区域 */}
              <motion.div
                key={displayMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '24px',
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '2.5rem' }}>{displayConfig.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', color: displayConfig.color.accent }}>
                      {displayConfig.name}
                    </h3>
                    <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{displayConfig.description}</p>
                  </div>
                </div>

                {/* 特色功能 */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '12px',
                  }}
                >
                  {Object.entries(displayConfig.features)
                    .filter(([_, enabled]) => enabled)
                    .map(([feature]) => (
                      <span
                        key={feature}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: `${displayConfig.color.primary}66`,
                          fontSize: '0.75rem',
                        }}
                      >
                        {feature === 'hasCheckIn' && '✓ 每日打卡'}
                        {feature === 'hasStreak' && '🔥 连续奖励'}
                        {feature === 'hasPowerUps' && '⚡ 特殊道具'}
                        {feature === 'hasCompanions' && '🦞 小龙虾陪伴'}
                        {feature === 'timeLimit' && '⏱️ 限时挑战'}
                        {feature === 'lives' && '❤️ 生命系统'}
                      </span>
                    ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
