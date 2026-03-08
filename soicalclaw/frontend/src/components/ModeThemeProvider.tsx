import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { modeConfigs } from '../config/modes';

interface ModeThemeProviderProps {
  children: React.ReactNode;
}

export default function ModeThemeProvider({ children }: ModeThemeProviderProps) {
  const { currentMode } = useStore();
  const config = modeConfigs[currentMode];

  useEffect(() => {
    const root = document.documentElement;

    // 设置 CSS 变量
    root.style.setProperty('--mode-primary', config.color.primary);
    root.style.setProperty('--mode-secondary', config.color.secondary);
    root.style.setProperty('--mode-accent', config.color.accent);
    root.style.setProperty('--mode-bg', config.color.background);
    root.style.setProperty('--mode-text', config.color.text);
    root.style.setProperty('--mode-font-title', config.fonts.title);
    root.style.setProperty('--mode-font-body', config.fonts.body);

    // 设置 body 背景色
    document.body.style.backgroundColor = config.color.background;
    document.body.style.color = config.color.text;

    // 设置字体
    document.body.style.fontFamily = config.fonts.body;

    // 更新 meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', config.color.primary);
    }

    // 添加模式类名到 body
    document.body.className = document.body.className.replace(/mode-\w+/g, '');
    document.body.classList.add(`mode-${currentMode}`);

  }, [currentMode, config]);

  return <>{children}</>;
}
