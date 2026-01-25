import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import VitalChart from "../../components/charts/VitalChart";

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
    <div style={{ maxWidth: 900 }}>
      <h2>Vitals</h2>

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label>
            Type
            <select value={logType} onChange={(e) => setLogType(e.target.value)}>
              {VITAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {logType === "blood-pressure" ? (
            <>
              <label>
                Systolic
                <input value={bpSys} onChange={(e) => setBpSys(e.target.value)} placeholder="120" />
              </label>
              <label>
                Diastolic
                <input value={bpDia} onChange={(e) => setBpDia(e.target.value)} placeholder="80" />
              </label>
            </>
          ) : (
            <label>
              Value
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g., 72" />
            </label>
          )}

          <label>
            Unit
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="bpm / steps / %" />
          </label>

          <label>
            Source
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="manual">manual</option>
              <option value="device">device</option>
              <option value="wearable">wearable</option>
              <option value="app">app</option>
            </select>
          </label>
        </div>

        <label>
          Notes
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
        </label>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Log vital"}
        </button>
      </form>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Charts</h3>
        <label>
          Type
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            {VITAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Days
          <input
            type="number"
            min="1"
            max="90"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ width: 90 }}
          />
        </label>
        <button onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {weekly && (
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <strong>Weekly score:</strong> {weekly.score}/100
          {Array.isArray(weekly.insights) && weekly.insights.length > 0 && (
            <ul>
              {weekly.insights.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {chartData ? (
        <VitalChart chartData={chartData} />
      ) : (
        <p style={{ marginTop: 12, opacity: 0.7 }}>No chart data.</p>
      )}
    </div>
  );
}

