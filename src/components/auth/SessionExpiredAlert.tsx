import { useEffect, useState } from 'react'
import { AlertTriangle, LogIn } from 'lucide-react'

interface SessionExpiredAlertProps {
  show: boolean
  onClose: () => void
}

function SessionExpiredAlert({ show, onClose }: SessionExpiredAlertProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!show) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/login'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-scaleIn">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Sessão Expirada
          </h2>
          
          <p className="text-gray-600 mb-6">
            Sua sessão expirou por motivos de segurança. 
            Você será redirecionado para fazer login novamente.
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Redirecionando em <span className="font-bold text-red-600">{countdown}</span> segundos...
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="flex-1 bg-[#F9A01B] hover:bg-[#FF8C00] text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn size={20} />
              Ir para Login
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionExpiredAlert
