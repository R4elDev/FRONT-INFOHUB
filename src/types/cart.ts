import type { Product } from './product'

export interface CartItem extends Product {
  quantidade: number
}

export interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
  desconto: number
  frete: number
}

export interface Order {
  id: number
  items: CartItem[]
  total: number
  status: 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado'
  dataPedido: string
  dataEntrega?: string
  endereco: string
  formaPagamento: string
}
