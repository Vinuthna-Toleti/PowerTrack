
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate
} from 'react-router-dom'

import { useState } from 'react'

import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Appliances from './pages/Appliances'
import Analytics from './pages/Analytics'
import UsageHistory from './pages/UsageHistory'
import Login from './pages/Login'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'

import './App.css'


function ProtectedRoute({ isLoggedIn, children }) {

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}


function AppContent() {

  const navigate = useNavigate()

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  )

  // Added state for mobile navbar menu
  const [isMenuOpen, setIsMenuOpen] = useState(false)


  const handleLogin = () => {

    localStorage.setItem('isLoggedIn', 'true')

    setIsLoggedIn(true)

    navigate('/dashboard')
  }


  const handleLogout = () => {

    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')

    setIsLoggedIn(false)
    setIsMenuOpen(false)

    navigate('/login')
  }


  return (

    <>

      <nav className="navbar">

        <Link
          to="/"
          className="brand"
          onClick={() => setIsMenuOpen(false)}
        >

          <div className="brand-icon">
            ⚡
          </div>

          <div className="brand-text">

            <span className="brand-name">
              Power<span>Track</span>
            </span>

            <small>
              SMART ENERGY MANAGEMENT
            </small>

          </div>

        </Link>


        {/* Mobile hamburger menu button */}

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="powertrack-nav-links"
        >
          {isMenuOpen ? '×' : '☰'}
        </button>


        <div
          id="powertrack-nav-links"
          className={`nav-links ${isMenuOpen ? 'open' : ''}`}
        >

          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/appliances"
            onClick={() => setIsMenuOpen(false)}
          >
            Appliances
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/analytics"
            onClick={() => setIsMenuOpen(false)}
          >
            Analytics
          </Link>

          <Link
            to="/usage-history"
            onClick={() => setIsMenuOpen(false)}
          >
            Usage History
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsMenuOpen(false)}
          >
            Settings
          </Link>


          {!isLoggedIn ? (

            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>

          ) : (

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          )}

        </div>

      </nav>


      <Routes>

        {/* Home */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* Login */}

        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
            />
          }
        />


        {/* Forgot Password */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* Appliances */}

        <Route
          path="/appliances"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Appliances />
            </ProtectedRoute>
          }
        />


        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* Analytics */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* Usage History */}

        <Route
          path="/usage-history"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <UsageHistory />
            </ProtectedRoute>
          }
        />


        {/* Settings */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Settings />
            </ProtectedRoute>
          }
        />

      </Routes>

    </>

  )

}


function App() {

  return (

    <BrowserRouter>

      <AppContent />

    </BrowserRouter>

  )

}


export default App
