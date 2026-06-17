import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import BotsPage from './pages/BotsPage'
import WalletPage from './pages/WalletPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BacktestPage from './pages/BacktestPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bots" element={<BotsPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/backtest" element={<BacktestPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
