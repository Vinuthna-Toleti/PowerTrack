
import React, { useEffect, useState } from "react";
import "./Settings.css";

const API_URL = "https://powertrack-1.onrender.com/api/auth";
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getSettingsKey(user) {
  return `powertrackSettings_${user?.id ?? user?.email ?? "default"}`;
}

function getSavedSettings(user) {
  try {
    return JSON.parse(
      localStorage.getItem(getSettingsKey(user)) || "{}"
    );
  } catch {
    return {};
  }
}

function Settings() {
  const [user, setUser] = useState(getUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tariff, setTariff] = useState("8");
  const [monthlyGoal, setMonthlyGoal] = useState("100");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = getUser();
    const saved = getSavedSettings(currentUser);

    setUser(currentUser);
    setName(currentUser?.name || "");
    setEmail(currentUser?.email || "");
    setTariff(
      String(currentUser?.ratePerUnit ?? saved.tariff ?? 8)
    );
    setMonthlyGoal(String(saved.monthlyGoal ?? 100));
  }, []);

  async function saveSettings(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!user?.id) {
      setError("Please log in again before saving settings.");
      return;
    }

    const tariffValue = Number(tariff);
    const goalValue = Number(monthlyGoal);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      tariff.trim() === "" ||
      !Number.isFinite(tariffValue) ||
      tariffValue < 0
    ) {
      setError("Enter a valid electricity tariff.");
      return;
    }

    if (
      monthlyGoal.trim() === "" ||
      !Number.isFinite(goalValue) ||
      goalValue < 0
    ) {
      setError("Enter a valid monthly usage goal.");
      return;
    }

    setSaving(true);

    try {
      const profileResponse = await fetch(
        `${API_URL}/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      if (!profileResponse.ok) {
        const details = await profileResponse.text();
        throw new Error(
          details || `Profile update failed (${profileResponse.status}).`
        );
      }

      const updatedUser = await profileResponse.json();

      const rateResponse = await fetch(
        `${API_URL}/rate/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ratePerUnit: tariffValue,
          }),
        }
      );

      if (!rateResponse.ok) {
        const details = await rateResponse.text();
        throw new Error(
          details || `Tariff update failed (${rateResponse.status}).`
        );
      }

      const updatedRateUser = await rateResponse.json();

      const finalUser = {
        ...updatedUser,
        ...updatedRateUser,
      };

      localStorage.setItem("user", JSON.stringify(finalUser));

      const savedSettings = getSavedSettings(finalUser);

      localStorage.setItem(
        getSettingsKey(finalUser),
        JSON.stringify({
          ...savedSettings,
          tariff: tariffValue,
          monthlyGoal: goalValue,
        })
      );

      setUser(finalUser);
      setName(finalUser.name || name.trim());
      setEmail(finalUser.email || email.trim());
      setMessage("Settings saved successfully!");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that Spring Boot is running and CORS is configured."
          : err.message || "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-background-glow glow-one"></div>
      <div className="settings-background-glow glow-two"></div>
      <div className="settings-grid-pattern"></div>

      <main className="settings-container">
        <header className="settings-heading">
          <div className="settings-heading-icon">
            <span>⚡</span>
          </div>

          <div>
            <p className="settings-eyebrow">POWERTRACK CONTROL CENTER</p>
            <h1>Settings</h1>
            <p className="settings-subtitle">
              Personalize your profile and manage your energy goals.
            </p>
          </div>
        </header>

        <div className="settings-status-banner">
          <div className="status-indicator"></div>
          <span>Your energy dashboard, your way.</span>
          <span className="status-lightning">⚡</span>
        </div>

        <form className="settings-form" onSubmit={saveSettings}>
          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon profile-icon">♙</div>
              <div>
                <h2>Personal Information</h2>
                <p>Manage your account details</p>
              </div>
            </div>

            <div className="settings-fields">
              <div className="settings-field">
                <label htmlFor="settings-name">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="settings-field">
                <label htmlFor="settings-email">Email Address</label>
                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon tariff-icon">₹</div>
              <div>
                <h2>Electricity Preferences</h2>
                <p>Customize your electricity cost calculation</p>
              </div>
            </div>

            <div className="settings-fields">
              <div className="settings-field">
                <label htmlFor="settings-tariff">
                  Electricity Tariff
                </label>

                <div className="settings-input-with-unit">
                  <span className="settings-input-symbol">₹</span>
                  <input
                    id="settings-tariff"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    placeholder="8"
                    required
                  />
                  <span className="settings-unit">/ kWh</span>
                </div>

                <small>Cost per unit of electricity.</small>
              </div>

              <div className="settings-field">
                <label htmlFor="settings-goal">
                  Monthly Usage Goal
                </label>

                <div className="settings-input-with-unit">
                  <span className="settings-input-symbol">◎</span>
                  <input
                    id="settings-goal"
                    type="number"
                    min="0"
                    step="0.1"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    placeholder="100"
                    required
                  />
                  <span className="settings-unit">kWh</span>
                </div>

                <small>Your preferred monthly energy target.</small>
              </div>
            </div>
          </section>

          <section className="settings-tip">
            <div className="settings-tip-icon">✦</div>
            <div>
              <h3>Small changes make a difference</h3>
              <p>
                Set a realistic energy goal and track your electricity
                usage regularly to understand your consumption.
              </p>
            </div>
          </section>

          {message && (
            <div className="settings-message settings-success" role="status">
              <span>✓</span> {message}
            </div>
          )}

          {error && (
            <div className="settings-message settings-error" role="alert">
              <span>!</span> {error}
            </div>
          )}

          <div className="settings-actions">
            <button
              className="settings-save-button"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="settings-spinner"></span>
                  Saving Settings...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Save Settings
                  <span className="settings-button-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="settings-footer">
          <span>⚡ POWERTRACK</span>
          <span>Smarter energy. Better choices.</span>
        </footer>
      </main>
    </div>
  );
}

export default Settings;
