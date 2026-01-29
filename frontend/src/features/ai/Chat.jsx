import React, { useState } from "react";
import api from "../../services/api";
import "./Chat.css";
import { BsRobot, BsHourglass } from "react-icons/bs";
import { RiUserHeartLine } from "react-icons/ri";
import { BiSend, BiSolidError } from "react-icons/bi";

export default function Chat() {
  const [context, setContext] = useState("platform"); // platform | medical

  // Platform mode states
  const [platformMessage, setPlatformMessage] = useState("");
  const [platformMessages, setPlatformMessages] = useState([]);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformError, setPlatformError] = useState("");

  // Medical mode states
  const [medicalMessage, setMedicalMessage] = useState("");
  const [medicalMessages, setMedicalMessages] = useState([]);
  const [medicalLoading, setMedicalLoading] = useState(false);
  const [medicalError, setMedicalError] = useState("");

  // Get current mode states
  const getState = () => {
    if (context === "platform") {
      return {
        message: platformMessage,
        setMessage: setPlatformMessage,
        messages: platformMessages,
        setMessages: setPlatformMessages,
        loading: platformLoading,
        setLoading: setPlatformLoading,
        error: platformError,
        setError: setPlatformError,
      };
    } else {
      return {
        message: medicalMessage,
        setMessage: setMedicalMessage,
        messages: medicalMessages,
        setMessages: setMedicalMessages,
        loading: medicalLoading,
        setLoading: setMedicalLoading,
        error: medicalError,
        setError: setMedicalError,
      };
    }
  };

  const state = getState();

  const send = async (e) => {
    e.preventDefault();
    const trimmed = state.message.trim();
    if (!trimmed) return;

    state.setError("");
    state.setLoading(true);
    state.setMessages((m) => [...m, { role: "user", text: trimmed }]);
    state.setMessage("");

    try {
      const { data } = await api.post("/ai/chat", { message: trimmed, context });
      const payload = data?.data || {};
      const reply = payload?.response || "No response";
      state.setMessages((m) => [
        ...m,
        { role: "assistant", text: reply },
        ...(payload?.disclaimer ? [{ role: "system", text: payload.disclaimer }] : []),
      ]);
    } catch (err) {
      state.setError(err?.response?.data?.message || "Chat failed");
    } finally {
      state.setLoading(false);
    }
  };

  return (
    <div className={`chat-component chat-component--${context}`}>
      <div className="chat-header">
        <h2 className="chat-title">AI Assistant</h2>
        <label className="chat-mode-label">
          <span>Mode:</span>
          <select value={context} onChange={(e) => setContext(e.target.value)} className="chat-mode-select">
            <option value="platform">Platform</option>
            <option value="medical">Medical (general info)</option>
          </select>
        </label>
      </div>

      <div className="chat-messages-container">
        {state.messages.length === 0 ? (
          <div className="chat-empty">
            <p>Ask something to get started</p>
          </div>
        ) : (
          state.messages.map((m, idx) => (
            <div key={idx} className={`chat-message-wrapper chat-message-wrapper--${m.role}`}>
              <div className={`chat-message chat-message--${m.role}`}>
                {m.role === "assistant" && (
                  <span className="chat-message-avatar"><BsRobot className="chat-message-avatar-icon" /></span>
                )}
                <div className="chat-message-content">
                  <span className="chat-message-text">{m.text}</span>
                  {m.role === "system" && (
                    <span className="chat-message-disclaimer"><BiSolidError className="chat-message-avatar-icon" /> Disclaimer</span>
                  )}
                </div>
                {m.role === "user" && (
                  <span className="chat-message-avatar"><RiUserHeartLine className="chat-message-avatar-icon" /></span>
                )}
              </div>
            </div>
          ))
        )}
        {state.loading && (
          <div className="chat-message-wrapper chat-message-wrapper--assistant">
            <div className="chat-message chat-message--assistant">
              <span className="chat-message-avatar"><BsRobot className="chat-message-avatar-icon" /></span>
              <div className="chat-message-content">
                <div className="chat-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {state.error && (
        <div className="chat-error">
          <span className="chat-error-icon"><BiSolidError className="chat-message-avatar-icon" /></span>
          <span>{state.error}</span>
        </div>
      )}

      <form onSubmit={send} className="chat-form">
        <div className="chat-input-wrapper">
          <input
            value={state.message}
            onChange={(e) => state.setMessage(e.target.value)}
            placeholder="Type your message…"
            className="chat-input"
            disabled={state.loading}
          />
          <button type="submit" disabled={state.loading} className="chat-send-btn">
            {state.loading ? <BsHourglass className="chat-send-icon" /> : <BiSend className="chat-send-icon" />}
          </button>
        </div>
      </form>
    </div>
  );
}

