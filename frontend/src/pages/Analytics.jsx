import { useState, useEffect } from 'react'
import './Analytics.css'

function Analytics() {

  const [appliances, setAppliances] = useState([])
  const [history, setHistory] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const API_URL =
    'http://localhost:8080/api/appliances'

  const HISTORY_API_URL =
    'http://localhost:8080/api/usage-history'

  const user = JSON.parse(
    localStorage.getItem('user')
  )

  const userId = user?.id


  // =========================
  // GET APPLIANCE AND HISTORY DATA
  // =========================

  useEffect(() => {

    if (!userId) {
      setError('Please login first')
      setLoading(false)
      return
    }

    Promise.all([
      fetch(`${API_URL}/user/${userId}`),
      fetch(`${HISTORY_API_URL}/user/${userId}`)
    ])

      .then(async ([applianceResponse, historyResponse]) => {

        if (!applianceResponse.ok) {
          throw new Error(
            'Failed to fetch appliance data'
          )
        }

        if (!historyResponse.ok) {
          throw new Error(
            'Failed to fetch usage history'
          )
        }

        const applianceData =
          await applianceResponse.json()

        const historyData =
          await historyResponse.json()

        return {
          applianceData,
          historyData
        }
      })

      .then(({ applianceData, historyData }) => {

        setAppliances(applianceData)
        setHistory(historyData)
        setLoading(false)

      })

      .catch(error => {

        console.error(
          'Analytics error:',
          error
        )

        setError(
          'Could not load analytics data'
        )

        setLoading(false)

      })

  }, [userId])


  // =========================
  // AI ENERGY INSIGHTS
  // =========================

  useEffect(() => {

    if (!userId || appliances.length === 0) {
      return
    }

    const loadAIInsights = async () => {

      try {

        // Create a unique signature from current appliance usage
        const usageSignature =
          appliances
            .map(appliance =>
              `${appliance.id}-${appliance.quantity}-${appliance.hours}-${appliance.dailyUsage}`
            )
            .join('|')

        // Unique cache key for each user
        const cacheKey =
          `powertrack-ai-${userId}`

        // Check whether previous AI result exists
        const cachedData =
          sessionStorage.getItem(cacheKey)

        if (cachedData) {

          const cached =
            JSON.parse(cachedData)

          const cacheAge =
            Date.now() - cached.timestamp

          const thirtyMinutes =
            30 * 60 * 1000

          // Reuse cached result when:
          // 1. Usage data is unchanged
          // 2. Cache is less than 30 minutes old
          if (
            cached.usageSignature === usageSignature &&
            cacheAge < thirtyMinutes
          ) {

            setAiInsights(
              cached.insights
            )

            return
          }
        }

        // Call Gemini only when a fresh response is needed
        const response =
          await fetch(
            `${API_URL}/ai-insights/${userId}`
          )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch AI insights'
          )
        }

        const data =
          await response.json()

        setAiInsights(data)

        // Save AI result in session storage
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            insights: data,
            usageSignature: usageSignature,
            timestamp: Date.now()
          })
        )

      } catch (error) {

        console.error(
          'AI insights error:',
          error
        )

        setAiInsights([
          'AI insights are temporarily unavailable. Please try again later.'
        ])
      }

    }

    loadAIInsights()

  }, [userId, appliances])


  // =========================
  // TODAY'S DATE
  // =========================

  const today =
    new Date()

  const todayString =
    today.toLocaleDateString('en-CA')


  // =========================
  // TODAY'S HISTORY RECORD
  // =========================

  const todayRecord =
    history.find(
      record =>
        record.date === todayString
    )


  // =========================
  // TODAY'S TOTAL USAGE
  // =========================

  const totalDailyUsage =
    todayRecord
      ? Number(
          todayRecord.dailyUsage || 0
        )
      : 0


  const currentMonth =
    today.getMonth()

  const currentYear =
    today.getFullYear()


  // =========================
  // CURRENT MONTH USAGE
  // =========================

  const totalMonthlyUsage =
    history.reduce(
      (total, record) => {

        const [year, month, day] =
          record.date
            .split('-')
            .map(Number)

        const recordDate =
          new Date(
            year,
            month - 1,
            day
          )

        if (
          recordDate.getMonth() ===
            currentMonth &&
          recordDate.getFullYear() ===
            currentYear
        ) {

          return (
            total +
            Number(
              record.dailyUsage || 0
            )
          )
        }

        return total

      },
      0
    )


  // =========================
  // HIGHEST CONSUMING APPLIANCE
  // =========================

  const topConsumer =
    appliances.length > 0
      ? appliances.reduce(
          (highest, appliance) =>
            Number(
              appliance.dailyUsage || 0
            ) >
            Number(
              highest.dailyUsage || 0
            )
              ? appliance
              : highest
        )
      : null


  // =========================
  // ELECTRICITY ALERTS
  // =========================

  const averageDailyUsage =
    history.length > 0
      ? history.reduce(
          (total, record) =>
            total +
            Number(
              record.dailyUsage || 0
            ),
          0
        ) / history.length
      : 0


  const highUsageLimit =
    averageDailyUsage * 1.15


  const highUsageAlert =
    totalDailyUsage > 0 &&
    averageDailyUsage > 0 &&
    totalDailyUsage > highUsageLimit


  const topConsumerUsage =
    topConsumer
      ? Number(
          topConsumer.dailyUsage || 0
        )
      : 0


  const topConsumerPercentage =
    totalDailyUsage > 0
      ? (
          topConsumerUsage /
          totalDailyUsage
        ) * 100
      : 0


  const applianceAlert =
    topConsumerPercentage > 40


  // =========================
  // PERSONALIZED RECOMMENDATIONS
  // =========================

  const recommendations = []


  if (
    topConsumer &&
    topConsumerPercentage > 40
  ) {

    recommendations.push(
      `Reduce the usage of ${topConsumer.name}. It contributes ${topConsumerPercentage.toFixed(1)}% of today's electricity consumption.`
    )

  }


  if (
    totalDailyUsage > 0 &&
    averageDailyUsage > 0 &&
    totalDailyUsage > highUsageLimit
  ) {

    recommendations.push(
      'Your electricity usage is higher than usual today. Try reducing unnecessary appliance usage.'
    )

  }


  if (
    topConsumer &&
    topConsumerUsage > 1
  ) {

    recommendations.push(
      `${topConsumer.name} is consuming ${topConsumerUsage.toFixed(2)} kWh today. Consider reducing its operating hours.`
    )

  }


  if (
    recommendations.length === 0
  ) {

    recommendations.push(
      'Your current electricity usage looks reasonable. Continue monitoring your appliances to maintain efficient consumption.'
    )

  }


  // =========================
  // USAGE PATTERNS
  // =========================

  const sortedHistory =
    [...history].sort(
      (a, b) =>
        a.date.localeCompare(b.date)
    )


  const weekStart =
    new Date(today)

  weekStart.setDate(
    today.getDate() -
    today.getDay()
  )

  weekStart.setHours(
    0,
    0,
    0,
    0
  )


  const thisWeekHistory =
    history.filter(record => {

      const [year, month, day] =
        record.date
          .split('-')
          .map(Number)

      const recordDate =
        new Date(
          year,
          month - 1,
          day
        )

      return (
        recordDate >= weekStart &&
        recordDate <= today
      )

    })


  const thisWeekUsage =
    thisWeekHistory.reduce(
      (total, record) =>
        total +
        Number(
          record.dailyUsage || 0
        ),
      0
    )


  const patternAverage =
    history.length > 0
      ? history.reduce(
          (total, record) =>
            total +
            Number(
              record.dailyUsage || 0
            ),
          0
        ) / history.length
      : 0


  const highestUsageRecord =
    sortedHistory.length > 0
      ? sortedHistory.reduce(
          (highest, record) =>
            Number(
              record.dailyUsage || 0
            ) >
            Number(
              highest.dailyUsage || 0
            )
              ? record
              : highest
        )
      : null


  const lowestUsageRecord =
    sortedHistory.length > 0
      ? sortedHistory.reduce(
          (lowest, record) =>
            Number(
              record.dailyUsage || 0
            ) <
            Number(
              lowest.dailyUsage || 0
            )
              ? record
              : lowest
        )
      : null


  let usageTrend =
    'No Data'


  if (sortedHistory.length >= 2) {

    const firstUsage =
      Number(
        sortedHistory[0].dailyUsage || 0
      )

    const lastUsage =
      Number(
        sortedHistory[
          sortedHistory.length - 1
        ].dailyUsage || 0
      )

    if (lastUsage > firstUsage) {

      usageTrend =
        'Increasing'

    }
    else if (lastUsage < firstUsage) {

      usageTrend =
        'Decreasing'

    }
    else {

      usageTrend =
        'Stable'

    }

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="analytics">

      {/* Header */}

      <div className="analytics-header">

        <h1>
          Energy Analytics 📊
        </h1>

        <p>
          Analyze your electricity consumption
          and identify major energy consumers.
        </p>

      </div>


      {/* Loading */}

      {loading && (

        <div className="analytics-message">
          Loading appliance data...
        </div>

      )}


      {/* Error */}

      {error && (

        <div className="analytics-error">
          {error}
        </div>

      )}


      {/* Summary */}

      {!loading && !error && (

        <div className="analytics-summary">

          <div className="analytics-card">

            <h3>
              Daily Consumption
            </h3>

            <h2>
              {totalDailyUsage.toFixed(2)} kWh
            </h2>

          </div>


          <div className="analytics-card">

            <h3>
              Monthly Consumption
            </h3>

            <h2>
              {totalMonthlyUsage.toFixed(2)} kWh
            </h2>

          </div>


          <div className="analytics-card">

            <h3>
              Top Consumer
            </h3>

            <h2>
              {topConsumer
                ? topConsumer.name
                : 'No Data'}
            </h2>

          </div>

        </div>

      )}


      {/* Appliance Consumption */}

      <div className="analytics-section">

        <h2>
          Appliance Consumption
        </h2>

        {!loading &&
        appliances.length === 0 ? (

          <p className="no-data">
            No appliance data available.
            Add appliances to view analytics.
          </p>

        ) : (

          <div className="analysis-list">

            {appliances.map(appliance => {

              const dailyUsage =
                Number(
                  appliance.dailyUsage || 0
                )


              const percentage =
                totalDailyUsage > 0
                  ? (
                      dailyUsage /
                      totalDailyUsage
                    ) * 100
                  : 0


              return (

                <div
                  className="analysis-item"
                  key={appliance.id}
                >

                  <div className="analysis-info">

                    <span>
                      {appliance.name}
                    </span>

                    <strong>
                      {dailyUsage.toFixed(2)}
                      {' '}
                      kWh/day
                    </strong>

                  </div>


                  <div className="progress-background">

                    <div
                      className="progress-bar"
                      style={{
                        width:
                          `${percentage}%`
                      }}
                    ></div>

                  </div>


                  <p>
                    {percentage.toFixed(1)}%
                    {' '}
                    of total consumption
                  </p>

                </div>

              )

            })}

          </div>

        )}

      </div>


      {/* Electricity Alerts */}

      <div className="analytics-section">

        <h2>
          ⚠️ Electricity Alerts
        </h2>

        {!highUsageAlert &&
        !applianceAlert ? (

          <div className="alert-success">

            <strong>
              ✅ Your usage looks normal
            </strong>

            <p>
              No unusual electricity
              consumption was detected.
            </p>

          </div>

        ) : (

          <div className="alert-list">

            {highUsageAlert && (

              <div className="alert-item">

                <div className="alert-icon">
                  ⚡
                </div>

                <div>

                  <h3>
                    High Daily Usage
                  </h3>

                  <p>
                    Today's usage is{' '}
                    {totalDailyUsage.toFixed(2)}
                    {' '}kWh, which is more than
                    15% above your average daily
                    usage of{' '}
                    {averageDailyUsage.toFixed(2)}
                    {' '}kWh.
                  </p>

                </div>

              </div>

            )}


            {applianceAlert && (

              <div className="alert-item">

                <div className="alert-icon">
                  🔌
                </div>

                <div>

                  <h3>
                    High Appliance Consumption
                  </h3>

                  <p>
                    {topConsumer.name}
                    {' '}is responsible for{' '}
                    {topConsumerPercentage.toFixed(1)}
                    % of today's usage.
                    Consider reducing its usage.
                  </p>

                </div>

              </div>

            )}

          </div>

        )}

      </div>


      {/* Energy Recommendations */}

      <div className="analytics-section">

        <h2>
          🤖 Energy Recommendations
        </h2>

        <p className="recommendation-subtitle">
          Suggestions based on your current
          electricity usage.
        </p>

        <div className="recommendation-list">

          {recommendations.map(
            (recommendation, index) => (

              <div
                className="recommendation-item"
                key={index}
              >

                <div className="recommendation-icon">
                  💡
                </div>

                <div>

                  <h3>
                    Recommendation {index + 1}
                  </h3>

                  <p>
                    {recommendation}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* AI Energy Insights */}

      <div className="analytics-section">

        <h2>
          🧠 AI Energy Insights
        </h2>

        <p className="recommendation-subtitle">
          Personalized insights generated from your
          electricity usage.
        </p>

        <div className="recommendation-list">

          {aiInsights.length > 0 ? (

            aiInsights.map(
              (insight, index) => (

                <div
                  className="recommendation-item"
                  key={index}
                >

                  <div className="recommendation-icon">
                    🤖
                  </div>

                  <div>

                    <h3>
                      AI Insight {index + 1}
                    </h3>

                    <p>
                      {insight}
                    </p>

                  </div>

                </div>

              )
            )

          ) : (

            <p className="no-data">
              Add appliance usage data to generate
              personalized AI insights.
            </p>

          )}

        </div>

      </div>


      {/* =========================
          USAGE PATTERNS
      ========================= */}

      <div className="analytics-section">

        <h2>
          📈 Usage Patterns
        </h2>

        <p className="pattern-subtitle">
          Understand how your electricity
          consumption changes over time.
        </p>


        <div className="pattern-grid">

          <div className="pattern-card">

            <span>
              This Week
            </span>

            <strong>
              {thisWeekUsage.toFixed(2)}
              {' '}kWh
            </strong>

          </div>


          <div className="pattern-card">

            <span>
              Average Daily
            </span>

            <strong>
              {patternAverage.toFixed(2)}
              {' '}kWh
            </strong>

          </div>


          <div className="pattern-card">

            <span>
              Highest Usage
            </span>

            <strong>
              {highestUsageRecord
                ? Number(
                    highestUsageRecord.dailyUsage || 0
                  ).toFixed(2)
                : '0.00'}
              {' '}kWh
            </strong>

            {highestUsageRecord && (
              <small>
                {highestUsageRecord.date}
              </small>
            )}

          </div>


          <div className="pattern-card">

            <span>
              Lowest Usage
            </span>

            <strong>
              {lowestUsageRecord
                ? Number(
                    lowestUsageRecord.dailyUsage || 0
                  ).toFixed(2)
                : '0.00'}
              {' '}kWh
            </strong>

            {lowestUsageRecord && (
              <small>
                {lowestUsageRecord.date}
              </small>
            )}

          </div>


          <div className="pattern-card">

            <span>
              Usage Trend
            </span>

            <strong>
              {usageTrend}
            </strong>

          </div>

        </div>

      </div>


      {/* Energy Insight */}

      <div className="analytics-insight">

        <h2>
          💡 Energy Insight
        </h2>

        <p>

          {topConsumer

            ? `${topConsumer.name} is currently your highest energy-consuming appliance. Reducing its usage could help lower your overall electricity consumption.`

            : 'Add appliances to receive personalized energy insights.'}

        </p>

      </div>

    </div>

  )
}

export default Analytics