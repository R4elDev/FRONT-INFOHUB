import api from '../lib/api';

interface SaldoResponse {
  status: boolean;
  message: string;
  data?: {
    saldo: number;
    nivel: string;
    total_ganho: number;
    total_gasto: number;
  };
}

interface TransacaoHistorico {
  id_transacao: number;
  tipo_acao: string;
  pontos: number;
  descricao: string;
  data_transacao: string;
}

interface HistoricoResponse {
  status: boolean;
  message: string;
  data?: TransacaoHistorico[];
}

interface ResumoPorTipo {
  tipo_acao: string;
  total_transacoes: number;
  total_pontos: number;
}

interface ResumoPorTipoResponse {
  status: boolean;
  message: string;
  data?: ResumoPorTipo[];
}

interface PerfilCompleto {
  saldo: number;
  nivel: string;
  total_ganho: number;
  total_gasto: number;
  resumo_por_tipo: ResumoPorTipo[];
}

interface PerfilCompletoResponse {
  status: boolean;
  message: string;
  data?: PerfilCompleto;
}

interface UsuarioRanking {
  id_usuario: number;
  nome_usuario: string;
  saldo_total: number;
  posicao: number;
}

interface RankingResponse {
  status: boolean;
  message: string;
  data?: UsuarioRanking[];
}

