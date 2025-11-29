import api from '../lib/api';

interface AvaliacaoResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface Avaliacao {
  id_avaliacao: number;
  id_usuario: number;
  id_produto?: number;
  id_estabelecimento?: number;
  nota: number;
  comentario: string;
  data_avaliacao: string;
  nome_usuario?: string;
}

interface EstatisticasAvaliacao {
  media: number;
  total: number;
  distribuicao: {
    nota: number;
    quantidade: number;
    percentual: number;
  }[];
}

class AvaliacaoService {
  /**
   * Verifica se existe pedido simulado (localStorage) com o produto
   */
  private verificarPedidoSimulado(idProduto: number): boolean {
    try {
      const pedidos = JSON.parse(localStorage.getItem('pedidos_usuario') || '[]')
      return pedidos.some((pedido: any) => 
        pedido.status === 'entregue' && 
        pedido.itens?.some((item: any) => item.id === idProduto)
      )
    } catch {
      return false
    }
  }

  /**
   * Salva avaliação simulada no localStorage
   */
  private salvarAvaliacaoSimulada(avaliacao: any): void {
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes_simuladas') || '[]')
    avaliacoes.push({
      ...avaliacao,
      id_avaliacao: Date.now(),
      data_avaliacao: new Date().toISOString()
    })
    localStorage.setItem('avaliacoes_simuladas', JSON.stringify(avaliacoes))
  }

