import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validarCodigo, solicitarCodigoRecuperacao } from "../services/requests";

function RecuperarSenha2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [reenvioLoading, setReenvioLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
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
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verificar se todos os campos estão preenchidos
    if (code.some((digit) => digit === "")) {
      setErrorMsg("Por favor, preencha todos os campos");
      return;
    }

    // Verificar se temos o email
    if (!email) {
      setErrorMsg("Email não encontrado. Reinicie o processo de recuperação.");
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
        setSuccessMsg("Código validado com sucesso!");
        
        // Aguardar um pouco para mostrar a mensagem de sucesso
        setTimeout(() => {
          navigate("/recuperar-senha-final", { 
            state: { 
              email, 
              codigo: codigoCompleto 
            } 
          });
        }, 1500);
      } else {
        setErrorMsg(response?.message || "Código inválido ou expirado");
      }
      
    } catch (err: any) {
      console.error("Erro ao validar código:", err);
      console.error("Resposta do erro:", err.response?.data);
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          setErrorMsg(data?.message || "Código inválido ou expirado");
        } else if (status === 404) {
          setErrorMsg("Endpoint não encontrado. Verifique a configuração da API");
        } else if (status >= 500) {
          setErrorMsg("Erro no servidor. Tente novamente mais tarde");
        } else {
          setErrorMsg(data?.message || `Erro HTTP ${status}`);
        }
      } else if (err.request) {
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente");
      } else {
        setErrorMsg("Erro inesperado ao validar código");
      }
    } finally {
      setLoading(false);
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
        // Limpar os campos de código
        setCode(["", "", "", ""]);
        
        // Focar no primeiro input
        setTimeout(() => {
          const firstInput = document.getElementById(`code-input-0`);
          firstInput?.focus();
        }, 100);
        
        setSuccessMsg("Novo código enviado para seu email!");
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

        <div className="bg-white w-[600px] h-[800px] p-6 rounded-4xl shadow-lg flex flex-col items-center">
          <img
            src={LogoDeRecuperarSenha}
            alt="logo recuperar"
            className="w-70 h-90 mb-3"
          />

          <h2 className="text-3xl font-bold mb-1 text-center">
            Confirme seu código
          </h2>
          <p className="text-1xl text-center mb-4">
            Código enviado para: {email ? mascarEmail(email) : ""}
          </p>

          {/* Mensagem de erro */}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-[400px] text-center text-sm">
              {errorMsg}
            </div>
          )}

          {/* Mensagem de sucesso */}
          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 w-[400px] text-center text-sm">
              {successMsg}
            </div>
          )}

          <div className="flex gap-4 mt-4">
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
                className="w-12 h-12 text-center text-xl mt-5 font-bold border-2
                          border-gray-300 rounded-lg
                          focus:outline-none focus:border-[#F9A01B]
                          disabled:opacity-50"
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || code.some((digit) => digit === "")}
            className="bg-[#25992E] text-white w-[200px] h-[50px] px-6 py-2
                      rounded-full text-lg font-bold hover:bg-[#4D8832] mt-6
                      disabled:opacity-50"
          >
            {loading ? "Validando..." : "Continuar"}
          </Button>

          <p className="text-sm mt-4">
            Não recebeu código?{" "}
            <span 
              className="font-bold text-green-500 text-1xl cursor-pointer hover:text-green-600"
              onClick={handleReenviarCodigo}
            >
              {reenvioLoading ? "Enviando..." : "Enviar novamente"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha2;