class InfoCashService {
  async getSaldo(idUsuario: number): Promise<SaldoResponse> {
    try {
      const response = await api.get(`/infocash/saldo/${idUsuario}`);
      const responseData = response.data as any;
      
      console.log('💰 [getSaldo] Resposta bruta:', JSON.stringify(responseData, null, 2));
      
      // Extrair dados - pode vir em vários formatos
      const rawData = responseData?.data || responseData || {};
      
      // Extrair saldo - O BACKEND RETORNA: { saldo: { saldo_total: 2 } }
      let saldoValor = 0;
      
      // Caso 1: saldo é objeto com saldo_total (formato do backend atual)
      if (rawData.saldo && typeof rawData.saldo === 'object' && rawData.saldo.saldo_total !== undefined) {
        saldoValor = Number(rawData.saldo.saldo_total) || 0;
        console.log('💡 [getSaldo] Saldo extraído de saldo.saldo_total:', saldoValor);
      }
      // Caso 2: saldo é número direto
      else if (typeof rawData.saldo === 'number') {
        saldoValor = rawData.saldo;
      } 
      // Caso 3: saldo_total na raiz
      else if (typeof rawData.saldo_total === 'number') {
        saldoValor = rawData.saldo_total;
      } 
      // Caso 4: pontos
      else if (typeof rawData.pontos === 'number') {
        saldoValor = rawData.pontos;
      }
      // Caso 5: número direto
      else if (typeof rawData === 'number') {
        saldoValor = rawData;
      }
      // Caso 6: tentar converter
      else {
        saldoValor = Number(rawData.saldo) || Number(rawData.saldo_total) || 0;
      }
      
      const saldoNormalizado = {
        saldo: saldoValor,
        nivel: rawData.nivel || rawData.level || this.getNivelUsuario(saldoValor).nivel,
        total_ganho: Number(rawData.total_ganho) || Number(rawData.ganho) || 0,
        total_gasto: Number(rawData.total_gasto) || Number(rawData.gasto) || 0
      };
      
      console.log('✅ [getSaldo] Saldo normalizado:', saldoNormalizado);
      
      return { 
        status: true, 
        message: 'Saldo carregado',
        data: saldoNormalizado
      };
    } catch (error: any) {
      console.warn('⚠️ [getSaldo] Erro:', error.response?.status, error.message);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao buscar saldo',
        data: {
          saldo: 0,
          nivel: 'Bronze',
          total_ganho: 0,
          total_gasto: 0
        }
      };
    }
  }

  async getHistorico(idUsuario: number, limite = 50): Promise<HistoricoResponse> {
    try {
      const response = await api.get(`/infocash/historico/${idUsuario}?limite=${limite}`);
      const responseData = response.data as any;
      
      console.log('📜 [getHistorico] Resposta bruta:', responseData);
      
      // Normalizar dados do histórico
      const rawHistorico = responseData?.data || responseData?.historico || responseData?.transacoes || responseData || [];
      
      let historicoNormalizado: TransacaoHistorico[] = [];
      
      if (Array.isArray(rawHistorico)) {
        historicoNormalizado = rawHistorico.map((item: any) => ({
          id_transacao: item.id_transacao || item.id || 0,
          tipo_acao: item.tipo_acao || item.tipo || item.action || 'OUTROS',
          pontos: item.pontos || item.valor || item.amount || 0,
          descricao: item.descricao || item.description || item.motivo || '',
          data_transacao: item.data_transacao || item.data || item.createdAt || item.created_at || new Date().toISOString()
        }));
      }
      
      console.log('✅ [getHistorico] Histórico normalizado:', historicoNormalizado.length, 'itens');
      
      return { 
        status: true, 
        message: 'Histórico carregado',
        data: historicoNormalizado 
      };
    } catch (error: any) {
      console.warn('⚠️ [getHistorico] Erro:', error.response?.status, error.message);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao buscar histórico', 
        data: [] 
      };
    }
  }

  async concederPontos(dados: { id_usuario: number; pontos: number; descricao: string }): Promise<any> {
    try {
      const response = await api.post('/infocash/conceder', dados);
      return response.data as any;
    } catch (error: any) {
      console.error('Erro ao conceder pontos:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao conceder pontos' 
      };
    }
  }

  getNivelUsuario(pontos: number): { nivel: string; cor: string; proximoNivel: number } {
    if (pontos < 100) {
      return { nivel: 'Bronze', cor: '#CD7F32', proximoNivel: 100 };
    } else if (pontos < 500) {
      return { nivel: 'Prata', cor: '#C0C0C0', proximoNivel: 500 };
    } else if (pontos < 1000) {
      return { nivel: 'Ouro', cor: '#FFD700', proximoNivel: 1000 };
    } else if (pontos < 5000) {
      return { nivel: 'Platina', cor: '#E5E4E2', proximoNivel: 5000 };
    } else {
      return { nivel: 'Diamante', cor: '#B9F2FF', proximoNivel: 10000 };
    }
  }

  formatarPontos(pontos: number): string {
    return new Intl.NumberFormat('pt-BR').format(pontos);
  }

  async getResumoPorTipo(idUsuario: number): Promise<ResumoPorTipoResponse> {
    try {
      const response = await api.get(`/infocash/resumo/${idUsuario}`);
      return response.data as ResumoPorTipoResponse;
    } catch (error: any) {
      console.error('Erro ao buscar resumo por tipo:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao buscar resumo', 
        data: [] 
      };
    }
  }

  async getPerfilCompleto(idUsuario: number): Promise<PerfilCompletoResponse> {
    try {
      const response = await api.get(`/infocash/perfil/${idUsuario}`);
      const responseData = response.data as any;
      
      console.log('👤 [getPerfilCompleto] Resposta bruta:', JSON.stringify(responseData, null, 2));
      
      // Extrair dados - pode vir em vários formatos
      const rawData = responseData?.data || responseData || {};
      
      // Extrair saldo - O BACKEND RETORNA: { saldo: { saldo_total: 2 } }
      let saldoValor = 0;
      
      // Caso 1: saldo é objeto com saldo_total (formato do backend atual)
      if (rawData.saldo && typeof rawData.saldo === 'object' && rawData.saldo.saldo_total !== undefined) {
        saldoValor = Number(rawData.saldo.saldo_total) || 0;
        console.log('💡 [getPerfilCompleto] Saldo extraído de saldo.saldo_total:', saldoValor);
      }
      // Caso 2: saldo é número direto
      else if (typeof rawData.saldo === 'number') {
        saldoValor = rawData.saldo;
      } 
      // Caso 3: saldo_total na raiz
      else if (typeof rawData.saldo_total === 'number') {
        saldoValor = rawData.saldo_total;
      } 
      // Caso 4: pontos
      else if (typeof rawData.pontos === 'number') {
        saldoValor = rawData.pontos;
      }
      // Caso 5: tentar converter
      else {
        saldoValor = Number(rawData.saldo) || Number(rawData.saldo_total) || 0;
      }
      
      const perfilNormalizado = {
        saldo: saldoValor,
        nivel: rawData.nivel || rawData.level || this.getNivelUsuario(saldoValor).nivel,
        total_ganho: Number(rawData.total_ganho) || Number(rawData.ganho) || 0,
        total_gasto: Number(rawData.total_gasto) || Number(rawData.gasto) || 0,
        resumo_por_tipo: rawData.resumo_por_tipo || rawData.resumo || []
      };
      
      console.log('✅ [getPerfilCompleto] Perfil normalizado:', perfilNormalizado);
      
      return { 
        status: true, 
        message: 'Perfil carregado',
        data: perfilNormalizado
      };
    } catch (error: any) {
      console.warn('⚠️ [getPerfilCompleto] Erro:', error.response?.status, error.message);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao buscar perfil',
        data: {
          saldo: 0,
          nivel: 'Bronze',
          total_ganho: 0,
          total_gasto: 0,
          resumo_por_tipo: []
        }
      };
    }
  }

  async getRanking(limite = 10): Promise<RankingResponse> {
    try {
      const response = await api.get(`/infocash/ranking?limite=${limite}`);
      const responseData = response.data as any;
      
      console.log('📊 [getRanking] Resposta bruta:', responseData);
      
      // Normalizar dados do ranking
      let rankingData: UsuarioRanking[] = [];
      
      // Extrair array de ranking
      const rawRanking = responseData?.data || responseData?.ranking || responseData || [];
      
      if (Array.isArray(rawRanking)) {
        rankingData = rawRanking.map((item: any, index: number) => ({
          id_usuario: item.id_usuario || item.id || item.usuario_id || 0,
          nome_usuario: item.nome_usuario || item.nome || item.name || item.usuario?.nome || 'Usuário',
          saldo_total: item.saldo_total || item.saldo || item.pontos || item.total || 0,
          posicao: item.posicao || item.position || index + 1
        }));
      }
      
      console.log('✅ [getRanking] Ranking normalizado:', rankingData);
      
      return { 
        status: true, 
        message: 'Ranking carregado', 
        data: rankingData 
      };
    } catch (error: any) {
      console.warn('⚠️ [getRanking] Erro:', error.response?.status, error.message);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao buscar ranking', 
        data: [] 
      };
    }
  }
}

export default new InfoCashService();
export type { 
  SaldoResponse, 
  HistoricoResponse, 
  TransacaoHistorico,
  ResumoPorTipo,
  ResumoPorTipoResponse,
  PerfilCompleto,
  PerfilCompletoResponse,
  UsuarioRanking,
  RankingResponse
};
