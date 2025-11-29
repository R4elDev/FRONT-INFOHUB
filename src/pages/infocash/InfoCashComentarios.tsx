import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SidebarLayout from "../../components/layouts/SidebarLayout";
import { MessageCircle, ThumbsUp, MessageSquare, ArrowLeft, Calendar, Award, Loader2, Package, ShoppingBag, Send, CheckCircle, XCircle, Sparkles } from "lucide-react";
import iconPerfilComentario from "../../assets/iconPerfilComentario.png";
import comunidadeService from '../../services/comunidadeService';

// Animações CSS profissionais
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes checkmark {
    0% { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }
  
  @keyframes circleGrow {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
  
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
  }
  
  .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
  .animate-circleGrow { animation: circleGrow 0.5s ease-out forwards; }
  .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
  .animate-slideInRight { animation: slideInRight 0.4s ease-out forwards; }
  .animate-slideOutRight { animation: slideOutRight 0.3s ease-out forwards; }
  
  .checkmark-path {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: checkmark 0.6s ease-out 0.3s forwards;
  }
`
if (!document.head.querySelector('style[data-infocash-animations-v2]')) {
  style.setAttribute('data-infocash-animations-v2', 'true')
  document.head.appendChild(style)
}

export default function InfoCashComentarios() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para curtidas
  const [curtidas, setCurtidas] = useState<{ [key: number]: { curtido: boolean; total: number } }>({});
  
  // Estados para modal de comentário
  const [modalComentarioAberto, setModalComentarioAberto] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState<any | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  
  // Estados para visualização de comentários
  const [comentariosVisiveis, setComentariosVisiveis] = useState<{ [key: number]: boolean }>({});
  const [comentariosPorPost, setComentariosPorPost] = useState<{ [key: number]: any[] }>({});
  const [carregandoComentarios, setCarregandoComentarios] = useState<{ [key: number]: boolean }>({});
  
  // Estados para notificações toast
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });
  
  // Estado para animação de sucesso no modal
  const [mostrarSucessoModal, setMostrarSucessoModal] = useState(false);

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
        
        // Carregar curtidas de cada post
        carregarCurtidasPosts(response.data);
      } else if (response.status && response.data) {
        // Caso data não seja array mas exista
        const dataArray = Array.isArray(response.data) ? response.data : [response.data];
        setComments(dataArray);
        carregarCurtidasPosts(dataArray);
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

  const carregarCurtidasPosts = async (posts: any[]) => {
    const curtidasTemp: { [key: number]: { curtido: boolean; total: number } } = {};
    
    for (const post of posts) {
      const resultado = await comunidadeService.verificarCurtida(post.id_comentario);
      curtidasTemp[post.id_comentario] = {
        curtido: resultado.curtido,
        total: resultado.total_curtidas
      };
    }
    
    setCurtidas(curtidasTemp);
  };

  // Função para mostrar toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleCurtir = async (idPost: number) => {
    const resultado = await comunidadeService.curtirPost(idPost);
    
    if (resultado.status && resultado.data) {
      console.log(`✅ Curtida atualizada:`, resultado.data);
      
      setCurtidas(prev => ({
        ...prev,
        [idPost]: { 
          curtido: resultado.data.curtido, 
          total: resultado.data.total_curtidas 
        }
      }));
    } else {
      console.warn('⚠️ Erro ao curtir:', resultado.message);
      showToast('error', 'Não foi possível curtir. Tente novamente.');
    }
  };

  const abrirModalComentario = (post: any) => {
    setPostSelecionado(post);
    setModalComentarioAberto(true);
    setComentarioTexto('');
  };

  const fecharModalComentario = () => {
    setModalComentarioAberto(false);
    setPostSelecionado(null);
    setComentarioTexto('');
  };

  const handleEnviarComentario = async () => {
    if (!comentarioTexto.trim() || !postSelecionado) return;
    
    setEnviandoComentario(true);
    const resultado = await comunidadeService.comentarEmPost(postSelecionado.id_comentario, comentarioTexto);
    
    if (resultado.status) {
      // Mostrar animação de sucesso
      setMostrarSucessoModal(true);
      setEnviandoComentario(false);
      
      // Após 2 segundos, fechar modal e mostrar toast
      setTimeout(() => {
        setMostrarSucessoModal(false);
        fecharModalComentario();
        showToast('success', 'Comentário enviado com sucesso! 🎉');
        
        // Recarregar comentários desse post
        carregarComentariosDoPost(postSelecionado.id_comentario);
      }, 1800);
    } else {
      setEnviandoComentario(false);
      showToast('error', resultado.message || 'Erro ao enviar comentário');
    }
  };

  const toggleComentarios = async (idPost: number) => {
    // Se já está visível, apenas esconde
    if (comentariosVisiveis[idPost]) {
      setComentariosVisiveis(prev => ({ ...prev, [idPost]: false }));
      return;
    }
    
    // Se não tem comentários carregados, busca
    if (!comentariosPorPost[idPost]) {
      await carregarComentariosDoPost(idPost);
    }
    
    // Mostra os comentários
    setComentariosVisiveis(prev => ({ ...prev, [idPost]: true }));
  };

  const carregarComentariosDoPost = async (idPost: number) => {
    setCarregandoComentarios(prev => ({ ...prev, [idPost]: true }));
    
    const resultado = await comunidadeService.listarComentariosDoPost(idPost);
    
    if (resultado.status) {
      setComentariosPorPost(prev => ({ ...prev, [idPost]: resultado.comentarios }));
    }
    
    setCarregandoComentarios(prev => ({ ...prev, [idPost]: false }));
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
                    <button 
                      onClick={() => handleCurtir(c.id_comentario)}
                      className={`flex items-center gap-2 transition-colors group ${
                        curtidas[c.id_comentario]?.curtido 
                          ? 'text-[#F9A01B]' 
                          : 'text-gray-600 hover:text-[#F9A01B]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        curtidas[c.id_comentario]?.curtido
                          ? 'bg-orange-100'
                          : 'bg-gray-100 group-hover:bg-orange-100'
                      }`}>
                        <ThumbsUp className={`w-4 h-4 ${curtidas[c.id_comentario]?.curtido ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-sm font-medium">
                        {curtidas[c.id_comentario]?.curtido ? 'Curtido' : 'Curtir'}
                        {curtidas[c.id_comentario]?.total > 0 && (
                          <span className="ml-1">({curtidas[c.id_comentario]?.total})</span>
                        )}
                      </span>
                    </button>
                    <button 
                      onClick={() => abrirModalComentario(c)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Comentar</span>
                    </button>
                    
                    {/* Botão Ver Comentários */}
                    <button 
                      onClick={() => toggleComentarios(c.id_comentario)}
                      className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group ml-auto"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {comentariosVisiveis[c.id_comentario] ? 'Ocultar' : 'Ver'} comentários
                        {comentariosPorPost[c.id_comentario] && ` (${comentariosPorPost[c.id_comentario].length})`}
                      </span>
                    </button>
                  </div>

                  {/* Seção de Comentários */}
                  {comentariosVisiveis[c.id_comentario] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {carregandoComentarios[c.id_comentario] ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">Carregando comentários...</span>
                        </div>
                      ) : comentariosPorPost[c.id_comentario]?.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-600 uppercase">
                            {comentariosPorPost[c.id_comentario].length} Comentário(s)
                          </p>
                          {comentariosPorPost[c.id_comentario].map((comentario: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-purple-600">
                                    {comentario.nome_usuario?.[0] || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {comentario.nome_usuario || 'Usuário'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatarData(comentario.data_criacao || comentario.createdAt || new Date().toISOString())}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed pl-10">
                                {comentario.conteudo}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
                          <button
                            onClick={() => abrirModalComentario(c)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Seja o primeiro a comentar!
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Botão Flutuante Moderno */}
          <Link to="/infocash/novo-comentario">
            <button className="fixed right-6 bottom-6 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-2xl shadow-2xl px-6 py-4 hover:shadow-[0_10px_40px_rgba(249,160,27,0.4)] hover:scale-105 transition-all flex items-center gap-3 z-50 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base">Novo Comentário</span>
            </button>
          </Link>

          {/* Toast Notification - Profissional */}
          {toast.show && (
            <div className={`fixed top-6 right-6 z-[100] animate-slideInRight`}>
              <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border-2 ${
                toast.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {toast.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <XCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-bold text-sm ${
                    toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {toast.type === 'success' ? 'Sucesso!' : 'Ops!'}
                  </p>
                  <p className={`text-xs ${
                    toast.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Comentário - Design Premium */}
          {modalComentarioAberto && postSelecionado && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(249,160,27,0.4)] max-w-lg w-full overflow-hidden animate-scaleIn border border-orange-100">
                
                {/* Animação de Sucesso - Premium */}
                {mostrarSucessoModal ? (
                  <div className="p-10 flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white">
                    {/* Círculo animado com check */}
                    <div className="relative">
                      {/* Anéis externos animados */}
                      <div className="absolute inset-0 w-28 h-28 -m-2 rounded-full border-4 border-orange-200 animate-ping opacity-30" />
                      <div className="absolute inset-0 w-28 h-28 -m-2 rounded-full border-2 border-orange-300 animate-pulse" />
                      
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F9A01B] via-orange-400 to-[#FF8C00] flex items-center justify-center animate-circleGrow shadow-xl shadow-orange-300">
                        <svg className="w-12 h-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path className="checkmark-path" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      
                      {/* Partículas de confete melhoradas */}
                      <Sparkles className="absolute -top-3 -right-3 w-7 h-7 text-yellow-400 animate-bounce" />
                      <Sparkles className="absolute -bottom-2 -left-3 w-6 h-6 text-orange-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <Sparkles className="absolute top-1 -left-5 w-5 h-5 text-amber-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <Sparkles className="absolute -top-1 left-1/2 w-4 h-4 text-yellow-500 animate-bounce" style={{ animationDelay: '0.45s' }} />
                    </div>
                    
                    <h3 className="text-2xl font-extrabold text-gray-800 mt-8 mb-2 tracking-tight">Comentário Enviado!</h3>
                    <p className="text-gray-500 text-center text-sm">Sua opinião foi publicada com sucesso</p>
                    
                    {/* Badge de pontos - Premium */}
                    <div className="mt-6 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg shadow-orange-200 animate-pulse-slow">
                      <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-white text-lg">+10 HubCoins</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header Premium - Laranja */}
                    <div className="bg-gradient-to-r from-[#F9A01B] via-orange-500 to-[#FF8C00] p-6 relative overflow-hidden">
                      {/* Decorações de fundo */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-white tracking-tight">Novo Comentário</h3>
                            <p className="text-sm text-orange-100 font-medium">Compartilhe sua experiência</p>
                          </div>
                        </div>
                        <button 
                          onClick={fecharModalComentario}
                          className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 hover:rotate-90 flex items-center justify-center transition-all duration-300"
                        >
                          <span className="text-white text-2xl leading-none font-light">×</span>
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo do Post Original */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-b border-orange-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-orange-600 font-semibold mb-1">Respondendo a:</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{postSelecionado.titulo}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{postSelecionado.conteudo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Área de Texto Premium */}
                    <div className="p-5">
                      <div className="relative">
                        <textarea
                          value={comentarioTexto}
                          onChange={(e) => setComentarioTexto(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 'Enter' && comentarioTexto.trim() && !enviandoComentario) {
                              handleEnviarComentario();
                            }
                          }}
                          placeholder="O que você achou? Compartilhe sua opinião..."
                          className="w-full min-h-[130px] p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none resize-none text-sm transition-all placeholder:text-gray-400"
                          autoFocus
                          maxLength={500}
                        />
                        {/* Contador de caracteres animado */}
                        <div className={`absolute bottom-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                          comentarioTexto.length > 450 
                            ? 'bg-red-100 text-red-600' 
                            : comentarioTexto.length > 0 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'text-gray-400'
                        }`}>
                          {comentarioTexto.length}/500
                        </div>
                      </div>
                      
                      {/* Dica Premium */}
                      <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-md">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Ganhe recompensas!</p>
                          <p className="text-xs text-gray-500">Você receberá <strong className="text-orange-600">+10 HubCoins</strong> por comentar</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Premium */}
                    <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 flex items-center justify-between">
                      <p className="text-xs text-gray-500 hidden sm:block">
                        <kbd className="px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Enter</kbd> para enviar
                      </p>
                      <div className="flex gap-3 ml-auto">
                        <button
                          onClick={fecharModalComentario}
                          className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl font-semibold transition-all hover:scale-105"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleEnviarComentario}
                          disabled={!comentarioTexto.trim() || enviandoComentario}
                          className="px-7 py-2.5 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-orange-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 transition-all flex items-center gap-2 group"
                        >
                          {enviandoComentario ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                              <span>Publicar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
