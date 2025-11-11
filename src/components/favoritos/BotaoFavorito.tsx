import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useFavoritos } from '../../contexts/FavoritosContext'
import { getCurrentUser } from '../../services/apiServicesFixed'

interface BotaoFavoritoProps {
  idProduto: number
  idEstabelecimento: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  onToggle?: (isFavorito: boolean) => void
}

export default function BotaoFavorito({ 
  idProduto, 
  className = '', 
  size = 'md',
  showText = false,
  onToggle 
}: BotaoFavoritoProps) {
  const { isFavorite, toggleFavorite, loading } = useFavoritos()
  const [localLoading, setLocalLoading] = useState(false)

  // Tamanhos do ícone
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  // Classes CSS baseadas no tamanho
  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  }

  const isFavorito = isFavorite(idProduto)

  const handleToggleFavorito = async () => {
    try {
      setLocalLoading(true)
      
      const user = getCurrentUser()
      if (!user) {
        alert('Você precisa estar logado para usar favoritos')
        return
      }

      // Usa a função toggle (mais eficiente)
      const produto = {
        id: idProduto,
        nome: `Produto ${idProduto}`,
        preco: 0,
        categoria: 'Produto',
        descricao: 'Produto favoritado',
        imagem: ''
      }
      
      const result = await toggleFavorite(produto)
      
      if (result) {
        const { action, is_favorito } = result
        console.log(`✅ Produto ${action === 'added' ? 'adicionado aos' : 'removido dos'} favoritos`)
        if (onToggle) onToggle(is_favorito)
      }
    } catch (error: any) {
      console.error('Erro ao alterar favorito:', error)
      alert('Erro ao alterar favorito. Tente novamente.')
    } finally {
      setLocalLoading(false)
    }
  }


  return (
    <button
      onClick={handleToggleFavorito}
      disabled={loading || localLoading}
      className={`
        inline-flex items-center justify-center gap-2 
        rounded-lg border transition-all duration-200
        hover:scale-105 active:scale-95
        ${(loading || localLoading) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${isFavorito 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-red-500'
        }
        ${sizeClasses[size]} ${className}
      `}
      title={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart 
        size={iconSizes[size]} 
        fill={isFavorito ? 'currentColor' : 'none'}
        className={`transition-all duration-200 ${(loading || localLoading) ? 'animate-pulse' : ''}`}
      />
      {showText && (
        <span className="font-medium">
          {loading 
            ? (isFavorito ? 'Removendo...' : 'Adicionando...') 
            : (isFavorito ? 'Favorito' : 'Favoritar')
          }
        </span>
      )}
    </button>
  )
}
