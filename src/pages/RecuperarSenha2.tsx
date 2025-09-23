import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importação do useNavigate

function RecuperarSenha2() {
  const [code, setCode] = useState(["", "", "", ""]);
  const navigate = useNavigate(); // Hook para navegação

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Limita a entrada a um único caractere
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move o foco para o próximo input
    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = () => {
    // Aqui você pode adicionar validações, como verificar se todos os campos estão preenchidos
    if (code.some((digit) => digit === "")) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Navega para a próxima tela
    navigate("/recuperar-senha-final"); // Substitua "/nova-tela" pela rota desejada
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
          {/* Logo dentro do card, centralizada */}
          <img
            src={LogoDeRecuperarSenha}
            alt="logo recuperar"
            className="w-70 h-90 mb-3"
          />

          <h2 className="text-3xl font-bold mb-1 text-center">
            Confirme seu número
          </h2>
          <p className="text-1xl text-center mb-0">
            Código enviado para: 11 9 1234-5678
          </p>

          <div className="flex gap-4 mt-4">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl mt-5 font-bold border-2 
                            border-gray-300 rounded-lg 
                            focus:outline-none focus:border-[#F9A01B]"
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit} // Adiciona a navegação ao botão
            className="bg-[#25992E] text-white w-[200px] h-[50px] px-6 py-2 
                        rounded-full text-lg font-bold hover:bg-[#4D8832] mt-6"
          >
            Entrar
          </Button>

          <p className="text-sm mt-4">
            Não recebeu código? <span className=" font-bold text-green-500 
                                                    text-1xl  cursor-pointer">  
            Enviar novamente</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha2;