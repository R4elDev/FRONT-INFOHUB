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

class InfoCashService {
  async getSaldo(idUsuario: number): Promise<SaldoResponse> {
    try {
      const response = await api.get(`/infocash/saldo/${idUsuario}`);
      return response.data as SaldoResponse;
    } catch (error: any) {
      console.error('Erro ao buscar saldo:', error);
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
      return response.data as HistoricoResponse;
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
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
}

export default new InfoCashService();
export type { SaldoResponse, HistoricoResponse, TransacaoHistorico };
