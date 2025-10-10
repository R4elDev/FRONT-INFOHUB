import { useUser } from '../../contexts/UserContext'
import type { ReactNode } from 'react'

interface SmartRouteProps {
  userComponent: ReactNode
  adminComponent: ReactNode
  companyComponent?: ReactNode
}

export default function SmartRoute({ 
  userComponent, 
  adminComponent, 
  companyComponent 
}: SmartRouteProps) {
  const { isAdmin, isCompany } = useUser()

  // Show admin version for admin users
  if (isAdmin) {
    return <>{adminComponent}</>
  }

  // Show company version for company users (if provided, otherwise show admin)
  if (isCompany) {
    return <>{companyComponent || adminComponent}</>
  }

  // Show regular user version
  return <>{userComponent}</>
}
