import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  Server,
  Plus,
  Menu,
  Send,
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/teams', icon: Users, label: '团队管理' },
    { path: '/employees', icon: Briefcase, label: '员工管理' },
    { path: '/tasks', icon: Send, label: '下达任务' },
    { path: '/connections', icon: Server, label: '连接管理' },
  ]

  return (
    <div className="min-h-screen bg-paper-cream flex" style={{
      backgroundImage: `
        linear-gradient(var(--line-gray) 1px, transparent 1px),
        linear-gradient(90deg, var(--line-gray) 1px, transparent 1px)
      `,
      backgroundSize: '100% 28px, 28px 100%'
    }}>
      {/* Sidebar - 笔记本风格 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-paper-white transform transition-transform duration-300 lg:translate-x-0 lg:static sketch-border ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderLeft: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--line-blue) 27px, var(--line-blue) 28px)',
          backgroundSize: '100% 28px',
          lineHeight: '28px'
        }}
      >
        <div className="h-full flex flex-col relative">
          {/* 红色装订线 */}
          <div
            className="absolute left-8 top-0 bottom-0 w-0.5 bg-line-red opacity-50"
            style={{
              backgroundImage: 'repeating-linear-gradient(var(--line-red) 0px, var(--line-red) 8px, transparent 8px, transparent 16px)',
              backgroundSize: '100% 16px'
            }}
          />

          {/* Logo - 便利贴风格 */}
          <div className="h-20 flex items-center px-6 pt-4 mb-4">
            <div className="sticky-note tape ml-8 p-4 transform -rotate-2">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🦞</span>
                <div>
                  <h1 className="font-bold text-ink-primary text-lg leading-tight">今天我是虾老板</h1>
                  <p className="text-xs text-ink-light">数字员工团队</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto ml-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-lg transition-all duration-200 sketch-border mb-2 ${
                    isActive
                      ? 'bg-highlight-yellow transform -rotate-1'
                      : 'hover:bg-paper-yellow hover:transform hover:rotate-1'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 text-ink-primary" />
                <span className="text-ink-primary">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Create Team Button - 手绘按钮 */}
          <div className="p-4 ml-4">
            <NavLink
              to="/teams/create"
              className="flex items-center justify-center w-full px-4 py-3 bg-ink-blue text-white sketch-border transform hover:scale-105 hover:-rotate-1 transition-transform"
            >
              <Plus className="w-5 h-5 mr-2" />
              创建新团队
            </NavLink>
          </div>

          {/* Version */}
          <div className="px-4 py-3 text-sm text-ink-light ml-4">
            OpenClaw Digital Workforce v1.0.0
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink-primary/20 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - 撕纸效果 */}
        <header
          className="h-16 bg-paper-white flex items-center justify-between px-4 lg:px-8 shadow-sketch relative"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--line-gray) 27px, var(--line-gray) 28px)',
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 sketch-border hover:bg-paper-yellow"
          >
            <Menu className="w-6 h-6 text-ink-primary" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center space-x-3 text-lg text-ink-secondary">
              <span className="flex items-center marker-highlight">
                <span className="w-3 h-3 rounded-full bg-ink-green mr-2 border-2 border-white shadow-sm"></span>
                系统正常
              </span>
            </div>

            {/* Settings */}
            <button className="p-2 sketch-border hover:bg-paper-yellow transition-colors transform hover:rotate-3">
              <Settings className="w-5 h-5 text-ink-primary" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
