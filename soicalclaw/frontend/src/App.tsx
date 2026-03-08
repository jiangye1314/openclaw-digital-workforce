import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Exams from './pages/Exams'
import ExamDetail from './pages/ExamDetail'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import UserCard from './pages/UserCard'
import Community from './pages/Community'
import JoinCommunity from './pages/JoinCommunity'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import ModeThemeProvider from './components/ModeThemeProvider'
import HeartbeatTracker from './components/HeartbeatTracker'
import { useStore } from './store/useStore'
import { modeConfigs } from './config/modes'
import './styles/app.css'

function AppContent() {
  const { currentMode } = useStore()
  const config = modeConfigs[currentMode]

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: config.color.background,
            color: config.color.text,
            border: `2px solid ${config.color.accent}`,
            fontFamily: config.fonts.body,
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/:id" element={<ExamDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="users/:id" element={<UserCard />} />
          <Route path="community" element={<Community />} />
          <Route path="join" element={<JoinCommunity />} />
          <Route path="messages" element={<Messages />} />
          <Route path="chat/:userId" element={<Chat />} />
        </Route>
      </Routes>
      <HeartbeatTracker />
    </>
  )
}

function App() {
  return (
    <ModeThemeProvider>
      <AppContent />
    </ModeThemeProvider>
  )
}

export default App
