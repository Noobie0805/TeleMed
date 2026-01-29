import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiVideo, FiPhone, FiMessageCircle } from "react-icons/fi";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/feedback/EmptyState";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import "./MyAppointments.css";

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

  const statusVariant = (status) => {
    switch (status) {
      case "scheduled":
        return "info";
      case "ongoing":
        return "success";
      case "completed":
        return "secondary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your appointments..." />;
  }

  return (
    <div className="appointments-page">
      <PageHeader
        title="My Appointments"
        subtitle="Review and manage your upcoming and past consultations."
        actions={[
          <button key="refresh" type="button" onClick={load} className="appointments-page__refresh">
            Refresh
          </button>,
          <Link key="book" to="/doctors" className="appointments-page__primary-link">
            Book new appointment
          </Link>,
        ]}
      />

      {error && <p className="error">{error}</p>}

      {appointments.length === 0 ? (
        <EmptyState
          icon={<FiCalendar size={48} />}
          title="No appointments yet"
          description="Book your first appointment to get started with telemedicine."
          action={
            <Link to="/doctors" className="appointments-page__primary-link">
              Find a doctor
            </Link>
          }
        />
      ) : (
        <div className="appointments-list">
          {appointments.map((a) => {
            const doctorName = a?.doctorId?.profile?.name || "Doctor";
            const specialty = a?.doctorId?.profile?.specialty || "General";
            const dateStr = a?.slot?.date
              ? new Date(a.slot.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";
            const timeStr = `${a?.slot?.startTime || ""} – ${a?.slot?.endTime || ""}`;

            return (
              <div key={a._id} className="appointment-card">
                <div className="appointment-card__header">
                  <div className="appointment-card__status">
                    <Badge variant={statusVariant(a?.status)}>{a?.status || "unknown"}</Badge>
                  </div>
                  <div className="appointment-card__type">
                    {a?.type === "video" && <><FiVideo size={16} aria-hidden /> </>}
                    {a?.type === "audio" && <><FiPhone size={16} aria-hidden /> </>}
                    {a?.type === "chat" && <><FiMessageCircle size={16} aria-hidden /> </>}
                    {a?.type || "consultation"}
                  </div>
                </div>

                <div className="appointment-card__body">
                  <div className="appointment-card__doctor">
                    <div className="appointment-card__avatar" aria-hidden="true">
                      {doctorName.charAt(0)}
                    </div>
                    <div>
                      <div className="appointment-card__doctor-name">{doctorName}</div>
                      <div className="appointment-card__specialty">{specialty}</div>
                    </div>
                  </div>

                  <div className="appointment-card__meta">
                    <div className="appointment-card__meta-item">
                      <span className="appointment-card__meta-label">Date</span>
                      <span className="appointment-card__meta-value">{dateStr}</span>
                    </div>
                    <div className="appointment-card__meta-item">
                      <span className="appointment-card__meta-label">Time</span>
                      <span className="appointment-card__meta-value">{timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="appointment-card__actions">
                  {a?.status === "ongoing" && a?.type === "video" && (
                    <Link to={`/video/${a._id}`} className="appointment-card__btn appointment-card__btn--primary">
                      Join video call
                    </Link>
                  )}

                  {a?.status === "scheduled" && (
                    <button
                      type="button"
                      onClick={() => remove(a._id)}
                      className="appointment-card__btn appointment-card__btn--danger"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

