import React from 'react'
import { Minus, Plus, Trash2, Tag } from 'lucide-react'
import { Button } from '../ui/button'
import type { CarrinhoItem } from '../../services/carrinhoService'
import { formatarPreco, itemEmPromocao, calcularDesconto } from '../../hooks/useCarrinhoAPI'

// ============================================
// COMPONENTE DE ITEM DO CARRINHO
// ============================================

interface ItemCarrinhoProps {
  item: CarrinhoItem
  onAtualizarQuantidade: (idProduto: number, novaQuantidade: number) => Promise<void>
  onRemover: (idProduto: number) => Promise<void>
  loading?: boolean
}

const ItemCarrinho: React.FC<ItemCarrinhoProps> = ({ 
  item, 
  onAtualizarQuantidade, 
  onRemover,
  loading = false 
}) => {
  const emPromocao = itemEmPromocao(item)
  const precoFinal = item.preco_promocional || item.preco_atual
  const totalItem = (precoFinal * item.quantidade).toFixed(2)
  const desconto = emPromocao ? calcularDesconto(item) : null

  const handleQuantidadeChange = async (novaQuantidade: number) => {
    if (novaQuantidade < 1) {
      await onRemover(item.id_produto)
    } else {
      await onAtualizarQuantidade(item.id_produto, novaQuantidade)
    }
  }

  const handleRemover = async () => {
    await onRemover(item.id_produto)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Informações do Produto */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-lg text-gray-800 leading-tight">
              {item.nome_produto}
            </h4>
            
            {/* Botão Remover */}
            <Button
              onClick={handleRemover}
              disabled={loading}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
              variant="ghost"
              size="sm"
              title="Remover item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Categoria */}
          {item.categoria && (
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600 font-medium">
                  {item.categoria}
                </span>
              </div>
            </div>
          )}

          {/* Descrição */}
          {item.descricao && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {item.descricao}
            </p>
          )}

          {/* Preços */}
          <div className="space-y-2">
            {emPromocao ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-green-600">
                    {formatarPreco(item.preco_promocional!)}
                  </span>
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{desconto?.percentual}% OFF
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">De:</span>
                  <span className="text-gray-500 line-through">
                    {formatarPreco(item.preco_atual)}
                  </span>
                </div>
                <div className="text-xs text-green-700 font-medium mt-1">
                  Economia: {formatarPreco(parseFloat(desconto?.valor || '0'))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-2xl font-bold text-gray-800">
                  {formatarPreco(item.preco_atual)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  Preço regular
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controles de Quantidade */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm text-gray-500 font-medium">
            Quantidade
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
            <Button
              onClick={() => handleQuantidadeChange(item.quantidade - 1)}
              disabled={loading || item.quantidade <= 1}
              className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-600"
              variant="ghost"
              size="sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <span className="w-12 text-center font-bold text-lg">
              {item.quantidade}
            </span>
            
            <Button
              onClick={() => handleQuantidadeChange(item.quantidade + 1)}
              disabled={loading}
              className="h-8 w-8 p-0 rounded-lg hover:bg-green-100 hover:text-green-600"
              variant="ghost"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Total do Item */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Total</div>
            <div className="text-xl font-bold text-[#F9A01B]">
              {formatarPreco(parseFloat(totalItem))}
            </div>
          </div>
        </div>
      </div>

      {/* Promoção válida até */}
      {emPromocao && item.promocao_valida_ate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            ⏰ Promoção válida até: {new Date(item.promocao_valida_ate).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemCarrinho
