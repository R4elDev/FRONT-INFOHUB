import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import bolaVermelhaBrancaDireta from "../../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../../assets/LogoDeRecuperarSenha.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarCodigoRecuperacao } from "../../services/requests";
import { Mail, Shield, Star, Sparkles, Zap, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';

function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleNextStep();
    }
  };

  // Função que chama a API para solicitar código
  async function handleNextStep() {

    if (!email) {
      toast.error("Preencha o campo email");
      return;
    }

    // Validação simples de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email com formato válido");
      return;
    }

    const payload = { email };

    try {
      setLoading(true);
      
      await solicitarCodigoRecuperacao(payload);
      toast.success("Código enviado para seu email!");
      
      // Se chegou até aqui, deu certo
      setTimeout(() => {
        navigate("/recuperar-senha2", { state: { email } });
      }, 1000);
      
    } catch (err: any) {
      console.error("Erro ao solicitar código:", err);
      if (err.response?.status === 404) {
        toast.error("Email não encontrado");
      } else if (err.response?.status >= 500) {
        toast.error("Erro no servidor. Tente novamente mais tarde");
      } else {
        toast.error("Erro ao enviar código de recuperação");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-400 via-[#F9A01B] to-yellow-500 relative">
      {/* Gradientes decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-red-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse z-0" style={{animationDelay: '1s'}} />
      
      {/* Badges de status */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeInLeft z-20">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-xs font-bold text-gray-700">Recuperação Segura</span>
      </div>
      
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-fadeInRight z-20">
        <Star className="w-4 h-4 text-white fill-white" />
        <span className="text-xs font-bold text-white">Passo 1</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <img
          src={bolaVermelhaBrancaDireta}
          alt="bola vermelha"
          className="absolute top-0 right-0 w-24 sm:w-32 md:w-auto"
        />

        <img
          src={bolaVermelhaBrancaEsquerda}
          alt="bola vermelha"
          className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-auto"
        />

        {/* Partículas flutuantes */}
        <div className="absolute top-32 right-16 animate-float opacity-20 z-10">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-32 left-16 animate-float-reverse opacity-20 z-10" style={{animationDelay: '1s'}}>
          <Zap className="w-5 h-5 text-white" />
        </div>

        <div className="bg-white/95 backdrop-blur-xl w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] min-h-[600px] p-6 sm:p-8 
                        rounded-3xl shadow-2xl flex flex-col items-center border-2 border-white/50 animate-scaleIn">
          {/* Logo com glow */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full" />
            <img
              src={LogoDeRecuperarSenha}
              alt="logo recuperar"
              className="relative w-40 h-48 sm:w-48 sm:h-56 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Título premium */}
          <div className="text-center mb-6 animate-fadeInDown">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
              Recuperar Senha
            </h2>
            <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Informe seu email para receber o código
            </p>
          </div>

          {/* Input Email Premium */}
          <div className="relative w-full max-w-[400px] group animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="h-[56px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 
                         focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl 
                         border-2 border-gray-100"
            />
          </div>

          {/* Botão Premium */}
          <Button
            onClick={handleNextStep}
            disabled={loading}
            className="mt-8 w-full max-w-[400px] h-[56px] rounded-full text-[18px] font-bold text-white transition-all duration-300 
                       overflow-hidden group shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 ring-2 ring-green-300 
                       hover:ring-green-400 disabled:opacity-70 disabled:cursor-not-allowed animate-fadeInUp"
            style={{
              background: 'linear-gradient(135deg, #25992E 0%, #2EBF37 50%, #25992E 100%)',
              backgroundSize: '200% 100%',
              animationDelay: '0.4s'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Avançar
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>

          {/* Hint Enter */}
          <div className="flex items-center justify-center gap-2 mt-4 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
            <div className="bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
              <p className="text-[11px] text-orange-700 font-semibold flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Pressione <kbd className="px-2 py-0.5 bg-orange-200 rounded text-[10px] font-mono">Enter</kbd> para continuar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
