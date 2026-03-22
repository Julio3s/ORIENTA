import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Injecter le token JWT si présent
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh token automatique
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return client(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/admin-login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ---- Auth ----
export const login = (username, password) =>
  client.post('/token/', { username, password })

// ---- Séries ----
export const getSeries = () => client.get('/series/')
export const getSerie = (id) => client.get(`/series/${id}/`)
export const createSerie = (data) => client.post('/series/', data)
export const updateSerie = (id, data) => client.put(`/series/${id}/`, data)
export const deleteSerie = (id) => client.delete(`/series/${id}/`)

// ---- Matières ----
export const getMatieres = () => client.get('/matieres/')
export const createMatiere = (data) => client.post('/matieres/', data)
export const updateMatiere = (id, data) => client.put(`/matieres/${id}/`, data)
export const deleteMatiere = (id) => client.delete(`/matieres/${id}/`)

// ---- SerieMatiere ----
export const getSeriesMatieres = () => client.get('/series-matieres/')
export const createSerieMatiere = (data) => client.post('/series-matieres/', data)
export const updateSerieMatiere = (id, data) => client.put(`/series-matieres/${id}/`, data)
export const deleteSerieMatiere = (id) => client.delete(`/series-matieres/${id}/`)

// ---- Universités ----
export const getUniversites = () => client.get('/universites/')
export const createUniversite = (data) => client.post('/universites/', data)
export const updateUniversite = (id, data) => client.put(`/universites/${id}/`, data)
export const deleteUniversite = (id) => client.delete(`/universites/${id}/`)

// ---- Filières ----
export const getFilieres = () => client.get('/filieres/')
export const getFiliere = (id) => client.get(`/filieres/${id}/`)
export const createFiliere = (data) => client.post('/filieres/', data)
export const updateFiliere = (id, data) => client.put(`/filieres/${id}/`, data)
export const deleteFiliere = (id) => client.delete(`/filieres/${id}/`)

// ---- FiliereMatiere ----
export const getFiliereMatieres = () => client.get('/filieres-matieres/')
export const createFiliereMatiere = (data) => client.post('/filieres-matieres/', data)
export const updateFiliereMatiere = (id, data) => client.put(`/filieres-matieres/${id}/`, data)
export const deleteFiliereMatiere = (id) => client.delete(`/filieres-matieres/${id}/`)

// ---- Seuils (UniversiteFiliere) ----
export const getSeuils = () => client.get('/universites-filieres/')
export const createSeuil = (data) => client.post('/universites-filieres/', data)
export const updateSeuil = (id, data) => client.put(`/universites-filieres/${id}/`, data)
export const deleteSeuil = (id) => client.delete(`/universites-filieres/${id}/`)

// ---- Suggestion ----
export const getSuggestions = (serieId, notes) =>
  client.post('/suggerer/', { serie_id: serieId, notes })

export default client
