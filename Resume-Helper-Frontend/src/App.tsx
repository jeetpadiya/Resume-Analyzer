import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './pages/Dashboard'
import PublicRoutes from './routes/PublicRoutes'
import ProtectedRoutes from './routes/ProtectedRoutes'

import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ResumeHistory from './pages/ResumeHistory'
import AiFeatures from './pages/AiFeatures'

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <BrowserRouter>
        <Routes>

          {/* 🔥 THIS IS WHAT YOU MISSED */}
          <Route 
            path="/" 
            element={
              token 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/login" replace />
            } 
          />

          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoutes />} >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<ResumeHistory />} />
            <Route path="/ai-features/:resumeId?" element={<AiFeatures />} />
          </Route>

          {/* optional fallback */}
          <Route path="*" element={<h1>No route found</h1>} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
