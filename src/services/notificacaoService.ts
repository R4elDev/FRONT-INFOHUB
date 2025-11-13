import api from '../lib/api'

// ============================================
// TIPOS TYPESCRIPT PARA NOTIFICAÇÕES
// ============================================

export interface Notificacao {
  id_notificacao: number
  id_usuario: number
  mensagem: string
  tipo: 'promocao' | 'compra' | 'social' | 'alerta' | 'carrinho'
  lida: boolean
  data_envio: string
  tempo_relativo: string
}

export interface NotificacaoResponse {
  status: boolean
  status_code: number
  message: string
  data: {
    notificacoes: Notificacao[]
    total_nao_lidas: number
    total_exibidas?: number
  }
}

export interface ContadorResponse {
  status: boolean
  status_code: number
  message: string
  data: {
    total_nao_lidas: number
  }
}

export interface ActionResponse {
  status: boolean
  status_code: number
  message: string
}

// ============================================
// DADOS MOCKADOS PARA FALLBACK
// ============================================

const notificacoesMockadas: Notificacao[] = [
  {
    id_notificacao: 1,
    id_usuario: 1,
    mensagem: "🔥 Seu produto favorito \"Arroz Integral\" está em promoção por R$ 8,99 no Supermercado Central!",
    tipo: 'promocao',
    lida: false,
    data_envio: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    tempo_relativo: "há 5 min"
  },
  {
    id_notificacao: 2,
    id_usuario: 1,
    mensagem: "✅ Compra #1234 confirmada! Valor: R$ 45,90. Acompanhe o status na área \"Meus Pedidos\".",
    tipo: 'compra',
    lida: false,
    data_envio: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    tempo_relativo: "há 1 hora"
  },
  {
    id_notificacao: 3,
    id_usuario: 1,
    mensagem: "❤️ Seu comentário sobre \"Café Premium\" recebeu 5 curtidas!",
    tipo: 'social',
    lida: false,
    data_envio: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tempo_relativo: "há 2 horas"
  },
  {
    id_notificacao: 4,
    id_usuario: 1,
    mensagem: "⚠️ Produtos no seu carrinho estão com estoque limitado. Finalize sua compra!",
    tipo: 'alerta',
    lida: true,
    data_envio: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    tempo_relativo: "há 3 horas"
  },
  {
    id_notificacao: 5,
    id_usuario: 1,
    mensagem: "🛍️ Você esqueceu itens no seu carrinho! Complete sua compra e ganhe frete grátis.",
    tipo: 'carrinho',
    lida: true,
    data_envio: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tempo_relativo: "há 1 dia"
  },
  {
    id_notificacao: 6,
    id_usuario: 1,
    mensagem: "🔥 Promoção relâmpago! Produtos de limpeza com até 40% OFF por tempo limitado.",
    tipo: 'promocao',
    lida: true,
    data_envio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tempo_relativo: "há 2 dias"
  }
]

// ============================================
// CLASSE DE SERVIÇO DE NOTIFICAÇÕES
// ============================================

export class NotificacaoService {
  private baseUrl = '/v1/infohub'

