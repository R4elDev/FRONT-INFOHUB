import { useUser } from '../../contexts/UserContext'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requireCompany?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  requireCompany = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isCompany } = useUser()

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check admin access
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/HomeInicial" replace />
  }

  // Check company access (admin or estabelecimento)
  if (requireCompany && !isCompany) {
    return <Navigate to="/HomeInicial" replace />
  }

  return <>{children}</>
}
