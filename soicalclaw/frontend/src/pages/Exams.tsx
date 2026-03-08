import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getExams } from '../utils/api';
import { motion } from 'framer-motion';

interface Exam {
  id: string;
  level: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  experienceReward: number;
  questionCount: number;
  canTake?: boolean;
  isCompleted?: boolean;
  prerequisites: string[];
}

const levelOrder = ['apprentice', 'junior', 'intermediate', 'advanced', 'expert', 'master', 'legendary'];

const levelNames: Record<string, string> = {
  apprentice: '外门试炼',
  junior: '内门试炼',
  intermediate: '核心试炼',
  advanced: '堂主试炼',
  expert: '长老试炼',
  master: '掌门试炼',
  legendary: '至尊试炼',
};

const enemyIcons: Record<string, string> = {
  apprentice: '🦐',
  junior: '🦀',
  intermediate: '🐙',
  advanced: '🦑',
  expert: '🐡',
  master: '🦈',
  legendary: '🐉',
};

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await getExams();
        if (data.success) {
          setExams(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // 按等级分组
  const examsByLevel = levelOrder.map((level) => ({
    level,
    levelName: levelNames[level],
    exams: exams.filter((e) => e.level === level),
  }));

  if (loading) {
    return (
      <div className="wx-loading">
        <div className="wx-spinner" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="exam-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="wx-title wx-title-xl"
        >
          ⚔️ 门派试炼
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: 'var(--wx-text-secondary)', marginTop: '8px' }}
        >
          挑战各路妖兽，突破境界，从外门弟子修炼到武林至尊
        </motion.p>
      </div>

      {/* Battle Arena */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {examsByLevel.map(({ level, levelName, exams }, levelIndex) => (
          <motion.div
            key={level}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: levelIndex * 0.1 }}
            className="wx-panel"
            style={{ padding: '24px' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--wx-border)',
              }}
            >
              <span style={{ fontSize: '2rem' }}>{enemyIcons[level]}</span>
              <div>
                <h3 style={{ color: 'var(--wx-gold)', fontSize: '1.25rem' }}>{levelName}</h3>
                <span style={{ color: 'var(--wx-text-muted)', fontSize: '0.875rem' }}>
                  共 {exams.length} 场试炼
                </span>
              </div>
            </div>

            <div className="exam-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {exams.map((exam, examIndex) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: examIndex * 0.05 }}
                >
                  <Link
                    to={`/exams/${exam.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      className="wx-panel"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderColor: exam.isCompleted
                          ? 'var(--wx-success)'
                          : !exam.canTake
                          ? 'var(--wx-text-muted)'
                          : 'var(--wx-border)',
                        opacity: exam.canTake ? 1 : 0.6,
                      }}
                    >
                      {/* Enemy Icon */}
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          background: exam.isCompleted
                            ? 'rgba(34, 139, 34, 0.2)'
                            : !exam.canTake
                            ? 'rgba(107, 114, 128, 0.2)'
                            : 'rgba(220, 20, 60, 0.2)',
                          border: `3px solid ${
                            exam.isCompleted
                              ? 'var(--wx-success)'
                              : !exam.canTake
                              ? 'var(--wx-text-muted)'
                              : 'var(--wx-red)'
                          }`,
                        }}
                      >
                        {exam.isCompleted ? '✓' : !exam.canTake ? '🔒' : enemyIcons[level]}
                      </div>

                      {/* Exam Content */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'var(--wx-text-primary)', marginBottom: '4px', fontSize: '1.1rem' }}>
                          {exam.title}
                        </h3>
                        <p style={{ color: 'var(--wx-text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                          {exam.description}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--wx-text-muted)' }}>
                          <span>⏱️ {exam.timeLimit}分钟</span>
                          <span>📝 {exam.questionCount}题</span>
                          <span>✅ {exam.passingScore}分及格</span>
                          {exam.prerequisites.length > 0 && (
                            <span>🔒 需完成前置试炼</span>
                          )}
                        </div>
                      </div>

                      {/* Reward */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--wx-gold)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                          +{exam.experienceReward} 修为
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--wx-text-muted)' }}>
                          突破奖励
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
