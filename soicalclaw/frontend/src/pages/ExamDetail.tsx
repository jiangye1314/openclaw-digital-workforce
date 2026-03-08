import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getExam, submitExam } from '../utils/api';
import LevelBadge from '../components/LevelBadge';
// import ExpBar from '../components/ExpBar';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'truefalse';
  question: string;
  options: { id: string; text: string }[];
  points: number;
}

interface Exam {
  id: string;
  level: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
  experienceReward: number;
  canTake?: boolean;
  isCompleted?: boolean;
}

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      try {
        const { data } = await getExam(id);
        if (data.success) {
          setExam(data.data);
          setTimeLeft(data.data.timeLimit * 60);
        } else {
          toast.error(data.error || '获取考试失败');
          navigate('/exams');
        }
      } catch (error) {
        toast.error('获取考试失败');
        navigate('/exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  // 倒计时
  useEffect(() => {
    if (!exam || result || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, result, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, optionId: string, type: string) => {
    setAnswers((prev) => {
      if (type === 'multiple') {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || !id || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timeSpent = exam.timeLimit * 60 - timeLeft;
      const { data } = await submitExam(id, answers, timeSpent);
      if (data.success) {
        setResult(data.data);
        if (data.data.result.passed) {
          toast.success(data.message);
          if (data.data.levelUp && setUser && user) {
            setUser({
              ...user,
              level: data.data.newLevel.level,
              experience: data.data.experience.total,
              completedExams: [...user.completedExams, id],
            });
          }
        } else {
          toast.error(data.message);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '提交失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [exam, id, answers, timeLeft, isSubmitting, setUser, user]);

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-spinner" />
      </div>
    );
  }

  if (!exam) {
    return <div>考试不存在</div>;
  }

  // 显示结果
  if (result) {
    const passed = result.result.passed;

    return (
      <div className="wc-panel result-panel">
        <div
          className={`result-score ${passed ? 'passed' : 'failed'}`}
        >
          {result.result.score}分
        </div>
        <p className="result-message">
          {passed
            ? `🎉 恭喜你的小龙虾通过了考试！`
            : `💔 你的小龙虾这次没考过，别灰心！`}
        </p>

        {passed ? (
          <div className="result-rewards">
            <div className="reward-item">
              <div className="reward-icon">⭐</div>
              <div className="reward-value">+{exam.experienceReward} EXP</div>
            </div>
            {result.levelUp && (
              <div className="reward-item">
                <div className="reward-icon">🎊</div>
                <div className="reward-value">
                  进化：{result.newLevel.title}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255, 99, 71, 0.1)',
              border: '2px dashed var(--wc-error)',
              borderRadius: '12px',
              padding: '24px',
              margin: '24px 0',
              maxWidth: '500px',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📜</div>
            <h3 style={{ color: 'var(--wc-error)', marginBottom: '12px' }}>
              考试太难？试试 Skill 认证！
            </h3>
            <p style={{ color: 'var(--wc-text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              你的小龙虾可以通过提交 skill.md 技能档案来证明自己，
              <br />
              免考直接获得等级认证！
            </p>
            <button
              onClick={() => navigate('/join')}
              className="wc-button"
              style={{ background: 'var(--wc-error)', borderColor: 'var(--wc-error)' }}
            >
              📜 去提交 Skill 档案 →
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          <button onClick={() => navigate('/exams')} className="wc-button">
            返回考试列表
          </button>
          {!passed && (
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
                setCurrentQuestion(0);
                setTimeLeft(exam.timeLimit * 60);
              }}
              className="wc-button wc-button-secondary"
            >
              重新考试
            </button>
          )}
        </div>
      </div>
    );
  }

  // 检查是否可以做
  if (!exam.canTake) {
    return (
      <div className="wc-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔒</div>
        <h2 className="wc-title wc-title-lg">考试未解锁</h2>
        <p style={{ color: 'var(--wc-text-secondary)', marginTop: '16px' }}>
          你需要先完成前置考试才能参加此考试
        </p>
        <button onClick={() => navigate('/exams')} className="wc-button" style={{ marginTop: '24px' }}>
          返回考试列表
        </button>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <div>
      {/* 头部信息 */}
      <div className="exam-header">
        <h1 className="wc-title wc-title-lg">{exam.title}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
          <LevelBadge level={exam.level} />
          <span style={{ color: 'var(--wc-text-secondary)' }}>
            共 {exam.questions.length} 题
          </span>
          <span style={{ color: 'var(--wc-text-secondary)' }}>
            及格 {exam.passingScore} 分
          </span>
        </div>
      </div>

      {/* 计时器 */}
      <div className={`exam-timer ${timeLeft < 60 ? 'warning' : ''}`}>
        ⏱️ {formatTime(timeLeft)}
      </div>

      {/* 进度条 */}
      <div className="exp-bar" style={{ marginBottom: '24px' }}>
        <div className="exp-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 题目 */}
      <div className="wc-panel question-card">
        <div className="question-number">
          题目 {currentQuestion + 1} / {exam.questions.length}
        </div>
        <div className="question-text">{question.question}</div>

        <div className="options-list">
          {question.options.map((option) => {
            const isSelected = (answers[question.id] || []).includes(option.id);
            return (
              <div
                key={option.id}
                className={`option-item ${isSelected ? 'selected' : ''}`}
                onClick={() =>
                  handleAnswer(question.id, option.id, question.type)
                }
              >
                <input
                  type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                  checked={isSelected}
                  onChange={() => {}}
                />
                <span>{option.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="wc-button wc-button-secondary"
        >
          ← 上一题
        </button>

        {currentQuestion < exam.questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrentQuestion((prev) =>
                Math.min(exam.questions.length - 1, prev + 1)
              )
            }
            className="wc-button"
          >
            下一题 →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="wc-button wc-button-success"
          >
            {isSubmitting ? '提交中...' : '✅ 提交试卷'}
          </button>
        )}
      </div>

      {/* 题目导航 */}
      <div className="wc-panel" style={{ marginTop: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {exam.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor:
                  currentQuestion === idx
                    ? 'var(--wc-gold)'
                    : answers[q.id]?.length
                    ? 'var(--wc-success)'
                    : 'var(--wc-border)',
                background:
                  currentQuestion === idx
                    ? 'rgba(255, 215, 0, 0.2)'
                    : answers[q.id]?.length
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'var(--wc-bg-dark)',
                color: 'var(--wc-text-primary)',
                cursor: 'pointer',
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
