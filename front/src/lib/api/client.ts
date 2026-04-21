import axios from 'axios';
import { getAccessToken } from '../auth-utils';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
});

client.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => {
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
            console.error(`Received HTML instead of JSON for ${response.config.url}. Check your proxy settings or backend URL.`);
        }
        return response;
    },
    (error) => {
        // Clerk handles token refresh automatically via getAccessToken().
        // If we get a 401 here, it likely means the session is truly invalid/expired
        // or the user doesn't have permissions.
        return Promise.reject(error);
    }
);

export default client;
