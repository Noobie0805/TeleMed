import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function JitsiMeet() {
  const { appointmentId } = useParams();
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("");
  const [passCode, setPassCode] = useState("");
  const [ended, setEnded] = useState(false);

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
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to end session");
    }
  };

  if (loading) return <div>Loading video session…</div>;

  return (
    <div>
      <h2>Video session</h2>

      {error && (
        <div>
          <p className="error">{error}</p>
          {role === "patient" && (
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              If your doctor hasn’t started the session yet, please wait until the appointment is marked ongoing.
            </p>
          )}
        </div>
      )}

      {ended && <p>Session ended.</p>}

      {roomName && (
        <div style={{ marginBottom: 12 }}>
          <div>
            <strong>Room:</strong> {roomName}
          </div>
          <div>
            <strong>Passcode:</strong> {passCode || "—"}
          </div>
        </div>
      )}

      {iframeSrc && !ended && (
        <iframe
          title="Jitsi Meet"
          src={iframeSrc}
          style={{ width: "100%", height: "70vh", border: 0, borderRadius: 8 }}
          allow="camera; microphone; fullscreen; display-capture"
        />
      )}

      {role === "doctor" && roomName && !ended && (
        <div style={{ marginTop: 12 }}>
          <button onClick={endSession}>End session</button>
        </div>
      )}
    </div>
  );
}

