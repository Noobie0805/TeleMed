import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function DoctorSchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/appointments/schedule");
      const list = data?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirm = async (id) => {
    setError("");
    try {
      await api.put(`/appointments/confirm/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Confirm failed");
    }
  };

  const cancel = async (id) => {
    const reason = window.prompt("Cancel reason (optional):") || "";
    setError("");
    try {
      await api.put(`/appointments/cancel/${id}`, reason ? { reason } : {});
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed");
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Today's Schedule</h2>
        <button onClick={load} style={{ marginLeft: "auto" }}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p>No appointments today.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {items.map((apt) => (
            <div
              key={apt.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div>
                    <strong>{apt.patient}</strong>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {apt.time} · {apt.type} · fees: {apt.fees ?? 0}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>
                    <strong>{apt.status}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                    {apt.status === "scheduled" && (
                      <button onClick={() => confirm(apt.id)}>Confirm</button>
                    )}
                    {(apt.status === "scheduled" || apt.status === "confirmed") && (
                      <button onClick={() => cancel(apt.id)}>Cancel</button>
                    )}
                    {apt.status === "confirmed" && apt.type === "video" && (
                      <Link to={`/video/${apt.id}`}>Start video</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

