import React, { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { CarrinhoAPI } from '../../services/carrinhoService'

// ============================================
// COMPONENTE DE BADGE DO CARRINHO
// ============================================

interface BadgeCarrinhoProps {
  className?: string
  showZero?: boolean
  onClick?: () => void
}

const BadgeCarrinho: React.FC<BadgeCarrinhoProps> = ({ 
  className = '',
  showZero = false,
  onClick
}) => {
  const { user, isAuthenticated } = useUser()
  const [contador, setContador] = useState(0)
  const [loading, setLoading] = useState(false)

  // Atualizar contador
  const atualizarContador = async () => {
    if (!isAuthenticated || !user?.id) {
      setContador(0)
      return
    }

    try {
      setLoading(true)
      const dados = await CarrinhoAPI.contarItens(user.id)
      setContador(dados.total_produtos)
    } catch (error) {
      console.error('Erro ao contar itens do carrinho:', error)
      setContador(0)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar quando usuário mudar
  useEffect(() => {
    atualizarContador()
  }, [isAuthenticated, user?.id])

  // Atualizar periodicamente (a cada 30 segundos)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const interval = setInterval(atualizarContador, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user?.id])

  const shouldShowBadge = showZero || contador > 0

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      title={`${contador} ${contador === 1 ? 'item' : 'itens'} no carrinho`}
    >
      <ShoppingCart className="w-6 h-6" />
      
      {shouldShowBadge && (
        <span 
          className={`
            absolute -top-2 -right-2 
            min-w-[20px] h-5 
            bg-red-500 text-white 
            text-xs font-bold 
            rounded-full 
            flex items-center justify-center
            px-1
            ${loading ? 'animate-pulse' : ''}
            ${contador > 99 ? 'text-[10px]' : ''}
          `}
        >
          {loading ? '...' : contador > 99 ? '99+' : contador}
        </span>
      )}
    </div>
  )
}

export default BadgeCarrinho
