import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

type AuthStorage = {
    token?: string;
    // kalau kamu simpan field lain di localStorage auth, tambahin di sini
    [key: string]: unknown;
};

// const baseURL = `${import.meta.env.VITE_API_BE_URL}/api`;
const baseURL = `${import.meta.env.VITE_API_BE_URL}`;

const apiClient: AxiosInstance = axios.create({
    baseURL,
    // timeout: 1000,
    // withCredentials: true,
    // headers: {
    //     "Content-Type": "application/json",
    // },
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // const raw = localStorage.getItem("auth");
        // let token: string | undefined;

        // if (raw) {
        //     try {
        //         const parsed: AuthStorage = JSON.parse(raw);
        //         token = typeof parsed?.token === "string" ? parsed.token : undefined;
        //     } catch {
        //         // kalau isinya bukan JSON valid, abaikan
        //         token = undefined;
        //     }
        // }

        // if (token) {
        //     // Pastikan headers ada dan set Authorization
        //     config.headers.set("Authorization", `Bearer ${token}`);
        // }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.clear();

            // Hapus cookie (manual + js-cookie)
            document.cookie =
                "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            Cookies.remove("token");
            Cookies.remove("_csrf");
            Cookies.remove("user_id");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default apiClient;