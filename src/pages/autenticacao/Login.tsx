import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import bolalaranjacombranconomeioGrande from "../../assets/bolalaranjacombranconomeioGrande.png";
import bolalaranjacombranconomeioPequena from "../../assets/bolalaranjacombranconomeioPequena.png";
import homifazendocompra from "../../assets/homifazendocompra.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles, Loader2, Shield, Star, TrendingUp, Zap, CheckCircle } from "lucide-react";
import { login } from "../../services/requests";
import { ROUTES } from "../../utils/constants";
import { validateLogin } from "../../utils/validation";
import { useUser } from "../../contexts/UserContext";
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showsenha, setShowsenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setsenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Função para lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  async function handleLogin() {
    setErrorMsg(null);

    // Validação usando sistema centralizado
    const validation = validateLogin({ email, senha });

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      setErrorMsg(firstError.message);
      toast.error(firstError.message);
      return;
    }

    const payload = { email, senha };

    try {
      setLoading(true);
      const res = await login(payload);

      if (res.status) {
        localStorage.setItem("auth_token", res.token);
        
        // Save user data to context
        setUser({
          id: res.usuario.id,
          nome: res.usuario.nome,
          email: res.usuario.email,
          perfil: res.usuario.perfil as 'consumidor' | 'estabelecimento' | 'admin'
        });

        // Route based on user type - SEM TOAST
        if (res.usuario.perfil === 'admin') {
          navigate(ROUTES.HOME_INICIAL); // Admin vai para HomeInicial (que renderiza HomeInicialAdmin via SmartRoute)
        } else if (res.usuario.perfil === 'estabelecimento') {
          navigate(ROUTES.PERFIL_EMPRESA); // Company dashboard
        } else {
          navigate(ROUTES.HOME_INICIAL); // Regular user home
        }
      } else {
        const errorMessage = "E-mail ou senha incorretos";
        setErrorMsg(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = "Erro ao conectar com a API";
      setErrorMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* TOPO COM IMAGENS */}
      <div className="h-[30vh] sm:h-[35vh] md:h-[40vh] bg-gradient-to-br from-white via-orange-50/30 to-white relative flex items-center justify-center overflow-hidden">
        {/* Badge de segurança */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeInLeft">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-gray-700">Login Seguro</span>
        </div>
        
        {/* Rating badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-fadeInRight">
          <Star className="w-4 h-4 text-white fill-white" />
          <span className="text-xs font-bold text-white">4.9</span>
        </div>
        {/* Gradientes decorativos aprimorados */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        
        <img
          src={bolalaranjacombranconomeioGrande}
          alt="bola laranja grande"
          className="absolute top-0 right-0 w-20 sm:w-24 md:w-28 animate-float drop-shadow-xl"
        />
        <img
          src={bolalaranjacombranconomeioPequena}
          alt="bola laranja pequena"
          className="absolute top-16 sm:top-20 md:top-24 left-0 w-14 sm:w-16 md:w-20 animate-float-reverse drop-shadow-xl"
        />
        <img
          src={homifazendocompra}
          alt="homem fazendo compra"
          className="w-auto h-[65%] sm:h-[70%] md:h-[75%] object-contain animate-scaleIn drop-shadow-2xl"
        />
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 bg-gradient-to-br from-[#FFA726] via-[#F9A01B] to-[#FF8C00] relative flex flex-col items-center justify-center px-4 py-6 overflow-hidden">
        {/* Elementos decorativos de fundo aprimorados */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '2.5s'}} />
        </div>
        
        {/* Partículas flutuantes decorativas */}
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-32 right-16 animate-float-reverse opacity-20" style={{animationDelay: '1s'}}>
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="absolute top-40 right-12 animate-float opacity-15" style={{animationDelay: '2s'}}>
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-reverse opacity-15" style={{animationDelay: '1.5s'}}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        {/* Título aprimorado */}
        <div className="relative z-10 mb-6 animate-fadeInDown">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-lg animate-pulse" />
              <Sparkles className="relative w-7 h-7 text-white animate-pulse" />
            </div>
            <h1 className="text-[26px] sm:text-[30px] md:text-[36px] font-bold text-center font-[Poppins] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              Bem vindo de volta!
            </h1>
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-lg animate-pulse" style={{animationDelay: '0.5s'}} />
              <Sparkles className="relative w-7 h-7 text-white animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
          </div>
          <p className="text-[14px] sm:text-[16px] text-center text-white/90 font-[Poppins] drop-shadow-md flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Entre com suas credenciais para continuar
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[500px] relative z-10 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          {/* Input Email aprimorado */}
          <div className="relative group">
            <div className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 z-10 transition-all group-hover:scale-110">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Mail className="relative w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-focus-within:text-[#25992E] transition-colors" />
              </div>
            </div>
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-[56px] sm:h-[62px] md:h-[68px] bg-white/95 backdrop-blur-sm rounded-[50px] text-[16px] sm:text-[18px] md:text-[20px] pl-12 sm:pl-14 pr-4 sm:pr-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] placeholder:text-gray-400 font-[Poppins]
                       focus:ring-4 focus:ring-[#25992E] focus:bg-white focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-white/50 hover:border-white/80"
            />
            {email && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                <CheckCircle className="w-5 h-5 text-green-500 animate-scaleIn" />
              </div>
            )}
          </div>

          {/* Input Senha aprimorado */}
          <div className="relative w-full group">
            <div className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 z-10 transition-all group-hover:scale-110">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Lock className="relative w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-focus-within:text-[#25992E] transition-colors" />
              </div>
            </div>
            <Input
              type={showsenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setsenha(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-[56px] sm:h-[62px] md:h-[68px] bg-white/95 backdrop-blur-sm rounded-[50px] text-[16px] sm:text-[18px] md:text-[20px] pl-12 sm:pl-14 pr-12 sm:pr-14 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] placeholder:text-gray-400 font-[Poppins]
                         focus:ring-4 focus:ring-[#25992E] focus:bg-white focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-white/50 hover:border-white/80"
            />
            <button
              type="button"
              onClick={() => setShowsenha(!showsenha)}
              className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#25992E] transition-all hover:scale-125 z-10 p-1 hover:bg-green-50 rounded-full"
            >
              {showsenha ? (
                <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>

          <div
            className="w-full flex justify-end"
            onClick={() => navigate("/recuperar-senha")}
          >
            <p className="text-[14px] sm:text-[16px] font-[Poppins] text-white/90 cursor-pointer hover:text-white hover:underline transition-all drop-shadow-md font-semibold">
              Esqueceu a senha?
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl text-center animate-shake shadow-xl border-2 border-red-400">
              <p className="text-[14px] sm:text-[16px] font-semibold font-[Poppins]">
                {errorMsg}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center w-full mt-5 sm:mt-6 relative z-10 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="relative w-full max-w-[500px] h-[56px] sm:h-[62px] md:h-[68px] rounded-[50px] text-white text-[18px] sm:text-[20px] md:text-[22px] font-[Poppins] font-bold 
                       hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group ring-2 ring-white/30 hover:ring-white/50
                       disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #25992E 0%, #2EBF37 50%, #25992E 100%)',
              backgroundSize: '200% 100%'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  ENTRAR
                </>
              )}
            </span>
            {/* shimmer efeito no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                            opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] 
                            transition-transform duration-700"></div>
          </Button>
        </div>
        
        {/* Hint de Enter aprimorado */}
        <div className="flex items-center justify-center gap-2 mt-2 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30">
            <p className="text-[12px] sm:text-[13px] text-white font-[Poppins] font-semibold flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Pressione <kbd className="px-2 py-0.5 bg-white/30 rounded text-[11px] font-mono">Enter</kbd> para entrar
            </p>
          </div>
        </div>

        <div
          className="flex flex-row items-center justify-center mt-5 space-x-2 cursor-pointer group relative z-10 animate-fadeInUp"
          onClick={() => navigate("/cadastro")}
          style={{animationDelay: '0.6s'}}
        >
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all group-hover:scale-105">
            <p className="text-[14px] sm:text-[16px] text-center font-[Poppins] text-white/90 drop-shadow-md inline">
              Não tem uma conta?{" "}
            </p>
            <p className="text-[14px] sm:text-[16px] text-white text-center font-[Poppins] font-bold drop-shadow-md inline group-hover:underline">
              Cadastre-se aqui
            </p>
          </div>
        </div>
        
        {/* Indicador de features */}
        <div className="flex items-center justify-center gap-4 mt-6 relative z-10 animate-fadeInUp" style={{animationDelay: '0.7s'}}>
          <div className="flex items-center gap-1.5 text-white/70">
            <Shield className="w-4 h-4" />
            <span className="text-[11px] font-[Poppins]">Seguro</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-1.5 text-white/70">
            <Zap className="w-4 h-4" />
            <span className="text-[11px] font-[Poppins]">Rápido</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-1.5 text-white/70">
            <Star className="w-4 h-4 fill-white/70" />
            <span className="text-[11px] font-[Poppins]">Confiável</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

