import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolalaranjacombranconomeioGrande from "../assets/bolalaranjacombranconomeioGrande.png";
import bolalaranjacombranconomeioPequena from "../assets/bolalaranjacombranconomeioPequena.png";
import homifazendocompra from "../assets/homifazendocompra.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../services/requests";

function Login() {
  const navigate = useNavigate();
  const [showsenha, setShowsenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setsenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin() {
    setErrorMsg(null);

    if (!email || !senha) {
      setErrorMsg("Preencha todos os campos");
      return;
    }

    const payload = { email, senha };

    try {
      setLoading(true);
      const res = await login(payload);

      if (res.status) {
        localStorage.setItem("auth_token", res.token);
        navigate("/HomeInicial");
      } else {
        setErrorMsg("E-mail ou senha incorretos");
      }
    } catch (err: any) {
      setErrorMsg("Erro ao conectar com a API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* TOPO COM IMAGENS */}
      <div className="h-[30vh] sm:h-[35vh] md:h-[45vh] bg-white relative flex items-center justify-center overflow-hidden">
        <img
          src={bolalaranjacombranconomeioGrande}
          alt="bola laranja grande"
          className="absolute top-0 right-0 w-24 sm:w-32 md:w-auto animate-float-slow"
        />
        <img
          src={bolalaranjacombranconomeioPequena}
          alt="bola laranja pequena"
          className="absolute top-20 sm:top-28 md:top-36 left-0 w-16 sm:w-20 md:w-auto animate-float-fast"
        />
        <img
          src={homifazendocompra}
          alt="homem fazendo compra"
          className="w-auto h-[70%] sm:h-[75%] md:h-[80%] object-contain animate-zoom-in"
        />
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 bg-[#F9A01B] flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-center font-[Poppins] text-black animate-slide-up">
          Bem vindo de volta!
        </h1>

        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[821px] mt-4 sm:mt-6 animate-fade-in">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[70px] sm:h-[85px] md:h-[98px] bg-white rounded-[46px] text-[20px] sm:text-[26px] md:text-[32px] px-4 sm:px-6 placeholder:text-[20px] sm:placeholder:text-[26px] md:placeholder:text-[32px] placeholder:text-gray-400 font-[Poppins]
                       focus:ring-4 focus:ring-[#25992E] shadow-md transition-all duration-300 hover:scale-[1.02]"
          />

          <div className="relative w-full">
            <Input
              type={showsenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setsenha(e.target.value)}
              className="h-[70px] sm:h-[85px] md:h-[98px] bg-white rounded-[46px] text-[20px] sm:text-[26px] md:text-[32px] px-4 sm:px-6 placeholder:text-[20px] sm:placeholder:text-[26px] md:placeholder:text-[32px] placeholder:text-gray-400 font-[Poppins]
                         focus:ring-4 focus:ring-[#25992E] shadow-md transition-all duration-300 hover:scale-[1.02]"
            />
            <button
              type="button"
              onClick={() => setShowsenha(!showsenha)}
              className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#25992E] transition-colors"
            >
              {showsenha ? (
                <EyeOff className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              ) : (
                <Eye className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              )}
            </button>
          </div>

          <div
            className="w-full flex justify-end"
            onClick={() => navigate("/recuperar-senha")}
          >
            <p className="text-[16px] sm:text-[20px] md:text-[24px] font-[Poppins] text-black cursor-pointer hover:text-[#25992E] transition-colors">
              Recuperar senha
            </p>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-[14px] sm:text-[18px] md:text-[20px] mt-2 text-center font-semibold animate-shake">
              {errorMsg}
            </p>
          )}
        </div>

        <div className="flex justify-center w-full mt-6 sm:mt-8">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="relative w-[280px] sm:w-[350px] md:w-[410px] h-[70px] sm:h-[80px] md:h-[92px] bg-[#25992E] rounded-[66px] text-white text-[24px] sm:text-[30px] md:text-[36px] font-[Poppins] font-bold 
                       hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10">
              {loading ? "Entrando..." : "LOGIN"}
            </span>
            {/* shimmer efeito no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                            opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] 
                            transition-transform duration-700"></div>
          </Button>
        </div>

        <div
          className="flex flex-row items-center justify-center mt-4 sm:mt-6 space-x-2 cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => navigate("/cadastro")}
        >
          <p className="text-[16px] sm:text-[20px] md:text-[24px] text-center font-[Poppins] text-black">
            Não tem uma conta?
          </p>
          <p className="text-[16px] sm:text-[20px] md:text-[24px] text-[#25992E] text-center font-[Poppins] font-semibold hover:underline">
            Cadastre-se aqui
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

