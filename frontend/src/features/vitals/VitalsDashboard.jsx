import React, { useEffect, useMemo, useState } from "react";
import { FiHeart, FiTrendingUp } from "react-icons/fi";
import api from "../../services/api";
import VitalChart from "../../components/charts/VitalChart";
import PageHeader from "../../components/layout/PageHeader";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import EmptyState from "../../components/feedback/EmptyState";
import "./VitalsDashboard.css";

const VITAL_TYPES = [
  "blood-pressure",
  "heart-rate",
  "blood-glucose",
  "steps",
  "weight",
  "temperature",
  "blood-oxygen",
];

export default function VitalsDashboard() {
  const [logType, setLogType] = useState("heart-rate");
  const [value, setValue] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [unit, setUnit] = useState("");
  const [source, setSource] = useState("manual");
  const [notes, setNotes] = useState("");

  const [chartType, setChartType] = useState("heart-rate");
  const [days, setDays] = useState(7);

  const [chartData, setChartData] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const effectiveValue = useMemo(() => {
    if (logType === "blood-pressure") {
      const s = Number(bpSys);
      const d = Number(bpDia);
      if (!Number.isFinite(s) || !Number.isFinite(d)) return null;
      return { systolic: s, diastolic: d };
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }, [logType, value, bpSys, bpDia]);

  const loadWeekly = async () => {
    const { data } = await api.get("/vitals/weekly-health-score");
    setWeekly(data?.data || null);
  };

  const loadChart = async () => {
    const { data } = await api.get("/vitals/chart-data", {
      params: { type: chartType, days },
    });
    setChartData(data?.data || null);
  };

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      await Promise.all([loadWeekly(), loadChart()]);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load vitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, days]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!logType) return setError("Select a vital type.");
    if (effectiveValue === null) return setError("Enter a valid value.");

    setLoading(true);
    try {
      await api.post("/vitals/log", {
        type: logType,
        value: effectiveValue,
        unit: unit || undefined,
        notes: notes || undefined,
        source,
      });
      setSuccess("Vital logged.");
      setValue("");
      setBpSys("");
      setBpDia("");
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to log vital");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vitals-page">
      <PageHeader
        title="Health vitals"
        subtitle="Log your health measurements and track trends over time."
      />

      <div className="vitals-layout">
        <section className="vitals-log">
          <h3 className="vitals-section-title">Quick log</h3>

          <form onSubmit={submit} className="vitals-log-form">
            <div className="vitals-log-row">
              <label className="vitals-field">
                <span className="vitals-label">Type</span>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                >
                  {VITAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              {logType === "blood-pressure" ? (
                <>
                  <label className="vitals-field">
                    <span className="vitals-label">Systolic</span>
                    <input
                      value={bpSys}
                      onChange={(e) => setBpSys(e.target.value)}
                      placeholder="120"
                    />
                  </label>
                  <label className="vitals-field">
                    <span className="vitals-label">Diastolic</span>
                    <input
                      value={bpDia}
                      onChange={(e) => setBpDia(e.target.value)}
                      placeholder="80"
                    />
                  </label>
                </>
              ) : (
                <label className="vitals-field">
                  <span className="vitals-label">Value</span>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g., 72"
                  />
                </label>
              )}
            </div>

            <div className="vitals-log-row">
              <label className="vitals-field">
                <span className="vitals-label">Unit</span>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="bpm / steps / %"
                />
              </label>

              <label className="vitals-field">
                <span className="vitals-label">Source</span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="manual">manual</option>
                  <option value="device">device</option>
                  <option value="wearable">wearable</option>
                  <option value="app">app</option>
                </select>
              </label>
            </div>

            <div className="vitals-log-row">
              <label className="vitals-field">
                <span className="vitals-label">Notes</span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="optional"
                />
              </label>
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <div className="vitals-log-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Log vital"}
              </button>
            </div>
          </form>
        </section>

        <section className="vitals-summary">
          <h3 className="vitals-section-title">Weekly health score</h3>
          {loading && !weekly && (
            <LoadingSpinner size="sm" text="Loading weekly score..." />
          )}

          {weekly ? (
            <div className="vitals-score-card">
              <div className="vitals-score-value">{weekly.score}/100</div>
              {Array.isArray(weekly.insights) && weekly.insights.length > 0 && (
                <ul className="vitals-score-insights">
                  {weekly.insights.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            !loading && (
              <EmptyState
                icon={<FiHeart size={48} />}
                title="No weekly score yet"
                description="Log a few vitals to see your weekly health score."
              />
            )
          )}
        </section>
      </div>

      <section className="vitals-charts">
        <div className="vitals-charts-header">
          <h3 className="vitals-section-title">Charts</h3>
          <div className="vitals-charts-controls">
            <label className="vitals-field">
              <span className="vitals-label">Type</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                {VITAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="vitals-field">
              <span className="vitals-label">Days</span>
              <input
                type="number"
                min="1"
                max="90"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="vitals-refresh"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && !chartData && (
          <LoadingSpinner text="Loading vitals chart..." />
        )}

        {chartData ? (
          <div className="vitals-chart-wrapper">
            <VitalChart chartData={chartData} />
          </div>
        ) : (
          !loading && (
            <EmptyState
              icon={<FiTrendingUp size={48} />}
              title="No chart data"
              description="Log some vitals or adjust the time range to see trends."
            />
          )
        )}
      </section>
    </div>
  );
}

