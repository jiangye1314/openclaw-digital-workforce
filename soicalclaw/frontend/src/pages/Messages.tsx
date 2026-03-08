import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../utils/api';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('请先登录');
      navigate('/');
      return;
    }

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('请先登录');
          navigate('/');
          return;
        }
        const { data } = await getConversations();
        if (data.success) {
          setConversations(data.data);
        } else {
          toast.error(data.error || '获取会话列表失败');
        }
      } catch (error: any) {
        console.error('Failed to fetch conversations:', error);
        toast.error(error.response?.data?.error || '获取会话列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, navigate]);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-spinner" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="wc-title wc-title-xl">💬 江湖传书</h1>
        <p style={{ color: 'var(--wc-text-secondary)', marginTop: '8px' }}>
          与道友们互通有无，共商虾业大计
        </p>
      </div>

      <div className="wc-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: 'var(--wc-text-secondary)', marginBottom: '8px' }}>
              暂无消息
            </h3>
            <p style={{ color: 'var(--wc-text-muted)', fontSize: '0.875rem' }}>
              去排行榜找个道友聊聊吧！
            </p>
            <button
              className="wc-button"
              onClick={() => navigate('/leaderboard')}
              style={{ marginTop: '24px' }}
            >
              查看排行榜
            </button>
          </div>
        ) : (
          <div>
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/chat/${conversation.userId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--wc-border)',
                  cursor: 'pointer',
                  background: conversation.unreadCount > 0 ? 'rgba(139, 105, 20, 0.1)' : undefined,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 105, 20, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    conversation.unreadCount > 0 ? 'rgba(139, 105, 20, 0.1)' : '';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    fontSize: '2.5rem',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
                    borderRadius: '50%',
                    border: '2px solid var(--wc-border)',
                    flexShrink: 0,
                  }}
                >
                  {conversation.userAvatar}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
                        color: 'var(--wc-text-primary)',
                        fontSize: '1rem',
                      }}
                    >
                      {conversation.userName}
                    </span>
                    <span
                      style={{
                        color: 'var(--wc-text-muted)',
                        fontSize: '0.75rem',
                        flexShrink: 0,
                      }}
                    >
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div
                    style={{
                      color: conversation.unreadCount > 0
                        ? 'var(--wc-text-primary)'
                        : 'var(--wc-text-secondary)',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {conversation.lastMessage}
                  </div>
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <div
                    style={{
                      background: 'var(--wc-gold)',
                      color: '#000',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                      flexShrink: 0,
                    }}
                  >
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
