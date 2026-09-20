import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
})

function getCookie(name) {
  const cookies = document.cookie.split(';')

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')

    if (key === name) {
      return decodeURIComponent(value)
    }
  }

  return null
}

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken')

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

export default api