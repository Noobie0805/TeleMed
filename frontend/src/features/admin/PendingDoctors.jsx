import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function PendingDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/admin/pending-doctors");
      const list = data?.data || [];
      setDoctors(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pending doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (doctorId, status) => {
    const notes = window.prompt("Notes (optional):") || "";
    setError("");
    try {
      await api.put(`/admin/doctors/${doctorId}/verify`, { status, notes: notes || undefined });
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Pending Doctors</h2>
        <button onClick={load} style={{ marginLeft: "auto" }}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {doctors.length === 0 ? (
        <p>No pending doctors.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {doctors.map((d) => (
            <div
              key={d._id}
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
                    <strong>{d.profile?.name || "Doctor"}</strong>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {d.email} · {d.profile?.specialty || "—"} · exp: {d.profile?.experience ?? 0}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => verify(d._id, "verified")}>Approve</button>
                  <button onClick={() => verify(d._id, "rejected")}>Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

