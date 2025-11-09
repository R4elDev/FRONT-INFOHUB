import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import bolaVermelhaBrancaDireta from "../../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../../assets/LogoDeRecuperarSenha.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validarCodigo, solicitarCodigoRecuperacao } from "../../services/requests";
import { Shield, Star, Sparkles, Zap, CheckCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import toast from 'react-hot-toast';

function RecuperarSenha2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [reenvioLoading, setReenvioLoading] = useState(false);
  
  // Pegar o email da navegação anterior
  const email = location.state?.email;

  // Redirecionar se não tiver email
  useEffect(() => {
    if (!email) {
      console.log("Email não encontrado, redirecionando...");
      navigate("/recuperar-senha");
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Limita a entrada a um único caractere
    
    // Permitir apenas números
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move o foco para o próximo input
    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Permitir navegação com backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Função que chama a API para validar código
  async function handleSubmit() {

    // Verificar se todos os campos estão preenchidos
    if (code.some((digit) => digit === "")) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Verificar se temos o email
    if (!email) {
      toast.error("Email não encontrado. Reinicie o processo de recuperação.");
      navigate("/recuperar-senha");
      return;
    }

    // Juntar o código em uma string
    const codigoCompleto = code.join("");
    
    // Payload correto com email e codigo
    const payload = { 
      email: email,
      codigo: codigoCompleto 
    };

    console.log("Validando código:", { email, codigo: codigoCompleto });

    try {
      setLoading(true);
      const response = await validarCodigo(payload);
      console.log("Resposta da validação:", response);
      
      // Verificar se a resposta indica sucesso
      if (response && (response.status === true || response.status_code === 200)) {
        toast.success("Código validado com sucesso!");
        
        // Aguardar um pouco para mostrar a mensagem de sucesso
        setTimeout(() => {
          navigate("/recuperar-senha-final", { 
            state: { 
              email, 
              codigo: codigoCompleto 
            } 
          });
        }, 1000);
      } else {
        toast.error(response?.message || "Código inválido ou expirado");
      }
      
    } catch (err: any) {
      console.error("Erro ao validar código:", err);
      console.error("Resposta do erro:", err.response?.data);
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          toast.error(data?.message || "Código inválido ou expirado");
        } else if (status === 404) {
          toast.error("Endpoint não encontrado. Verifique a configuração da API");
        } else if (status >= 500) {
          toast.error("Erro no servidor. Tente novamente mais tarde");
        } else {
          toast.error(data?.message || `Erro HTTP ${status}`);
        }
      } else if (err.request) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente");
      } else {
        toast.error("Erro inesperado ao validar código");
      }
    } finally {
      setLoading(false);
    }
  }

  // Função para reenviar código
  async function handleReenviarCodigo() {
    if (!email) {
      toast.error("Email não encontrado. Reinicie o processo de recuperação.");
      return;
    }
    
    try {
      setReenvioLoading(true);
      
      const payload = { email };
      const response = await solicitarCodigoRecuperacao(payload);
      
      if (response && (response.status === true || response.message)) {
        // Limpar os campos de código
        setCode(["", "", "", ""]);
        
        // Focar no primeiro input
        setTimeout(() => {
          const firstInput = document.getElementById(`code-input-0`);
          firstInput?.focus();
        }, 100);
        
        toast.success("Novo código enviado para seu email!");
      } else {
        toast.error("Erro ao enviar novo código");
      }
      
    } catch (err: any) {
      console.error("Erro ao reenviar código:", err);
      toast.error(err.response?.data?.message || "Erro ao reenviar código");
    } finally {
      setReenvioLoading(false);
    }
  }

  // Mascarar email para exibição
  const mascarEmail = (email: string) => {
    if (!email) return "";
    const [nome, dominio] = email.split("@");
    if (!nome || !dominio) return email;
    const nomeOculto = nome.slice(0, 2) + "***" + nome.slice(-1);
    return `${nomeOculto}@${dominio}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-400 via-[#F9A01B] to-yellow-500 relative">
      {/* Gradientes decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-red-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse z-0" style={{animationDelay: '1s'}} />
      
      {/* Badges de status */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeInLeft z-20">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-xs font-bold text-gray-700">Código Seguro</span>
      </div>
      
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-fadeInRight z-20">
        <Star className="w-4 h-4 text-white fill-white" />
        <span className="text-xs font-bold text-white">Passo 2</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <img
          src={bolaVermelhaBrancaDireta}
          alt="bola vermelha"
          className="absolute top-0 right-0 w-24 sm:w-32 md:w-auto opacity-50"
        />

        <img
          src={bolaVermelhaBrancaEsquerda}
          alt="bola vermelha"
          className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-auto opacity-50"
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
              Confirme seu código
            </h2>
            <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Enviado para: {email ? mascarEmail(email) : ""}
            </p>
          </div>

          {/* Inputs de código premium */}
          <div className="flex gap-3 sm:gap-4 mt-4 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                disabled={loading}
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold border-3
                          border-orange-300 rounded-2xl bg-white/95 backdrop-blur-sm
                          focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-300
                          focus:scale-110 transition-all duration-300
                          disabled:opacity-50 shadow-lg hover:shadow-xl"
              />
            ))}
          </div>

          {/* Botão Premium */}
          <Button
            onClick={handleSubmit}
            disabled={loading || code.some((digit) => digit === "")}
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
                  Validando...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Continuar
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>

          {/* Reenviar código */}
          <div className="mt-6 flex items-center justify-center gap-2 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
            <p className="text-xs sm:text-sm text-gray-600">
              Não recebeu código?
            </p>
            <button 
              className="flex items-center gap-1 font-bold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
              onClick={handleReenviarCodigo}
              disabled={reenvioLoading}
            >
              <RefreshCw className={`w-4 h-4 ${reenvioLoading ? 'animate-spin' : ''}`} />
              {reenvioLoading ? "Enviando..." : "Enviar novamente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha2;
