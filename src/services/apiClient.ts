import axios from "axios";


const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    // We can't access the Redux store directly here easily without circular dependencies,
    // so we get it from localStorage (assuming we save it there) or handle it differently.
    // For now, let's grab it from localStorage if it exists.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const getData = async (url: string, params = {}) => {
  const response = await apiClient.get(url, { params });
  return response.data;
};

export const postData = async (url: string, data = {}) => {
  const response = await apiClient.post(url, data);
  return response.data;
};

export const putData = async (url: string, data = {}) => {
  const response = await apiClient.put(url, data);
  return response.data;
};

export default apiClient;
