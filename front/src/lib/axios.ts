import axios from 'axios';

// Environment variable for API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// We will inject the token via a Request Interceptor.
// Since we are using React, we typically get the token from Clerk's useAuth() hook.
// However, hooks cannot be used in plain JS/TS files directly outside components.
// Pattern: We can export a function to set the token, or use a setup function.
// Or simpler: The component logic will attach the token to the header before calling, 
// OR we use an interceptor that reads from a global store if available.
// For simplicity in this renewal, let's create a helper function `createAuthenticatedApi` or just pass token to headers in the query function.

// Better approach: Setup interceptor but we need the getToken function from Clerk.
// Since Clerk's `useAuth` provides `getToken`, we can't easily access it here statically.
// We will use a pattern where we pass the token to the API call or wrap it.

// Let's stick to a simple interceptor that checks if we have a way to get the token, or we modify the QueryFunctionContext.
// Actually, the best way with React Query + Clerk is:
// const { getToken } = useAuth();
// const { data } = useQuery({ queryKey: [..], queryFn: async () => { const token = await getToken(); return api.get(..., { headers: { Authorization: `Bearer ${token}` } }) } })

// So `api` here will just be the base configuration.
