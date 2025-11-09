import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import bolaVermelhaBrancaDireta from "../../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../../assets/LogoDeRecuperarSenha.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Shield, Star, Sparkles, Zap, CheckCircle, Lock, Loader2, RefreshCw } from "lucide-react";
import { redefinirSenha, solicitarCodigoRecuperacao } from "../../services/requests";
import toast from 'react-hot-toast';

function RecuperarSenhaFinal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [reenvioLoading, setReenvioLoading] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  
  // Pegar o email e código da navegação anterior
  const email = location.state?.email;
  const codigo = location.state?.codigo;

  // Redirecionar se não tiver email ou código
  useEffect(() => {
    if (!email || !codigo) {
      console.log("Email ou código não encontrado, redirecionando...");
      navigate("/recuperar-senha");
    }
  }, [email, codigo, navigate]);

  // Validação de senha (sem obrigar maiúscula)
  const validarSenha = (senha: string) => {
    const temMinimo8Chars = senha.length >= 8;
    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /\d/.test(senha);

    return {
      valida: temMinimo8Chars && temLetra && temNumero,
      erros: [
        !temMinimo8Chars && "Mínimo 8 caracteres",
        !temLetra && "Pelo menos uma letra",
        !temNumero && "Pelo menos um número"
      ].filter(Boolean)
    };
  };

  // Função que chama a API para redefinir senha
  async function handleNextStep() {

    // Log para debug
    console.log("=== INICIANDO REDEFINIÇÃO DE SENHA ===");
    console.log("Email:", email);
    console.log("Código:", codigo);
    console.log("Nova senha preenchida:", !!novaSenha);
    console.log("Confirmar senha preenchida:", !!confirmarSenha);

    // Validações básicas
    if (!novaSenha || !confirmarSenha) {
      console.error("❌ Campos vazios");
      toast.error("Preencha todos os campos");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      console.error("❌ Senhas não coincidem");
      toast.error("As senhas não coincidem");
      return;
    }

    // Validação de senha
    const validacao = validarSenha(novaSenha);
    if (!validacao.valida) {
      console.error("❌ Senha inválida:", validacao.erros);
      toast.error(`Senha deve conter: ${validacao.erros.join(", ")}`);
      return;
    }

    // Verificar se temos email e código
    if (!email || !codigo) {
      console.error("❌ Email ou código ausente");
      toast.error("Dados da sessão perdidos. Reinicie o processo de recuperação.");
      navigate("/recuperar-senha");
      return;
    }

    const payload = { 
      codigo: codigo.toString(),
      novaSenha: novaSenha.trim()
    };

    console.log("✅ Payload que será enviado:");
    console.log("- Código:", payload.codigo);
    console.log("- Nova senha (length):", payload.novaSenha.length);
    console.log("- Endpoint: /redefinir-senha");

    try {
      setLoading(true);
      console.log("🔄 Fazendo requisição para API...");
      
      const response = await redefinirSenha(payload);
      
      console.log("📨 RESPOSTA COMPLETA DA API:");
      console.log("Response objeto:", response);
      console.log("Response.status:", response?.status);
      console.log("Response.status_code:", response?.status_code);
      console.log("Response.message:", response?.message);
      
      // Verificação mais flexível da resposta
      const isSuccess = response && (
        response.status === true || 
        response.status_code === 200 || 
        response.status_code === 201 ||
        (response.message && response.message.toLowerCase().includes('sucesso'))
      );
      
      if (isSuccess) {
        console.log("✅ SUCESSO! Senha redefinida");
        toast.success("Senha redefinida com sucesso!");
        
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Senha redefinida com sucesso! Faça login com sua nova senha." 
            } 
          });
        }, 2000);
      } else {
        console.error("❌ Resposta indica falha");
        toast.error(response?.message || "Erro ao redefinir senha. Tente novamente.");
      }
      
    } catch (err: any) {
      console.error("💥 ERRO CAPTURADO:");
      console.error("Erro completo:", err);
      console.error("err.response:", err.response);
      console.error("err.response?.data:", err.response?.data);
      console.error("err.response?.status:", err.response?.status);
      console.error("err.message:", err.message);
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.error(`❌ HTTP Error ${status}:`, data);
        
        if (status === 400) {
          toast.error(data?.message || "Código inválido ou expirado. Solicite um novo código");
        } else if (status === 401) {
          toast.error("Não autorizado. Código pode ter expirado");
        } else if (status === 404) {
          toast.error("Endpoint não encontrado. Verifique a configuração da API");
        } else if (status === 422) {
          toast.error("Dados inválidos. Verifique a senha e tente novamente");
        } else if (status >= 500) {
          toast.error("Erro no servidor. Tente novamente mais tarde");
        } else {
          toast.error(data?.message || `Erro HTTP ${status}`);
        }
      } else if (err.request) {
        console.error("❌ Erro de rede - sem resposta do servidor");
        toast.error("Erro de conexão. Verifique sua internet e tente novamente");
      } else {
        console.error("❌ Erro inesperado:", err.message);
        toast.error("Erro inesperado. Tente novamente");
      }
    } finally {
      setLoading(false);
      console.log("=== FIM DA TENTATIVA DE REDEFINIÇÃO ===");
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
        toast.success("Novo código enviado para seu email!");
        
        setTimeout(() => {
          navigate("/recuperar-senha2", { state: { email } });
        }, 2000);
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

  // Indicador de força da senha
  const getPasswordStrength = () => {
    if (novaSenha.length === 0) return "";
    
    const pontos = [
      novaSenha.length >= 8,
      /[A-Z]/.test(novaSenha),
      /[a-z]/.test(novaSenha),
      /\d/.test(novaSenha),
      /[!@#$%^&*(),.?":{}|<>]/.test(novaSenha)
    ].filter(Boolean).length;

    if (pontos <= 2) return "Fraca";
    if (pontos === 3) return "Média";
    if (pontos === 4) return "Forte";
    return "Muito Forte";
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "Fraca": return "text-red-500";
      case "Média": return "text-yellow-500";
      case "Forte": return "text-green-500";
      case "Muito Forte": return "text-green-600";
      default: return "";
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-400 via-[#F9A01B] to-yellow-500 relative">
      {/* Gradientes decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-red-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse z-0" style={{animationDelay: '1s'}} />
      
      {/* Badges de status */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeInLeft z-20">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-xs font-bold text-gray-700">Redefinição Segura</span>
      </div>
      
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-fadeInRight z-20">
        <Star className="w-4 h-4 text-white fill-white" />
        <span className="text-xs font-bold text-white">Passo 3</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10 overflow-y-auto">
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

        <div className="bg-white/95 backdrop-blur-xl w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] p-6 sm:p-8 
                        rounded-3xl shadow-2xl flex flex-col items-center overflow-y-auto border-2 border-white/50 animate-scaleIn">
          {/* Logo com glow */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full" />
            <img
              src={LogoDeRecuperarSenha}
              alt="logo recuperar"
              className="relative w-32 h-40 sm:w-40 sm:h-48 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Título premium */}
          <div className="text-center mb-6 animate-fadeInDown w-full max-w-[400px]">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
              Criar nova senha
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Redefinindo para: {email ? mascarEmail(email) : ""}
            </p>
          </div>

          {/* Input Nova Senha Premium */}
          <div className="relative w-full max-w-[400px] group mb-3 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <Input
              type={showNovaSenha ? "text" : "password"}
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={loading}
              className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-12 text-[16px] placeholder:text-gray-400 
                         focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl 
                         border-2 border-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-all hover:scale-125 z-10 p-1 hover:bg-orange-50 rounded-full"
              disabled={loading}
            >
              {showNovaSenha ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Indicador de força da senha */}
          {novaSenha && (
            <p className={`text-xs w-full max-w-[400px] mb-3 ${getPasswordStrengthColor()} font-semibold animate-fadeIn`}>
              Força da senha: {getPasswordStrength()}
            </p>
          )}

          {/* Input Confirmar Senha Premium */}
          <div className="relative w-full max-w-[400px] group mb-3 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <Input
              type={showConfirmarSenha ? "text" : "password"}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={loading}
              className={`h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-12 text-[16px] placeholder:text-gray-400 
                         focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl 
                         border-2 ${novaSenha === confirmarSenha && confirmarSenha ? "border-green-400" : "border-gray-100"}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-all hover:scale-125 z-10 p-1 hover:bg-orange-50 rounded-full"
              disabled={loading}
            >
              {showConfirmarSenha ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Indicador de senhas iguais */}
          {confirmarSenha && (
            <p className={`text-xs w-full max-w-[400px] mb-4 font-semibold animate-fadeIn ${
              novaSenha === confirmarSenha ? "text-green-600" : "text-red-600"
            }`}>
              {novaSenha === confirmarSenha ? "✓ Senhas coincidem" : "✗ Senhas não coincidem"}
            </p>
          )}

          {/* Botão Premium */}
          <Button
            onClick={handleNextStep}
            disabled={loading || !novaSenha || !confirmarSenha || novaSenha !== confirmarSenha}
            className="w-full max-w-[400px] h-[56px] rounded-full text-[18px] font-bold text-white transition-all duration-300 
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
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Redefinir Senha
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>

          {/* Reenviar código */}
          <div className="mt-4 flex items-center justify-center gap-2 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
            <p className="text-xs sm:text-sm text-gray-600">
              Código expirou?
            </p>
            <button 
              className="flex items-center gap-1 font-bold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
              onClick={handleReenviarCodigo}
              disabled={reenvioLoading}
            >
              <RefreshCw className={`w-4 h-4 ${reenvioLoading ? 'animate-spin' : ''}`} />
              {reenvioLoading ? "Enviando..." : "Solicitar novo código"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenhaFinal;
