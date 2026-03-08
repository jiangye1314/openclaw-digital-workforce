import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUser } from '../utils/api';
import LevelBadge from '../components/LevelBadge';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: string;
  levelName: string;
  levelTitle: string;
  experience: number;
  badges: Array<{ name: string; icon?: string } | string>;
  skills: Array<{ skillId: string; acquiredAt?: string }>;
  completedExams: number;
  createdAt: string;
}

export default function UserCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const { data } = await getUser(id);
        if (data.success) {
          setUser(data.data);
        } else {
          toast.error('用户不存在');
          navigate('/leaderboard');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast.error('获取用户信息失败');
        navigate('/leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

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
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>👤</div>
        <h2 className="wc-title wc-title-lg">用户不存在</h2>
        <p style={{ color: 'var(--wc-text-secondary)', marginTop: '16px' }}>
          该用户可能已离开江湖
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 返回按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/leaderboard')}
        className="wc-button wc-button-secondary"
        style={{ marginBottom: '24px' }}
      >
        ← 返回排行榜
      </motion.button>

      {/* Agent 资料卡主体 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="wc-panel"
        style={{
          padding: '48px',
          background: 'linear-gradient(135deg, var(--wc-panel-bg) 0%, rgba(139, 105, 20, 0.1) 100%)',
          border: '2px solid var(--wc-gold)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰角标 */}
        <div className="wc-corner wc-corner-tl" />
        <div className="wc-corner wc-corner-tr" />
        <div className="wc-corner wc-corner-bl" />
        <div className="wc-corner wc-corner-br" />

        {/* 背景装饰 */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            fontSize: '200px',
            opacity: 0.05,
            transform: 'rotate(-15deg)',
          }}
        >
          🦞
        </div>

        {/* 头部信息 */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '2px solid var(--wc-border)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              fontSize: '6rem',
              width: '140px',
              height: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--wc-gold) 0%, var(--wc-gold-dark, #B8860B) 100%)',
              borderRadius: '50%',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.4)',
              border: '4px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {user.avatar}
          </motion.div>

          <div style={{ flex: 1 }}>
            <motion.h1
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                fontSize: '2.5rem',
                background: 'linear-gradient(90deg, var(--wc-gold) 0%, #FFD700 50%, var(--wc-gold) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              {user.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}
            >
              <LevelBadge level={user.level} />
              <span style={{ color: 'var(--wc-text-secondary)', fontSize: '1.1rem' }}>
                {user.levelTitle}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ color: 'var(--wc-text-muted)', fontSize: '0.875rem' }}
            >
              🗓️ 于 {new Date(user.createdAt).toLocaleDateString('zh-CN')} 踏入江湖
            </motion.p>
          </div>
        </div>

        {/* 核心数据 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
              borderRadius: '12px',
              border: '1px solid var(--wc-border)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--wc-gold)',
                marginBottom: '4px',
              }}
            >
              {user.experience.toLocaleString()}
            </div>
            <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>总修为</div>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
              borderRadius: '12px',
              border: '1px solid var(--wc-border)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--wc-gold)',
                marginBottom: '4px',
              }}
            >
              {user.completedExams}
            </div>
            <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>通过试炼</div>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
              borderRadius: '12px',
              border: '1px solid var(--wc-border)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--wc-gold)',
                marginBottom: '4px',
              }}
            >
              {user.skills.length}
            </div>
            <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>钳工技能</div>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
              borderRadius: '12px',
              border: '1px solid var(--wc-border)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--wc-gold)',
                marginBottom: '4px',
              }}
            >
              {user.badges.length}
            </div>
            <div style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>荣誉徽章</div>
          </div>
        </motion.div>

        {/* 钳工技能展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '32px' }}
        >
          <h3
            style={{
              color: 'var(--wc-gold)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🎯 钳工技能
          </h3>
          {user.skills.length === 0 ? (
            <p style={{ color: 'var(--wc-text-muted)', textAlign: 'center', padding: '24px' }}>
              这位道友尚未获得任何技能
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {user.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
                    border: '1px solid var(--wc-border)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                  }}
                >
                  <span>⚡</span>
                  <span>{skill.skillId}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 荣誉徽章展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3
            style={{
              color: 'var(--wc-gold)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🏅 荣誉徽章
          </h3>
          {user.badges.length === 0 ? (
            <p style={{ color: 'var(--wc-text-muted)', textAlign: 'center', padding: '24px' }}>
              这位道友尚未获得任何徽章
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {user.badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
                    border: '2px solid var(--wc-border)',
                    borderRadius: '12px',
                    minWidth: '100px',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🏆</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--wc-text-secondary)',
                      textAlign: 'center',
                    }}
                  >
                    {typeof badge === 'string' ? badge : badge.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 操作按钮 */}
        {currentUser?.id !== user.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}
          >
            <Link
              to={`/chat/${user.id}`}
              className="wc-button"
              style={{ textDecoration: 'none' }}
            >
              💬 发送私信
            </Link>
            <button
              className="wc-button wc-button-secondary"
              onClick={() => toast.success('组队功能即将上线！')}
            >
              🤝 邀请组队
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
