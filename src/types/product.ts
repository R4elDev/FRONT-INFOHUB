export interface Product {
  id: number
  nome: string
  preco: number
  precoAntigo?: number
  imagem: string
  desconto?: number
  loja?: string
  descricao?: string
  categoria?: string
  estoque?: number
}

export interface ProductCardProps extends Product {
  isFavorite?: boolean
  onFavoriteClick?: (id: number) => void
  onClick?: (id: number) => void
  onAddToCart?: (id: number) => void
}
