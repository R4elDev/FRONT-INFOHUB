import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SidebarLayout from "../../components/layouts/SidebarLayout";
import { MessageCircle, ThumbsUp, Edit3, ArrowLeft, Calendar, Award, Loader2, Package, ShoppingBag } from "lucide-react";
import iconPerfilComentario from "../../assets/iconPerfilComentario.png";
import comunidadeService from '../../services/comunidadeService'; // Usando serviço REAL
import { useUser } from '../../contexts/UserContext';

// Animação CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
if (!document.head.querySelector('style[data-infocash-animations]')) {
  style.setAttribute('data-infocash-animations', 'true')
  document.head.appendChild(style)
}

export default function InfoCashComentarios() {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarComentarios();
  }, []);

  const carregarComentarios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔎 [InfoCashComentarios] Carregando posts do backend...');
      
      const response = await comunidadeService.listarPosts();
      
      console.log('📥 [InfoCashComentarios] Resposta recebida:', response);
      console.log('📊 [InfoCashComentarios] Status:', response.status);
      console.log('📊 [InfoCashComentarios] Data:', response.data);
      
      if (response.status && Array.isArray(response.data)) {
        console.log('✅ [InfoCashComentarios] Total de posts:', response.data.length);
        setComments(response.data);
      } else if (response.status && response.data) {
        // Caso data não seja array mas exista
        const dataArray = Array.isArray(response.data) ? response.data : [response.data];
        setComments(dataArray);
      } else {
        console.log('⚠️ [InfoCashComentarios] Nenhum post encontrado');
        setComments([]);
      }
    } catch (err: any) {
      console.error('❌ [InfoCashComentarios] Erro ao carregar posts:', err);
      console.error('❌ [InfoCashComentarios] Detalhes:', err.response?.data);
      setError(`Erro ao carregar posts: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const agora = new Date();
    const diff = agora.getTime() - date.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    
    if (horas < 1) return 'Agora mesmo';
    if (horas === 1) return 'Há 1 hora';
    if (horas < 24) return `Há ${horas} horas`;
    if (horas < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="px-4 sm:px-6 md:px-12 py-6">
          {/* Header Moderno */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-orange-100 p-4 mb-6 sticky top-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link 
                  to="/infocash" 
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Comunidade</h1>
                  <p className="text-xs text-gray-500">Todos os comentários</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#F9A01B]" />
                <span className="text-sm font-bold text-gray-700">{comments.length}</span>
              </div>
            </div>
          </div>

          {/* Lista de Comentários Modernizada */}
          <div className="space-y-4 mb-24">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#F9A01B] mb-4" />
                <p className="text-gray-500">Carregando comentários...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={carregarComentarios}
                  className="px-4 py-2 bg-[#F9A01B] text-white rounded-lg font-semibold hover:bg-[#FF8C00] transition-colors">
                  Tentar Novamente
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">Nenhum comentário ainda. Seja o primeiro!</p>
                <Link to="/infocash/novo-comentario">
                  <button className="px-6 py-3 bg-[#F9A01B] text-white rounded-lg font-bold hover:bg-[#FF8C00] transition-colors">
                    Criar Primeiro Comentário
                  </button>
                </Link>
              </div>
            ) : (
              comments.map((c, index) => (
                <div 
                  key={c.id_comentario} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 hover:shadow-xl transition-all"
                  style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
                >
                  {/* Cabeçalho do Comentário */}
                  <div className="flex items-start gap-3 mb-3">
                    <img 
                      src={iconPerfilComentario} 
                      alt="perfil" 
                      className="w-12 h-12 rounded-full border-2 border-orange-200 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-base mb-0.5">{c.nome_usuario}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatarData(c.data_criacao)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-full">
                      <Award className="w-3.5 h-3.5 text-green-700" />
                      <span className="text-xs font-bold text-green-700">+{c.pontos_ganhos} HC</span>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-sm font-bold text-gray-800 mb-2">{c.titulo}</h3>
                  
                  {/* Produto Vinculado */}
                  {c.produto && (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                      {c.produto.imagem ? (
                        <img 
                          src={c.produto.imagem} 
                          alt={c.produto.nome}
                          className="w-12 h-12 rounded-lg object-cover border border-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-medium">Produto vinculado</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{c.produto.nome}</p>
                        {c.produto.preco && (
                          <p className="text-xs text-green-600 font-semibold">R$ {c.produto.preco}</p>
                        )}
                      </div>
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                  
                  {/* Corpo do Comentário */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {c.conteudo}
                    </p>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-[#F9A01B] transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Curtir</span>
                    </button>
                    {user?.id === c.id_usuario && (
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botão Flutuante Moderno */}
          <Link to="/infocash/novo-comentario">
            <button className="fixed right-6 bottom-6 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-2xl shadow-2xl px-6 py-4 hover:shadow-[0_10px_40px_rgba(249,160,27,0.4)] hover:scale-105 transition-all flex items-center gap-3 z-50 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base">Novo Comentário</span>
            </button>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  )
}
