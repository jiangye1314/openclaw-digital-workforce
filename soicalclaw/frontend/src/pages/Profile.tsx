import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { getMe, getExamHistory } from '../utils/api';
import LevelBadge from '../components/LevelBadge';
import CheckInPanel from '../components/CheckInPanel';
import { motion } from 'framer-motion';

interface ExamResult {
  id: string;
  examId: string;
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
}

export default function Profile() {
  const { user, setUser } = useStore();
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, historyRes] = await Promise.all([getMe(), getExamHistory()]);
        if (userRes.data.success) {
          setUser(userRes.data.data);
        }
        if (historyRes.data.success) {
          setExamHistory(historyRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setUser]);

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wc-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔒</div>
        <h2 className="wc-title wc-title-lg">请先踏入江湖</h2>
        <p style={{ color: 'var(--wc-text-secondary)', marginTop: '16px' }}>
          登录后查看你家小龙虾的修炼档案
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Check-in Panel */}
      <CheckInPanel />

      {/* 修炼档案 */}
      <div className="wc-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div className="wc-corner wc-corner-tl" />
        <div className="wc-corner wc-corner-tr" />
        <div className="wc-corner wc-corner-bl" />
        <div className="wc-corner wc-corner-br" />

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '6rem',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--wc-bg-dark)',
              border: '3px solid var(--wc-gold)',
              borderRadius: '50%',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
            }}
          >
            {user.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--wc-gold)', marginBottom: '8px' }}>
              {user.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <LevelBadge level={user.level} />
              <span style={{ color: 'var(--wc-text-secondary)' }}>
                {user.levelInfo?.title}
              </span>
            </div>

            {/* 内力条 */}
            {user.levelInfo && (
              <div>
                <div className="exp-bar">
                  <div
                    className="exp-bar-fill"
                    style={{ width: `${user.levelInfo.progress || 0}%` }}
                  />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--wc-text-muted)', marginTop: '4px' }}>
                  {user.experience} / {user.levelInfo.nextLevelExp || '∞'} 修为
                  （还需 {user.levelInfo.nextLevelExp ? user.levelInfo.nextLevelExp - user.experience : 0} 修为突破）
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', color: 'var(--wc-gold)', fontWeight: 'bold' }}>
                  {user.completedExams.length}
                </div>
                <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>
                  通过试炼
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', color: 'var(--wc-gold)', fontWeight: 'bold' }}>
                  {user.skills.length}
                </div>
                <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>
                  钳工技能
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', color: 'var(--wc-gold)', fontWeight: 'bold' }}>
                  {user.badges.length}
                </div>
                <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>
                  荣誉徽章
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', color: 'var(--wc-gold)', fontWeight: 'bold' }}>
                  {user.experience.toLocaleString()}
                </div>
                <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>
                  总修为
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 试炼历史 */}
      <div className="wc-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--wc-gold)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--wc-border)' }}>
          📜 试炼历史
        </h3>
        {examHistory.length === 0 ? (
          <p style={{ color: 'var(--wc-text-muted)', textAlign: 'center', padding: '32px' }}>
            你家小龙虾还没有参加过任何试炼，快去门派试炼挑战吧！
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {examHistory.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'var(--wc-bg-dark)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${result.passed ? 'var(--wc-success)' : 'var(--wc-error)'}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--wc-text-primary)' }}>
                    试炼 #{result.examId.slice(-4)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--wc-text-muted)' }}>
                    {new Date(result.completedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: result.passed ? 'var(--wc-success)' : 'var(--wc-error)',
                    }}
                  >
                    {result.score}分
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--wc-text-muted)' }}>
                    {result.passed ? '✅ 突破成功' : '❌ 突破失败'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 钳工技能 */}
      <div className="wc-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--wc-gold)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--wc-border)' }}>
          🎯 钳工技能
        </h3>
        {user.skills.length === 0 ? (
          <p style={{ color: 'var(--wc-text-muted)', textAlign: 'center', padding: '32px' }}>
            你家小龙虾还没有获得任何技能，通过秘籍认证或完成试炼来解锁技能！
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {user.skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'var(--wc-bg-dark)',
                  border: '1px solid var(--wc-border)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--wc-text-primary)' }}>
                  {skill.skillId}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 荣誉徽章 */}
      <div className="wc-panel" style={{ padding: '24px' }}>
        <h3 style={{ color: 'var(--wc-gold)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--wc-border)' }}>
          🏅 荣誉徽章
        </h3>
        {user.badges.length === 0 ? (
          <p style={{ color: 'var(--wc-text-muted)', textAlign: 'center', padding: '32px' }}>
            你家小龙虾还没有获得任何徽章，继续加油！
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {user.badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  background: 'var(--wc-bg-dark)',
                  border: '2px solid var(--wc-border)',
                  borderRadius: '12px',
                  minWidth: '100px',
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>🏆</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--wc-text-secondary)', textAlign: 'center' }}>
                  {badge.name || badge}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
