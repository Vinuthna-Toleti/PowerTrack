
import { useEffect, useState } from 'react'
import './UsageHistory.css'

function UsageHistory() {
  const [history, setHistory] = useState([])
  const [filteredHistory, setFilteredHistory] = useState([])
  const [period, setPeriod] = useState('today')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editUsage, setEditUsage] = useState('')

  const API_URL ='https://powertrack-1.onrender.com/api/usage-history'

  const user = JSON.parse(localStorage.getItem('user'))
  const userId = user?.id

  // Load the user's usage history
  useEffect(() => {
    if (!userId) {
      setError('Please login first')
      setLoading(false)
      return
    }

    fetch(`${API_URL}/user/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load usage history')
        }

        return response.json()
      })
      .then(data => {
        // Keep only the latest returned record for each date
        const unique = {}

        data.forEach(record => {
          if (
            !unique[record.date] ||
            Number(record.id) > Number(unique[record.date].id)
          ) {
            unique[record.date] = record
          }
        })

        const result = Object.values(unique).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )

        setHistory(result)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading history:', error)
        setError('Could not load usage history')
        setLoading(false)
      })
  }, [userId])

  // Filter history by the selected period
  useEffect(() => {
    const today = new Date()

    function getDate(dateString) {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    const todayString =
      `${today.getFullYear()}-` +
      `${String(today.getMonth() + 1).padStart(2, '0')}-` +
      `${String(today.getDate()).padStart(2, '0')}`

    // Monday of this week
    const startWeek = new Date(todayDate)
    const day = startWeek.getDay()
    const daysFromMonday = day === 0 ? 6 : day - 1

    startWeek.setDate(startWeek.getDate() - daysFromMonday)

    // First day of this month
    const startMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )

    // Previous month
    const startPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    )

    const endPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    )

    let result = []

    if (period === 'today') {
      result = history.filter(
        record => record.date === todayString
      )
    } else if (period === 'week') {
      result = history.filter(record => {
        const recordDate = getDate(record.date)

        return recordDate >= startWeek && recordDate <= todayDate
      })
    } else if (period === 'month') {
      result = history.filter(record => {
        const recordDate = getDate(record.date)

        return recordDate >= startMonth && recordDate <= todayDate
      })
    } else if (period === 'previousMonth') {
      result = history.filter(record => {
        const recordDate = getDate(record.date)

        return (
          recordDate >= startPreviousMonth &&
          recordDate <= endPreviousMonth
        )
      })
    }

    setFilteredHistory(result)
  }, [history, period])

  // Summary calculations
  const totalUsage = filteredHistory.reduce(
    (sum, record) => sum + Number(record.dailyUsage || 0),
    0
  )

  const averageUsage = filteredHistory.length
    ? totalUsage / filteredHistory.length
    : 0

  const highestUsage = filteredHistory.length
    ? filteredHistory.reduce((max, record) =>
        Number(record.dailyUsage || 0) >
        Number(max.dailyUsage || 0)
          ? record
          : max
      )
    : null

  function formatDate(date) {
    const [year, month, day] = date.split('-').map(Number)

    return new Date(year, month - 1, day).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    )
  }

  // Read appliance details stored in the history record
  function getAppliances(record) {
    if (!record.applianceDetails) {
      return []
    }

    try {
      const details = JSON.parse(record.applianceDetails)

      return Array.isArray(details) ? details : []
    } catch {
      return []
    }
  }

  // Read individual hours whether they are an array or JSON string
  function getUnitHours(appliance) {
    if (Array.isArray(appliance.unitHours)) {
      return appliance.unitHours
    }

    if (typeof appliance.unitHours === 'string') {
      try {
        const parsed = JSON.parse(appliance.unitHours)

        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch {
        // Use the average-hours fallback below
      }
    }

    return []
  }

  // Start editing a daily usage record
  function startEdit(record) {
    setEditingId(record.id)
    setEditUsage(Number(record.dailyUsage || 0).toFixed(2))
  }

  // Save edited usage
  async function saveEdit(record) {
    const usage = Number(editUsage)

    if (!Number.isFinite(usage) || usage < 0) {
      alert('Enter valid usage')
      return
    }

    const rate = Number(user?.ratePerUnit ?? 8)
    const bill = Number((usage * rate).toFixed(2))

    try {
      const response = await fetch(`${API_URL}/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: record.date,
          dailyUsage: usage,
          estimatedBill: bill,
          userId: record.userId,
          applianceDetails: record.applianceDetails
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update usage')
      }

      const updated = await response.json()

      setHistory(prev =>
        prev.map(item => item.id === record.id ? updated : item)
      )

      setEditingId(null)
      setEditUsage('')

      alert('Usage updated successfully')
    } catch (error) {
      console.error(error)
      alert('Could not update usage')
    }
  }

  // Delete a history record
  async function deleteHistory(id) {
    if (
      !window.confirm(
        'Are you sure you want to delete this usage record?'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete usage record')
      }

      setHistory(prev =>
        prev.filter(record => record.id !== id)
      )

      setExpandedId(null)
    } catch (error) {
      console.error(error)
      alert('Could not delete usage record')
    }
  }

  return (
    <div className="usage-history">
      <div className="history-header">
        <div className="history-title">
          <div className="history-icon">↗</div>

          <div>
            <h1>Usage History</h1>
            <p>
              Track your electricity consumption over time.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="history-message">
          Loading usage history...
        </div>
      )}

      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Period selection */}
          <div className="history-periods">
            {[
              ['today', 'Today'],
              ['week', 'This Week'],
              ['month', 'This Month'],
              ['previousMonth', 'Previous Month']
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  period === value
                    ? 'period-btn active'
                    : 'period-btn'
                }
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div className="history-summary">
            <div className="history-card">
              <div className="card-icon">📅</div>
              <div>
                <h3>Days Recorded</h3>
                <h2>{filteredHistory.length}</h2>
                <p>Usage records</p>
              </div>
            </div>

            <div className="history-card">
              <div className="card-icon">⚡</div>
              <div>
                <h3>Average Daily Usage</h3>
                <h2>{averageUsage.toFixed(2)}</h2>
                <p>kWh per day</p>
              </div>
            </div>

            <div className="history-card">
              <div className="card-icon">↑</div>
              <div>
                <h3>Highest Usage</h3>
                <h2>
                  {highestUsage
                    ? Number(highestUsage.dailyUsage).toFixed(2)
                    : '0.00'}
                </h2>
                <p>
                  {highestUsage
                    ? `kWh on ${formatDate(highestUsage.date)}`
                    : 'No data'}
                </p>
              </div>
            </div>

            <div className="history-card">
              <div className="card-icon">₹</div>
              <div>
                <h3>Total Consumption</h3>
                <h2>{totalUsage.toFixed(2)}</h2>
                <p>kWh recorded</p>
              </div>
            </div>
          </div>

          {/* Usage graph */}
          <div className="history-section">
            <div className="section-title">
              <div className="section-icon">📈</div>
              <div>
                <h2>Usage Trend</h2>
                <p>
                  View your electricity consumption over the selected period.
                </p>
              </div>
            </div>

            <div className="usage-graph">
              {filteredHistory.length === 0 ? (
                <p className="no-history">
                  No usage data available for this period.
                </p>
              ) : (
                <div className="graph-bars">
                  {[...filteredHistory].reverse().map(record => {
                    const usage = Number(record.dailyUsage || 0)

                    const maxUsage = Math.max(
                      ...filteredHistory.map(item =>
                        Number(item.dailyUsage || 0)
                      )
                    )

                    const height = maxUsage > 0
                      ? (usage / maxUsage) * 100
                      : 0

                    return (
                      <div className="graph-column" key={record.id}>
                        <div className="graph-value">
                          {usage.toFixed(2)}
                        </div>

                        <div
                          className="graph-bar"
                          style={{ height: `${height}%` }}
                        ></div>

                        <div className="graph-date">
                          {formatDate(record.date)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Daily consumption */}
          <div className="history-section">
            <div className="section-title">
              <div className="section-icon">📊</div>
              <div>
                <h2>Daily Consumption</h2>
                <p>
                  View your daily electricity usage and estimated bill.
                </p>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <p className="no-history">
                No usage history available for this period.
              </p>
            ) : (
              <div className="history-table">
                <div className="history-table-header">
                  <span>Date</span>
                  <span>Daily Usage</span>
                  <span>Estimated Bill</span>
                  <span>Actions</span>
                </div>

                {filteredHistory.map(record => {
                  const appliances = getAppliances(record)
                  const expanded = expandedId === record.id
                  const editing = editingId === record.id

                  return (
                    <div className="history-record" key={record.id}>
                      <div className="history-row">
                        <span className="date-value">
                          <span className="calendar-icon">▣</span>
                          {formatDate(record.date)}
                        </span>

                        {editing ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editUsage}
                            onChange={e => setEditUsage(e.target.value)}
                          />
                        ) : (
                          <strong>
                            {Number(record.dailyUsage || 0).toFixed(2)} kWh
                          </strong>
                        )}

                        <strong>
                          ₹
                          {Number(
                            editing
                              ? Number(editUsage || 0) *
                                  Number(user?.ratePerUnit ?? 8)
                              : record.estimatedBill || 0
                          ).toFixed(2)}
                        </strong>

                        <div className="history-actions">
                          {appliances.length > 0 && (
                            <button
                              className="view-history-btn"
                              onClick={() =>
                                setExpandedId(
                                  expanded ? null : record.id
                                )
                              }
                            >
                              {expanded ? 'Hide' : 'View'}
                            </button>
                          )}

                          {editing ? (
                            <>
                              <button
                                className="save-history-btn"
                                onClick={() => saveEdit(record)}
                              >
                                Save
                              </button>

                              <button
                                className="cancel-history-btn"
                                onClick={() => {
                                  setEditingId(null)
                                  setEditUsage('')
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="edit-history-btn"
                                onClick={() => startEdit(record)}
                              >
                                Edit
                              </button>

                              <button
                                className="delete-history-btn"
                                onClick={() => deleteHistory(record.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded appliance details */}
                      {expanded && (
                        <div className="appliance-history-details">
                          <h3>
                            Appliances Used on {formatDate(record.date)}
                          </h3>

                          {appliances.map((appliance, index) => {
                            const unitHours = getUnitHours(appliance)

                            return (
                              <div
                                className="history-appliance-card"
                                key={index}
                              >
                                <strong>{appliance.name}</strong>

                                <span>
                                  Quantity: {appliance.quantity}
                                </span>

                                <span>
                                  Power: {appliance.power} W
                                </span>

                                {unitHours.length > 0 ? (
                                  <div className="history-unit-hours">
                                    <strong>Individual Unit Hours:</strong>

                                    {unitHours.map((hours, unitIndex) => (
                                      <p key={unitIndex}>
                                        {appliance.name} {unitIndex + 1}: {hours} hours/day
                                      </p>
                                    ))}

                                    <span>
                                      Total unit-hours:{' '}
                                      {unitHours.reduce(
                                        (sum, hours) => sum + Number(hours || 0),
                                        0
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span>
                                    Average Hours Used: {appliance.hours} hours/day
                                  </span>
                                )}

                                <span>
                                  Daily Usage:{' '}
                                  {Number(appliance.dailyUsage || 0).toFixed(2)} kWh
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default UsageHistory
