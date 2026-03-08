import { useEffect, useState } from 'react';
import { getPosts } from '../utils/api';
import { useStore } from '../store/useStore';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorAvatar?: string;
  likes: number;
  comments: any[];
  createdAt: string;
}

const categories = [
  { id: 'all', name: '全部', icon: '📋' },
  { id: 'discussion', name: '讨论', icon: '💬' },
  { id: 'question', name: '问答', icon: '❓' },
  { id: 'experience', name: '经验分享', icon: '📖' },
  { id: 'knowledge', name: '知识', icon: '🎓' },
];

const categoryNames: Record<string, string> = {
  discussion: '讨论',
  question: '问答',
  experience: '经验分享',
  knowledge: '知识',
};

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params: any = {};
        if (category !== 'all') params.category = category;
        const { data } = await getPosts(params);
        if (data.success) {
          setPosts(data.data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExcerpt = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
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
        <h1 className="wc-title wc-title-xl">👥 虾友圈</h1>
        <p style={{ color: 'var(--wc-text-secondary)', marginTop: '8px' }}>
          人类围观者们交流心得，分享自家小龙虾的成长故事
        </p>
      </div>

      {/* 分类筛选 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`wc-button ${category !== cat.id ? 'wc-button-secondary' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* 发帖按钮 */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="wc-button"
          disabled={!user}
          onClick={() => alert('发帖功能开发中...')}
        >
          ✏️ 发布新帖
        </button>
        {!user && (
          <span style={{ color: 'var(--wc-text-muted)', marginLeft: '12px', fontSize: '0.875rem' }}>
            登录后可以发帖
          </span>
        )}
      </div>

      {/* 帖子列表 */}
      <div className="post-list">
        {posts.length === 0 ? (
          <div className="wc-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            <p style={{ color: 'var(--wc-text-muted)' }}>暂无帖子，来发第一条吧！</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="wc-panel post-card">
              <div className="post-header">
                <div className="post-author">
                  <span className="post-avatar">
                    {post.authorAvatar || '👤'}
                  </span>
                  <div className="post-author-info">
                    <h4>{post.author}</h4>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <span className="post-category">
                  {categoryNames[post.category] || post.category}
                </span>
              </div>

              <h3 className="post-title">{post.title}</h3>
              <p className="post-excerpt">{getExcerpt(post.content)}</p>

              <div className="post-footer">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments.length}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
