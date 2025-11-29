import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Plus, ExternalLink } from 'lucide-react';
import comunidadeService from '../../services/comunidadeService';
import { useUser } from '../../contexts/UserContext';
import iconPerfilComentario from '../../assets/iconPerfilComentario.png';

interface Post {
  id_comentario: number;
  titulo: string;
  conteudo: string;
  nome_usuario: string;
  data_criacao: string;
  pontos_ganhos?: number;
  id_produto?: number;
  foto_url?: string;
}

export default function ComunidadeCompacta() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [curtidas, setCurtidas] = useState<{ [key: number]: { curtido: boolean; total: number } }>({});

  useEffect(() => {
    carregarPosts();
  }, []);

  const carregarPosts = async () => {
    try {
      setLoading(true);
      console.log('🔎 [ComunidadeCompacta] Carregando posts da API...');
      
      const response = await comunidadeService.listarPosts();
      
      if (response.status && Array.isArray(response.data)) {
        console.log('✅ [ComunidadeCompacta] Posts carregados:', response.data.length);
        // Pegar apenas os 3 primeiros posts
        const postsRecentes = response.data.slice(0, 3);
        setPosts(postsRecentes);
        
        // Carregar curtidas
        await carregarCurtidasPosts(postsRecentes);
      }
    } catch (error) {
      console.error('❌ [ComunidadeCompacta] Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarCurtidasPosts = async (posts: Post[]) => {
    const curtidasTemp: { [key: number]: { curtido: boolean; total: number } } = {};
    
    for (const post of posts) {
      try {
        const curtidaResponse = await comunidadeService.verificarCurtida(post.id_comentario);
        curtidasTemp[post.id_comentario] = {
          curtido: curtidaResponse.curtido || false,
          total: curtidaResponse.total_curtidas || 0
        };
      } catch (error) {
        curtidasTemp[post.id_comentario] = {
          curtido: false,
          total: 0
        };
      }
    }
    
    setCurtidas(curtidasTemp);
  };

  const handleCurtir = async (postId: number) => {
    if (!user?.id) {
      alert('Você precisa estar logado para curtir posts');
      return;
    }

    try {
      console.log('👍 [ComunidadeCompacta] Curtindo/Descurtindo post:', postId);
      const response = await comunidadeService.curtirPost(postId);
      
      if (response.status && response.data) {
        console.log('✅ [ComunidadeCompacta] Curtida atualizada:', response.data);
        setCurtidas(prev => ({
          ...prev,
          [postId]: {
            curtido: response.data.curtido || false,
            total: response.data.total_curtidas || 0
          }
        }));
      }
    } catch (error) {
      console.error('❌ [ComunidadeCompacta] Erro ao curtir post:', error);
    }
  };

  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    const agora = new Date();
    const diffMs = agora.getTime() - dataObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 7) return `${diffDias}d atrás`;
    
    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-gray-800">Comunidade InfoHub</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Carregando posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-gray-800">Comunidade InfoHub</h2>
        </div>
        <button
          onClick={() => navigate('/infocash/novo-comentario')}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Novo Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-2">Nenhum post ainda</p>
          <p className="text-sm text-gray-400 mb-4">Seja o primeiro a compartilhar!</p>
          <button
            onClick={() => navigate('/infocash/novo-comentario')}
            className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Criar Post
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {posts.map((post) => {
              const curtidaInfo = curtidas[post.id_comentario] || { curtido: false, total: 0 };
              
              return (
                <div
                  key={post.id_comentario}
                  className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all"
                >
                  {/* Header do Post */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={iconPerfilComentario}
                      alt="perfil"
                      className="w-10 h-10 rounded-full border-2 border-purple-200 shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {post.nome_usuario}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatarData(post.data_criacao)}
                      </p>
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">
                    {post.titulo}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
                    {post.conteudo}
                  </p>

                  {/* Ações */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleCurtir(post.id_comentario)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        curtidaInfo.curtido
                          ? 'text-red-500'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${curtidaInfo.curtido ? 'fill-current' : ''}`}
                      />
                      <span className="text-xs font-medium">{curtidaInfo.total}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">0</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão Ver Todos */}
          <button
            onClick={() => navigate('/infocash/comentarios')}
            className="w-full py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 rounded-xl font-semibold text-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Todos os Posts da Comunidade
          </button>
        </>
      )}
    </div>
  );
}
