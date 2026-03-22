import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import EspaceEtudiant from './pages/EspaceEtudiant'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/admin-login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EspaceEtudiant />} />
        <Route path="/admin-login" element={<LoginPage />} />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