  /**
   * Simula delay de rede para dados mockados
   */
  private async simulateNetworkDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
  }

  /**
   * 1. Listar notificações do usuário
   * GET /v1/infohub/notificacoes/{id_usuario}?limit=20
   */
  async listarNotificacoes(userId: number, limit: number = 20): Promise<NotificacaoResponse> {
    try {
      const { data } = await api.get<NotificacaoResponse>(
        `${this.baseUrl}/notificacoes/${userId}?limit=${limit}`
      )
      return data
    } catch (error: any) {
      console.warn('API de notificações não disponível, usando dados mockados:', error.message)
      
      // Fallback para dados mockados
      await this.simulateNetworkDelay()
      
      const notificacoesFiltradas = notificacoesMockadas
        .filter(n => n.id_usuario === userId)
        .slice(0, limit)
      
      const naoLidas = notificacoesFiltradas.filter(n => !n.lida).length
      
      return {
        status: true,
        status_code: 200,
        message: "Notificações carregadas (modo offline)",
        data: {
          notificacoes: notificacoesFiltradas,
          total_nao_lidas: naoLidas,
          total_exibidas: notificacoesFiltradas.length
        }
      }
    }
  }

  /**
   * 2. Contar notificações não lidas
   * GET /v1/infohub/notificacoes/{id_usuario}/count
   */
  async contarNaoLidas(userId: number): Promise<number> {
    try {
      const { data } = await api.get<ContadorResponse>(
        `${this.baseUrl}/notificacoes/${userId}/count`
      )
      return data.data?.total_nao_lidas || 0
    } catch (error: any) {
      console.warn('API de notificações não disponível, usando dados mockados:', error.message)
      
      // Fallback para dados mockados
      const naoLidas = notificacoesMockadas
        .filter(n => n.id_usuario === userId && !n.lida)
        .length
      
      return naoLidas
    }
  }

  /**
   * 3. Listar apenas notificações não lidas
   * GET /v1/infohub/notificacoes/{id_usuario}/nao-lidas
   */
  async listarNaoLidas(userId: number): Promise<NotificacaoResponse> {
    try {
      const { data } = await api.get<NotificacaoResponse>(
        `${this.baseUrl}/notificacoes/${userId}/nao-lidas`
      )
      return data
    } catch (error: any) {
      console.warn('API de notificações não disponível, usando dados mockados:', error.message)
      
      // Fallback para dados mockados
      await this.simulateNetworkDelay()
      
      const notificacoesNaoLidas = notificacoesMockadas
        .filter(n => n.id_usuario === userId && !n.lida)
      
      return {
        status: true,
        status_code: 200,
        message: "Notificações não lidas carregadas (modo offline)",
        data: {
          notificacoes: notificacoesNaoLidas,
          total_nao_lidas: notificacoesNaoLidas.length
        }
      }
    }
  }

  /**
   * 4. Marcar notificação como lida (individual)
   * PUT /v1/infohub/notificacoes/{id_notificacao}/lida
   */
  async marcarComoLida(notificacaoId: number): Promise<ActionResponse> {
    try {
      const { data } = await api.put<ActionResponse>(
        `${this.baseUrl}/notificacoes/${notificacaoId}/lida`,
        {}
      )
      return data
    } catch (error: any) {
      console.warn('API de notificações não disponível, simulando ação:', error.message)
      
      // Fallback - simula marcar como lida nos dados mockados
      await this.simulateNetworkDelay()
      
      const notificacao = notificacoesMockadas.find(n => n.id_notificacao === notificacaoId)
      if (notificacao) {
        notificacao.lida = true
      }
      
      return {
        status: true,
        status_code: 200,
        message: "Notificação marcada como lida (modo offline)"
      }
    }
  }

  /**
   * 5. Marcar todas as notificações como lidas
   * PUT /v1/infohub/notificacoes/{id_usuario}/marcar-todas-lidas
   */
  async marcarTodasComoLidas(userId: number): Promise<ActionResponse> {
    try {
      const { data } = await api.put<ActionResponse>(
        `${this.baseUrl}/notificacoes/${userId}/marcar-todas-lidas`,
        {}
      )
      return data
    } catch (error: any) {
      console.warn('API de notificações não disponível, simulando ação:', error.message)
      
      // Fallback - marca todas como lidas nos dados mockados
      await this.simulateNetworkDelay()
      
      notificacoesMockadas.forEach(n => {
        if (n.id_usuario === userId) {
          n.lida = true
        }
      })
      
      return {
        status: true,
        status_code: 200,
        message: "Todas as notificações marcadas como lidas (modo offline)"
      }
    }
  }

  /**
   * 6. Deletar notificação específica
   * DELETE /v1/infohub/notificacoes/{id_notificacao}
   */
  async deletarNotificacao(notificacaoId: number): Promise<ActionResponse> {
    try {
      const { data } = await api.delete<ActionResponse>(
        `${this.baseUrl}/notificacoes/${notificacaoId}`
      )
      return data
    } catch (error: any) {
      console.warn('API de notificações não disponível, simulando ação:', error.message)
      
      // Fallback - remove dos dados mockados
      await this.simulateNetworkDelay()
      
      const index = notificacoesMockadas.findIndex(n => n.id_notificacao === notificacaoId)
      if (index > -1) {
        notificacoesMockadas.splice(index, 1)
      }
      
      return {
        status: true,
        status_code: 200,
        message: "Notificação deletada (modo offline)"
      }
    }
  }

  /**
   * 7. Filtrar notificações por tipo
   * GET /v1/infohub/notificacoes/{id_usuario}/tipo/{tipo}
   */
  async filtrarPorTipo(userId: number, tipo: string): Promise<NotificacaoResponse> {
    try {
      const { data } = await api.get<NotificacaoResponse>(
        `${this.baseUrl}/notificacoes/${userId}/tipo/${tipo}`
      )
      return data
    } catch (error: any) {
      console.warn('API de notificações não disponível, usando dados mockados:', error.message)
      
      // Fallback para dados mockados
      await this.simulateNetworkDelay()
      
      const notificacoesFiltradas = notificacoesMockadas
        .filter(n => n.id_usuario === userId && n.tipo === tipo)
      
      const naoLidas = notificacoesFiltradas.filter(n => !n.lida).length
      
      return {
        status: true,
        status_code: 200,
        message: `Notificações do tipo "${tipo}" carregadas (modo offline)`,
        data: {
          notificacoes: notificacoesFiltradas,
          total_nao_lidas: naoLidas
        }
      }
    }
  }
}

