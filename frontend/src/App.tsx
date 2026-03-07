import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Teams } from './pages/Teams'
import { Employees } from './pages/Employees'
import { EmployeeChat } from './pages/EmployeeChat'
import { Connections } from './pages/Connections'
import { TeamDetail } from './pages/TeamDetail'
import { TeamOrchestrator } from './pages/TeamOrchestrator'
import { CreateTeam } from './pages/CreateTeam'
import { Tasks } from './pages/Tasks'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/create" element={<CreateTeam />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/teams/:id/orchestrate" element={<TeamOrchestrator />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id/chat" element={<EmployeeChat />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </Layout>
  )
}

export default App
