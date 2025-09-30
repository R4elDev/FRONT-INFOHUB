import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png";
import iconEmail from "../assets/iconEmail.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarCodigoRecuperacao } from "../services/requests";

function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Função que chama a API para solicitar código
  async function handleNextStep() {
    setErrorMsg(null);

    if (!email) {
      setErrorMsg("Preencha o campo email");
      return;
    }

    // Validação simples de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Por favor, insira um email com formato válido");
      return;
    }

    const payload = { email };

    try {
      setLoading(true);
      
      await solicitarCodigoRecuperacao(payload); // 👉 Chamada da API aqui
      
      // Se chegou até aqui, deu certo
      navigate("/recuperar-senha2", { state: { email } });
      
    } catch (err: any) {
      console.error("Erro ao solicitar código:", err);
      if (err.response?.status === 404) {
        setErrorMsg("Email não encontrado");
      } else if (err.response?.status >= 500) {
        setErrorMsg("Erro no servidor. Tente novamente mais tarde");
      } else {
        setErrorMsg("Erro ao enviar código de recuperação");
      }
    } finally {
      setLoading(false);
    }
  }

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

        <div className="bg-white w-[600px] h-[800px] 
                        p-6 rounded-4xl shadow-lg flex flex-col items-center">
          <img
            src={LogoDeRecuperarSenha}
            alt="logo recuperar"
            className="w-70 h-90 mb-3"
          />

          <h2 className="text-3xl font-bold mb-1 text-center">
            Recuperar Senha
          </h2>
          <p className="text-1xl text-center mb-4">
            Preencha o campo abaixo com o seu email
          </p>

          {/* Mensagem de erro */}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 
                            px-4 py-3 rounded mb-4 w-[400px] text-center text-sm">
              {errorMsg}
            </div>
          )}

          <div className="relative w-[400px]">
            <img
              src={iconEmail}
              alt="icon email"
              className="absolute left-3 top-1/2 transform  w-6 h-6 text-gray-400 z-10"
            />

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-[55px] bg-gray rounded-[36px] text-[16px] px-10 
                         placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1] mt-7"
            />
          </div>

          <Button
            onClick={handleNextStep} // 👉 chama a API
            disabled={loading}
            className="mt-10 bg-[#25992E] w-[200px] h-[50px] 
            text-white px-10 py-2 rounded-full text-lg font-bold hover:bg-[#4D8832]
            disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Avançar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;