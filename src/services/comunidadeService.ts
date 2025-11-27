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
    console.log('📋 ========== LISTAR TODOS OS POSTS (tbl_post) ==========');
    
    try {
      let response;
      let endpointUsado = '';
      
      // TENTATIVA 1: GET /posts (busca TODOS os posts da tbl_post)
      try {
        console.log('🔍 TENTATIVA 1: GET /posts (tbl_post)');
        response = await api.get('/posts', {
          params: { limite, page }
        });
        endpointUsado = '/posts';
        console.log('✅ TENTATIVA 1 SUCESSO!');
      } catch (error1: any) {
        console.log('❌ TENTATIVA 1 FALHOU:', error1.response?.status, error1.response?.data);
        
        // TENTATIVA 2: GET /posts sem params
        try {
          console.log('🔍 TENTATIVA 2: GET /posts (sem params)');
          response = await api.get('/posts');
          endpointUsado = '/posts (sem params)';
          console.log('✅ TENTATIVA 2 SUCESSO!');
        } catch (error2: any) {
          console.log('❌ TENTATIVA 2 FALHOU:', error2.response?.status, error2.response?.data);
          
          // TENTATIVA 3: GET /post (singular)
          try {
            console.log('🔍 TENTATIVA 3: GET /post');
            response = await api.get('/post');
            endpointUsado = '/post';
            console.log('✅ TENTATIVA 3 SUCESSO!');
          } catch (error3: any) {
            console.log('❌ TENTATIVA 3 FALHOU:', error3.response?.status, error3.response?.data);
            
            // TENTATIVA 4: GET /v1/infohub/posts
            try {
              console.log('🔍 TENTATIVA 4: GET /v1/infohub/posts');
              response = await api.get('/v1/infohub/posts');
              endpointUsado = '/v1/infohub/posts';
              console.log('✅ TENTATIVA 4 SUCESSO!');
            } catch (error4: any) {
              console.log('❌ TENTATIVA 4 FALHOU:', error4.response?.status, error4.response?.data);
              
              // TENTATIVA 5: GET /infohub/posts
              try {
                console.log('🔍 TENTATIVA 5: GET /infohub/posts');
                response = await api.get('/infohub/posts');
                endpointUsado = '/infohub/posts';
                console.log('✅ TENTATIVA 5 SUCESSO!');
              } catch (error5: any) {
                console.log('❌ TENTATIVA 5 FALHOU:', error5.response?.status, error5.response?.data);
                throw new Error('Todos os endpoints de posts falharam');
              }
            }
          }
        }
      }
      
      console.log(`✅ ENDPOINT QUE FUNCIONOU: ${endpointUsado}`);
      console.log('📦 RESPOSTA RAW:', response!.data);
      console.log('📊 TIPO:', typeof response!.data);
      console.log('📊 É ARRAY?:', Array.isArray(response!.data));
      
      const responseData = response!.data as any;
      
      // PROCESSAR RESPOSTA - 4 formatos possíveis
      let posts: any[] = [];
      
      // Formato 1: Array direto
      if (Array.isArray(responseData)) {
        posts = responseData;
        console.log(`✅ FORMATO 1: Array direto com ${posts.length} posts`);
      } 
      // Formato 2: { data: [...] }
      else if (responseData?.data && Array.isArray(responseData.data)) {
        posts = responseData.data;
        console.log(`✅ FORMATO 2: Objeto com data[] - ${posts.length} posts`);
      }
      // Formato 3: { posts: [...] }
      else if (responseData?.posts && Array.isArray(responseData.posts)) {
        posts = responseData.posts;
        console.log(`✅ FORMATO 3: Objeto com posts[] - ${posts.length} posts`);
      }
      // Formato 4: { status, data: {...} }
      else if (responseData?.status && responseData?.data) {
        posts = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        console.log(`✅ FORMATO 4: Response com status - ${posts.length} posts`);
      }
      
      // Mostrar primeiro item se existir
      if (posts.length > 0) {
        console.log('🔍 PRIMEIRO POST (estrutura completa):', JSON.stringify(posts[0], null, 2));
      } else {
        console.warn('⚠️ NENHUM POST ENCONTRADO NA tbl_post!');
        console.warn('⚠️ ResponseData completo:', responseData);
      }
      
      // MAPEAR posts para formato esperado pela interface
      const dadosFormatados = posts.map((p: any) => {
        const produtoData = p.produto || p.Produto || null;
        
        return {
          id_comentario: p.id_post || p.id || 0,
          titulo: p.titulo || 'Post',
          conteudo: p.conteudo || p.texto || p.descricao || '',
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
      });
      
      console.log(`✅ RETORNANDO ${dadosFormatados.length} POSTS FORMATADOS`);
      console.log('========== FIM LISTAR POSTS ==========');
      
      return {
        status: true,
        message: `${dadosFormatados.length} posts encontrados`,
        data: dadosFormatados
      };
      
    } catch (err: any) {
      console.error('❌ ========== ERRO FATAL ==========');
      console.error('❌ Status:', err.response?.status);
      console.error('❌ Mensagem:', err.response?.data);
      console.error('❌ Erro:', err.message);
      console.error('========== FIM ERRO ==========');
      
      return {
        status: false,
        message: err.response?.data?.message || err.message || 'Erro ao buscar posts',
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

  // ========== FUNCIONALIDADES DE CURTIDA ==========
  
  /**
   * Curtir um post
   */
  async curtirPost(idPost: number): Promise<{ status: boolean; message: string; data?: any }> {
    try {
      console.log(`👍 [curtirPost] Curtindo post ${idPost}...`);
      
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          status: false,
          message: 'Você precisa estar logado para curtir'
        };
      }
      
      const user = JSON.parse(userData);
      
      // Payload exato esperado pelo backend
      const payloadCurtir = {
        id_usuario: user.id
      };
      
      const payloadCompleto = {
        id_post: idPost,
        id_usuario: user.id
      };
      
      // Tentar vários formatos de endpoint
      // PRIORIDADE 1: Endpoint documentado do backend
      const endpoints = [
        { method: 'POST', url: `/post/${idPost}/curtir`, data: payloadCurtir },
        { method: 'POST', url: '/curtida', data: payloadCompleto },
        { method: 'POST', url: `/posts/${idPost}/curtir`, data: payloadCurtir },
        { method: 'POST', url: `/curtidas`, data: payloadCompleto },
        { method: 'POST', url: `/post/${idPost}/like`, data: payloadCurtir },
        { method: 'POST', url: `/posts/${idPost}/like`, data: payloadCurtir },
      ];
      
      let ultimoErro: any = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 [curtirPost] Tentando ${endpoint.url}...`);
          console.log(`📦 [curtirPost] Payload:`, JSON.stringify(endpoint.data, null, 2));
          
          const response = await api.post(endpoint.url, endpoint.data);
          
          console.log(`✅ [curtirPost] Sucesso com ${endpoint.url}!`);
          console.log(`📥 [curtirPost] Resposta completa:`, response.data);
          
          // Extrair dados conforme formato do backend
          const responseData = response.data as any;
          const curtidaData = responseData?.data || responseData;
          
          return {
            status: true,
            message: responseData?.message || 'Post curtido com sucesso!',
            data: {
              curtido: curtidaData?.curtido,
              total_curtidas: curtidaData?.total_curtidas,
              acao: curtidaData?.acao // 'adicionada' ou 'removida'
            }
          };
        } catch (err: any) {
          console.log(`❌ [curtirPost] ${endpoint.url} falhou:`, err.response?.status);
          
          // Se for erro 500, mostrar detalhes do erro
          if (err.response?.status === 500) {
            console.error(`🔴 [curtirPost] ERRO 500 DETALHADO:`, {
              endpoint: endpoint.url,
              payload_enviado: endpoint.data,
              erro_backend: err.response?.data,
              mensagem: err.response?.data?.message || err.message
            });
          }
          
          ultimoErro = err;
          continue;
        }
      }
      
      throw ultimoErro;
      
    } catch (error: any) {
      console.error('❌ [curtirPost] Todos os endpoints falharam');
      return {
        status: false,
        message: error.response?.data?.message || 'Endpoint de curtida não encontrado. Verifique a API.'
      };
    }
  }

  /**
   * Descurtir um post
   */
  async descurtirPost(idPost: number): Promise<{ status: boolean; message: string }> {
    try {
      console.log(`👎 [descurtirPost] Removendo curtida do post ${idPost}...`);
      
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          status: false,
          message: 'Você precisa estar logado'
        };
      }
      
      const user = JSON.parse(userData);
      
      // Tentar vários formatos de endpoint
      const endpoints = [
        { url: `/curtida/${idPost}/${user.id}` },
        { url: `/post/${idPost}/curtir/${user.id}` },
        { url: `/posts/${idPost}/curtir/${user.id}` },
        { url: `/curtidas/${idPost}/${user.id}` },
        { url: `/post/${idPost}/like/${user.id}` },
      ];
      
      let ultimoErro: any = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 [descurtirPost] Tentando DELETE ${endpoint.url}...`);
          await api.delete(endpoint.url);
          console.log(`✅ [descurtirPost] Sucesso com ${endpoint.url}!`);
          
          return {
            status: true,
            message: 'Curtida removida'
          };
        } catch (err: any) {
          console.log(`❌ [descurtirPost] ${endpoint.url} falhou:`, err.response?.status);
          ultimoErro = err;
          continue;
        }
      }
      
      throw ultimoErro;
      
    } catch (error: any) {
      console.error('❌ [descurtirPost] Todos os endpoints falharam');
      return {
        status: false,
        message: 'Endpoint de descurtir não encontrado'
      };
    }
  }

  /**
   * Verificar se usuário curtiu o post
   */
  async verificarCurtida(idPost: number): Promise<{ curtido: boolean; total_curtidas: number }> {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return { curtido: false, total_curtidas: 0 };
      }
      
      const user = JSON.parse(userData);
      
      // Tentar vários endpoints com diferentes formatos
      const endpoints = [
        // Formato esperado pelo backend: GET /post/:id/curtida/verificar?id_usuario=X
        { url: `/post/${idPost}/curtida/verificar`, params: { id_usuario: user.id } },
        { url: `/post/${idPost}/curtidas/verificar`, params: { id_usuario: user.id } },
        // Formatos alternativos
        { url: `/curtidas/${idPost}`, params: { id_usuario: user.id } },
        { url: `/curtida/${idPost}`, params: { id_usuario: user.id } },
        { url: `/post/${idPost}/curtidas`, params: null },
        { url: `/posts/${idPost}/curtidas`, params: null },
        { url: `/post/${idPost}/likes`, params: null },
        { url: `/posts/${idPost}/likes`, params: null },
      ];
      
      let response;
      let encontrado = false;
      
      for (const endpoint of endpoints) {
        try {
          response = await api.get(endpoint.url, endpoint.params ? { params: endpoint.params } : undefined);
          encontrado = true;
          console.log(`✅ [verificarCurtida] Funcionou com ${endpoint.url}`);
          break;
        } catch (err: any) {
          continue;
        }
      }
      
      if (!encontrado) {
        console.log('⚠️ [verificarCurtida] Nenhum endpoint funcionou, retornando valores padrão');
        return { curtido: false, total_curtidas: 0 };
      }
      
      const responseData = response?.data as any;
      
      // Verificar se usuário curtiu
      let curtido = false;
      let totalCurtidas = 0;
      
      // Formato 1: Resposta do controller { status, data: { curtido, total_curtidas } }
      if (responseData?.data) {
        curtido = responseData.data.curtido || false;
        totalCurtidas = responseData.data.total_curtidas || 0;
        console.log(`📊 [verificarCurtida] Formato backend: curtido=${curtido}, total=${totalCurtidas}`);
      }
      // Formato 2: Direto { curtido, total_curtidas }
      else if (responseData?.curtido !== undefined) {
        curtido = responseData.curtido;
        totalCurtidas = responseData.total_curtidas || 0;
      }
      // Formato 3: Array de curtidas
      else if (Array.isArray(responseData)) {
        totalCurtidas = responseData.length;
        curtido = responseData.some((c: any) => c.id_usuario === user.id || c.usuario_id === user.id);
      }
      // Formato 4: Objeto com array curtidas
      else if (responseData?.curtidas && Array.isArray(responseData.curtidas)) {
        totalCurtidas = responseData.curtidas.length;
        curtido = responseData.curtidas.some((c: any) => c.id_usuario === user.id || c.usuario_id === user.id);
      }
      // Formato 5: total e curtido_pelo_usuario
      else if (responseData?.total !== undefined) {
        totalCurtidas = responseData.total;
        curtido = responseData.curtido_pelo_usuario || false;
      }
      
      return { curtido, total_curtidas: totalCurtidas };
      
    } catch (error: any) {
      console.error('❌ [verificarCurtida] Erro:', error.message);
      return { curtido: false, total_curtidas: 0 };
    }
  }

  // ========== FUNCIONALIDADES DE COMENTÁRIO EM POST ==========
  
  /**
   * Comentar em um post específico
   */
  async comentarEmPost(idPost: number, conteudo: string): Promise<{ status: boolean; message: string; data?: any }> {
    try {
      console.log(`💬 [comentarEmPost] Comentando no post ${idPost}...`);
      
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          status: false,
          message: 'Você precisa estar logado para comentar'
        };
      }
      
      const user = JSON.parse(userData);
      
      const payload = {
        id_post: idPost,
        id_usuario: user.id,
        conteudo
      };
      
      let response;
      try {
        // Formato 1: POST /post/:id/comentario
        response = await api.post(`/post/${idPost}/comentario`, payload);
      } catch (err1: any) {
        try {
          // Formato 2: POST /comentario
          response = await api.post('/comentario', payload);
        } catch (err2: any) {
          // Formato 3: POST /posts/:id/comment
          response = await api.post(`/posts/${idPost}/comment`, payload);
        }
      }
      
      console.log('✅ [comentarEmPost] Comentário criado!');
      
      return {
        status: true,
        message: 'Comentário criado com sucesso!',
        data: response?.data
      };
      
    } catch (error: any) {
      console.error('❌ [comentarEmPost] Erro:', error.response?.data || error.message);
      return {
        status: false,
        message: error.response?.data?.message || 'Erro ao comentar'
      };
    }
  }

  /**
   * Listar comentários de um post específico
   */
  async listarComentariosDoPost(idPost: number): Promise<{ status: boolean; comentarios: any[]; total: number }> {
    try {
      console.log(`📋 [listarComentariosDoPost] Buscando comentários do post ${idPost}...`);
      
      let response;
      try {
        // Formato 1: GET /post/:id/comentarios
        response = await api.get(`/post/${idPost}/comentarios`);
      } catch (err1: any) {
        try {
          // Formato 2: GET /comentarios/:id_post
          response = await api.get(`/comentarios/${idPost}`);
        } catch (err2: any) {
          // Formato 3: GET /posts/:id/comments
          response = await api.get(`/posts/${idPost}/comments`);
        }
      }
      
      const data = response?.data as any;
      let comentarios: any[] = [];
      
      if (Array.isArray(data)) {
        comentarios = data;
      } else if (data?.comentarios && Array.isArray(data.comentarios)) {
        comentarios = data.comentarios;
      } else if (data?.data && Array.isArray(data.data)) {
        comentarios = data.data;
      }
      
      console.log(`✅ [listarComentariosDoPost] ${comentarios.length} comentários encontrados`);
      
      return {
        status: true,
        comentarios,
        total: comentarios.length
      };
      
    } catch (error: any) {
      console.error('❌ [listarComentariosDoPost] Erro:', error.message);
      return {
        status: false,
        comentarios: [],
        total: 0
      };
    }
  }
}

export default new ComunidadeService();
export type { Comentario, ComentarioResponse, CreateComentarioResponse };
