import { useState, useEffect } from 'react'
import { obterEndereco, formatarEnderecoParaExibicao, temEnderecoCadastrado } from '../utils/endereco'
import type { EnderecoData } from '../utils/endereco'

interface EnderecoDisplayProps {
  showFull?: boolean // Se deve mostrar endereço completo ou apenas cidade
  className?: string
}

/**
 * Componente para exibir o endereço do usuário em qualquer página
 * 
 * Uso:
 * <EnderecoDisplay /> - Mostra apenas cidade
 * <EnderecoDisplay showFull={true} /> - Mostra endereço completo
 */
function EnderecoDisplay({ showFull = false, className = '' }: EnderecoDisplayProps) {
  const [endereco, setEndereco] = useState<EnderecoData | null>(null)
  const [hasEndereco, setHasEndereco] = useState(false)

  useEffect(() => {
    // Carrega o endereço quando o componente monta
    const enderecoSalvo = obterEndereco()
    setEndereco(enderecoSalvo)
    setHasEndereco(temEnderecoCadastrado())
  }, [])

  if (!hasEndereco || !endereco) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        📍 Endereço não cadastrado
      </div>
    )
  }

  return (
    <div className={`text-gray-700 ${className}`}>
      {showFull ? (
        <div>
          <span className="text-green-600">📍</span> {formatarEnderecoParaExibicao(endereco)}
        </div>
      ) : (
        <div>
          <span className="text-green-600">📍</span> {endereco.cidade} - {endereco.estado}
        </div>
      )}
    </div>
  )
}

export default EnderecoDisplay
