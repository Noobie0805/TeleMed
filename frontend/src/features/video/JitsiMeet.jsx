import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import EmptyState from "../../components/feedback/EmptyState";
import "./JitsiMeet.css";

export default function JitsiMeet() {
  const { appointmentId } = useParams();
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("");
  const [passCode, setPassCode] = useState("");
  const [ended, setEnded] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultSubmitted, setConsultSubmitted] = useState(false);
  const [consultForm, setConsultForm] = useState({
    notes: "",
    prescription: "",
    diagnosis: "",
    followUpInstructions: "",
  });

  const jitsiHost = process.env.REACT_APP_JITSI || "meet.jit.si";

  const iframeSrc = useMemo(() => {
    if (!roomName) return "";
    const host = jitsiHost.startsWith("http") ? jitsiHost : `https://${jitsiHost}`;
    return `${host}/${encodeURIComponent(roomName)}`;
  }, [roomName, jitsiHost]);

  useEffect(() => {
    let alive = true;

    const init = async () => {
      setError("");
      setLoading(true);
      try {
        if (!appointmentId) throw new Error("Missing appointmentId");
        if (role !== "doctor" && role !== "patient") {
          throw new Error("Only doctors and patients can use video sessions.");
        }

        const endpoint =
          role === "doctor"
            ? `/video/start/${appointmentId}`
            : `/video/join/${appointmentId}`;

        const { data } = role === "doctor" ? await api.post(endpoint) : await api.get(endpoint);
        const payload = data?.data || {};

        if (alive) {
          setRoomName(payload.roomName || "");
          setPassCode(payload.passCode || "");
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || err?.message || "Failed to start/join session");
      } finally {
        if (alive) setLoading(false);
      }
    };

    init();
    return () => {
      alive = false;
    };
  }, [appointmentId, role]);

  const endSession = async () => {
    setError("");
    try {
      await api.post(`/video/end/${appointmentId}`);
      setEnded(true);
      if (role === "doctor") setShowConsultForm(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to end session");
    }
  };

  const submitConsultNotes = async (e) => {
    e.preventDefault();
    setError("");
    setConsultSubmitting(true);
    try {
      await api.patch(`/appointments/${appointmentId}/notes`, consultForm);
      setConsultSubmitted(true);
      setShowConsultForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit notes");
    } finally {
      setConsultSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Preparing your video session..." />;
  }

  if (error && !roomName) {
    return (
      <div className="video-page">
        <PageHeader title="Video consultation" subtitle="We couldn't start your session." />
        <EmptyState
          icon={<FiAlertTriangle size={48} />}
          title="Unable to start session"
          description={error}
        />
        {role === "patient" && (
          <p className="video-hint">
            If your doctor hasn't started the session yet, please wait until the appointment is
            marked ongoing and try again from your appointments page.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="video-page">
      <PageHeader
        title="Video consultation"
        subtitle={role === "doctor" ? "You are hosting this consultation." : "You are joining this consultation."}
      />

      {error && !ended && (
        <p className="error">{error}</p>
      )}

      {ended ? (
        <>
          <EmptyState
            icon={<FiCheckCircle size={48} />}
            title="Session ended"
            description={
              consultSubmitted
                ? "Consultation notes submitted. You can close this window or return to your appointments."
                : "This video consultation has finished. You can close this window or return to your appointments."
            }
          />
          {role === "doctor" && showConsultForm && !consultSubmitted && (
            <div className="video-consult-form-wrapper">
              <h3 className="video-consult-form-title">Submit consultation notes</h3>
              <form onSubmit={submitConsultNotes} className="video-consult-form">
                <label className="video-consult-form__label">
                  <span>Notes</span>
                  <textarea
                    value={consultForm.notes}
                    onChange={(e) => setConsultForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    placeholder="Consultation notes"
                    className="video-consult-form__input"
                  />
                </label>
                <label className="video-consult-form__label">
                  <span>Diagnosis</span>
                  <input
                    type="text"
                    value={consultForm.diagnosis}
                    onChange={(e) => setConsultForm((p) => ({ ...p, diagnosis: e.target.value }))}
                    placeholder="Diagnosis"
                    className="video-consult-form__input"
                  />
                </label>
                <label className="video-consult-form__label">
                  <span>Prescription</span>
                  <textarea
                    value={consultForm.prescription}
                    onChange={(e) => setConsultForm((p) => ({ ...p, prescription: e.target.value }))}
                    rows={2}
                    placeholder="Prescription details"
                    className="video-consult-form__input"
                  />
                </label>
                <label className="video-consult-form__label">
                  <span>Follow-up instructions</span>
                  <textarea
                    value={consultForm.followUpInstructions}
                    onChange={(e) =>
                      setConsultForm((p) => ({ ...p, followUpInstructions: e.target.value }))
                    }
                    rows={2}
                    placeholder="Follow-up instructions"
                    className="video-consult-form__input"
                  />
                </label>
                <div className="video-consult-form__actions">
                  <button
                    type="button"
                    className="video-consult-form__btn video-consult-form__btn--secondary"
                    onClick={() => setShowConsultForm(false)}
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={consultSubmitting}
                    className="video-consult-form__btn video-consult-form__btn--primary"
                  >
                    {consultSubmitting ? "Submitting..." : "Submit notes"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <>
          {roomName && (
            <div className="video-info-card">
              <div className="video-info-row">
                <span className="video-info-label">Room</span>
                <span className="video-info-value">{roomName}</span>
              </div>
              <div className="video-info-row">
                <span className="video-info-label">Passcode</span>
                <span className="video-info-value">{passCode || "—"}</span>
              </div>
            </div>
          )}

          {iframeSrc && (
            <div className="video-frame-wrapper">
              <iframe
                title="Jitsi Meet"
                src={iframeSrc}
                className="video-frame"
                allow="camera; microphone; fullscreen; display-capture"
              />
            </div>
          )}

          {role === "doctor" && roomName && (
            <div className="video-actions">
              <button type="button" onClick={endSession} className="video-end-btn">
                End session for everyone
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

