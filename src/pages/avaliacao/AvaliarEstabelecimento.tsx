import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Star, ArrowLeft, Send, Gift, Sparkles, CheckCircle, Store, MapPin, Coins, Award } from 'lucide-react';
import SidebarLayout from '../../components/layouts/SidebarLayout';
import avaliacaoService from '../../services/avaliacaoService';
import { useUser } from '../../contexts/UserContext';

// Animações CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes starPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes coinBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  
  .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
  .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
  .animate-starPop { animation: starPop 0.3s ease-out; }
  .animate-coinBounce { animation: coinBounce 1s ease-in-out infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`;
if (!document.head.querySelector('style[data-avaliacao-estab-animations]')) {
  style.setAttribute('data-avaliacao-estab-animations', 'true');
  document.head.appendChild(style);
}

// Categorias de avaliação
const CATEGORIAS = [
  { id: 'atendimento', label: 'Atendimento', icone: '👤' },
  { id: 'qualidade', label: 'Qualidade', icone: '✨' },
  { id: 'preco', label: 'Preço', icone: '💰' },
  { id: 'ambiente', label: 'Ambiente', icone: '🏪' },
  { id: 'entrega', label: 'Entrega', icone: '🚚' }
];

export default function AvaliarEstabelecimento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  
  // Dados do estabelecimento
  const [estabelecimento, setEstabelecimento] = useState<any>({
    id: id || searchParams.get('id') || 1,
    nome: searchParams.get('nome') || 'Estabelecimento',
    imagem: searchParams.get('imagem') || null,
    endereco: searchParams.get('endereco') || ''
  });
  
  // Estados do formulário
  const [notaGeral, setNotaGeral] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [notasCategorias, setNotasCategorias] = useState<Record<string, number>>({});
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  
  // Verificar se pode avaliar
  const [podeAvaliar, setPodeAvaliar] = useState(true);
  const [motivoNaoPode, setMotivoNaoPode] = useState('');

  useEffect(() => {
    if (user?.id && estabelecimento.id) {
      verificarPermissao();
    }
  }, [user?.id, estabelecimento.id]);

  const verificarPermissao = async () => {
    const result = await avaliacaoService.podeAvaliarEstabelecimento(user!.id, Number(estabelecimento.id));
    setPodeAvaliar(result.podeAvaliar);
    if (!result.podeAvaliar) {
      setMotivoNaoPode(result.motivo || 'Você já avaliou este estabelecimento ou não tem compra entregue.');
    }
  };

  const handleSubmit = async () => {
    if (notaGeral === 0) {
      setErro('Selecione uma nota geral de 1 a 5 estrelas');
      return;
    }
    
    if (comentario.trim().length < 10) {
      setErro('O comentário deve ter pelo menos 10 caracteres');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      // Monta comentário completo com notas das categorias
      let comentarioCompleto = comentario.trim();
      
      const categoriasAvaliadas = Object.entries(notasCategorias)
        .filter(([_, nota]) => nota > 0)
        .map(([cat, nota]) => {
          const categoria = CATEGORIAS.find(c => c.id === cat);
          return `${categoria?.icone} ${categoria?.label}: ${'⭐'.repeat(nota)}`;
        });
      
      if (categoriasAvaliadas.length > 0) {
        comentarioCompleto += `\n\n--- Detalhes ---\n${categoriasAvaliadas.join('\n')}`;
      }

      const result = await avaliacaoService.avaliarEstabelecimento(
        user!.id,
        Number(estabelecimento.id),
        notaGeral,
        comentarioCompleto
      );

      if (result.status) {
        setSucesso(true);
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      } else {
        setErro(result.message);
      }
    } catch (err: any) {
      setErro('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const getNotaLabel = (n: number) => {
    switch (n) {
      case 1: return 'Péssimo';
      case 2: return 'Ruim';
      case 3: return 'Regular';
      case 4: return 'Bom';
      case 5: return 'Excelente';
      default: return 'Selecione uma nota';
    }
  };

  const getNotaColor = (n: number) => {
    switch (n) {
      case 1: return 'from-red-500 to-red-600';
      case 2: return 'from-orange-500 to-orange-600';
      case 3: return 'from-yellow-500 to-yellow-600';
      case 4: return 'from-lime-500 to-lime-600';
      case 5: return 'from-green-500 to-emerald-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const handleCategoriaClick = (catId: string, nota: number) => {
    setNotasCategorias(prev => ({
      ...prev,
      [catId]: prev[catId] === nota ? 0 : nota
    }));
  };

  // Tela de sucesso
  if (sucesso) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-6">
          <div className="animate-scaleIn bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center relative overflow-hidden">
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '100%',
                    backgroundColor: ['#9B59B6', '#8E44AD', '#3498DB', '#E74C3C', '#F39C12'][i % 5],
                    animation: `confetti ${1 + Math.random()}s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
            
            {/* Success Content */}
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg animate-float">
                <Award className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-3xl font-black text-gray-800 mb-3">
                Avaliação Enviada! 🎊
              </h1>
              
              <p className="text-gray-600 mb-6">
                Sua opinião ajuda outros usuários a escolher melhor!
              </p>
              
              {/* Pontos Ganhos */}
              <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-2xl p-6 mb-6 border-2 border-purple-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-coinBounce">
                    <Coins className="w-10 h-10 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Você ganhou</p>
                    <p className="text-3xl font-black text-purple-600">+8 HubCoins</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Redirecionando...
              </p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4 md:p-6">
        {/* Header */}
        <div className="animate-fadeInUp max-w-2xl mx-auto mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Store className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-800">
                Avaliar Estabelecimento
              </h1>
              <p className="text-gray-600">Compartilhe sua experiência de compra!</p>
            </div>
          </div>
        </div>

        {/* Card Principal */}
        <div className="animate-fadeInUp max-w-2xl mx-auto" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
            
            {/* Estabelecimento Info */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-effect"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {estabelecimento.imagem ? (
                    <img src={estabelecimento.imagem} alt={estabelecimento.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{estabelecimento.nome}</h2>
                  {estabelecimento.endereco && (
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm truncate">{estabelecimento.endereco}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Badge de pontos */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Gift className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm">+8 pontos</span>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-6 md:p-8">
              {/* Verificação de permissão */}
              {!podeAvaliar && (
                <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                  <p className="text-purple-800 font-medium text-center">
                    ⚠️ {motivoNaoPode}
                  </p>
                </div>
              )}
              
              {/* Nota Geral */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-4 text-center text-lg">
                  Nota Geral do Estabelecimento
                </label>
                
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNotaGeral(n)}
                      onMouseEnter={() => setHoverNota(n)}
                      onMouseLeave={() => setHoverNota(0)}
                      disabled={!podeAvaliar}
                      className={`
                        p-2 rounded-xl transition-all duration-200 transform
                        ${n <= (hoverNota || notaGeral) ? 'scale-110' : 'scale-100'}
                        ${notaGeral === n ? 'animate-starPop' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <Star
                        className={`
                          w-12 h-12 md:w-14 md:h-14 transition-all duration-200
                          ${n <= (hoverNota || notaGeral) 
                            ? 'text-purple-500 fill-purple-500 drop-shadow-lg' 
                            : 'text-gray-300'
                          }
                        `}
                      />
                    </button>
                  ))}
                </div>
                
                <div className={`
                  text-center py-2 px-6 rounded-full inline-flex mx-auto
                  bg-gradient-to-r ${getNotaColor(hoverNota || notaGeral)}
                  ${(hoverNota || notaGeral) > 0 ? 'text-white' : 'text-gray-500 bg-gray-100'}
                `}>
                  <span className="font-bold">{getNotaLabel(hoverNota || notaGeral)}</span>
                </div>
              </div>

              {/* Avaliação por Categoria */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-4">
                  Avalie cada aspecto <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                
                <div className="space-y-3">
                  {CATEGORIAS.map((cat) => (
                    <div 
                      key={cat.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icone}</span>
                        <span className="font-medium text-gray-700">{cat.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => handleCategoriaClick(cat.id, n)}
                            disabled={!podeAvaliar}
                            className="p-1 disabled:opacity-50"
                          >
                            <Star
                              className={`
                                w-6 h-6 transition-all
                                ${n <= (notasCategorias[cat.id] || 0)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                                }
                              `}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comentário */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-3">
                  Descreva sua experiência
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  disabled={!podeAvaliar}
                  placeholder="Como foi sua experiência com este estabelecimento? Atendimento, produtos, entrega..."
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>Mínimo 10 caracteres</span>
                  <span>{comentario.length}/500</span>
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <p className="text-red-600 font-medium text-center">{erro}</p>
                </div>
              )}

              {/* Botão Enviar */}
              <button
                onClick={handleSubmit}
                disabled={enviando || !podeAvaliar || notaGeral === 0}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3
                  transition-all duration-300 transform
                  ${enviando || !podeAvaliar || notaGeral === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {enviando ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>Enviar Avaliação</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Info */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Coins className="w-4 h-4 text-purple-500" />
                <span>Você ganhará <strong className="text-purple-600">+8 HubCoins</strong> ao enviar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
