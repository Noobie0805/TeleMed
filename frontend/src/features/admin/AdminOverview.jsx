import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import "./AdminOverview.css";

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [p, ds, as, rev, audit] = await Promise.all([
        api.get("/admin/platform/overview"),
        api.get("/admin/doctors/status"),
        api.get("/admin/appointments/status"),
        api.get("/admin/platform/revenue"),
        api.get("/admin/audit-logs"),
      ]);
      setOverview(p.data?.data || null);
      setDoctorStatus(ds.data?.data || null);
      setAppointmentStats(as.data?.data || null);
      setRevenueReport(Array.isArray(rev.data?.data) ? rev.data.data : []);
      setAuditLogs(Array.isArray(audit.data?.data) ? audit.data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    if (!window.confirm("Run appointment cleanup? This will archive inconsistent appointments.")) return;
    setCleanupMessage("");
    setCleanupLoading(true);
    try {
      const { data } = await api.post("/admin/appointments/cleanup");
      setCleanupMessage(data?.message || "Cleanup completed.");
      await load();
    } catch (err) {
      setCleanupMessage(err?.response?.data?.message || "Cleanup failed");
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading admin overview..." fullScreen />;
  }

  return (
    <div className="admin-overview-page">
      <PageHeader
        title="Admin Overview"
        subtitle="Platform stats, revenue, audit logs, and maintenance"
        actions={[
          <button key="refresh" type="button" onClick={load} className="refresh-button admin-overview__refresh">
            Refresh
          </button>,
        ]}
      />

      {error && <p className="error">{error}</p>}
      {cleanupMessage && (
        <p className={cleanupMessage.includes("failed") ? "error" : "admin-overview__message"}>
          {cleanupMessage}
        </p>
      )}

      <div className="overview-grid">
        {/* Platform stats */}
        <section className="overview-section overview-section--platform">
          <h3>Platform (last 30 days)</h3>
          <div className="stats-cards">
            <div className="stat-card stat-card--primary">
              <span className="stat-card__value">{overview?.totalPatients ?? 0}</span>
              <span className="stat-card__label">Total patients</span>
            </div>
            <div className="stat-card stat-card--success">
              <span className="stat-card__value">{overview?.verifiedDoctors ?? 0}</span>
              <span className="stat-card__label">Verified doctors</span>
            </div>
            <div className="stat-card stat-card--warning">
              <span className="stat-card__value">{overview?.pendingDoctors ?? 0}</span>
              <span className="stat-card__label">Pending doctors</span>
            </div>
            <div className="stat-card stat-card--info">
              <span className="stat-card__value">{overview?.monthlyConsults ?? 0}</span>
              <span className="stat-card__label">Completed consultations</span>
            </div>
            <div className="stat-card stat-card--revenue">
              <span className="stat-card__value">₹{overview?.totalRevenue ?? 0}</span>
              <span className="stat-card__label">Total revenue</span>
            </div>
            <div className="stat-card stat-card--commission">
              <span className="stat-card__value">₹{overview?.platformCommission ?? 0}</span>
              <span className="stat-card__label">Platform commission (20%)</span>
            </div>
          </div>
        </section>

        {/* Doctor status */}
        <section className="overview-section overview-section--doctors">
          <h3>Doctor verification status</h3>
          <div className="stats-cards stats-cards--compact">
            <div className="stat-card stat-card--success">
              <span className="stat-card__value">{doctorStatus?.totalDoctors ?? 0}</span>
              <span className="stat-card__label">Total doctors</span>
            </div>
            {(doctorStatus?.statuses ?? []).map((s) => (
              <div
                key={s.status}
                className={`stat-card stat-card--${s.status === "verified" ? "success" : s.status === "pending" ? "warning" : "error"}`}
              >
                <span className="stat-card__value">{s.count}</span>
                <span className="stat-card__label">{s.status}</span>
              </div>
            ))}
          </div>
          {Array.isArray(doctorStatus?.pendingDoctors) && doctorStatus.pendingDoctors.length > 0 && (
            <div className="overview-subsection">
              <h4>Recent pending</h4>
              <ul className="pending-doctors-list">
                {doctorStatus.pendingDoctors.slice(0, 5).map((d) => (
                  <li key={d._id} className="pending-doctor-item">
                    <span className="pending-doctor__name">{d?.profile?.name ?? "—"}</span>
                    <span className="pending-doctor__email">{d?.email ?? ""}</span>
                    <span className="pending-doctor__date">
                      {d?.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/pending-doctors" className="overview-link">
                View all pending →
              </Link>
            </div>
          )}
        </section>

        {/* Appointment stats */}
        <section className="overview-section overview-section--appointments">
          <h3>Appointment statistics</h3>
          <div className="stats-cards stats-cards--compact">
            <div className="stat-card stat-card--primary">
              <span className="stat-card__value">{appointmentStats?.totalAppointments ?? 0}</span>
              <span className="stat-card__label">Total appointments</span>
            </div>
            <div className="stat-card stat-card--warning">
              <span className="stat-card__value">
                {appointmentStats?.noShowRate != null
                  ? `${(Number(appointmentStats.noShowRate) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
              <span className="stat-card__label">No-show rate</span>
            </div>
          </div>
          {(appointmentStats?.statuses ?? []).length > 0 && (
            <div className="overview-subsection">
              <h4>By status</h4>
              <ul className="status-breakdown-list">
                {appointmentStats.statuses.map((s) => (
                  <li key={s.status} className="status-breakdown-item">
                    <span className="status-breakdown__name">{s.status}</span>
                    <span className="status-breakdown__count">{s.count}</span>
                    {s.avgDuration != null && !Number.isNaN(s.avgDuration) && (
                      <span className="status-breakdown__duration">
                        avg {Number(s.avgDuration).toFixed(0)} min
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="overview-section">
          <h3>Revenue report (last 30 days)</h3>
          {revenueReport.length === 0 ? (
            <p className="overview-empty">No revenue data.</p>
          ) : (
            <div className="revenue-list">
              {revenueReport.map((row, idx) => (
                <div key={row._id?.day ?? idx} className="revenue-row">
                  <span className="revenue-row__day">{row._id?.day ?? "—"}</span>
                  <span className="revenue-row__amount">₹{row.dailyRevenue ?? 0}</span>
                  <span className="revenue-row__consults">{row.consultations ?? 0} consults</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overview-section overview-section--wide">
          <h3>Audit logs (cancelled / no-show, last 7 days)</h3>
          {auditLogs.length === 0 ? (
            <p className="overview-empty">No audit logs.</p>
          ) : (
            <div className="audit-list">
              {auditLogs.map((log, idx) => (
                <div key={log._id ?? idx} className="audit-row">
                  <span className="audit-row__date">
                    {log.updatedAt ? new Date(log.updatedAt).toLocaleString() : "—"}
                  </span>
                  <span className="audit-row__status">{log.status}</span>
                  <span className="audit-row__doctor">
                    {log.doctorId?.profile?.name ?? "—"}
                  </span>
                  <span className="audit-row__patient">
                    {log.patientId?.profile?.name ?? "—"}
                  </span>
                  {log.notes && <span className="audit-row__notes">{log.notes}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overview-section overview-section--actions">
          <h3>Maintenance</h3>
          <button
            type="button"
            className="admin-overview__cleanup-btn"
            onClick={runCleanup}
            disabled={cleanupLoading}
          >
            {cleanupLoading ? "Running..." : "Run appointment cleanup"}
          </button>
          <p className="overview-hint">
            Archives inconsistent or stale appointments to logs.
          </p>
        </section>
      </div>
    </div>
  );
}
