const API_BASE = "http://localhost:5000/api";

export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function createAppointment({ patientId, doctorId, datetime }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ patientId, doctorId, datetime }),
  });
  return res.json();
}

export async function getAppointment(appointmentId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return res.json();
} 