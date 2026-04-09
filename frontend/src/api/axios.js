import axios from 'axios'

const STORAGE_ACCESS = 'notenest_access'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_ACCESS)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default api
