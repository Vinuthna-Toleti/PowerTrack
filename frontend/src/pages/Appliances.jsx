
import { useState, useEffect } from 'react'
import './Appliances.css'

function Appliances() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [power, setPower] = useState('')
  const [appliances, setAppliances] = useState([])
  const [todayHours, setTodayHours] = useState({})

  const API_URL = 'http://localhost:8080/api/appliances'
  const HISTORY_API_URL = 'http://localhost:8080/api/usage-history'

  const user = JSON.parse(localStorage.getItem('user'))
  const userId = user?.id

  // Load individual unit hours, including older appliance records
  function getInitialUnitHours(appliance) {
    const count = Math.max(0, Number(appliance.quantity) || 0)
    let savedHours = null

    if (Array.isArray(appliance.unitHours)) {
      savedHours = appliance.unitHours
    } else if (
      typeof appliance.unitHours === 'string' &&
      appliance.unitHours.trim()
    ) {
      try {
        savedHours = JSON.parse(appliance.unitHours)
      } catch {
        savedHours = null
      }
    }

    if (Array.isArray(savedHours) && savedHours.length === count) {
      return savedHours.map(value =>
        value === null || value === undefined ? '' : String(value)
      )
    }

    // Preserve the previous shared-hours value for older appliances
    const oldHours = Number(appliance.hours)

    if (oldHours > 0) {
      return Array(count).fill(String(oldHours))
    }

    return Array(count).fill('')
  }

  // Estimate typical appliance power in watts
  function getEstimatedPower(applianceName) {
    const text = applianceName.toLowerCase()

    if (text.includes('fan')) return 60
    if (text.includes('bulb')) return 10
    if (text.includes('light')) return 10
    if (text.includes('tube')) return 20
    if (text.includes('tv') || text.includes('television')) return 100
    if (text.includes('fridge') || text.includes('refrigerator')) return 150
    if (text.includes('ac') || text.includes('air conditioner')) return 1200
    if (text.includes('washing')) return 500
    if (text.includes('laptop')) return 60
    if (text.includes('computer') || text.includes('desktop')) return 200
    if (text.includes('iron')) return 1000
    if (text.includes('microwave')) return 1200
    if (text.includes('geyser') || text.includes('heater')) return 2000
    if (text.includes('mixer')) return 500
    if (text.includes('pump')) return 750
    if (text.includes('oven')) return 1500
    if (text.includes('kettle')) return 1500
    if (text.includes('cooler')) return 200
    if (text.includes('router')) return 10
    if (text.includes('charger')) return 10

    return 100
  }

  // Calculate electricity usage using individual hours for every unit
  // Formula: power (W) × total unit-hours ÷ 1000
  function calculateDailyUsage(appliance, unitHoursValues) {
    const powerValue = Number(appliance.power)

    const totalHours = unitHoursValues.reduce(
      (total, hours) => total + Number(hours),
      0
    )

    return (powerValue * totalHours) / 1000
  }

  // Load the user's appliances
  useEffect(() => {
    if (!userId) return

    fetch(`${API_URL}/user/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch appliances')
        }

        return response.json()
      })
      .then(data => {
        setAppliances(data)

        const hoursData = {}

        data.forEach(appliance => {
          hoursData[appliance.id] = getInitialUnitHours(appliance)
        })

        setTodayHours(hoursData)
      })
      .catch(error => {
        console.error('Error fetching appliances:', error)
      })
  }, [userId])

  // Add an appliance
  async function addAppliance() {
    if (!name.trim() || !quantity) {
      alert('Please enter appliance name and quantity')
      return
    }

    if (!userId) {
      alert('Please login first')
      return
    }

    const quantityValue = Number(quantity)

    if (!Number.isInteger(quantityValue) || quantityValue < 1) {
      alert('Quantity must be a positive whole number')
      return
    }

    const finalPower = power
      ? Number(power)
      : getEstimatedPower(name)

    if (!Number.isFinite(finalPower) || finalPower <= 0) {
      alert('Power must be a positive number')
      return
    }

    const newAppliance = {
      name: name.trim(),
      quantity: quantityValue,
      power: finalPower,
      hours: 0,
      unitHours: JSON.stringify(Array(quantityValue).fill(null)),
      dailyUsage: 0,
      monthlyUsage: 0,
      userId: userId
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAppliance)
      })

      if (!response.ok) {
        throw new Error('Failed to add appliance')
      }

      const savedAppliance = await response.json()

      setAppliances(prev => [...prev, savedAppliance])

      setTodayHours(prev => ({
        ...prev,
        [savedAppliance.id]: Array(quantityValue).fill('')
      }))

      setName('')
      setQuantity('')
      setPower('')

      if (!power) {
        alert(`Appliance added using an estimated power of ${finalPower}W.`)
      }
    } catch (error) {
      console.error(error)
      alert('Could not save appliance')
    }
  }

  // Change hours for one specific unit
  function handleHoursChange(id, index, value) {
    setTodayHours(prev => {
      const updatedHours = [...(prev[id] || [])]

      updatedHours[index] = value

      return {
        ...prev,
        [id]: updatedHours
      }
    })
  }

  // Save today's appliance usage and history
  async function saveTodaysUsage() {
    if (!userId) {
      alert('Please login first')
      return
    }

    if (appliances.length === 0) {
      alert('Please add at least one appliance')
      return
    }

    let totalDailyUsage = 0
    const applianceDetails = []

    try {
      for (const appliance of appliances) {
        const values = todayHours[appliance.id] || []

        if (values.length !== Number(appliance.quantity)) {
          alert(`Please enter hours for every unit of ${appliance.name}`)
          return
        }

        const numericHours = []

        for (let index = 0; index < values.length; index++) {
          const value = values[index]

          if (value === '' || value === null || value === undefined) {
            alert(`Please enter today's hours for ${appliance.name} ${index + 1}`)
            return
          }

          const hours = Number(value)

          if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
            alert(`Hours for ${appliance.name} ${index + 1} must be between 0 and 24`)
            return
          }

          numericHours.push(hours)
        }

        const totalHours = numericHours.reduce(
          (total, hours) => total + hours,
          0
        )

        // Average hours per unit, for compatibility with the existing backend
        const averageHours =
          numericHours.length > 0
            ? totalHours / numericHours.length
            : 0

        // Calculate usage without any additional appliance factor
        const dailyUsage = calculateDailyUsage(
          appliance,
          numericHours
        )

        const monthlyUsage = dailyUsage * 30

        totalDailyUsage += dailyUsage

        const updatedAppliance = {
          hours: Number(averageHours.toFixed(2)),
          unitHours: JSON.stringify(numericHours),
          dailyUsage: Number(dailyUsage.toFixed(2)),
          monthlyUsage: Number(monthlyUsage.toFixed(2))
        }

        const response = await fetch(
          `${API_URL}/${appliance.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedAppliance)
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to update ${appliance.name}`)
        }

        applianceDetails.push({
          name: appliance.name,
          quantity: appliance.quantity,
          power: appliance.power,
          hours: Number(averageHours.toFixed(2)),
          unitHours: numericHours,
          totalHours: Number(totalHours.toFixed(2)),
          dailyUsage: Number(dailyUsage.toFixed(2))
        })
      }

      const today = new Date().toLocaleDateString('en-CA')
      const roundedUsage = Number(totalDailyUsage.toFixed(2))
      const ratePerUnit = Number(user?.ratePerUnit ?? 8)

      const estimatedBill = Number(
        (roundedUsage * ratePerUnit).toFixed(2)
      )

      const historyData = {
        date: today,
        dailyUsage: roundedUsage,
        estimatedBill: estimatedBill,
        userId: userId,
        applianceDetails: JSON.stringify(applianceDetails)
      }

      const historyResponse = await fetch(HISTORY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(historyData)
      })

      if (!historyResponse.ok) {
        throw new Error('Failed to save usage history')
      }

      // Refresh appliances from the backend
      const refreshResponse = await fetch(`${API_URL}/user/${userId}`)

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh appliances')
      }

      const refreshedData = await refreshResponse.json()

      setAppliances(refreshedData)

      const hoursData = {}

      refreshedData.forEach(appliance => {
        hoursData[appliance.id] = getInitialUnitHours(appliance)
      })

      setTodayHours(hoursData)

      alert("Today's usage saved successfully!")
    } catch (error) {
      console.error(error)
      alert("Could not save today's usage")
    }
  }

  // Delete an appliance
  async function deleteAppliance(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete appliance')
      }

      setAppliances(prev =>
        prev.filter(appliance => appliance.id !== id)
      )

      setTodayHours(prev => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    } catch (error) {
      console.error(error)
      alert('Could not delete appliance')
    }
  }

  return (
    <div className="appliances">
      <div className="appliances-header">
        <h1>Manage Your Appliances</h1>

        <p>
          Add your appliances and track their
          electricity consumption
        </p>
      </div>

      <div className="appliances-content">
        {/* LEFT SIDE: ADD APPLIANCE */}
        <div className="appliance-form">
          <h2>Add Appliance</h2>

          <input
            type="text"
            placeholder="Appliance name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <input
            type="number"
            min="1"
            placeholder="Power (Watts) - Optional"
            value={power}
            onChange={e => setPower(e.target.value)}
          />

          <p className="power-help">
            Don't know the power? Leave it empty.
            PowerTrack will estimate it automatically.
          </p>

          <button onClick={addAppliance}>
            Add Appliance
          </button>
        </div>

        {/* RIGHT SIDE: APPLIANCE LIST */}
        <div className="appliance-list">
          <h2>Your Appliances</h2>

          {appliances.length === 0 ? (
            <p className="no-appliances">
              No appliances added yet.
            </p>
          ) : (
            appliances.map(appliance => {
              const unitHoursValues =
                todayHours[appliance.id] ??
                Array(Number(appliance.quantity)).fill('')

              return (
                <div
                  className="appliance-card"
                  key={appliance.id}
                >
                  <h3>{appliance.name}</h3>

                  <p>
                    Quantity: {appliance.quantity}
                  </p>

                  <p>
                    Power: {appliance.power} W{' '}
                    <span className="estimated-label">
                      (estimated/entered)
                    </span>
                  </p>

                  <p>
                    <strong>Today's Hours — Each Unit</strong>
                  </p>

                  <div className="unit-hours-list">
                    {Array.from(
                      { length: Number(appliance.quantity) },
                      (_, index) => (
                        <div
                          className="unit-hours-row"
                          key={index}
                        >
                          <label
                            htmlFor={`hours-${appliance.id}-${index}`}
                          >
                            {appliance.name} {index + 1}
                          </label>

                          <input
                            id={`hours-${appliance.id}-${index}`}
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            placeholder="Hours"
                            value={unitHoursValues[index] ?? ''}
                            onChange={e =>
                              handleHoursChange(
                                appliance.id,
                                index,
                                e.target.value
                              )
                            }
                          />

                          <span>hours/day</span>
                        </div>
                      )
                    )}
                  </div>

                  <p>
                    Current Daily Usage:{' '}
                    {Number(appliance.dailyUsage || 0).toFixed(2)} kWh
                  </p>

                  <p>
                    Estimated Monthly Usage:{' '}
                    {Number(appliance.monthlyUsage || 0).toFixed(2)} kWh
                  </p>

                  <button
                    className="delete-btn"
                    onClick={() => deleteAppliance(appliance.id)}
                  >
                    Delete
                  </button>
                </div>
              )
            })
          )}

          {appliances.length > 0 && (
            <button
              className="save-usage-btn"
              onClick={saveTodaysUsage}
            >
              Save Today's Usage
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Appliances