// ============================================
// SISTEMA DE POLLING PARA TEMPO REAL
// ============================================

export class NotificacaoRealTime {
  private userId: number
  private intervalId: NodeJS.Timeout | null = null
  private notificacaoService: NotificacaoService
  private onUpdate: (data: { naoLidas: number }) => void

  constructor(userId: number, onUpdate: (data: { naoLidas: number }) => void) {
    this.userId = userId
    this.onUpdate = onUpdate
    this.notificacaoService = new NotificacaoService()
  }

  /**
   * Iniciar polling automático
   */
  iniciar(intervaloSegundos: number = 30): void {
    this.parar() // Parar se já estiver rodando
    
    this.intervalId = setInterval(async () => {
      try {
        const naoLidas = await this.notificacaoService.contarNaoLidas(this.userId)
        this.onUpdate({ naoLidas })
      } catch (error) {
        console.error('Erro no polling de notificações:', error)
      }
    }, intervaloSegundos * 1000)
  }

  /**
   * Parar polling
   */
  parar(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Obter ícone por tipo de notificação
 */
export const getIconePorTipo = (tipo: string): string => {
  const icones = {
    promocao: '🔥',
    compra: '🛒',
    social: '❤️',
    alerta: '⚠️',
    carrinho: '🛍️'
  }
  return icones[tipo as keyof typeof icones] || '📢'
}

/**
 * Obter cor por tipo de notificação
 */
export const getCorPorTipo = (tipo: string): string => {
  const cores = {
    promocao: 'from-red-500 to-pink-500',
    compra: 'from-green-500 to-emerald-500',
    social: 'from-purple-500 to-pink-500',
    alerta: 'from-yellow-500 to-orange-500',
    carrinho: 'from-blue-500 to-indigo-500'
  }
  return cores[tipo as keyof typeof cores] || 'from-gray-500 to-gray-600'
}

/**
 * Obter ID do usuário logado
 */
export const getUsuarioLogado = (): number | null => {
  try {
    const userData = localStorage.getItem('user_data')
    if (!userData) return null
    
    const user = JSON.parse(userData)
    return user.id || null
  } catch (error) {
    console.error('Erro ao obter usuário logado:', error)
    return null
  }
}

// ============================================
// INSTÂNCIA SINGLETON DO SERVIÇO
// ============================================

export const notificacaoService = new NotificacaoService()
