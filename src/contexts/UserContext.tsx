import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login as loginAPI } from '../services/requests'
import type { loginRequest } from '../services/types'

export interface User {
  id: number
  nome: string
  email: string
  perfil: 'consumidor' | 'estabelecimento' | 'admin'
  cpf?: string
  cnpj?: string
  telefone?: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isCompany: boolean
  setUser: (user: User | null) => void
  login: (credentials: loginRequest) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const setUser = (userData: User | null) => {
    setUserState(userData)
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user_data')
    }
  }

  const login = async (credentials: loginRequest): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true)
      const response = await loginAPI(credentials)
      
      if (response.status && response.usuario) {
        console.log('📥 Dados do usuário recebidos da API:', response.usuario)
        
        const userData: User = {
          id: response.usuario.id,
          nome: response.usuario.nome,
          email: response.usuario.email,
          perfil: response.usuario.perfil as 'consumidor' | 'estabelecimento' | 'admin',
          cpf: response.usuario.cpf,
          cnpj: response.usuario.cnpj,
          telefone: response.usuario.telefone
        }
        
        console.log('✅ Dados salvos no contexto:', userData)
        setUser(userData)
        return { success: true }
      } else {
        return { success: false, message: 'Credenciais inválidas' }
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login. Tente novamente.' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  // Load user data from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUserState(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    }
  }, [])

  const isAuthenticated = !!user && !!localStorage.getItem('auth_token')
  const isAdmin = user?.perfil === 'admin'
  const isCompany = user?.perfil === 'estabelecimento' || user?.perfil === 'admin'

  const value: UserContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isCompany,
    setUser,
    login,
    logout,
    loading
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
