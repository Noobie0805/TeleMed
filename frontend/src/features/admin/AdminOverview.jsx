import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [o, ds, as] = await Promise.all([
        api.get("/admin/platform/overview"),
        api.get("/admin/doctors/status"),
        api.get("/admin/appointments/status"),
      ]);
      setOverview(o.data?.data || null);
      setDoctorStatus(ds.data?.data || null);
      setAppointmentStats(as.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Admin Overview</h2>
        <button onClick={load} style={{ marginLeft: "auto" }}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <section style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Platform</h3>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(overview, null, 2)}
          </pre>
        </section>

        <section style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Doctor status</h3>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(doctorStatus, null, 2)}
          </pre>
        </section>

        <section style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Appointments</h3>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(appointmentStats, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}

