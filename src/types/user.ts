export interface User {
  id: number
  nome: string
  email: string
  telefone?: string
  cpf?: string
  dataNascimento?: string
  avatar?: string
  endereco?: Address
}

export interface Address {
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface Company {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: Address
  logo?: string
  descricao?: string
}
