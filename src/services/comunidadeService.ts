import api from '../lib/api';

interface Produto {
  id_produto: number;
  nome: string;
  descricao?: string;
  preco?: string;
  imagem?: string;
}

interface Comentario {
  id_comentario: number;
  titulo: string;
  conteudo: string;
  pontos_ganhos: number;
  data_criacao: string;
  data_atualizacao: string;
  nome_usuario: string;
  id_usuario: number;
  id_produto?: number;
  produto?: Produto;
  foto_url?: string;
}

interface ComentarioResponse {
  status: boolean;
  message: string;
  data?: Comentario | Comentario[];
}

interface CreateComentarioResponse {
  status: boolean;
  message: string;
  data?: Comentario;
}

class ComunidadeService {
  private readonly INFOCASH_POST_ID = 1;
  
  async verificarPost(): Promise<boolean> {
    try {
      const response = await api.get(`/post/${this.INFOCASH_POST_ID}`);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async listarComentarios(limite = 20, page = 1): Promise<ComentarioResponse> {
    try {
      const response = await api.get(`/post/${this.INFOCASH_POST_ID}/comentarios`, {
        params: { page, limit: limite }
      });
      
      const responseData = response.data as any;
      
      if (responseData && Array.isArray(responseData)) {
        return {
          status: true,
          message: 'Comentários listados com sucesso',
          data: responseData.map((c: any) => ({
            id_comentario: c.id_comentario || c.id || 0,
            titulo: c.titulo || 'Comentário',
            conteudo: c.conteudo || c.texto || c.comentario || '',
            pontos_ganhos: c.pontos_ganhos || 10,
            data_criacao: c.data_criacao || c.createdAt || new Date().toISOString(),
            data_atualizacao: c.data_atualizacao || c.updatedAt || new Date().toISOString(),
            nome_usuario: c.nome_usuario || c.usuario?.nome || 'Usuário',
            id_usuario: c.id_usuario || c.usuario?.id || 1
          }))
        };
      }
      
      if (responseData && responseData.data) {
        return {
          status: true,
          message: responseData.message || 'Comentários listados',
          data: responseData.data
        };
      }
      
      return { 
        status: true, 
        message: 'Nenhum comentário encontrado',
        data: [] 
      };
    } catch (error: any) {
      console.error('Erro ao listar comentários:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao listar comentários', 
        data: [] 
      };
    }
  }

  async criarPost(dados: {
    titulo?: string;
    conteudo: string;
    id_produto?: number | null;
    imagem?: string;
  }): Promise<CreateComentarioResponse> {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          status: false,
          message: 'Você precisa estar logado para criar um post'
        };
      }
      
      const user = JSON.parse(userData);
      
      // POST REAL - SEM MOCK
      const payload: any = {
        id_usuario: user.id,
        conteudo: dados.conteudo
      };
      
      // Enviar titulo separadamente se existir
      if (dados.titulo) {
        payload.titulo = dados.titulo;
      }
      
      if (dados.id_produto) {
        payload.id_produto = parseInt(String(dados.id_produto));
      }
      
      if (dados.imagem) {
        payload.foto_url = dados.imagem;
      }
      
      console.log('📝 [criarPost] Criando post...');
      console.log('📦 [criarPost] Payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post('/posts', payload);
      
      console.log('✅ [criarPost] Resposta do backend:', response.data);
      
      const responseData = response.data as any;
      if (responseData && responseData.status) {
        const post = responseData.data || responseData;
        
        return {
          status: true,
          message: 'Post criado com sucesso! +10 HubCoins 🎉',
          data: {
            id_comentario: post.id_post || post.id || Date.now(),
            titulo: dados.titulo || 'Post',
            conteudo: dados.conteudo,
            pontos_ganhos: 10,
            data_criacao: post.data_criacao || post.createdAt || new Date().toISOString(),
            data_atualizacao: post.data_atualizacao || post.updatedAt || new Date().toISOString(),
            nome_usuario: user.nome || 'Usuário',
            id_usuario: user.id
          }
        };
      }
      
      return {
        status: true,
        message: 'Post criado com sucesso!',
        data: {
          id_comentario: Date.now(),
          titulo: dados.titulo || 'Post',
          conteudo: dados.conteudo,
          pontos_ganhos: 10,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
          nome_usuario: user.nome || 'Usuário',
          id_usuario: user.id
        }
      };
    } catch (error: any) {
      console.error('❌ [criarPost] Erro ao criar post:', error);
      console.error('📍 [criarPost] Status:', error.response?.status);
      console.error('📦 [criarPost] Resposta do backend:', error.response?.data);
      console.error('🔍 [criarPost] Mensagem de erro:', error.response?.data?.message);
      console.error('🔍 [criarPost] Detalhes completos:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        payload: error.config?.data
      });
      
      if (error.response?.status === 401) {
        return {
          status: false,
          message: 'Você precisa estar logado para criar um post'
        };
      }
      
      if (error.response?.status === 400) {
        const mensagemErro = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.response?.data?.msg ||
                           'Formato inválido. Verifique os dados enviados';
        
        console.error('⚠️ [criarPost] Erro de validação:', mensagemErro);
        
        return {
          status: false,
          message: mensagemErro
        };
      }
      
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao criar post' 
      };
    }
  }

  async listarPosts(limite = 50, page = 1): Promise<ComentarioResponse> {
    console.log('📋 [listarPosts] Buscando posts do backend...');
    
    try {
      // Tentar primeiro com paginação, depois sem
      console.log('🔍 [listarPosts] Chamando GET /posts...');
      
      let response;
      try {
        // Primeira tentativa: com paginação
        response = await api.get('/posts', {
          params: { page, limit: limite }
        });
      } catch (firstError: any) {
        console.log('⚠️ [listarPosts] Falhou com paginação, tentando sem params...');
        // Segunda tentativa: sem parâmetros
        response = await api.get('/posts');
      }
      
      console.log('✅ [listarPosts] Resposta:', response.data);
      
      const responseData = response.data as any;
      
      // Extrair posts de diferentes estruturas de resposta
      let posts: any[] = [];
      
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        posts = responseData.data;
      } else if (responseData && responseData.posts && Array.isArray(responseData.posts)) {
        posts = responseData.posts;
      } else if (Array.isArray(responseData)) {
        posts = responseData;
      }
      
      console.log(`📊 [listarPosts] Total de posts: ${posts.length}`);
      
      // Log para debug - ver estrutura do produto
      if (posts.length > 0) {
        console.log('🔍 [listarPosts] Estrutura do primeiro post:', JSON.stringify(posts[0], null, 2));
      }
      
      return {
        status: true,
        message: 'Posts listados com sucesso',
        data: posts.map((p: any) => {
          // Extrair dados do produto de diferentes estruturas possíveis
          const produtoData = p.produto || p.Produto || null;
          
          return {
            id_comentario: p.id_post || p.id || p.id_comentario,
            titulo: p.titulo || 'Post',
            conteudo: p.conteudo || p.texto || '',
            pontos_ganhos: p.pontos_ganhos || 10,
            data_criacao: p.data_criacao || p.createdAt || p.created_at || new Date().toISOString(),
            data_atualizacao: p.data_atualizacao || p.updatedAt || p.updated_at || new Date().toISOString(),
            nome_usuario: p.nome_usuario || p.usuario?.nome || p.Usuario?.nome || 'Usuário',
            id_usuario: p.id_usuario || p.usuario?.id || p.Usuario?.id || 1,
            id_produto: p.id_produto || produtoData?.id_produto || produtoData?.id || null,
            produto: produtoData ? {
              id_produto: produtoData.id_produto || produtoData.id,
              nome: produtoData.nome || produtoData.name || 'Produto',
              descricao: produtoData.descricao || produtoData.description || '',
              preco: produtoData.preco || produtoData.price || '',
              imagem: produtoData.imagem || produtoData.image || produtoData.foto_url || ''
            } : undefined,
            foto_url: p.foto_url || p.imagem || null
          };
        })
      };
      
    } catch (err: any) {
      console.error('❌ [listarPosts] Erro:', err.response?.status, err.response?.data || err.message);
      
      // Log detalhado do erro
      if (err.response) {
        console.error('📋 [listarPosts] Response headers:', err.response.headers);
        console.error('📋 [listarPosts] Response config:', err.response.config?.url);
      }
      
      return {
        status: false,
        message: err.response?.data?.message || 'Erro ao buscar posts',
        data: []
      };
    }
  }
  
  async criarComentario(dados: { titulo: string; conteudo: string }): Promise<ComentarioResponse> {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          status: false,
          message: 'Você precisa estar logado para comentar'
        };
      }
      
      const user = JSON.parse(userData);
      
      const payload = {
        id_post: this.INFOCASH_POST_ID,
        id_usuario: user.id,
        conteudo: `**${dados.titulo}**\n\n${dados.conteudo}`
      };
      
      console.log('📝 Enviando comentário para post ID:', this.INFOCASH_POST_ID);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post(`/post/${this.INFOCASH_POST_ID}/comentario`, payload);
      
      console.log('✅ Resposta do backend:', response.data);
      
      const responseData = response.data as any;
      if (responseData) {
        const comentario = responseData?.comentario || responseData?.data || responseData;
        
        return {
          status: true,
          message: 'Comentário criado com sucesso! +10 HubCoins 🎉',
          data: {
            id_comentario: comentario.id_comentario || comentario.id || Date.now(),
            titulo: dados.titulo,
            conteudo: dados.conteudo,
            pontos_ganhos: 10,
            data_criacao: comentario.data_criacao || comentario.createdAt || new Date().toISOString(),
            data_atualizacao: comentario.data_atualizacao || comentario.updatedAt || new Date().toISOString(),
            nome_usuario: user.nome || 'Usuário',
            id_usuario: user.id
          }
        };
      }
      
      return {
        status: true,
        message: 'Comentário criado com sucesso!',
        data: {
          id_comentario: Date.now(),
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          pontos_ganhos: 10,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
          nome_usuario: user.nome,
          id_usuario: user.id
        }
      };
    } catch (error: any) {
      console.error('❌ Erro ao criar comentário:', error);
      console.error('📍 Status:', error.response?.status);
      console.error('📦 Resposta do backend:', error.response?.data);
      
      if (error.response?.status === 401) {
        return {
          status: false,
          message: 'Você precisa estar logado para comentar'
        };
      }
      
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao criar comentário' 
      };
    }
  }

  async buscarComentario(id: number): Promise<ComentarioResponse> {
    try {
      const response = await api.get(`/comentario/${id}`);
      const responseData = response.data as any;
      
      if (responseData) {
        const comentario = Array.isArray(responseData) ? responseData[0] : 
                          responseData?.comentario || responseData?.data || {};
        
        const comentarioFormatado: Comentario = {
          id_comentario: comentario.id_comentario || comentario.id || 0,
          titulo: comentario.titulo || 'Comentário',
          conteudo: comentario.conteudo || comentario.texto || comentario.comentario || '',
          pontos_ganhos: comentario.pontos_ganhos || 0,
          data_criacao: comentario.data_criacao || comentario.createdAt || new Date().toISOString(),
          data_atualizacao: comentario.data_atualizacao || comentario.updatedAt || new Date().toISOString(),
          nome_usuario: comentario.nome_usuario || comentario.usuario?.nome || 'Usuário',
          id_usuario: comentario.id_usuario || comentario.usuario?.id || 1
        };
        
        return {
          status: true,
          message: 'Comentário encontrado',
          data: comentarioFormatado
        };
      }
      
      return { 
        status: true, 
        message: 'Comentários não encontrados',
        data: [] as Comentario[]
      };
    } catch (error: any) {
      console.error('Erro ao buscar comentário:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao buscar comentário' 
      };
    }
  }

  async listarComentariosUsuario(idUsuario: number, limite = 20): Promise<ComentarioResponse> {
    try {
      const response = await api.get(`/comentarios/usuario/${idUsuario}?limite=${limite}`);
      return response.data as ComentarioResponse;
    } catch (error: any) {
      console.error('Erro ao listar comentários do usuário:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao listar comentários do usuário', 
        data: [] 
      };
    }
  }

  async atualizarComentario(id: number, dados: { titulo?: string; conteudo: string }): Promise<ComentarioResponse> {
    try {
      const response = await api.put(`/comentario/${id}`, dados);
      
      const responseData = response.data as any;
      if (responseData) {
        return {
          status: true,
          message: 'Comentário atualizado com sucesso',
          data: responseData as Comentario
        };
      }
      
      return {
        status: true,
        message: 'Comentário atualizado'
      };
    } catch (error: any) {
      console.error('Erro ao atualizar comentário:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao atualizar comentário' 
      };
    }
  }

  async deletarComentario(id: number): Promise<ComentarioResponse> {
    try {
      const response = await api.delete(`/comentario/${id}`);
      
      if (response.data) {
        const responseData = response.data as any;
        return {
          status: true,
          message: responseData.message || 'Comentário deletado com sucesso'
        };
      }
      
      return {
        status: true,
        message: 'Comentário deletado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao deletar comentário:', error);
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao deletar comentário' 
      };
    }
  }
}

export default new ComunidadeService();
export type { Comentario, ComentarioResponse, CreateComentarioResponse };
