import axios from "axios";
import { session } from "./session";

const getBaseUrl = () => process.env.REACT_APP_API_URL;

export async function refreshTokens() {
  const baseURL = getBaseUrl();

  if (!baseURL) throw new Error("REACT_APP_API_URL is not set");

  // refreshToken is automatically sent via HTTPOnly cookie with withCredentials: true
  const { data } = await axios.post(
    `${baseURL}/auth/refresh`,
    {}, // No body needed - refreshToken comes from cookie
    { withCredentials: true }
  );

  const accessToken = data?.data?.accessToken;

  if (!accessToken) {
    throw new Error("Unexpected refresh response");
  }

  // refreshToken is automatically updated in HTTPOnly cookie by backend
  // Only update accessToken in session storage
  session.setSession({
    accessToken,
    user: session.getUser(),
  });

  return { accessToken };
}

