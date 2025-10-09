// Utilitários para gerenciamento de endereços

export interface EnderecoData {
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  latitude: string
  longitude: string
  endereco_completo: string
  data_cadastro: string
}

/**
 * Salva o endereço do usuário no localStorage
 */
export function salvarEndereco(endereco: EnderecoData): void {
  try {
    localStorage.setItem('endereco_usuario', JSON.stringify(endereco))
    console.log('✅ Endereço salvo com sucesso')
  } catch (error) {
    console.error('❌ Erro ao salvar endereço:', error)
  }
}

/**
 * Recupera o endereço do usuário do localStorage
 */
export function obterEndereco(): EnderecoData | null {
  try {
    const enderecoSalvo = localStorage.getItem('endereco_usuario')
    if (enderecoSalvo) {
      return JSON.parse(enderecoSalvo)
    }
    return null
  } catch (error) {
    console.error('❌ Erro ao recuperar endereço:', error)
    return null
  }
}

/**
 * Verifica se o usuário tem endereço cadastrado
 */
export function temEnderecoCadastrado(): boolean {
  const endereco = obterEndereco()
  return endereco !== null && endereco.cep !== ''
}

/**
 * Remove o endereço salvo do localStorage
 */
export function removerEndereco(): void {
  try {
    localStorage.removeItem('endereco_usuario')
    console.log('🗑️ Endereço removido')
  } catch (error) {
    console.error('❌ Erro ao remover endereço:', error)
  }
}

/**
 * Formata o endereço para exibição
 */
export function formatarEnderecoParaExibicao(endereco: EnderecoData): string {
  return `${endereco.rua}, ${endereco.numero}${endereco.complemento ? `, ${endereco.complemento}` : ''}, ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP: ${formatarCep(endereco.cep)}`
}

/**
 * Formata CEP para exibição (12345-678)
 */
export function formatarCep(cep: string): string {
  const apenasNumeros = cep.replace(/\D/g, '')
  if (apenasNumeros.length !== 8) {
    return cep
  }
  return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
}

/**
 * Obtém apenas a cidade e estado do endereço
 */
export function obterCidadeEstado(): string | null {
  const endereco = obterEndereco()
  if (endereco) {
    return `${endereco.cidade} - ${endereco.estado}`
  }
  return null
}

/**
 * Obtém as coordenadas do endereço salvo
 */
export function obterCoordenadas(): { lat: string, lon: string } | null {
  const endereco = obterEndereco()
  if (endereco && endereco.latitude && endereco.longitude) {
    return {
      lat: endereco.latitude,
      lon: endereco.longitude
    }
  }
  return null
}

/**
 * Atualiza apenas as coordenadas do endereço existente
 */
export function atualizarCoordenadas(latitude: string, longitude: string): void {
  const endereco = obterEndereco()
  if (endereco) {
    endereco.latitude = latitude
    endereco.longitude = longitude
    salvarEndereco(endereco)
  }
}

/**
 * Verifica se o endereço está na mesma cidade
 */
export function estaNaMesmaCidade(cidade: string, estado: string): boolean {
  const endereco = obterEndereco()
  if (endereco) {
    return endereco.cidade.toLowerCase() === cidade.toLowerCase() && 
           endereco.estado.toLowerCase() === estado.toLowerCase()
  }
  return false
}
