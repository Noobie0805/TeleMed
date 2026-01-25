import React, { useState } from "react";
import api from "../../services/api";

export default function Chat() {
  const [context, setContext] = useState("platform"); // platform | medical
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // { role, text }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setMessage("");

    try {
      const { data } = await api.post("/ai/chat", { message: trimmed, context });
      const payload = data?.data || {};
      const reply = payload?.response || "No response";
      setMessages((m) => [
        ...m,
        { role: "assistant", text: reply },
        ...(payload?.disclaimer ? [{ role: "system", text: payload.disclaimer }] : []),
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>Chat</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Mode:{" "}
          <select value={context} onChange={(e) => setContext(e.target.value)}>
            <option value="platform">Platform</option>
            <option value="medical">Medical (general info)</option>
          </select>
        </label>
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 12,
          minHeight: 200,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Ask something to get started.</div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong style={{ textTransform: "capitalize" }}>{m.role}:</strong>{" "}
              <span>{m.text}</span>
            </div>
          ))
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={send} style={{ display: "flex", gap: 8 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message…"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

