import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoggedUserData } from '../services/requests'
import { ROUTES } from '../utils/constants'

/**
 * Hook para redirecionamento inteligente baseado no tipo de usuário
 * 
 * Funcionalidades:
 * - Detecta automaticamente o tipo de usuário logado
 * - Redireciona para a área apropriada (consumidor, empresa, admin)
 * - Protege rotas baseado no perfil do usuário
 */
export function useUserRedirect() {
  const navigate = useNavigate()

  const getUserType = () => {
    const userData = getLoggedUserData()
    return userData?.perfil || null
  }

  const redirectToUserArea = () => {
    const userType = getUserType()
    
    if (!userType) {
      // Usuário não logado - redireciona para login
      navigate(ROUTES.LOGIN)
      return
    }

    switch (userType) {
      case 'estabelecimento':
        navigate(ROUTES.DASHBOARD_EMPRESA)
        break
      case 'admin':
        navigate(ROUTES.ADMIN)
        break
      case 'consumidor':
      default:
        navigate(ROUTES.HOME_INICIAL)
        break
    }
  }

  const redirectToUserProfile = () => {
    const userType = getUserType()
    
    if (!userType) {
      navigate(ROUTES.LOGIN)
      return
    }

    switch (userType) {
      case 'estabelecimento':
        navigate(ROUTES.PERFIL_EMPRESA)
        break
      case 'admin':
        navigate(ROUTES.ADMIN)
        break
      case 'consumidor':
      default:
        navigate(ROUTES.PERFIL)
        break
    }
  }

  const isUserCompany = () => {
    const userType = getUserType()
    return userType === 'estabelecimento'
  }

  const isUserAdmin = () => {
    const userType = getUserType()
    return userType === 'admin'
  }

  const isUserConsumer = () => {
    const userType = getUserType()
    return userType === 'consumidor'
  }

  const requiresCompanyAccess = (callback?: () => void) => {
    const userType = getUserType()
    
    if (userType !== 'estabelecimento') {
      // Usuário não é empresa - redireciona para área apropriada
      redirectToUserArea()
      return false
    }
    
    if (callback) callback()
    return true
  }

  const requiresAdminAccess = (callback?: () => void) => {
    const userType = getUserType()
    
    if (userType !== 'admin') {
      // Usuário não é admin - redireciona para área apropriada
      redirectToUserArea()
      return false
    }
    
    if (callback) callback()
    return true
  }

  return {
    getUserType,
    redirectToUserArea,
    redirectToUserProfile,
    isUserCompany,
    isUserAdmin,
    isUserConsumer,
    requiresCompanyAccess,
    requiresAdminAccess
  }
}

/**
 * Hook para proteção de rotas baseado no tipo de usuário
 * 
 * @param requiredUserType - Tipo de usuário necessário para acessar a rota
 * @param redirectOnFail - Se deve redirecionar automaticamente em caso de falha
 */
export function useRouteProtection(
  requiredUserType: 'consumidor' | 'estabelecimento' | 'admin' | null = null,
  redirectOnFail: boolean = true
) {
  const navigate = useNavigate()
  const { getUserType, redirectToUserArea } = useUserRedirect()

  useEffect(() => {
    const userType = getUserType()

    // Se não há usuário logado e é necessário estar logado
    if (!userType && requiredUserType) {
      if (redirectOnFail) {
        navigate(ROUTES.LOGIN)
      }
      return
    }

    // Se há um tipo específico requerido e o usuário não corresponde
    if (requiredUserType && userType !== requiredUserType) {
      if (redirectOnFail) {
        redirectToUserArea()
      }
      return
    }
  }, [requiredUserType, redirectOnFail, navigate, getUserType, redirectToUserArea])

  const hasAccess = () => {
    const userType = getUserType()
    
    if (!userType && requiredUserType) {
      return false
    }
    
    if (requiredUserType && userType !== requiredUserType) {
      return false
    }
    
    return true
  }

  return {
    hasAccess: hasAccess(),
    userType: getUserType()
  }
}
