import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import "./AppointmentForm.css";

export default function AppointmentForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedDoctorId = searchParams.get("doctorId") || "";

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(preselectedDoctorId);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [type, setType] = useState("video");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let alive = true;
    const loadDoctors = async () => {
      try {
        const { data } = await api.get("/auth/doctors");
        const list = data?.data?.data || [];
        if (alive) setDoctors(Array.isArray(list) ? list : []);
      } catch (e) {
        // Non-blocking: allow booking if doctorId already provided
        if (alive) setDoctors([]);
      }
    };
    loadDoctors();
    return () => {
      alive = false;
    };
  }, []);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d._id === doctorId),
    [doctors, doctorId]
  );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!doctorId) {
      setError("Please select a doctor.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Please select a start and end time.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/appointments/book", {
        doctorId,
        date,
        startTime,
        endTime,
        type,
      });
      setSuccess("Appointment booked successfully.");
      navigate("/appointments", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-page">
      <PageHeader
        title="Book appointment"
        subtitle="Choose a doctor, date, time, and consultation type."
      />

      <div className="appointment-form-card">
        <form onSubmit={submit} className="appointment-form">
          <div className="appointment-form__row">
            <label className="appointment-form__field">
              <span className="appointment-form__label">Doctor</span>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.profile?.name}{" "}
                    {d.profile?.specialty ? `- ${d.profile.specialty}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedDoctor && (
            <div className="appointment-form__hint">
              Booking with <strong>{selectedDoctor.profile?.name}</strong>
            </div>
          )}

          <div className="appointment-form__row">
            <label className="appointment-form__field">
              <span className="appointment-form__label">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="appointment-form__row appointment-form__row--inline">
            <label className="appointment-form__field">
              <span className="appointment-form__label">Start time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </label>
            <label className="appointment-form__field">
              <span className="appointment-form__label">End time</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="appointment-form__row">
            <label className="appointment-form__field">
              <span className="appointment-form__label">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="chat">Chat</option>
              </select>
            </label>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="appointment-form__actions">
            <button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

