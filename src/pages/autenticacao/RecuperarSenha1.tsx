import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import bolaVermelhaBrancaDireta from "../../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../../assets/LogoDeRecuperarSenha.png";
import iconEmail from "../../assets/iconEmail.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarCodigoRecuperacao } from "../../services/requests";

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
          className="absolute top-0 right-0 w-24 sm:w-32 md:w-auto"
        />

        <img
          src={bolaVermelhaBrancaEsquerda}
          alt="bola vermelha"
          className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-auto"
        />

        <div className="bg-white w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] min-h-[600px] sm:min-h-[700px] md:h-[800px] 
                        p-4 sm:p-6 rounded-3xl md:rounded-4xl shadow-lg flex flex-col items-center">
          <img
            src={LogoDeRecuperarSenha}
            alt="logo recuperar"
            className="w-48 h-56 sm:w-56 sm:h-64 md:w-70 md:h-90 mb-3 object-contain"
          />

          <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center">
            Recuperar Senha
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-center mb-4">
            Preencha o campo abaixo com o seu email
          </p>

          {/* Mensagem de erro */}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 
                            px-4 py-3 rounded mb-4 w-full max-w-[350px] sm:max-w-[400px] text-center text-sm">
              {errorMsg}
            </div>
          )}

          <div className="relative w-full max-w-[350px] sm:max-w-[400px]">
            <img
              src={iconEmail}
              alt="icon email"
              className="absolute left-3 top-1/2 transform -translate-y-1/15 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 z-10"
            />

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-[50px] sm:h-[55px] bg-gray rounded-[36px] text-[14px] sm:text-[16px] px-10 
                         placeholder:text-[16px] sm:placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1] mt-6 sm:mt-7"
            />
          </div>

          <Button
            onClick={handleNextStep}
            disabled={loading}
            className="mt-8 sm:mt-10 bg-[#25992E] w-[180px] sm:w-[200px] h-[45px] sm:h-[50px] 
            text-white px-8 sm:px-10 py-2 rounded-full text-base sm:text-lg font-bold hover:bg-[#4D8832]
            disabled:opacity-50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {loading ? "Enviando..." : "Avançar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
