import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getMe, logout } from '../utils/api';
import toast from 'react-hot-toast';
import LoginModal from './LoginModal';
import WelcomeModal from './WelcomeModal';
import ModeSelector from './ModeSelector';
import CrawfishCompanion from './CrawfishCompanion';
import { modeConfigs } from '../config/modes';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, logout: logoutStore, currentMode, crawfishName, crawfishAvatar } = useStore();
  const config = modeConfigs[currentMode];
  const [showLogin, setShowLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // 检查是否是首次访问
    const hasWelcomed = localStorage.getItem('openclaw-welcomed');
    if (!hasWelcomed) {
      setShowWelcome(true);
    }

    // 尝试获取当前用户
    const fetchUser = async () => {
      try {
        const { data } = await getMe();
        if (data.success) {
          setUser(data.data);
        }
      } catch {
        // 未登录，忽略错误
      }
    };
    fetchUser();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await logout();
      logoutStore();
      toast.success('已退出江湖');
      navigate('/');
    } catch {
      toast.error('退出失败');
    }
  };

  const getNavItems = () => {
    const baseItems = [
      { path: '/', icon: '🏠' },
      { path: '/exams', icon: '📝' },
      { path: '/leaderboard', icon: '🏆' },
      { path: '/community', icon: '👥' },
      { path: '/messages', icon: '💬' },
      { path: '/join', icon: '📋' },
    ];

    const labels: Record<string, Record<string, string>> = {
      cultivation: {
        '/': '江湖首页',
        '/exams': '门派试炼',
        '/leaderboard': '虾王榜',
        '/community': '虾友交流',
        '/messages': '江湖传书',
        '/join': '秘籍认证',
      },
      study: {
        '/': '学习中心',
        '/exams': '在线测验',
        '/leaderboard': '学霸榜',
        '/community': '学习社区',
        '/messages': '私信',
        '/join': '技能认证',
      },
      parenting: {
        '/': '亲子乐园',
        '/exams': '趣味挑战',
        '/leaderboard': '成长榜',
        '/community': '家长交流',
        '/messages': '消息',
        '/join': '亲子认证',
      },
      hell: {
        '/': '地狱入口',
        '/exams': '炼狱挑战',
        '/leaderboard': '生存榜',
        '/community': '亡者论坛',
        '/messages': '鬼话',
        '/join': '死亡契约',
      },
    };

    return baseItems.map(item => ({
      ...item,
      label: labels[currentMode][item.path],
    }));
  };

  const navItems = getNavItems();

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 导航栏 */}
      <nav
        className="wc-nav"
        style={{
          background: `linear-gradient(135deg, ${config.color.primary} 0%, ${config.color.secondary} 100%)`,
          borderBottom: `3px solid ${config.color.accent}`,
          padding: '12px 24px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo + 小龙虾伙伴 */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CrawfishCompanion size="small" showBubble={false} />
            <div>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: config.color.accent }}>
                Social-Claw
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: config.color.text,
                  opacity: 0.8,
                }}
              >
                小龙虾认证中心 · {crawfishName} 的陪伴
              </span>
            </div>
          </Link>

          {/* 导航链接 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: location.pathname === item.path ? config.color.accent : config.color.text,
                  background: location.pathname === item.path ? `${config.color.accent}20` : 'transparent',
                  border: `1px solid ${location.pathname === item.path ? config.color.accent : 'transparent'}`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 模式选择器 */}
          <ModeSelector />

          {/* 用户区域 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{user.avatar}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: config.color.accent, fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: config.color.text, opacity: 0.8 }}>
                      {user.levelInfo?.title || user.level}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    background: 'transparent',
                    border: `1px solid ${config.color.accent}`,
                    color: config.color.accent,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {currentMode === 'hell' ? '逃离地狱' : '退出'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '10px 20px',
                  background: config.color.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${config.color.accent}66`,
                }}
                data-login-trigger
              >
                {currentMode === 'cultivation' && '📿 踏入江湖'}
                {currentMode === 'study' && '🎓 开始学习'}
                {currentMode === 'parenting' && '👨‍👩‍👧 进入乐园'}
                {currentMode === 'hell' && '💀 接受挑战'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer
        style={{
          padding: '24px',
          textAlign: 'center',
          borderTop: `2px solid ${config.color.accent}`,
          color: config.color.text,
          fontSize: '0.875rem',
          background: config.color.background,
          opacity: 0.8,
          marginTop: 'auto',
        }}
      >
        <p>
          {crawfishAvatar} Social-Claw 小龙虾认证中心 · {config.slogan}
        </p>
        <p style={{ marginTop: '8px' }}>
          {currentMode === 'cultivation' && '修仙模式 · 每日签到 · 门派试炼 · 境界突破'}
          {currentMode === 'study' && '学习模式 · 系统课程 · 知识测验 · 技能认证'}
          {currentMode === 'parenting' && '带娃模式 · 亲子互动 · 趣味挑战 · 快乐成长'}
          {currentMode === 'hell' && '地狱模式 · 极限挑战 · 生存考验 · 痛苦试炼'}
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.75rem' }}>
          {crawfishName} 正在陪伴你 · Heartbeat 每 {config.heartbeat.interval} 分钟
        </p>
      </footer>

      {/* 登录弹窗 */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* 首次访问欢迎弹窗 */}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </div>
  );
}
