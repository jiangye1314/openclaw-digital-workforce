import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { modeConfigs, crawfishTips, type ExamMode } from '../config/modes';

interface CrawfishCompanionProps {
  size?: 'small' | 'medium' | 'large';
  showBubble?: boolean;
}

const crawfishActions: Record<ExamMode, string[]> = {
  cultivation: ['修炼中...', '吐纳灵气', '冥想', '练钳', '翻阅秘籍'],
  study: ['学习中...', '做笔记', '复习', '思考', '阅读'],
  parenting: ['玩耍中...', '画画', '唱歌', '跳舞', '堆积木'],
  hell: ['挣扎中...', '忍受痛苦', '战斗', '求生', '对抗恶魔'],
};

const crawfishEmotions: Record<ExamMode, string[]> = {
  cultivation: ['(｡♥‿♥｡)', '(◕‿◕)', '(ﾉ◕ヮ◕)ﾉ', 'ᕙ(⇀‸↼‶)ᕗ', '(｀◕‸◕´+)'],
  study: ['(◠‿◠)', '(｡◕‿◕｡)', 'ʕ•ᴥ•ʔ', '(◕ᴗ◕✿)', '(◍•ᴗ•◍)'],
  parenting: ['(ﾉ◕ヮ◕)ﾉ', '(◕‿◕✿)', 'ʕ♡˙ᴥ˙♡ʔ', '٩(◕‿◕｡)۶', '(◕ᴥ◕ʋ)'],
  hell: ['(；￣Д￣)', '٩(╬ʘ益ʘ╬)۶', '(☉_☉)', 'ಠ╭╮ಠ', '(╥﹏╥)'],
};

export default function CrawfishCompanion({
  size = 'medium',
  showBubble = true,
}: CrawfishCompanionProps) {
  const { currentMode, crawfishName, crawfishAvatar } = useStore();
  const [currentAction, setCurrentAction] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const config = modeConfigs[currentMode];
  const actions = crawfishActions[currentMode as ExamMode];
  const tips = crawfishTips[currentMode as ExamMode];
  const emotions = crawfishEmotions[currentMode as ExamMode];

  const sizeMap = {
    small: { container: 80, avatar: 40, fontSize: '0.75rem' },
    medium: { container: 120, avatar: 60, fontSize: '0.875rem' },
    large: { container: 180, avatar: 90, fontSize: '1rem' },
  };

  const { container, avatar, fontSize } = sizeMap[size];

  // 循环切换动作
  useEffect(() => {
    const actionInterval = setInterval(() => {
      setCurrentAction((prev) => (prev + 1) % actions.length);
    }, 3000);

    return () => clearInterval(actionInterval);
  }, [actions.length]);

  // 随机显示提示
  useEffect(() => {
    if (!showBubble) return;

    const tipInterval = setInterval(() => {
      const randomTip = Math.floor(Math.random() * tips.length);
      setCurrentTip(randomTip);
      setShowTip(true);

      setTimeout(() => {
        setShowTip(false);
      }, 5000);
    }, 15000);

    return () => clearInterval(tipInterval);
  }, [tips, showBubble]);

  const handleClick = () => {
    setIsAnimating(true);
    setShowTip(true);
    setCurrentTip(Math.floor(Math.random() * tips.length));

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    setTimeout(() => {
      setShowTip(false);
    }, 5000);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: container,
        height: container,
      }}
    >
      {/* 小龙虾气泡对话框 */}
      <AnimatePresence>
        {showBubble && showTip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '12px',
              padding: '12px 16px',
              background: config.color.background,
              border: `2px solid ${config.color.accent}`,
              borderRadius: '16px',
              minWidth: '200px',
              maxWidth: '280px',
              boxShadow: `0 4px 20px ${config.color.primary}40`,
              zIndex: 100,
            }}
          >
            {/* 气泡三角形 */}
            <div
              style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: `10px solid ${config.color.accent}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `8px solid ${config.color.background}`,
              }}
            />

            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: config.color.text,
                lineHeight: 1.5,
              }}
            >
              {emotions[currentTip]} {tips[currentTip]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 小龙虾主体 */}
      <motion.div
        onClick={handleClick}
        style={{
          width: container,
          height: container,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${config.color.primary}20 0%, ${config.color.secondary}30 100%)`,
          border: `3px solid ${config.color.accent}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        animate={{
          scale: isAnimating ? [1, 1.2, 0.9, 1.1, 1] : 1,
          rotate: isAnimating ? [0, -10, 10, -10, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* 光环效果 */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            border: `2px dashed ${config.color.accent}`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* 小龙虾头像 */}
        <motion.div
          style={{
            fontSize: avatar,
            lineHeight: 1,
          }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {crawfishAvatar}
        </motion.div>

        {/* 动作文字 */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '10%',
            fontSize: '0.625rem',
            color: config.color.text,
            opacity: 0.8,
            whiteSpace: 'nowrap',
          }}
          key={currentAction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {actions[currentAction]}
        </motion.div>
      </motion.div>

      {/* 名字标签 */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '4px 12px',
          background: config.color.accent,
          borderRadius: '12px',
          fontSize: fontSize,
          fontWeight: 'bold',
          color: '#fff',
          whiteSpace: 'nowrap',
          boxShadow: `0 2px 10px ${config.color.primary}40`,
        }}
      >
        {crawfishName}
      </motion.div>
    </div>
  );
}
