import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface TokenExpiredAlertProps {
  show: boolean
  onClose: () => void
}

export function TokenExpiredAlert({ show, onClose }: TokenExpiredAlertProps) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!show) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirectToLogin()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [show])

  const handleRedirectToLogin = () => {
    // Limpa dados de autenticação
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('estabelecimentoId')
    localStorage.removeItem('estabelecimentoNome')
    localStorage.removeItem('estabelecimentoUserId')
    localStorage.removeItem('estabelecimentoEndereco')
    localStorage.removeItem('estabelecimentoEnderecoCompleto')
    
    onClose()
    navigate('/login')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sessão Expirada</h3>
            <p className="text-sm text-gray-600">Seu token de autenticação expirou</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">
          Para continuar usando o sistema, você precisa fazer login novamente.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            Redirecionando automaticamente em <strong>{countdown}</strong> segundos...
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRedirectToLogin}
            className="flex-1 bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Ir para Login
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenExpiredAlert
