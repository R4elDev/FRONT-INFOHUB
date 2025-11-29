import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Star, ArrowLeft, Send, Gift, Sparkles, CheckCircle, Package, Store, Coins } from 'lucide-react';
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
  
  .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
  .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
  .animate-starPop { animation: starPop 0.3s ease-out; }
  .animate-coinBounce { animation: coinBounce 1s ease-in-out infinite; }
  
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`;
if (!document.head.querySelector('style[data-avaliacao-animations]')) {
  style.setAttribute('data-avaliacao-animations', 'true');
  document.head.appendChild(style);
}

export default function AvaliarProduto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  
  // Dados do produto (pode vir de params ou state)
  const [produto, setProduto] = useState<any>({
    id: id || searchParams.get('id') || 1,
    nome: searchParams.get('nome') || 'Produto',
    imagem: searchParams.get('imagem') || null,
    estabelecimento: searchParams.get('estabelecimento') || 'Estabelecimento'
  });
  
  // Estados do formulário
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  
  // Verificar se pode avaliar
  const [podeAvaliar, setPodeAvaliar] = useState(true);
  const [motivoNaoPode, setMotivoNaoPode] = useState('');

  useEffect(() => {
    if (user?.id && produto.id) {
      verificarPermissao();
    }
  }, [user?.id, produto.id]);

  const verificarPermissao = async () => {
    const result = await avaliacaoService.podeAvaliarProduto(user!.id, Number(produto.id));
    setPodeAvaliar(result.podeAvaliar);
    if (!result.podeAvaliar) {
      setMotivoNaoPode(result.motivo || 'Você já avaliou este produto ou não tem compra entregue.');
    }
  };

  const handleSubmit = async () => {
    if (nota === 0) {
      setErro('Selecione uma nota de 1 a 5 estrelas');
      return;
    }
    
    if (comentario.trim().length < 10) {
      setErro('O comentário deve ter pelo menos 10 caracteres');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      const result = await avaliacaoService.avaliarProduto(
        user!.id,
        Number(produto.id),
        nota,
        comentario.trim()
      );

      if (result.status) {
        setSucesso(true);
        // Aguardar animação e redirecionar
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
      default: return 'Selecione';
    }
  };

  const getNotaColor = (n: number) => {
    switch (n) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-lime-500';
      case 5: return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  // Tela de sucesso
  if (sucesso) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
          <div className="animate-scaleIn bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center relative overflow-hidden">
            {/* Confetti Background */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '100%',
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB'][i % 5],
                    animation: `confetti ${1 + Math.random()}s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
            
            {/* Success Icon */}
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-3xl font-black text-gray-800 mb-3">
                Avaliação Enviada! 🎉
              </h1>
              
              <p className="text-gray-600 mb-6">
                Obrigado por compartilhar sua experiência!
              </p>
              
              {/* Pontos Ganhos */}
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-6 mb-6 border-2 border-amber-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-coinBounce">
                    <Coins className="w-10 h-10 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Você ganhou</p>
                    <p className="text-3xl font-black text-amber-600">+8 HubCoins</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Redirecionando em instantes...
              </p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-6">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Star className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-800">
                Avaliar Produto
              </h1>
              <p className="text-gray-600">Compartilhe sua experiência e ganhe pontos!</p>
            </div>
          </div>
        </div>

        {/* Card Principal */}
        <div className="animate-fadeInUp max-w-2xl mx-auto" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
            
            {/* Produto Info */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-effect"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {produto.imagem ? (
                    <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{produto.nome}</h2>
                  <div className="flex items-center gap-2 text-white/80">
                    <Store className="w-4 h-4" />
                    <span className="text-sm">{produto.estabelecimento}</span>
                  </div>
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
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                  <p className="text-amber-800 font-medium text-center">
                    ⚠️ {motivoNaoPode}
                  </p>
                </div>
              )}
              
              {/* Seleção de Estrelas */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-4 text-center text-lg">
                  Qual sua nota para este produto?
                </label>
                
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNota(n)}
                      onMouseEnter={() => setHoverNota(n)}
                      onMouseLeave={() => setHoverNota(0)}
                      disabled={!podeAvaliar}
                      className={`
                        p-2 rounded-xl transition-all duration-200 transform
                        ${n <= (hoverNota || nota) ? 'scale-110' : 'scale-100'}
                        ${nota === n ? 'animate-starPop' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <Star
                        className={`
                          w-12 h-12 md:w-14 md:h-14 transition-all duration-200
                          ${n <= (hoverNota || nota) 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-lg' 
                            : 'text-gray-300'
                          }
                        `}
                      />
                    </button>
                  ))}
                </div>
                
                <p className={`text-center text-xl font-bold ${getNotaColor(hoverNota || nota)}`}>
                  {getNotaLabel(hoverNota || nota)}
                </p>
              </div>

              {/* Comentário */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-3">
                  Conte mais sobre sua experiência
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  disabled={!podeAvaliar}
                  placeholder="O que você achou do produto? Qualidade, embalagem, atendimento..."
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={enviando || !podeAvaliar || nota === 0}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3
                  transition-all duration-300 transform
                  ${enviando || !podeAvaliar || nota === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
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
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Você ganhará <strong className="text-amber-600">+8 HubCoins</strong> ao enviar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
