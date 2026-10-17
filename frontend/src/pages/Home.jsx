import { Link } from 'react-router-dom'
import './Home.css'

function Home() {

  return (

    <div className="home">

      {/* Hero Section */}

      <div className="home-hero">

        {/* Left Content */}

        <div className="home-content">

          <div className="home-badge">
            ⚡ Smart Energy Management
          </div>

          <h1>
            Track Your Power.
            <br />
            <span>Save Your Energy.</span>
          </h1>

          <p>
            PowerTrack helps you monitor electricity
            consumption, understand your energy usage,
            and make smarter decisions to reduce
            unnecessary energy consumption.
          </p>


          <div className="home-buttons">

            <Link to="/dashboard">
              <button className="primary-btn">
                Get Started →
              </button>
            </Link>

            <Link to="/analytics">
              <button className="secondary-btn">
                View Analytics
              </button>
            </Link>

          </div>

        </div>


        {/* Right Visual */}

        <div className="home-visual">

          <div className="energy-circle">

            <div className="energy-icon">
              ⚡
            </div>

          </div>

          <div className="energy-card card-one">
            <span>📊</span>
            <div>
              <strong>Energy Usage</strong>
              <small>Monitor consumption</small>
            </div>
          </div>

          <div className="energy-card card-two">
            <span>💡</span>
            <div>
              <strong>Save Energy</strong>
              <small>Reduce wastage</small>
            </div>
          </div>

          <div className="energy-card card-three">
            <span>🤖</span>
            <div>
              <strong>AI Insights</strong>
              <small>Smart recommendations</small>
            </div>
          </div>

        </div>

      </div>


      {/* Features */}

      <div className="home-features">

        <div className="feature">

          <div className="feature-icon">
            ⚡
          </div>

          <div>
            <h3>Track Consumption</h3>

            <p>
              Record your appliances and
              monitor their energy usage.
            </p>
          </div>

        </div>


        <div className="feature">

          <div className="feature-icon">
            📊
          </div>

          <div>
            <h3>Analyze Usage</h3>

            <p>
              Understand which appliances
              consume the most electricity.
            </p>
          </div>

        </div>


        <div className="feature">

          <div className="feature-icon">
            🤖
          </div>

          <div>
            <h3>AI Powered</h3>

            <p>
              Get intelligent recommendations
              for saving energy.
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Home