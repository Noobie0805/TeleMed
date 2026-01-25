import axios from 'axios';
import { session } from "./session";
import { refreshTokens } from "./refresh";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = session.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;

        // If we got a 401, try one refresh then retry once.
        if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { accessToken } = await refreshTokens();
                // refreshTokens() already updated session storage
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshErr) {
                session.clearSession();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
