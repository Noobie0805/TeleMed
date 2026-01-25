const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken"; // Kept for backward compatibility, but not used
const USER_KEY = "user";

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const session = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  },
  getRefreshToken() {
    // refreshToken is stored in HTTPOnly cookie, not localStorage
    // This method is kept for backward compatibility but returns empty string
    return "";
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? safeJsonParse(raw) : null;
  },
  setSession({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    // refreshToken is stored in HTTPOnly cookie by backend, not in localStorage
    // Ignore refreshToken parameter if provided
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

