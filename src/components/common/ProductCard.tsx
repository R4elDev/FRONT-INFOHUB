import { Button } from "../ui/button"
import type { ProductCardProps } from "../../types/product"

export default function ProductCard({
  id,
  nome,
  preco,
  precoAntigo,
  imagem,
  desconto = 0,
  isFavorite = false,
  onFavoriteClick,
  onClick
}: ProductCardProps) {
  return (
    <article
      onClick={() => onClick?.(id)}
      className="rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer
                 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
    >
      {/* Oferta + Favorito */}
      <div className="flex items-start justify-between mb-2">
        <span 
          className="bg-gradient-to-r from-green-600 to-green-500 
                     text-white text-[10px] font-semibold px-2.5 py-1 
                     rounded-md shadow-sm"
        >
          OFERTA
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteClick?.(id)
          }}
          className={`transition-colors text-xl ${
            isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
          }`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Imagem do Produto */}
      <div 
        className="flex items-center justify-center py-4 bg-gray-50 
                   rounded-xl mb-3"
      >
        <img 
          src={imagem} 
          alt={nome} 
          className="w-24 h-24 object-contain drop-shadow-md" 
        />
      </div>

      {/* Preço antigo + desconto */}
      {precoAntigo && desconto > 0 && (
        <div className="flex items-center justify-between text-xs mb-2">
          <span 
            className="bg-gradient-to-r from-orange-100 to-orange-50 
                       text-orange-700 font-bold px-2 py-1 rounded-md"
          >
            -{desconto}%
          </span>
          <span className="text-gray-400 line-through">
            R$ {precoAntigo.toFixed(2)}
          </span>
        </div>
      )}

      {/* Preço atual + botão adicionar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-green-700 font-bold text-lg">
          R$ {preco.toFixed(2)}
        </p>
        <Button 
          onClick={(e) => {
            e.stopPropagation()
            // Adicionar ao carrinho
          }}
          className="h-8 w-8 rounded-full p-0 text-white font-bold 
                     bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] 
                     hover:from-[#FF8C00] hover:to-[#F9A01B] 
                     shadow-md hover:shadow-lg transition-all hover:scale-110"
        >
          +
        </Button>
      </div>

      {/* Descrição */}
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
        {nome}
      </p>
    </article>
  )
}
