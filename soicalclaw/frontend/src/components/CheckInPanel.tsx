import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { checkIn, getCheckInStatus } from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckInDay {
  day: number;
  checked: boolean;
  today: boolean;
  reward: number;
}

export default function CheckInPanel() {
  const { user, setUser } = useStore();
  const [checkInDays, setCheckInDays] = useState<CheckInDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardExp, setRewardExp] = useState(0);

  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  const fetchCheckInStatus = async () => {
    if (!user) return;
    try {
      const { data } = await getCheckInStatus();
      if (data.success) {
        setCheckInDays(data.data.days);
        setStreak(data.data.streak);
        setTotalCheckIns(data.data.total);
        setCanCheckIn(data.data.canCheckIn);
      }
    } catch (error) {
      console.error('Failed to fetch check-in status:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || loading || !canCheckIn) return;
    setLoading(true);
    try {
      const { data } = await checkIn();
      if (data.success) {
        setRewardExp(data.data.reward);
        setShowReward(true);
        setStreak(data.data.streak);
        setTotalCheckIns(data.data.total);
        setCanCheckIn(false);

        // Update user experience
        if (setUser && user) {
          setUser({
            ...user,
            experience: user.experience + data.data.reward,
          });
        }

        toast.success(`🎉 打卡成功！获得 ${data.data.reward} 修为！`);
        fetchCheckInStatus();

        setTimeout(() => setShowReward(false), 2000);
      } else {
        toast.error(data.error || '打卡失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '打卡失败');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="wc-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Corner decorations */}
      <div className="wc-corner wc-corner-tl" />
      <div className="wc-corner wc-corner-tr" />
      <div className="wc-corner wc-corner-bl" />
      <div className="wc-corner wc-corner-br" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ color: 'var(--wc-gold)', fontSize: '1.25rem', marginBottom: '4px' }}>
            📿 每日签到
          </h3>
          <p style={{ color: 'var(--wc-text-secondary)', fontSize: '0.875rem' }}>
            连续签到获得更多修为
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--wc-gold)', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {streak} 天
          </div>
          <div style={{ color: 'var(--wc-text-muted)', fontSize: '0.75rem' }}>
            连续签到
          </div>
        </div>
      </div>

      {/* Check-in calendar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '20px' }}>
        {checkInDays.map((day, index) => (
          <motion.div
            key={day.day}
            className={`checkin-stamp ${day.checked ? 'checked' : ''} ${day.today ? 'today' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="day">{weekDays[index]}</span>
            <span style={{ fontSize: '1.25rem' }}>
              {day.checked ? '✓' : day.today ? '今' : '·'}
            </span>
            {day.checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  fontSize: '0.75rem',
                }}
              >
                🦞
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Reward display */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(145deg, var(--wc-gold) 0%, #B8860B 100%)',
              padding: '20px 40px',
              borderRadius: '12px',
              textAlign: 'center',
              zIndex: 10,
              boxShadow: '0 10px 40px rgba(255, 215, 0, 0.4)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🦞</div>
            <div style={{ color: '#000', fontWeight: 'bold', fontSize: '1.25rem' }}>
              +{rewardExp} 修为
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-in button */}
      <button
        onClick={handleCheckIn}
        disabled={loading || !canCheckIn || !user}
        className="wc-button"
        style={{
          width: '100%',
          background: canCheckIn
            ? 'linear-gradient(145deg, var(--wc-gold-dark) 0%, var(--wc-gold) 100%)'
            : undefined,
          color: canCheckIn ? '#000' : undefined,
          borderColor: canCheckIn ? 'var(--wc-gold)' : undefined,
        }}
      >
        {loading ? '⏳ 签到中...' : canCheckIn ? '📿 今日签到' : '✅ 今日已签到'}
        {!user && ' (请先登录)'}
      </button>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--wc-border)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--wc-gold)', fontWeight: 'bold' }}>{totalCheckIns}</div>
          <div style={{ color: 'var(--wc-text-muted)', fontSize: '0.75rem' }}>累计签到</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--wc-gold)', fontWeight: 'bold' }}>
            {streak >= 7 ? '3x' : streak >= 3 ? '2x' : '1x'}
          </div>
          <div style={{ color: 'var(--wc-text-muted)', fontSize: '0.75rem' }}>修为倍率</div>
        </div>
      </div>
    </div>
  );
}