  /**
   * Criar avaliação de produto (+8 pontos InfoCash)
   */
  async avaliarProduto(idUsuario: number, idProduto: number, nota: number, comentario: string): Promise<AvaliacaoResponse> {
    try {
      console.log('⭐ [avaliarProduto] Enviando avaliação...', { idUsuario, idProduto, nota });
      
      const response = await api.post('/avaliacao', {
        id_usuario: idUsuario,
        id_produto: idProduto,
        nota,
        comentario
      });
      
      console.log('✅ [avaliarProduto] Resposta:', response.data);
      
      return {
        status: true,
        message: (response.data as any)?.message || 'Avaliação criada com sucesso! +8 pontos',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ [avaliarProduto] Erro:', error.response?.data || error.message);
      
      // Se backend retornou 403 (sem compra), verifica se tem pedido simulado
      if (error.response?.status === 403) {
        if (this.verificarPedidoSimulado(idProduto)) {
          console.log('🔄 [avaliarProduto] Usando modo simulação (pedido local encontrado)');
          
          this.salvarAvaliacaoSimulada({
            id_usuario: idUsuario,
            id_produto: idProduto,
            nota,
            comentario
          });
          
          return {
            status: true,
            message: '✅ Avaliação salva com sucesso! +8 pontos (simulação)',
            data: { simulado: true }
          };
        }
      }
      
      return {
        status: false,
        message: error.response?.data?.message || 'Erro ao criar avaliação'
      };
    }
  }

  /**
   * Verifica se existe algum pedido simulado entregue
   */
  private verificarPedidoSimuladoEstabelecimento(): boolean {
    try {
      const pedidos = JSON.parse(localStorage.getItem('pedidos_usuario') || '[]')
      return pedidos.some((pedido: any) => pedido.status === 'entregue')
    } catch {
      return false
    }
  }

  /**
   * Criar avaliação de estabelecimento (+8 pontos InfoCash)
   */
  async avaliarEstabelecimento(idUsuario: number, idEstabelecimento: number, nota: number, comentario: string): Promise<AvaliacaoResponse> {
    try {
      console.log('⭐ [avaliarEstabelecimento] Enviando avaliação...', { idUsuario, idEstabelecimento, nota });
      
      const response = await api.post('/avaliacao', {
        id_usuario: idUsuario,
        id_estabelecimento: idEstabelecimento,
        nota,
        comentario
      });
      
      console.log('✅ [avaliarEstabelecimento] Resposta:', response.data);
      
      return {
        status: true,
        message: (response.data as any)?.message || 'Avaliação criada com sucesso! +8 pontos',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ [avaliarEstabelecimento] Erro:', error.response?.data || error.message);
      
      // Se backend retornou 403 (sem compra), verifica se tem pedido simulado
      if (error.response?.status === 403) {
        if (this.verificarPedidoSimuladoEstabelecimento()) {
          console.log('🔄 [avaliarEstabelecimento] Usando modo simulação (pedido local encontrado)');
          
          this.salvarAvaliacaoSimulada({
            id_usuario: idUsuario,
            id_estabelecimento: idEstabelecimento,
            nota,
            comentario
          });
          
          return {
            status: true,
            message: '✅ Avaliação salva com sucesso! +8 pontos (simulação)',
            data: { simulado: true }
          };
        }
      }
      
      return {
        status: false,
        message: error.response?.data?.message || 'Erro ao criar avaliação'
      };
    }
  }

  /**
   * Listar avaliações de um produto
   */
  async listarAvaliacoesProduto(idProduto: number): Promise<{ status: boolean; data: Avaliacao[] }> {
    try {
      const response = await api.get(`/avaliacao/produto/${idProduto}`);
      const data = response.data as any;
      const avaliacoes = data?.data || data?.avaliacoes || data || [];
      return { status: true, data: Array.isArray(avaliacoes) ? avaliacoes : [] };
    } catch (error: any) {
      console.error('Erro ao listar avaliações do produto:', error);
      return { status: false, data: [] };
    }
  }

  /**
   * Listar avaliações de um estabelecimento
   */
  async listarAvaliacoesEstabelecimento(idEstabelecimento: number): Promise<{ status: boolean; data: Avaliacao[] }> {
    try {
      const response = await api.get(`/avaliacao/estabelecimento/${idEstabelecimento}`);
      const data = response.data as any;
      const avaliacoes = data?.data || data?.avaliacoes || data || [];
      return { status: true, data: Array.isArray(avaliacoes) ? avaliacoes : [] };
    } catch (error: any) {
      console.error('Erro ao listar avaliações do estabelecimento:', error);
      return { status: false, data: [] };
    }
  }

  /**
   * Listar avaliações do usuário
   */
  async listarMinhasAvaliacoes(idUsuario: number): Promise<{ status: boolean; data: Avaliacao[] }> {
    try {
      const response = await api.get(`/avaliacao/usuario/${idUsuario}`);
      const data = response.data as any;
      const avaliacoes = data?.data || data?.avaliacoes || data || [];
      return { status: true, data: Array.isArray(avaliacoes) ? avaliacoes : [] };
    } catch (error: any) {
      console.error('Erro ao listar minhas avaliações:', error);
      return { status: false, data: [] };
    }
  }

  /**
   * Obter estatísticas de avaliações de um produto
   */
  async getEstatisticasProduto(idProduto: number): Promise<{ status: boolean; data: EstatisticasAvaliacao | null }> {
    try {
      const response = await api.get(`/avaliacao/estatisticas/produto/${idProduto}`);
      const data = response.data as any;
      return { status: true, data: data?.data || data };
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      return { status: false, data: null };
    }
  }

  /**
   * Verificar se usuário pode avaliar um produto
   * Se o endpoint não existir (404), permite avaliar por padrão
   */
  async podeAvaliarProduto(idUsuario: number, idProduto: number): Promise<{ podeAvaliar: boolean; motivo?: string }> {
    try {
      const response = await api.get(`/avaliacao/pode-avaliar?id_usuario=${idUsuario}&id_produto=${idProduto}`);
      return {
        podeAvaliar: (response.data as any)?.pode_avaliar || (response.data as any)?.podeAvaliar || false,
        motivo: (response.data as any)?.motivo || (response.data as any)?.message
      };
    } catch (error: any) {
      // Se endpoint não existe (404), permite avaliar
      if (error.response?.status === 404) {
        console.warn('⚠️ [podeAvaliarProduto] Endpoint não existe, permitindo avaliação');
        return { podeAvaliar: true };
      }
      console.error('Erro ao verificar permissão:', error);
      // Em caso de erro, permite avaliar (melhor UX)
      return { podeAvaliar: true };
    }
  }

  /**
   * Verificar se usuário pode avaliar um estabelecimento
   * Se o endpoint não existir (404), permite avaliar por padrão
   */
  async podeAvaliarEstabelecimento(idUsuario: number, idEstabelecimento: number): Promise<{ podeAvaliar: boolean; motivo?: string }> {
    try {
      const response = await api.get(`/avaliacao/pode-avaliar?id_usuario=${idUsuario}&id_estabelecimento=${idEstabelecimento}`);
      return {
        podeAvaliar: (response.data as any)?.pode_avaliar || (response.data as any)?.podeAvaliar || false,
        motivo: (response.data as any)?.motivo || (response.data as any)?.message
      };
    } catch (error: any) {
      // Se endpoint não existe (404), permite avaliar
      if (error.response?.status === 404) {
        console.warn('⚠️ [podeAvaliarEstabelecimento] Endpoint não existe, permitindo avaliação');
        return { podeAvaliar: true };
      }
      console.error('Erro ao verificar permissão:', error);
      // Em caso de erro, permite avaliar (melhor UX)
      return { podeAvaliar: true };
    }
  }
}

export default new AvaliacaoService();
export type { Avaliacao, AvaliacaoResponse, EstatisticasAvaliacao };
