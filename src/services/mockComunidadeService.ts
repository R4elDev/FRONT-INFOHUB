// Service de Mock para Demonstração - Salva tudo no LocalStorage
import type { Comentario, ComentarioResponse } from './comunidadeService';

interface Post {
  id_post: number;
  titulo: string;
  conteudo: string;
  autor: string;
  id_usuario: number;
  data_criacao: string;
  curtidas: number;
  comentarios_count: number;
}

interface MockUser {
  id: number;
  nome: string;
  avatar?: string;
}

class MockComunidadeService {
  private readonly STORAGE_KEY_POSTS = 'mock_posts';
  private readonly STORAGE_KEY_COMENTARIOS = 'mock_comentarios';
  private readonly STORAGE_KEY_USERS = 'mock_users';

  constructor() {
    this.inicializarDadosMock();
  }

  private inicializarDadosMock() {
    // Verificar se já existe dados, se não, criar dados iniciais
    if (!localStorage.getItem(this.STORAGE_KEY_POSTS)) {
      this.criarPostsIniciais();
    }
    if (!localStorage.getItem(this.STORAGE_KEY_USERS)) {
      this.criarUsuariosMock();
    }
    if (!localStorage.getItem(this.STORAGE_KEY_COMENTARIOS)) {
      this.criarComentariosIniciais();
    }
  }

