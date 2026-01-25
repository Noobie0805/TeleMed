import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/appointments/my-appointments");
      const list = data?.data || [];
      setAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (appointmentId) => {
    if (!appointmentId) return;
    setError("");
    try {
      await api.delete(`/appointments/${appointmentId}`);
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>My Appointments</h2>
        <Link to="/doctors">Book a new one</Link>
        <button onClick={load} style={{ marginLeft: "auto" }}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {appointments.map((a) => {
            const doctorName = a?.doctorId?.profile?.name || "Doctor";
            const dateStr = a?.slot?.date ? new Date(a.slot.date).toLocaleDateString() : "";
            const timeStr = `${a?.slot?.startTime || ""} - ${a?.slot?.endTime || ""}`;

            return (
              <div
                key={a._id}
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
                      <strong>{doctorName}</strong>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {dateStr} · {timeStr} · {a?.type}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>
                      <strong>{a?.status}</strong>
                    </div>
                    {a?.status === "scheduled" && (
                      <button onClick={() => remove(a._id)} style={{ marginTop: 6 }}>
                        Delete
                      </button>
                    )}
                    {a?.status === "ongoing" && a?.type === "video" && (
                      <div style={{ marginTop: 6 }}>
                        <Link to={`/video/${a._id}`}>Join video</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

