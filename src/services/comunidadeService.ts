import api from '../lib/api';

interface Comentario {
  id_comentario: number;
  titulo: string;
  conteudo: string;
  pontos_ganhos: number;
  data_criacao: string;
  data_atualizacao: string;
  nome_usuario: string;
  id_usuario: number;
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
      
      // ⚠️ MOCK TEMPORÁRIO - BACKEND COM ERRO NO DAO/MODEL
      const USE_MOCK = true; // Mudar para false quando backend for corrigido
      
      if (USE_MOCK) {
        console.log('⚠️ [MOCK] Usando mock temporário - backend com erro no DAO');
        console.log('📝 [MOCK] Simulando criação de post...');
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Salvar no localStorage como fallback
        const posts = JSON.parse(localStorage.getItem('mock_posts') || '[]');
        const novoPost = {
          id_post: Date.now(),
          id_usuario: user.id,
          conteudo: dados.conteudo,
          id_produto: dados.id_produto || null,
          foto_url: dados.imagem || null,
          data_criacao: new Date().toISOString(),
          nome_usuario: user.nome || 'Usuário'
        };
        
        posts.unshift(novoPost);
        localStorage.setItem('mock_posts', JSON.stringify(posts));
        
        console.log('✅ [MOCK] Post salvo localmente:', novoPost);
        
        return {
          status: true,
          message: 'Post criado com sucesso! (Mock temporário)',
          data: {
            id_comentario: novoPost.id_post,
            titulo: dados.titulo || 'Post',
            conteudo: dados.conteudo,
            pontos_ganhos: 10,
            data_criacao: novoPost.data_criacao,
            data_atualizacao: novoPost.data_criacao,
            nome_usuario: novoPost.nome_usuario,
            id_usuario: novoPost.id_usuario
          }
        };
      }
      
      // Código original para quando backend for corrigido
      const payload: any = {
        id_usuario: user.id,
        conteudo: dados.conteudo
      };
      
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
    try {
      // Primeiro tentar buscar posts mockados se USE_MOCK estiver ativo
      const mockPosts = localStorage.getItem('mock_posts');
      if (mockPosts) {
        const posts = JSON.parse(mockPosts);
        console.log('📋 [MOCK] Listando posts locais:', posts.length);
        
        return {
          status: true,
          message: 'Posts listados com sucesso (mock)',
          data: posts.map((p: any) => ({
            id_comentario: p.id_post || p.id,
            titulo: 'Post',
            conteudo: p.conteudo || '',
            pontos_ganhos: 10,
            data_criacao: p.data_criacao || new Date().toISOString(),
            data_atualizacao: p.data_criacao || new Date().toISOString(),
            nome_usuario: p.nome_usuario || 'Usuário',
            id_usuario: p.id_usuario || 1
          }))
        };
      }
      
      const response = await api.get(`/posts`, {
        params: { page, limit: limite }
      });
      
      const responseData = response.data as any;
      if (responseData && responseData.status) {
        const posts = Array.isArray(responseData.data) ? responseData.data : 
                     Array.isArray(responseData) ? responseData : [];
        
        return {
          status: true,
          message: 'Posts listados com sucesso',
          data: posts.map((p: any) => ({
            id_comentario: p.id_post || p.id,
            titulo: p.titulo || 'Post',
            conteudo: p.conteudo || p.texto || '',
            pontos_ganhos: 10,
            data_criacao: p.data_criacao || p.createdAt || new Date().toISOString(),
            data_atualizacao: p.data_atualizacao || p.updatedAt || new Date().toISOString(),
            nome_usuario: p.nome_usuario || p.usuario?.nome || 'Usuário',
            id_usuario: p.id_usuario || p.usuario?.id || 1
          }))
        };
      }
      
      return await this.listarComentarios(limite, page);
    } catch (error: any) {
      console.error('Erro ao listar posts:', error);
      return await this.listarComentarios(limite, page);
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