  private criarUsuariosMock() {
    const usuarios: MockUser[] = [
      { id: 1, nome: "Você" },
      { id: 2, nome: "Maria Silva" },
      { id: 3, nome: "João Santos" },
      { id: 4, nome: "Ana Costa" },
      { id: 5, nome: "Pedro Oliveira" },
      { id: 6, nome: "Carla Mendes" },
      { id: 7, nome: "Rafael Lima" },
      { id: 8, nome: "Juliana Ferreira" }
    ];
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(usuarios));
  }

  private criarPostsIniciais() {
    const posts: Post[] = [
      {
        id_post: 1,
        titulo: "🎉 Bem-vindos à Comunidade InfoCash!",
        conteudo: "Olá pessoal! Estou muito feliz em fazer parte desta comunidade incrível. O InfoCash está revolucionando a forma como economizamos! Já consegui acumular 500 HubCoins este mês apenas compartilhando dicas de economia. Vamos juntos nessa jornada! 💰",
        autor: "Maria Silva",
        id_usuario: 2,
        data_criacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        curtidas: 45,
        comentarios_count: 12
      },
      {
        id_post: 2,
        titulo: "💡 Dica: Promoção Imperdível no Supermercado Central!",
        conteudo: "Pessoal, acabei de descobrir uma promoção incrível! O Supermercado Central está com 30% de desconto em todos os produtos de limpeza esta semana. Já fui lá e economizei R$ 87,00! Aproveitem enquanto dura. Use o código LIMPA30 no app para ganhar +50 HubCoins extras!",
        autor: "João Santos",
        id_usuario: 3,
        data_criacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        curtidas: 89,
        comentarios_count: 23
      },
      {
        id_post: 3,
        titulo: "📊 Minha Meta: 1000 HubCoins até o Final do Mês",
        conteudo: "Estabeleci uma meta pessoal de alcançar 1000 HubCoins até o final do mês. Já estou com 750! Minha estratégia: cadastrar todas as minhas compras, compartilhar promoções diariamente e ajudar novos usuários. Quem mais está nesse desafio comigo? Vamos criar um grupo de apoio! 🚀",
        autor: "Ana Costa",
        id_usuario: 4,
        data_criacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        curtidas: 67,
        comentarios_count: 18
      },
      {
        id_post: 4,
        titulo: "🛒 Review: Vale a pena o Mercado Express?",
        conteudo: "Testei o Mercado Express por 1 mês e aqui está minha análise completa:\n\n✅ Prós:\n- Entrega em 15 minutos\n- Preços competitivos\n- Interface do app excelente\n- Integração perfeita com InfoCash (+20 coins por compra)\n\n❌ Contras:\n- Taxa de entrega um pouco alta\n- Produtos limitados\n\nNota final: 8/10 - Recomendo para compras emergenciais!",
        autor: "Pedro Oliveira",
        id_usuario: 5,
        data_criacao: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        curtidas: 124,
        comentarios_count: 34
      },
      {
        id_post: 5,
        titulo: "🎯 Alcancei o Nível Ouro! Próxima parada: Platina!",
        conteudo: "Depois de 3 meses usando o InfoCash, finalmente alcancei o nível Ouro! 🏆 Já economizei mais de R$ 500 em compras e ganhei R$ 150 em cashback. O segredo? Consistência e sempre verificar o app antes de qualquer compra. Obrigado a todos que compartilham dicas aqui! Vocês são demais!",
        autor: "Carla Mendes",
        id_usuario: 6,
        data_criacao: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        curtidas: 234,
        comentarios_count: 45
      },
      {
        id_post: 6,
        titulo: "📱 Tutorial: Como Maximizar seus Ganhos no InfoCash",
        conteudo: "Criei um guia completo para novatos:\n\n1️⃣ Cadastre TODAS as suas compras\n2️⃣ Ative notificações de promoções\n3️⃣ Participe dos desafios semanais\n4️⃣ Compartilhe pelo menos 1 promoção por dia\n5️⃣ Use o scanner de código de barras\n6️⃣ Convide amigos (50 coins por indicação!)\n\nSeguindo essas dicas, garanto que você ganha no mínimo 500 coins por mês! Alguma dúvida? Comenta aí! 👇",
        autor: "Rafael Lima",
        id_usuario: 7,
        data_criacao: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        curtidas: 178,
        comentarios_count: 56
      },
      {
        id_post: 7,
        titulo: "🏪 Novo Parceiro: Farmácia BemEstar com 15% de Cashback!",
        conteudo: "Novidade quentinha! A Farmácia BemEstar agora é parceira InfoCash! 💊\n\n🎁 Benefícios:\n• 15% de cashback em medicamentos genéricos\n• 10% em produtos de higiene\n• 5% em cosméticos\n• Entrega grátis acima de R$ 50\n\nJá testei e o cashback cai na hora! Minha compra de R$ 120 me rendeu 180 HubCoins!",
        autor: "Juliana Ferreira",
        id_usuario: 8,
        data_criacao: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        curtidas: 298,
        comentarios_count: 67
      }
    ];

    localStorage.setItem(this.STORAGE_KEY_POSTS, JSON.stringify(posts));
  }

  private criarComentariosIniciais() {
    const comentarios: Comentario[] = [
      // Comentários do Post 1
      {
        id_comentario: 101,
        titulo: "Bem-vinda!",
        conteudo: "Seja muito bem-vinda, Maria! Também estou adorando o InfoCash. Já economizei muito!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "João Santos",
        id_usuario: 3
      },
      {
        id_comentario: 102,
        titulo: "Dicas",
        conteudo: "500 coins em um mês é incrível! Pode compartilhar suas estratégias?",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Ana Costa",
        id_usuario: 4
      },

      // Comentários do Post 2
      {
        id_comentario: 201,
        titulo: "Valeu pela dica!",
        conteudo: "Acabei de voltar de lá! Economizei R$ 65! Muito obrigado pela dica, João!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Pedro Oliveira",
        id_usuario: 5
      },
      {
        id_comentario: 202,
        titulo: "Top!",
        conteudo: "Essa promoção salvou meu mês! Consegui fazer o estoque completo!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Carla Mendes",
        id_usuario: 6
      },

      // Comentários do Post 3
      {
        id_comentario: 301,
        titulo: "Tô dentro!",
        conteudo: "Vamos criar um grupo no WhatsApp para trocar dicas! Também quero chegar nos 1000!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Rafael Lima",
        id_usuario: 7
      },
      {
        id_comentario: 302,
        titulo: "Meta ambiciosa!",
        conteudo: "Adorei a meta! Vou estabelecer a minha também. Juntos somos mais fortes!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Juliana Ferreira",
        id_usuario: 8
      },

      // Comentários do Post 4
      {
        id_comentario: 401,
        titulo: "Excelente review!",
        conteudo: "Muito detalhado! Estava em dúvida se valia a pena, agora vou testar!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Maria Silva",
        id_usuario: 2
      },

      // Comentários do Post 5
      {
        id_comentario: 501,
        titulo: "Parabéns!",
        conteudo: "Que conquista incrível! Estou no Bronze ainda, mas vou seguir seu exemplo!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "João Santos",
        id_usuario: 3
      },
      {
        id_comentario: 502,
        titulo: "Inspirador!",
        conteudo: "Você é uma inspiração! R$ 500 de economia é muita coisa! Parabéns!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Ana Costa",
        id_usuario: 4
      },

      // Comentários do Post 6
      {
        id_comentario: 601,
        titulo: "Tutorial perfeito!",
        conteudo: "Salvei aqui! Vou seguir todas as dicas. Muito obrigado por compartilhar!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nome_usuario: "Pedro Oliveira",
        id_usuario: 5
      },

      // Comentários do Post 7
      {
        id_comentario: 701,
        titulo: "Ótima notícia!",
        conteudo: "Justamente a farmácia que eu mais compro! Que maravilha!",
        pontos_ganhos: 10,
        data_criacao: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        data_atualizacao: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        nome_usuario: "Carla Mendes",
        id_usuario: 6
      }
    ];

    localStorage.setItem(this.STORAGE_KEY_COMENTARIOS, JSON.stringify(comentarios));
  }

  // Listar todos os posts com informações completas
  async listarPosts(): Promise<any> {
    try {
      const posts = JSON.parse(localStorage.getItem(this.STORAGE_KEY_POSTS) || '[]');
      
      // Mapear posts para o formato de comentários do componente
      const postsFormatados = posts.map((post: Post) => ({
        id_comentario: post.id_post,
        titulo: post.titulo,
        conteudo: post.conteudo,
        pontos_ganhos: 0,
        data_criacao: post.data_criacao,
        data_atualizacao: post.data_criacao,
        nome_usuario: post.autor,
        id_usuario: post.id_usuario,
        // Adicionar informações extras
        is_post: true,
        curtidas: post.curtidas,
        comentarios_count: post.comentarios_count
      }));

      return {
        status: true,
        message: 'Posts carregados com sucesso',
        data: postsFormatados
      };
    } catch (error) {
      console.error('Erro ao listar posts mock:', error);
      return {
        status: false,
        message: 'Erro ao carregar posts',
        data: []
      };
    }
  }

  // Listar comentários de um post específico
  async listarComentarios(postId?: number): Promise<ComentarioResponse> {
    try {
      const comentarios = JSON.parse(localStorage.getItem(this.STORAGE_KEY_COMENTARIOS) || '[]');
      
      if (postId) {
        // Filtrar comentários de um post específico
        const comentariosDoPost = comentarios.filter((c: any) => 
          Math.floor(c.id_comentario / 100) === postId
        );
        return {
          status: true,
          message: 'Comentários carregados',
          data: comentariosDoPost
        };
      }
      
      // Retornar todos os comentários
      return {
        status: true,
        message: 'Todos os comentários carregados',
        data: comentarios
      };
    } catch (error) {
      console.error('Erro ao listar comentários mock:', error);
      return {
        status: false,
        message: 'Erro ao carregar comentários',
        data: []
      };
    }
  }

  // Criar novo comentário
  async criarComentario(dados: { titulo: string; conteudo: string; postId?: number }): Promise<ComentarioResponse> {
    try {
      const comentarios = JSON.parse(localStorage.getItem(this.STORAGE_KEY_COMENTARIOS) || '[]');
      const userData = localStorage.getItem('user_data');
      
      if (!userData) {
        // Usar usuário padrão
        const novoComentario: Comentario = {
          id_comentario: Date.now(),
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          pontos_ganhos: 10,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
          nome_usuario: "Você",
          id_usuario: 1
        };
        
        comentarios.push(novoComentario);
        localStorage.setItem(this.STORAGE_KEY_COMENTARIOS, JSON.stringify(comentarios));
        
        return {
          status: true,
          message: 'Comentário criado com sucesso! +10 HubCoins 🎉',
          data: novoComentario
        };
      }
      
      const user = JSON.parse(userData);
      
      const novoComentario: Comentario = {
        id_comentario: Date.now(),
        titulo: dados.titulo,
        conteudo: dados.conteudo,
        pontos_ganhos: 10,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString(),
        nome_usuario: user.nome || "Você",
        id_usuario: user.id || 1
      };
      
      comentarios.push(novoComentario);
      localStorage.setItem(this.STORAGE_KEY_COMENTARIOS, JSON.stringify(comentarios));
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        status: true,
        message: 'Comentário criado com sucesso! +10 HubCoins 🎉',
        data: novoComentario
      };
    } catch (error) {
      console.error('Erro ao criar comentário mock:', error);
      return {
        status: false,
        message: 'Erro ao criar comentário'
      };
    }
  }

  // Criar novo post
  async criarPost(dados: { titulo?: string; conteudo: string }): Promise<any> {
    try {
      const posts = JSON.parse(localStorage.getItem(this.STORAGE_KEY_POSTS) || '[]');
      const userData = localStorage.getItem('user_data');
      
      const user = userData ? JSON.parse(userData) : { id: 1, nome: "Você" };
      
      const novoPost: Post = {
        id_post: Date.now(),
        titulo: dados.titulo || "Nova publicação",
        conteudo: dados.conteudo,
        autor: user.nome || "Você",
        id_usuario: user.id || 1,
        data_criacao: new Date().toISOString(),
        curtidas: 0,
        comentarios_count: 0
      };
      
      // Adicionar no início da lista
      posts.unshift(novoPost);
      localStorage.setItem(this.STORAGE_KEY_POSTS, JSON.stringify(posts));
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        status: true,
        message: 'Post criado com sucesso! +20 HubCoins 🎉',
        data: novoPost
      };
    } catch (error) {
      console.error('Erro ao criar post mock:', error);
      return {
        status: false,
        message: 'Erro ao criar post'
      };
    }
  }

  // Limpar todos os dados mock
  limparDados() {
    localStorage.removeItem(this.STORAGE_KEY_POSTS);
    localStorage.removeItem(this.STORAGE_KEY_COMENTARIOS);
    localStorage.removeItem(this.STORAGE_KEY_USERS);
    this.inicializarDadosMock();
  }

  // Resetar para dados iniciais
  resetarDados() {
    this.limparDados();
  }
}

export default new MockComunidadeService();
