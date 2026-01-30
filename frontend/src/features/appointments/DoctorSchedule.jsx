import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import "./DoctorSchedule.css";

export default function DoctorSchedule() {
  const [items, setItems] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [scheduleRes, waitingRes, perfRes] = await Promise.all([
        api.get("/appointments/schedule"),
        api.get("/appointments/waiting-patients"),
        api.get("/appointments/performance"),
      ]);
      const list = scheduleRes.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
      setWaitingPatients(Array.isArray(waitingRes.data?.data) ? waitingRes.data.data : []);
      setPerformance(perfRes.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadPatientHistory = async (patientId) => {
    if (!patientId) return;
    setHistoryPatientId(patientId);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const { data } = await api.get(`/appointments/patient/${patientId}/history`);
      setHistoryData(data?.data || null);
    } catch (err) {
      setHistoryData({ error: err?.response?.data?.message || "Failed to load history" });
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryPatientId(null);
    setHistoryData(null);
  };

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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading schedule..." />;
  }

  return (
    <div className="doctor-schedule-page">
      <PageHeader
        title="Doctor dashboard"
        subtitle="Today's schedule, waiting patients, and performance"
        actions={[
          <button key="refresh" type="button" onClick={load} className="doctor-schedule__refresh">
            Refresh
          </button>,
        ]}
      />

      {error && <p className="error">{error}</p>}

      {/* Performance */}
      {performance && Object.keys(performance).length > 0 && (
        <section className="doctor-schedule__section doctor-schedule__performance">
          <h3>Performance (last 30 days)</h3>
          <div className="performance-grid">
            <div className="performance-card">
              <span className="performance-label">Total appointments</span>
              <span className="performance-value">{performance.totalAppointments ?? 0}</span>
            </div>
            <div className="performance-card">
              <span className="performance-label">Completion rate</span>
              <span className="performance-value">{performance.completionRate ?? 0}%</span>
            </div>
            <div className="performance-card">
              <span className="performance-label">Avg. rating</span>
              <span className="performance-value">{performance.avgRating ?? "—"}</span>
            </div>
            <div className="performance-card">
              <span className="performance-label">No-shows</span>
              <span className="performance-value">{performance.noShows ?? 0}</span>
            </div>
            <div className="performance-card">
              <span className="performance-label">Total revenue</span>
              <span className="performance-value">₹{performance.totalRevenue ?? 0}</span>
            </div>
          </div>
        </section>
      )}

      {/* Waiting patients */}
      <section className="doctor-schedule__section">
        <h3>Waiting patients</h3>
        {waitingPatients.length === 0 ? (
          <p className="doctor-schedule__empty">No patients waiting.</p>
        ) : (
          <div className="schedule-list">
            {waitingPatients.map((apt) => {
              const patientName = apt?.patientId?.profile?.name || "Patient";
              const patientId = apt?.patientId?._id;
              return (
                <div key={apt._id} className="schedule-card schedule-card--waiting">
                  <div className="schedule-card__main">
                    <strong>{patientName}</strong>
                    <span className="schedule-card__meta">
                      {apt?.slot?.startTime} – {apt?.slot?.endTime} · {apt?.type || "video"}
                    </span>
                  </div>
                  <div className="schedule-card__actions">
                    <button
                      type="button"
                      className="schedule-card__btn schedule-card__btn--secondary"
                      onClick={() => loadPatientHistory(patientId)}
                    >
                      History
                    </button>
                    {apt?.type === "video" && (
                      <Link
                        to={`/video/${apt._id}`}
                        className="schedule-card__btn schedule-card__btn--primary"
                      >
                        Start video
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Today's schedule */}
      <section className="doctor-schedule__section">
        <h3>Today's schedule</h3>
        {items.length === 0 ? (
          <p className="doctor-schedule__empty">No appointments today.</p>
        ) : (
          <div className="schedule-list">
            {items.map((apt) => (
              <div key={apt.id} className="schedule-card">
                <div className="schedule-card__main">
                  <strong>{apt.patient}</strong>
                  <span className="schedule-card__meta">
                    {apt.time} · {apt.type} · fees: ₹{apt.fees ?? 0}
                  </span>
                </div>
                <div className="schedule-card__actions">
                  {apt.status === "scheduled" && (
                    <button
                      type="button"
                      className="schedule-card__btn schedule-card__btn--secondary"
                      onClick={() => confirm(apt.id)}
                    >
                      Confirm
                    </button>
                  )}
                  {(apt.status === "scheduled" || apt.status === "confirmed") && (
                    <button
                      type="button"
                      className="schedule-card__btn schedule-card__btn--danger"
                      onClick={() => cancel(apt.id)}
                    >
                      Cancel
                    </button>
                  )}
                  {apt.status === "confirmed" && apt.type === "video" && (
                    <Link
                      to={`/video/${apt.id}`}
                      className="schedule-card__btn schedule-card__btn--primary"
                    >
                      Start video
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Patient history modal */}
      {historyPatientId != null && (
        <div className="doctor-schedule__modal-overlay" onClick={closeHistory} role="presentation">
          <div
            className="doctor-schedule__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="patient-history-title"
          >
            <div className="doctor-schedule__modal-header">
              <h3 id="patient-history-title">Patient history</h3>
              <button type="button" className="doctor-schedule__modal-close" onClick={closeHistory}>
                ×
              </button>
            </div>
            <div className="doctor-schedule__modal-body">
              {historyLoading ? (
                <LoadingSpinner text="Loading history..." />
              ) : historyData?.error ? (
                <p className="error">{historyData.error}</p>
              ) : historyData ? (
                <>
                  {historyData.appointments?.length > 0 && (
                    <div className="history-block">
                      <h4>Past consultations</h4>
                      <ul className="history-list">
                        {historyData.appointments.map((a) => (
                          <li key={a._id}>
                            {new Date(a.createdAt).toLocaleDateString()} – {a.status}
                            {a?.postConsult?.diagnosis && ` · ${a.postConsult.diagnosis}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {historyData.vitalsTrends?.length > 0 && (
                    <div className="history-block">
                      <h4>Vitals trends (last 30 days)</h4>
                      <ul className="history-list">
                        {historyData.vitalsTrends.map((v) => (
                          <li key={v._id}>
                            {v._id}: {v.count} readings
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!historyData.appointments?.length && !historyData.vitalsTrends?.length) && (
                    <p>No history found.</p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
