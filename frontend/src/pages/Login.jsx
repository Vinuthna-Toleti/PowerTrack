
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login({ onLogin }) {
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const API_URL = 'https://powertrack-1.onrender.com/api/auth'

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email || !password || (isRegister && !name)) {
      alert('Please fill all fields')
      return
    }

    const endpoint = isRegister
      ? `${API_URL}/register`
      : `${API_URL}/login`

    const userData = isRegister
      ? {
          name: name,
          email: email,
          password: password
        }
      : {
          email: email,
          password: password
        }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        alert(
          typeof data === 'string'
            ? data
            : 'Something went wrong'
        )
        return
      }

      if (isRegister) {
        alert('Registration successful! Please login.')

        setIsRegister(false)
        setName('')
        setEmail('')
        setPassword('')
        setShowPassword(false)
      } else {
        alert(`Welcome to PowerTrack, ${data.name}!`)

        localStorage.setItem(
          'user',
          JSON.stringify(data)
        )

        if (onLogin) {
          onLogin()
        }

        setPassword('')
        setShowPassword(false)

        navigate('/dashboard')
      }
    } catch (error) {
      console.error(error)
      alert('Could not connect to the backend.')
    }
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-left">
        <div className="login-brand">
          ⚡ PowerTrack
        </div>

        <h1>
          Track Energy.
          <br />
          Save More. ⚡
        </h1>

        <p>
          Monitor your electricity consumption,
          understand your energy usage and
          discover smarter ways to save energy.
        </p>

        <div className="login-features">

          <div>
            📊
            <span>
              <strong>Smart Analytics</strong>
              <small>Understand your consumption</small>
            </span>
          </div>

          <div>
            💡
            <span>
              <strong>Energy Insights</strong>
              <small>Identify high energy consumers</small>
            </span>
          </div>

          <div>
            🤖
            <span>
              <strong>AI Recommendations</strong>
              <small>Get personalized energy tips</small>
            </span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="login-right">
        <div className="login-box">

          <h2>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          <p>
            {isRegister
              ? 'Create your PowerTrack account'
              : 'Login to your PowerTrack account'}
          </p>

          <form onSubmit={handleSubmit}>

            {isRegister && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD FIELD */}

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* LOGIN OPTIONS */}

            {!isRegister && (
              <div className="login-options">

                <label>
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>

              </div>
            )}

            <button
              type="submit"
              className="login-btn"
            >
              {isRegister ? 'Create Account' : 'Login'}
            </button>

          </form>

          {/* REGISTER / LOGIN TOGGLE */}

          <div className="register-text">
            {isRegister
              ? 'Already have an account? '
              : "Don't have an account? "}

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)

                setName('')
                setEmail('')
                setPassword('')
                setShowPassword(false)
              }}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login
