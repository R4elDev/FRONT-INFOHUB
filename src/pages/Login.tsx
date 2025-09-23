import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolalaranjacombranconomeioGrande from "../assets/bolalaranjacombranconomeioGrande.png";
import bolalaranjacombranconomeioPequena from "../assets/bolalaranjacombranconomeioPequena.png";
import homifazendocompra from "../assets/homifazendocompra.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../services/requests"; // função que chama a API

function Login() {
  const navigate = useNavigate();
  const [showsenha, setShowsenha] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setsenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Função que chama a API de login
  async function handleLogin() {
    setErrorMsg(null);

    if (!email || !senha) {
      setErrorMsg("Preencha todos os campos");
      return;
    }

    const payload = { email, senha }; // tipo loginRequest

    try {
      setLoading(true);
      const res = await login(payload); // 👉 Chamada da API aqui

      if (res.status) {
        // Salva token
        localStorage.setItem("auth_token", res.token);
        // Redireciona para dashboard ou home
        navigate("/dashboard");
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
      <div className="h-[45vh] bg-white relative flex items-center justify-center">
        <img
          src={bolalaranjacombranconomeioGrande}
          alt="bola laranja"
          className="absolute top-0 right-0"
        />
        <img
          src={bolalaranjacombranconomeioPequena}
          alt="bola laranja"
          className="absolute top-36 left-0"
        />
        <img
          src={homifazendocompra}
          alt="homem fazendo compra"
          className="w-auto h-[80%] object-contain"
        />
      </div>

      <div className="flex-1 bg-[#F9A01B] flex flex-col items-center justify-center px-4">
        <h1 className="text-[40px] font-semibold text-center font-[Poppins] text-black">
          Bem vindo de volta!
        </h1>

        <div className="flex flex-col gap-4 w-full max-w-[821px] mt-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[98px] bg-white rounded-[46px] text-[32px] px-6 placeholder:text-[32px] placeholder:text-gray-400 font-[Poppins]"
          />

          <div className="relative w-full">
            <Input
              type={showsenha ? "text" : "senha"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setsenha(e.target.value)}
              className="h-[98px] bg-white rounded-[46px] text-[32px] px-6 placeholder:text-[32px] placeholder:text-gray-400 font-[Poppins]"
            />
            <button
              type="button"
              onClick={() => setShowsenha(!showsenha)}
              className="absolute right-6 top-1/2 transform -translate-y-1/2"
            >
              {showsenha ? (
                <EyeOff className="h-8 w-8 text-gray-400" />
              ) : (
                <Eye className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>

          <div className="w-full flex justify-end">
            <p className="text-[24px] font-[Poppins] text-black cursor-pointer hover:text-[#25992E] transition-colors">
              Recuperar senha
            </p>
          </div>

          {/* Mensagem de erro */}
          {errorMsg && (
            <p className="text-red-500 text-[20px] mt-2 text-center">{errorMsg}</p>
          )}
        </div>

        <div className="flex justify-center w-full mt-8">
          <Button
            onClick={handleLogin} // 👉 chama a API
            disabled={loading}
            className="w-[410px] h-[92px] bg-[#25992E] rounded-[66px] text-white text-[36px] font-[Poppins] font-medium hover:bg-[#1e7725] transition-colors"
          >
            {loading ? "Entrando..." : "LOGIN"}
          </Button>
        </div>

        <div
          className="flex flex-row items-center justify-center mt-4 space-x-2 cursor-pointer"
          onClick={() => navigate("/cadastro")}
        >
          <p className="text-[24px] text-center font-[Poppins] text-black">
            Não tem uma conta?
          </p>
          <p className="text-[24px] text-[#25992E] text-center font-[Poppins] font-semibold">
            Cadastre-se aqui
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;