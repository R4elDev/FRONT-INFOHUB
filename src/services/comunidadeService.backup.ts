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

class ComunidadeService {
  // ID do post padrão da comunidade InfoCash
  // IMPORTANTE: Este ID precisa corresponder a um post válido no backend
  // O post ID 1 é usado como post fixo para todos os comentários da comunidade
  // Caso precise mudar, altere aqui e garanta que o post existe no banco
  private readonly INFOCASH_POST_ID = 1;
  
  // Verificar se o post existe (útil para debugging)
  async verificarPost(): Promise<boolean> {
    try {
      const response = await api.get(`/post/${this.INFOCASH_POST_ID}`);
      console.log('✅ Post ID', this.INFOCASH_POST_ID, 'existe:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Post ID', this.INFOCASH_POST_ID, 'não encontrado!');
      console.error('⚠️ Crie o post no banco de dados com ID =', this.INFOCASH_POST_ID);
      return false;
    }
  }
  
  async listarComentarios(limite = 50, page = 1): Promise<ComentarioResponse> {
    try {
      // Usar endpoint real: GET /post/:id_post/comentarios/:page/:limit
      const response = await api.get(`/post/${this.INFOCASH_POST_ID}/comentarios/${page}/${limite}`);
      
      // Adaptar resposta do backend para o formato esperado
      const responseData = response.data as any;
      if (responseData) {
        const comentarios = Array.isArray(responseData) ? responseData : 
                           responseData?.comentarios || responseData?.data || [];
        
        return {
          status: true,
          message: 'Comentários listados com sucesso',
          data: comentarios.map((c: any) => ({
            id_comentario: c.id_comentario || c.id,
            titulo: c.titulo || 'Comentário',
            conteudo: c.conteudo || c.texto || c.comentario,
            pontos_ganhos: 10,
            data_criacao: c.data_criacao || c.createdAt || new Date().toISOString(),
            data_atualizacao: c.data_atualizacao || c.updatedAt || new Date().toISOString(),
            nome_usuario: c.nome_usuario || c.usuario?.nome || 'Usuário',
            id_usuario: c.id_usuario || c.usuario?.id || 1
          }))
        };
      }
      
      return { status: true, message: 'Sem comentários', data: [] };
    } catch (error: any) {
      console.error('Erro ao listar comentários:', error);
      
      // Tentar endpoint alternativo sem paginação
      try {
        const response = await api.get(`/post/${this.INFOCASH_POST_ID}/comentarios`);
        
        const responseData = response.data as any;
        if (responseData) {
          const comentarios = Array.isArray(responseData) ? responseData : 
                             responseData?.comentarios || responseData?.data || [];
          
          return {
            status: true,
            message: 'Comentários listados com sucesso',
            data: comentarios.slice(0, limite).map((c: any) => ({
              id_comentario: c.id_comentario || c.id,
              titulo: c.titulo || 'Comentário',
              conteudo: c.conteudo || c.texto || c.comentario,
              pontos_ganhos: 10,
              data_criacao: c.data_criacao || c.createdAt || new Date().toISOString(),
              data_atualizacao: c.data_atualizacao || c.updatedAt || new Date().toISOString(),
              nome_usuario: c.nome_usuario || c.usuario?.nome || 'Usuário',
              id_usuario: c.id_usuario || c.usuario?.id || 1
            }))
          };
        }
      } catch (err) {
        console.error('Erro no endpoint alternativo:', err);
      }
      
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao listar comentários', 
        data: [] 
      };
    }
  }

  async buscarComentarioPorId(id: number): Promise<ComentarioResponse> {
    try {
      // Usar endpoint real: GET /comentario/:id_comentario
      const response = await api.get(`/comentario/${id}`);
      
      const responseData = response.data as any;
      if (responseData) {
        const comentario = Array.isArray(responseData) ? responseData[0] : 
                          responseData?.comentario || responseData?.data || {};
        
        // Garantir que o objeto está formatado como Comentario
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
      
      // Se todos os fallbacks falharem, retornar resposta vazia
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

  async criarComentario(dados: { titulo: string; conteudo: string }): Promise<ComentarioResponse> {
    try {
      // Obter dados do usuário logado
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          status: false,
          message: 'Você precisa estar logado para comentar'
        };
      }
      
      const user = JSON.parse(userData);
      
      // Backend espera: id_post, id_usuario e conteudo
      const payload = {
        id_post: this.INFOCASH_POST_ID,
        id_usuario: user.id,
        conteudo: `**${dados.titulo}**\n\n${dados.conteudo}` // Título em negrito + conteúdo
      };
      
      console.log('📝 Enviando comentário para post ID:', this.INFOCASH_POST_ID);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post(`/post/${this.INFOCASH_POST_ID}/comentario`, payload);
      
      console.log('✅ Resposta do backend:', response.data);
      
      // Adaptar resposta do backend
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
      
      // Se erro for de autenticação, avisar
      if (error.response?.status === 401) {
        return {
          status: false,
          message: 'Você precisa estar logado para comentar'
        };
      }
      
      // Se erro for 400, pode ser validação
      if (error.response?.status === 400) {
        const mensagemErro = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.response?.data?.msg ||
                           'Formato inválido. Verifique os dados enviados';
        
        console.error('⚠️ Erro de validação:', mensagemErro);
        
        // Mostrar estrutura esperada para o usuário
        console.log('💡 Dica: Verifique se:');
        console.log('1. O post ID', this.INFOCASH_POST_ID, 'existe no banco');
        console.log('2. Você está autenticado (tem token JWT válido)');
        console.log('3. O backend aceita o campo "comentario"');
        console.log('');
        console.log('📝 Para criar o post no banco:');
        console.log("INSERT INTO tbl_posts (id_post, titulo, conteudo, id_usuario) VALUES (1, 'Comunidade InfoCash', 'Post da comunidade', 1);");
        
        return {
          status: false,
          message: mensagemErro
        };
      }
      
      return { 
        status: false, 
        message: error.response?.data?.message || 'Erro ao criar comentário' 
      };
    }
  }

  async listarComentariosUsuario(idUsuario: number, limite = 20): Promise<ComentarioResponse> {
    try {
      // Usar endpoint real: GET /comentarios/usuario/:id_usuario?limite=20
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
      // Usar endpoint real: PUT /comentario/:id_comentario
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
      // Usar endpoint real: DELETE /comentario/:id_comentario
      const response = await api.delete(`/comentario/${id}`);
      
      // Verificar se a resposta tem dados
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
      
      // Se erro for de autenticação, avisar
      if (error.response?.status === 401) {
        return {
          status: false,
          message: 'Você precisa estar logado para criar um post'
        };
      }
      
      // Se erro for 400, pode ser validação
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

  /**
   * Lista posts da rede social (feed geral)
   * GET /posts (proxy converte para /v1/infohub/posts)
   */
  async listarPosts(limite = 50, page = 1): Promise<ComentarioResponse> {
    try {
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
      
      // Fallback para comentários se posts não funcionar
      return await this.listarComentarios(limite, page);
    } catch (error: any) {
      console.error('Erro ao listar posts:', error);
      
      // Fallback para comentários
      return await this.listarComentarios(limite, page);
    }
  }
}

export default new ComunidadeService();
export type { Comentario, ComentarioResponse };
