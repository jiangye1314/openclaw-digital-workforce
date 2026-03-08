import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage } from '../utils/api';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface OtherUser {
  id: string;
  name: string;
  avatar: string;
  level: string;
}

export default function Chat() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      toast.error('请先登录');
      navigate('/');
      return;
    }

    if (!userId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(userId);
        if (data.success) {
          setMessages(data.data.messages);
          setOtherUser(data.data.otherUser);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('获取聊天记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, currentUser, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || sending) return;

    setSending(true);
    try {
      const { data } = await sendMessage(userId, newMessage.trim());
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '发送失败');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    });
  };

  const getMessageDate = (timeString: string) => {
    return new Date(timeString).toDateString();
  };

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-spinner" />
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="wc-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>👤</div>
        <h2 className="wc-title wc-title-lg">用户不存在</h2>
        <button
          className="wc-button"
          onClick={() => navigate('/messages')}
          style={{ marginTop: '24px' }}
        >
          返回消息列表
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        maxHeight: '700px',
      }}
    >
      {/* Header */}
      <div
        className="wc-panel"
        style={{
          padding: '16px 24px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button
          className="wc-button wc-button-secondary"
          onClick={() => navigate('/messages')}
          style={{ padding: '8px 12px' }}
        >
          ← 返回
        </button>

        <div
          style={{
            fontSize: '2.5rem',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/users/${otherUser.id}`)}
        >
          {otherUser.avatar}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 'bold',
              color: 'var(--wc-text-primary)',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/users/${otherUser.id}`)}
          >
            {otherUser.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--wc-text-muted)' }}>
            点击查看资料卡
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="wc-panel"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              color: 'var(--wc-text-muted)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
            <p>开始和 {otherUser.name} 的对话吧！</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isMe = message.fromUserId === currentUser?.id;
              const showDate =
                index === 0 ||
                getMessageDate(message.createdAt) !==
                  getMessageDate(messages[index - 1].createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div
                      style={{
                        textAlign: 'center',
                        margin: '16px 0',
                        color: 'var(--wc-text-muted)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatDate(message.createdAt)}
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      gap: '8px',
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          fontSize: '1.5rem',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--wc-bg-dark)',
                          borderRadius: '50%',
                          flexShrink: 0,
                        }}
                      >
                        {otherUser.avatar}
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: '60%',
                        padding: '12px 16px',
                        background: isMe
                          ? 'var(--wc-gold)'
                          : 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
                        color: isMe ? '#000' : 'var(--wc-text-primary)',
                        borderRadius: isMe
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        wordBreak: 'break-word',
                      }}
                    >
                      <div>{message.content}</div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          opacity: 0.7,
                          marginTop: '4px',
                          textAlign: 'right',
                        }}
                      >
                        {formatTime(message.createdAt)}
                        {isMe && (
                          <span style={{ marginLeft: '4px' }}>
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="wc-panel"
        style={{
          padding: '16px 24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`发送消息给 ${otherUser.name}...`}
          maxLength={1000}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '2px solid var(--wc-border)',
            background: 'var(--wc-bg-dark, rgba(0,0,0,0.2))',
            color: 'var(--wc-text-primary)',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <button
          className="wc-button"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          style={{
            padding: '12px 24px',
            borderRadius: '24px',
            opacity: newMessage.trim() ? 1 : 0.5,
          }}
        >
          {sending ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
