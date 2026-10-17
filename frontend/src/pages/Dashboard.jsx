
import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard() {

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  }

  function getSavedRate(currentUser) {
    try {
      const key = `powertrackSettings_${
        currentUser?.id ||
        currentUser?.email ||
        currentUser?.username ||
        'default'
      }`

      const settings = JSON.parse(
        localStorage.getItem(key) || '{}'
      )

      return Number(
        settings.tariff ?? currentUser?.ratePerUnit ?? 8
      )
    } catch {
      return Number(currentUser?.ratePerUnit ?? 8)
    }
  }

  const [user, setUser] = useState(getUser)
  const userId = user?.id

  const [appliances, setAppliances] = useState([])
  const [history, setHistory] = useState([])

  const [ratePerUnit, setRatePerUnit] = useState(
    () => getSavedRate(getUser())
  )

  const [monthlyBudget, setMonthlyBudget] = useState(
    user?.monthlyBudget ?? ''
  )

  const [suggestions, setSuggestions] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const API_URL = 'http://localhost:8080/api/appliances'
  const HISTORY_API_URL = 'http://localhost:8080/api/usage-history'


  /* =========================
     LOAD APPLIANCES AND HISTORY
  ========================= */

  useEffect(() => {

    if (!userId) {
      setError('Please login first')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    fetch(`${API_URL}/user/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch appliance data')
        }

        return response.json()
      })
      .then(data => {
        setAppliances(data)

        return fetch(`${HISTORY_API_URL}/user/${userId}`)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch usage history')
        }

        return response.json()
      })
      .then(historyData => {
        setHistory(historyData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Dashboard error:', error)
        setError('Could not load dashboard data')
        setLoading(false)
      })

  }, [userId])


  /* =========================
     LOAD SMART SUGGESTIONS
  ========================= */

  useEffect(() => {

    if (!userId) return

    fetch(`${API_URL}/suggestions/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        return response.json()
      })
      .then(data => {
        setSuggestions(data)
      })
      .catch(error => {
        console.error('Suggestions error:', error)
      })

  }, [userId])


  /* =========================
     SYNCHRONIZE SAVED RATE
  ========================= */

  useEffect(() => {

    const currentUser = getUser()

    setUser(currentUser)
    setRatePerUnit(getSavedRate(currentUser))
    setMonthlyBudget(currentUser?.monthlyBudget ?? '')

  }, [])


  /* =========================
     UPDATE ELECTRICITY RATE
  ========================= */

  async function updateRate() {

    if (!userId) return

    const newRate = Number(ratePerUnit)

    if (
      !Number.isFinite(newRate) ||
      newRate <= 0
    ) {
      alert('Please enter a valid electricity rate')
      setRatePerUnit(getSavedRate(user))
      return
    }

    try {

      const response = await fetch(
        `http://localhost:8080/api/auth/rate/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ratePerUnit: newRate
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update electricity rate')
      }

      const updatedUser = await response.json()

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      )

      setUser(updatedUser)

      const key = `powertrackSettings_${
        updatedUser.id ||
        updatedUser.email ||
        updatedUser.username ||
        'default'
      }`

      let settings = {}

      try {
        settings = JSON.parse(
          localStorage.getItem(key) || '{}'
        )
      } catch {
        settings = {}
      }

      localStorage.setItem(
        key,
        JSON.stringify({
          ...settings,
          tariff: newRate
        })
      )

      alert('Electricity rate updated successfully')

    } catch (error) {

      console.error('Rate update error:', error)
      alert('Could not save electricity rate')

    }
  }


  /* =========================
     UPDATE MONTHLY BUDGET
  ========================= */

  async function updateBudget() {

    if (!userId) return

    const newBudget = Number(monthlyBudget)

    if (
      monthlyBudget === '' ||
      !Number.isFinite(newBudget) ||
      newBudget < 0
    ) {
      alert('Please enter a valid monthly budget')
      return
    }

    try {

      const response = await fetch(
        `http://localhost:8080/api/auth/budget/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            monthlyBudget: newBudget
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update monthly budget')
      }

      const updatedUser = await response.json()

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      )

      setUser(updatedUser)
      setMonthlyBudget(updatedUser.monthlyBudget ?? '')

      alert('Monthly budget updated successfully')

    } catch (error) {

      console.error('Budget update error:', error)
      alert('Could not save monthly budget')

    }
  }


  /* =========================
     TODAY'S USAGE
  ========================= */

  const totalDailyUsage = appliances.reduce(
    (total, appliance) =>
      total + Number(appliance.dailyUsage || 0),
    0
  )


  /* =========================
     CURRENT DATE
  ========================= */

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()


  /* =========================
     CURRENT MONTH HISTORY
  ========================= */

  const currentMonthHistory = history.filter(record => {

    if (!record.date) return false

    const [year, month] = record.date.split('-').map(Number)

    return (
      year === currentYear &&
      month - 1 === currentMonth
    )
  })


  /* =========================
     ACTUAL MONTHLY USAGE
  ========================= */

  const totalMonthlyUsage = currentMonthHistory.reduce(
    (total, record) =>
      total + Number(record.dailyUsage || 0),
    0
  )


  /* =========================
     NUMBER OF RECORDED DAYS
  ========================= */

  const recordedDays = new Set(
    currentMonthHistory.map(record => record.date)
  ).size


  /* =========================
     DAYS IN CURRENT MONTH
  ========================= */

  const daysInCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate()


  /* =========================
     AVERAGE DAILY USAGE
  ========================= */

  const averageDailyUsage = recordedDays > 0
    ? totalMonthlyUsage / recordedDays
    : 0


  /* =========================
     PROJECTED MONTHLY USAGE
  ========================= */

  const projectedMonthlyUsage =
    averageDailyUsage * daysInCurrentMonth


  /* =========================
     CUSTOM ELECTRICITY BILL
  ========================= */

  function calculateBill(units) {

    const rate = Number(ratePerUnit) || 0

    return Math.max(0, Number(units) || 0) * rate
  }


  /* =========================
     PROJECTED BILL
  ========================= */

  const estimatedBill = calculateBill(
    projectedMonthlyUsage
  )


  /* =========================
     TOP CONSUMER
  ========================= */

  const topConsumer = appliances.length > 0
    ? appliances.reduce(
        (highest, appliance) =>
          Number(appliance.dailyUsage || 0) >
          Number(highest.dailyUsage || 0)
            ? appliance
            : highest
      )
    : null


  /* =========================
     BUDGET CALCULATIONS
  ========================= */

  const budget = Number(monthlyBudget || 0)
  const budgetRemaining = budget - estimatedBill

  const budgetPercentage = budget > 0
    ? Math.min((estimatedBill / budget) * 100, 100)
    : 0


  /* =========================
     PREVIOUS MONTH
  ========================= */

  const previousMonth = currentMonth === 0
    ? 11
    : currentMonth - 1

  const previousMonthYear = currentMonth === 0
    ? currentYear - 1
    : currentYear


  const previousMonthHistory = history.filter(record => {

    if (!record.date) return false

    const [year, month] = record.date.split('-').map(Number)

    return (
      year === previousMonthYear &&
      month - 1 === previousMonth
    )
  })


  const previousMonthUsage = previousMonthHistory.reduce(
    (total, record) =>
      total + Number(record.dailyUsage || 0),
    0
  )


  const previousMonthBill = calculateBill(
    previousMonthUsage
  )

  const currentMonthBill = calculateBill(
    totalMonthlyUsage
  )

  const savings = previousMonthBill - currentMonthBill

  const hasPreviousMonthData =
    previousMonthHistory.length > 0


  /* =========================
     PAGE
  ========================= */

  return (

    <div className="dashboard">

      <div className="dashboard-header">

        <h1>Energy Dashboard ⚡</h1>

        <p>
          Monitor your electricity consumption
          and manage your energy usage.
        </p>

      </div>


      {!loading && !error && (

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">⚡</div>
            <div>
              <h3>Today's Usage</h3>
              <h2>{totalDailyUsage.toFixed(2)} kWh</h2>
              <p>Total daily consumption</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <div>
              <h3>This Month</h3>
              <h2>{totalMonthlyUsage.toFixed(2)} kWh</h2>
              <p>Actual consumption recorded</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <div>
              <h3>Projected Monthly Bill</h3>
              <h2>₹{estimatedBill.toFixed(2)}</h2>
              <p>Based on projected monthly usage</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔥</div>
            <div>
              <h3>Top Consumer</h3>
              <h2>{topConsumer ? topConsumer.name : 'No Data'}</h2>
              <p>
                {topConsumer
                  ? `${Number(topConsumer.dailyUsage || 0).toFixed(2)} kWh/day`
                  : 'Add appliances'}
              </p>
            </div>
          </div>

        </div>

      )}


      {loading && (
        <div className="dashboard-message">
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {!loading && !error && (

        <div className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>📊 Consumption Overview</h2>
              <p>
                Understand how each appliance contributes
                to your electricity usage.
              </p>
            </div>

            <div className="rate-box">
              <span className="rate-label">
                Electricity Rate
              </span>

              <div className="rate-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={ratePerUnit}
                  onChange={event =>
                    setRatePerUnit(event.target.value)
                  }
                  onBlur={updateRate}
                />

                <span>/ unit</span>
              </div>
            </div>

          </div>


          {appliances.length === 0 ? (

            <p className="no-data">
              No appliance data available.
              Add appliances to view your consumption.
            </p>

          ) : (

            <div className="consumption-table">

              <div className="consumption-header">
                <div>Appliance</div>
                <div>Quantity × Power</div>
                <div>Daily Usage</div>
                <div>Monthly Usage</div>
                <div>Share</div>
              </div>


              {appliances.map(appliance => {

                const dailyUsage = Number(
                  appliance.dailyUsage || 0
                )

                const monthlyUsage = Number(
                  appliance.monthlyUsage || 0
                )

                const percentage = totalDailyUsage > 0
                  ? (dailyUsage / totalDailyUsage) * 100
                  : 0

                return (

                  <div
                    className="consumption-row"
                    key={appliance.id}
                  >

                    <div className="appliance-name">
                      <span className="appliance-icon">⚡</span>
                      <strong>{appliance.name}</strong>
                    </div>

                    <div className="quantity-power">
                      {appliance.quantity} × {appliance.power} W
                    </div>

                    <div className="usage-value">
                      <strong>{dailyUsage.toFixed(2)}</strong>
                      <span>kWh/day</span>
                    </div>

                    <div className="usage-value">
                      <strong>{monthlyUsage.toFixed(2)}</strong>
                      <span>kWh/month</span>
                    </div>

                    <div className="share-section">
                      <div className="share-number">
                        {percentage.toFixed(1)}%
                      </div>

                      <div className="share-bar-background">
                        <div
                          className="share-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                  </div>

                )
              })}

            </div>

          )}

        </div>

      )}


      {!loading && !error && (

        <div className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>💳 Monthly Electricity Budget</h2>
              <p>
                Set a monthly budget and compare it
                with your projected electricity bill.
              </p>
            </div>

            <div className="rate-box">
              <span className="rate-label">Monthly Budget</span>

              <div className="rate-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyBudget}
                  placeholder="Enter budget"
                  onChange={event =>
                    setMonthlyBudget(event.target.value)
                  }
                  onBlur={updateBudget}
                />
              </div>
            </div>

          </div>


          <div className="budget-summary">

            <div className="budget-item">
              <span>Budget</span>
              <strong>₹{budget.toFixed(2)}</strong>
            </div>

            <div className="budget-item">
              <span>Projected Bill</span>
              <strong>₹{estimatedBill.toFixed(2)}</strong>
            </div>

            <div className="budget-item">
              <span>
                {budgetRemaining >= 0 ? 'Remaining' : 'Over Budget'}
              </span>

              <strong className={budgetRemaining < 0 ? 'over-budget' : ''}>
                ₹{Math.abs(budgetRemaining).toFixed(2)}
              </strong>
            </div>

          </div>


          {budget > 0 && (

            <div className="budget-usage">

              <div className="budget-usage-label">
                <span>Budget Usage</span>
                <span>{budgetPercentage.toFixed(1)}%</span>
              </div>

              <div className="budget-usage-bar">
                <div
                  className="budget-usage-fill"
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>

            </div>

          )}

        </div>

      )}


      {!loading && !error && (

        <div className="dashboard-section">

          <div className="section-header">
            <div>
              <h2>📈 Savings Tracker</h2>
              <p>
                Compare your recorded electricity cost
                with the previous month.
              </p>
            </div>
          </div>


          {!hasPreviousMonthData ? (

            <p className="no-data">
              Previous Month Data is not available yet.
            </p>

          ) : (

            <div className="budget-summary">

              <div className="budget-item">
                <span>Previous Month</span>
                <strong>₹{previousMonthBill.toFixed(2)}</strong>
              </div>

              <div className="budget-item">
                <span>Current Month</span>
                <strong>₹{currentMonthBill.toFixed(2)}</strong>
              </div>

              <div className="budget-item">
                <span>
                  {savings >= 0 ? 'Amount Saved' : 'Amount Increased'}
                </span>

                <strong>
                  ₹{Math.abs(savings).toFixed(2)}
                </strong>
              </div>

            </div>

          )}

        </div>

      )}


      {!loading && !error && (

        <div className="energy-tip">

          <div className="tip-icon">💡</div>

          <div>
            <h2>Energy Saving Tip</h2>

            {suggestions.length > 0 ? (

              suggestions.map((suggestion, index) => (
                <p key={index}>💡 {suggestion}</p>
              ))

            ) : (

              <p>
                {topConsumer
                  ? `${topConsumer.name} is currently your highest energy-consuming appliance. Reducing its usage can help lower your electricity consumption.`
                  : 'Add appliances to receive personalized energy-saving insights.'}
              </p>

            )}

          </div>

        </div>

      )}

    </div>

  )
}

export default Dashboard
