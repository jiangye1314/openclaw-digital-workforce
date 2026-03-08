import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../utils/api';
import LevelBadge from '../components/LevelBadge';
import { useStore } from '../store/useStore';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: string;
  experience: number;
  badges: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await getLeaderboard();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-spinner" />
      </div>
    );
  }

  const getRankClass = (index: number) => {
    if (index === 0) return 'top-1';
    if (index === 1) return 'top-2';
    if (index === 2) return 'top-3';
    return 'other';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '👑';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return (index + 1).toString();
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="wc-title wc-title-xl">🏆 虾王榜</h1>
        <p style={{ color: 'var(--wc-text-secondary)', marginTop: '8px' }}>
          全服最强小龙虾排名，见证顶级虾王的实力！
        </p>
      </div>

      <div className="wc-panel" style={{ padding: '0' }}>
        {users.length === 0 ? (
          <p style={{ color: 'var(--wc-text-muted)', textAlign: 'center', padding: '48px' }}>
            暂无数据
          </p>
        ) : (
          <div>
            {users.map((user, index) => (
              <div
                key={user.id}
                className="leaderboard-item"
                onClick={() => navigate(`/users/${user.id}`)}
                style={{
                  background:
                    currentUser?.id === user.id
                      ? 'rgba(139, 105, 20, 0.2)'
                      : undefined,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 105, 20, 0.15)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    currentUser?.id === user.id ? 'rgba(139, 105, 20, 0.2)' : '';
                  e.currentTarget.style.transform = '';
                }}
              >
                <div className={`leaderboard-rank ${getRankClass(index)}`}>
                  {getRankIcon(index)}
                </div>

                <div className="leaderboard-avatar">{user.avatar}</div>

                <div className="leaderboard-info">
                  <h4>
                    {user.name}
                    {currentUser?.id === user.id && (
                      <span style={{ color: 'var(--wc-gold)', marginLeft: '8px' }}>
                        (你家小龙虾)
                      </span>
                    )}
                  </h4>
                  <LevelBadge level={user.level} showName={false} />
                </div>

                <div className="leaderboard-stats">
                  <div className="leaderboard-stat">
                    <div className="leaderboard-stat-value">
                      {user.experience.toLocaleString()}
                    </div>
                    <div className="leaderboard-stat-label">EXP</div>
                  </div>
                  <div className="leaderboard-stat">
                    <div className="leaderboard-stat-value">{user.badges}</div>
                    <div className="leaderboard-stat-label">徽章</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
