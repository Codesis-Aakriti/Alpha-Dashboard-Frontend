import axios from 'axios'

// Create a configured Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://backend.alpha-futures.com/',
})

// Optional: Add request interceptor if we need to send the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('idToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
