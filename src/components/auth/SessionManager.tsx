import { useState, useEffect } from 'react'
import SessionExpiredAlert from './SessionExpiredAlert'

interface SessionManagerProps {
  children: React.ReactNode
}

function SessionManager({ children }: SessionManagerProps) {
  const [showSessionAlert, setShowSessionAlert] = useState(false)

  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionAlert(true)
    }

    // Escuta o evento customizado disparado pelo interceptor da API
    window.addEventListener('sessionExpired', handleSessionExpired)

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired)
    }
  }, [])

  return (
    <>
      {children}
      <SessionExpiredAlert 
        show={showSessionAlert} 
        onClose={() => setShowSessionAlert(false)} 
      />
    </>
  )
}

export default SessionManager
