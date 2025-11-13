import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { 
  NotificacaoService, 
  NotificacaoRealTime, 
  getUsuarioLogado 
} from '../services/notificacaoService'
import type { Notificacao } from '../services/notificacaoService'

// ============================================
// TIPOS DO CONTEXTO
// ============================================

interface NotificacoesContextType {
  // Estado
  notificacoes: Notificacao[]
  naoLidas: number
  loading: boolean
  error: string | null
  
  // Ações
  carregarNotificacoes: (limit?: number) => Promise<void>
  carregarNaoLidas: () => Promise<void>
  marcarComoLida: (notificacaoId: number) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  deletarNotificacao: (notificacaoId: number) => Promise<void>
  filtrarPorTipo: (tipo: string) => Promise<void>
  limparError: () => void
  
  // Controle de polling
  iniciarPolling: (intervalo?: number) => void
  pararPolling: () => void
}

// ============================================
// CONTEXTO
// ============================================

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

interface NotificacoesProviderProps {
  children: ReactNode
}

export const NotificacoesProvider: React.FC<NotificacoesProviderProps> = ({ children }) => {
  // Estados
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Serviços
  const [notificacaoService] = useState(() => new NotificacaoService())
  const [pollingService, setPollingService] = useState<NotificacaoRealTime | null>(null)
  
  // Usuário atual (usa ID 1 como fallback para dados mockados)
  const userId = getUsuarioLogado() || 1

  // ============================================
  // FUNÇÕES DE AÇÃO
  // ============================================

  /**
   * Carregar notificações do usuário
   */
  const carregarNotificacoes = async (limit: number = 20): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await notificacaoService.listarNotificacoes(userId, limit)
      
      if (response.status && response.data) {
        setNotificacoes(response.data.notificacoes || [])
        setNaoLidas(response.data.total_nao_lidas || 0)
      } else {
        setError('Erro ao carregar notificações')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar notificações')
      console.error('Erro ao carregar notificações:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carregar apenas contador de não lidas
   */
  const carregarNaoLidas = async (): Promise<void> => {
    try {
      const count = await notificacaoService.contarNaoLidas(userId)
      setNaoLidas(count)
    } catch (err: any) {
      console.error('Erro ao carregar contador:', err)
    }
  }

  /**
   * Marcar notificação como lida
   */
  const marcarComoLida = async (notificacaoId: number): Promise<void> => {
    try {
      setError(null)
      
      await notificacaoService.marcarComoLida(notificacaoId)
      
      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id_notificacao === notificacaoId 
            ? { ...notif, lida: true }
            : notif
        )
      )
      
      // Atualizar contador
      setNaoLidas(prev => Math.max(0, prev - 1))
      
    } catch (err: any) {
      setError(err.message || 'Erro ao marcar como lida')
      console.error('Erro ao marcar como lida:', err)
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  const marcarTodasComoLidas = async (): Promise<void> => {
    try {
      setError(null)
      
      await notificacaoService.marcarTodasComoLidas(userId)
      
      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      )
      
      // Zerar contador
      setNaoLidas(0)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao marcar todas como lidas')
      console.error('Erro ao marcar todas como lidas:', err)
    }
  }

  /**
   * Deletar notificação
   */
  const deletarNotificacao = async (notificacaoId: number): Promise<void> => {
    try {
      setError(null)
      
      await notificacaoService.deletarNotificacao(notificacaoId)
      
      // Verificar se era não lida antes de remover
      const notificacao = notificacoes.find(n => n.id_notificacao === notificacaoId)
      const eraNaoLida = notificacao && !notificacao.lida
      
      // Remover do estado local
      setNotificacoes(prev => 
        prev.filter(notif => notif.id_notificacao !== notificacaoId)
      )
      
      // Atualizar contador se era não lida
      if (eraNaoLida) {
        setNaoLidas(prev => Math.max(0, prev - 1))
      }
      
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar notificação')
      console.error('Erro ao deletar notificação:', err)
    }
  }

  /**
   * Filtrar notificações por tipo
   */
  const filtrarPorTipo = async (tipo: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      
      if (tipo === 'todas') {
        response = await notificacaoService.listarNotificacoes(userId)
      } else if (tipo === 'nao-lidas') {
        response = await notificacaoService.listarNaoLidas(userId)
      } else {
        response = await notificacaoService.filtrarPorTipo(userId, tipo)
      }
      
      if (response.status && response.data) {
        setNotificacoes(response.data.notificacoes || [])
        setNaoLidas(response.data.total_nao_lidas || 0)
      }
      
    } catch (err: any) {
      setError(err.message || 'Erro ao filtrar notificações')
      console.error('Erro ao filtrar notificações:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Limpar erro
   */
  const limparError = (): void => {
    setError(null)
  }

  /**
   * Iniciar polling para atualizações em tempo real
   */
  const iniciarPolling = (intervalo: number = 30): void => {
    // Parar polling anterior se existir
    pararPolling()

    const polling = new NotificacaoRealTime(userId, ({ naoLidas: novoCount }) => {
      setNaoLidas(novoCount)
    })

    polling.iniciar(intervalo)
    setPollingService(polling)
  }

  /**
   * Parar polling
   */
  const pararPolling = (): void => {
    if (pollingService) {
      pollingService.parar()
      setPollingService(null)
    }
  }

  // ============================================
  // EFEITOS
  // ============================================

  /**
   * Carregar notificações iniciais
   */
  useEffect(() => {
    carregarNotificacoes()
    iniciarPolling(30) // Polling a cada 30 segundos

    // Cleanup ao desmontar
    return () => {
      pararPolling()
    }
  }, [userId])

  /**
   * Parar polling quando a página não está visível
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pararPolling()
      } else {
        iniciarPolling(30)
        carregarNaoLidas() // Atualizar contador ao voltar
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId])

  // ============================================
  // VALOR DO CONTEXTO
  // ============================================

  const contextValue: NotificacoesContextType = {
    // Estado
    notificacoes,
    naoLidas,
    loading,
    error,
    
    // Ações
    carregarNotificacoes,
    carregarNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    filtrarPorTipo,
    limparError,
    
    // Controle de polling
    iniciarPolling,
    pararPolling
  }

  return (
    <NotificacoesContext.Provider value={contextValue}>
      {children}
    </NotificacoesContext.Provider>
  )
}

// ============================================
// HOOK PERSONALIZADO
// ============================================

export const useNotificacoes = (): NotificacoesContextType => {
  const context = useContext(NotificacoesContext)
  
  if (context === undefined) {
    throw new Error('useNotificacoes deve ser usado dentro de um NotificacoesProvider')
  }
  
  return context
}
