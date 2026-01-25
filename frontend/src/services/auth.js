import api from "./api";
import { session } from "./session";

export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  const accessToken = data?.data?.tokens?.accessToken;
  const user = data?.data?.user;

  if (!accessToken || !user) {
    throw new Error("Unexpected login response");
  }

  // refreshToken is stored in HTTPOnly cookie, not in response
  session.setSession({ accessToken, user });
  return { user, accessToken };
}

export async function registerPatient(payload) {
  const { data } = await api.post("/auth/register-patient", payload);
  const accessToken = data?.data?.tokens?.accessToken;
  const user = data?.data?.user;

  if (!accessToken || !user) {
    throw new Error("Unexpected register response");
  }

  // refreshToken is stored in HTTPOnly cookie, not in response
  session.setSession({ accessToken, user });
  return { user, accessToken };
}

export async function registerDoctor(payload) {
  const { data } = await api.post("/auth/register-doctor", payload);
  // Doctor registration is pending verification and returns no tokens
  return data?.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    session.clearSession();
  }
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data?.data;
}

