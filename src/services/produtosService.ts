import api from '../lib/api';

export interface Produto {
  id_produto: number;
  nome: string;
  descricao?: string;
  preco?: number;
  id_categoria?: number;
  imagem?: string;
}

export interface ProdutoResponse {
  status: boolean;
  status_code?: number;
  message: string;
  data?: Produto[];
}

class ProdutosService {
  async listarProdutos(): Promise<ProdutoResponse> {
    try {
      console.log(' [produtosService] Buscando produtos...');
      console.log(' [produtosService] URL:', '/produtos');
      
      const response = await api.get('/produtos');
      
      console.log(' [produtosService] Resposta recebida:', response.status);
      console.log(' [produtosService] Dados:', response.data);
      
      const responseData = response.data as any;
      
      if (responseData.status) {
        const produtos = Array.isArray(responseData.data) ? responseData.data : 
                        Array.isArray(responseData) ? responseData : [];
        
        console.log(' [produtosService] Total de produtos:', produtos.length);
        
        return {
          status: true,
          status_code: 200,
          message: 'Produtos listados com sucesso',
          data: produtos
        };
      }
      
      console.warn(' [produtosService] Status false na resposta');
      
      return {
        status: false,
        message: responseData.message || 'Nenhum produto encontrado',
        data: []
      };
    } catch (error: any) {
      console.error(' [produtosService] Erro ao listar produtos:', error);
      console.error(' [produtosService] Status:', error.response?.status);
      console.error(' [produtosService] Resposta:', error.response?.data);
      console.error(' [produtosService] URL tentada:', error.config?.url);
      
      return {
        status: false,
        status_code: error.response?.status,
        message: error.response?.data?.message || 'Erro ao carregar produtos',
        data: []
      };
    }
  }

  async buscarProdutoPorId(id: number): Promise<{ status: boolean; message: string; data?: Produto }> {
    try {
      const response = await api.get(`/produto/${id}`);
      
      const responseData = response.data as any;
      
      if (responseData.status && responseData.data) {
        return {
          status: true,
          message: 'Produto encontrado',
          data: responseData.data
        };
      }
      
      return {
        status: false,
        message: 'Produto não encontrado'
      };
    } catch (error: any) {
      console.error(' Erro ao buscar produto:', error);
      
      return {
        status: false,
        message: error.response?.data?.message || 'Erro ao buscar produto'
      };
    }
  }
}

const produtosService = new ProdutosService();
export default produtosService;
