import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { redefinirSenha, solicitarCodigoRecuperacao } from "../services/requests";

function RecuperarSenhaFinal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [reenvioLoading, setReenvioLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
    setErrorMsg(null);
    setSuccessMsg(null);

    // Log para debug
    console.log("=== INICIANDO REDEFINIÇÃO DE SENHA ===");
    console.log("Email:", email);
    console.log("Código:", codigo);
    console.log("Nova senha preenchida:", !!novaSenha);
    console.log("Confirmar senha preenchida:", !!confirmarSenha);

    // Validações básicas
    if (!novaSenha || !confirmarSenha) {
      console.error("❌ Campos vazios");
      setErrorMsg("Preencha todos os campos");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      console.error("❌ Senhas não coincidem");
      setErrorMsg("As senhas não coincidem");
      return;
    }

    // Validação de senha
    const validacao = validarSenha(novaSenha);
    if (!validacao.valida) {
      console.error("❌ Senha inválida:", validacao.erros);
      setErrorMsg(`Senha deve conter: ${validacao.erros.join(", ")}`);
      return;
    }

    // Verificar se temos email e código
    if (!email || !codigo) {
      console.error("❌ Email ou código ausente");
      setErrorMsg("Dados da sessão perdidos. Reinicie o processo de recuperação.");
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
        setSuccessMsg("Senha redefinida com sucesso!");
        
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Senha redefinida com sucesso! Faça login com sua nova senha." 
            } 
          });
        }, 2000);
      } else {
        console.error("❌ Resposta indica falha");
        setErrorMsg(response?.message || "Erro ao redefinir senha. Tente novamente.");
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
          setErrorMsg(data?.message || "Código inválido ou expirado. Solicite um novo código");
        } else if (status === 401) {
          setErrorMsg("Não autorizado. Código pode ter expirado");
        } else if (status === 404) {
          setErrorMsg("Endpoint não encontrado. Verifique a configuração da API");
        } else if (status === 422) {
          setErrorMsg("Dados inválidos. Verifique a senha e tente novamente");
        } else if (status >= 500) {
          setErrorMsg("Erro no servidor. Tente novamente mais tarde");
        } else {
          setErrorMsg(data?.message || `Erro HTTP ${status}`);
        }
      } else if (err.request) {
        console.error("❌ Erro de rede - sem resposta do servidor");
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente");
      } else {
        console.error("❌ Erro inesperado:", err.message);
        setErrorMsg("Erro inesperado. Tente novamente");
      }
    } finally {
      setLoading(false);
      console.log("=== FIM DA TENTATIVA DE REDEFINIÇÃO ===");
    }
  }

  // Função para reenviar código
  async function handleReenviarCodigo() {
    if (!email) {
      setErrorMsg("Email não encontrado. Reinicie o processo de recuperação.");
      return;
    }
    
    try {
      setReenvioLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const payload = { email };
      const response = await solicitarCodigoRecuperacao(payload);
      
      if (response && (response.status === true || response.message)) {
        setSuccessMsg("Novo código enviado para seu email!");
        
        setTimeout(() => {
          navigate("/recuperar-senha2", { state: { email } });
        }, 2000);
      } else {
        setErrorMsg("Erro ao enviar novo código");
      }
      
    } catch (err: any) {
      console.error("Erro ao reenviar código:", err);
      setErrorMsg(err.response?.data?.message || "Erro ao reenviar código");
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
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div className="flex-1 bg-[#F9A01B] flex flex-col items-center justify-center px-4">
        <img
          src={bolaVermelhaBrancaDireta}
          alt="bola vermelha"
          className="absolute top-0 right-0"
        />

        <img
          src={bolaVermelhaBrancaEsquerda}
          alt="bola vermelha"
          className="absolute bottom-0 left-0"
        />

        <div className="bg-white w-[600px] h-[800px] p-6 rounded-4xl 
                        shadow-lg flex flex-col items-center overflow-y-auto">
          <img
            src={LogoDeRecuperarSenha}
            alt="logo recuperar"
            className="w-70 h-90 mb-3"
          />

          <h2 className="text-3xl font-bold mb-1 text-left w-[400px]">Criar nova senha</h2>
          <p className="text-1xl text-left w-[400px] mb-2">
            Redefinindo senha para: {email ? mascarEmail(email) : ""}
          </p>

          {/* Mensagem de erro */}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 
                            px-4 py-3 rounded mb-4 w-[400px] text-center text-sm">
              {errorMsg}
            </div>
          )}

          {/* Mensagem de sucesso */}
          {successMsg && (
            <div className="bg-green-100 border border-green-400 
                            text-green-700 px-4 py-3 rounded mb-4 w-[400px] text-center text-sm">
              {successMsg}
            </div>
          )}

          <div className="relative w-[400px] mb-2">
            <Input
              type={showNovaSenha ? "text" : "password"}
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={loading}
              className="h-[40px] bg-gray rounded-[36px] text-[16px] px-10 pr-12
                         placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1]"
            />
            <button
              type="button"
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {showNovaSenha ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Indicador de força da senha */}
          {novaSenha && (
            <p className={`text-sm w-[400px] mb-2 ${getPasswordStrengthColor()}`}>
              Força da senha: {getPasswordStrength()}
            </p>
          )}

          <h2 className="text-3xl font-bold mb-1 text-left w-[400px]">Confirmar nova senha</h2>
          <p className="text-1xl text-left w-[400px] mb-4">Confirme sua nova senha:</p>

          <div className="relative w-[400px] mb-6">
            <Input
              type={showConfirmarSenha ? "text" : "password"}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={loading}
              className="h-[40px] bg-gray rounded-[36px] text-[16px] px-10 pr-12
                         placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {showConfirmarSenha ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Indicador de senhas iguais */}
          {confirmarSenha && (
            <p className={`text-sm w-[400px] mb-4 ${
              novaSenha === confirmarSenha ? "text-green-500" : "text-red-500"
            }`}>
              {novaSenha === confirmarSenha ? "✓ Senhas coincidem" : "✗ Senhas não coincidem"}
            </p>
          )}

          <Button
            onClick={handleNextStep}
            disabled={loading || !novaSenha || !confirmarSenha || novaSenha !== confirmarSenha}
            className="mt-2 bg-[#25992E] w-[200px] h-[50px] 
                       text-white px-10 py-2 rounded-full text-lg font-bold hover:bg-[#4D8832]
                       disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Redefinir Senha"}
          </Button>

          <p className="text-sm mt-4">
            Código expirou?{" "}
            <span 
              className="font-bold text-green-500 text-1xl cursor-pointer hover:text-green-600"
              onClick={handleReenviarCodigo}
            >
              {reenvioLoading ? "Enviando..." : "Solicitar novo código"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenhaFinal;