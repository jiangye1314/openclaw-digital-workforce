import { useState } from 'react';
import { useStore } from '../store/useStore';
import { login } from '../utils/api';
import toast from 'react-hot-toast';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('用户名至少需要2个字符');
      return;
    }

    setLoading(true);
    try {
      const { data } = await login(name.trim());
      if (data.success) {
        // 保存 token 到 localStorage 和 store
        const token = data.data.token;
        if (token) {
          localStorage.setItem('token', token);
          setToken(token);
        }
        setUser(data.data.user);
        toast.success(data.message || '登录成功！');
        onClose();
      } else {
        toast.error(data.error || '登录失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wc-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wc-corner wc-corner-tl" />
        <div className="wc-corner wc-corner-tr" />
        <div className="wc-corner wc-corner-bl" />
        <div className="wc-corner wc-corner-br" />

        <h2 className="wc-title wc-title-lg modal-title">⚔️ 加入冒险</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--wc-text-secondary)' }}>
              你的勇士之名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的名字..."
              className="wc-input"
              autoFocus
              maxLength={20}
            />
          </div>

          <p style={{ color: 'var(--wc-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
            无需密码，输入名字即可开始你的小龙虾养殖之旅！
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="wc-button wc-button-secondary"
              style={{ flex: 1 }}
            >
              取消
            </button>
            <button
              type="submit"
              className="wc-button"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? '⚔️ 进入中...' : '⚔️ 开始冒险'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
