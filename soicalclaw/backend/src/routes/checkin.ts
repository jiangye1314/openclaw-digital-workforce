import express from 'express';
import { getCheckInData, updateCheckIn, updateCheckInData, updateUser } from '../utils/storage';
import { requireAuth } from '../utils/auth';

const router = express.Router();

// 计算签到奖励
function calculateReward(streak: number): number {
  const baseReward = 50;
  const multiplier = streak >= 7 ? 3 : streak >= 3 ? 2 : 1;
  return baseReward * multiplier;
}

// 获取本周签到状态
router.get('/status', requireAuth, (req, res) => {
  try {
    const user = req.user!;
    const checkInData = getCheckInData(user.id);

    // 获取本周的起始日期（周一）
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    // 生成本周的签到数据
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      days.push({
        day: i + 1,
        checked: checkInData.lastCheckIn === dateStr ||
                 (checkInData.checkInHistory || []).includes(dateStr),
        today: i === dayOfWeek - 1,
        reward: calculateReward(checkInData.streak),
      });
    }

    // 检查今天是否可以签到
    const todayStr = today.toISOString().split('T')[0];
    const canCheckIn = checkInData.lastCheckIn !== todayStr;

    res.json({
      success: true,
      data: {
        days,
        streak: checkInData.streak || 0,
        total: checkInData.totalCheckIns || 0,
        canCheckIn,
      }
    });
  } catch (error) {
    console.error('Get check-in status error:', error);
    res.status(500).json({ success: false, error: '获取签到状态失败' });
  }
});

// 执行签到
router.post('/', requireAuth, (req, res) => {
  try {
    const user = req.user!;
    const today = new Date().toISOString().split('T')[0];

    // 检查今天是否已经签到
    const checkInData = getCheckInData(user.id);
    if (checkInData.lastCheckIn === today) {
      return res.status(400).json({
        success: false,
        error: '今日已签到'
      });
    }

    // 计算连续签到
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (checkInData.lastCheckIn === yesterdayStr) {
      newStreak = (checkInData.streak || 0) + 1;
    }

    // 计算奖励
    const reward = calculateReward(newStreak);

    // 更新签到数据
    updateCheckIn(user.id, today, newStreak);

    // 给用户增加经验
    const updatedUser = updateUser(user.id, {
      experience: user.experience + reward
    });

    // 添加签到记录到历史
    const history = checkInData.checkInHistory || [];
    history.push(today);
    updateCheckInData(user.id, {
      ...checkInData,
      checkInHistory: history.slice(-30), // 保留最近30天
    });

    res.json({
      success: true,
      message: `签到成功！获得 ${reward} 修为！`,
      data: {
        reward,
        streak: newStreak,
        total: (checkInData.totalCheckIns || 0) + 1,
        user: updatedUser,
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, error: '签到失败' });
  }
});

export default router;
