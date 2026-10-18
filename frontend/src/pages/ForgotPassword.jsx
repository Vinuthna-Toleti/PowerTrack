
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.trim()) {
      setMessage('Please enter your registered email.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        'https://powertrack-1.onrender.com/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.trim() })
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data === 'string'
            ? data
            : 'Unable to process your request.'
        )
      }

      setMessage(
        data?.message ||
        'If the email is registered, follow the password reset instructions sent to it.'
      )
    } catch (error) {
      console.error('Forgot password error:', error)
      setMessage(
        'Could not process your request. Check the backend and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-icon">🔐</div>

        <h1>Forgot Password?</h1>

        <p>
          Enter your registered email address to begin
          resetting your PowerTrack password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email address</label>

          <input
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <p className="forgot-message" role="status">
            {message}
          </p>
        )}

        <button
          type="button"
          className="back-to-login"
          onClick={() => navigate('/')}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword
