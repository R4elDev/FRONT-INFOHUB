import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png";
import iconTelefone from "../assets/iconDeTelefone.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importação do useNavigate

function RecuperarSenha() {
  const [telefone, setTelefone] = useState("");
  const navigate = useNavigate(); // Hook para navegação

  const handleNextStep = () => {
    // Lógica para validar o telefone (opcional)
    if (telefone.trim() === "") {
      alert("Por favor, insira um número de telefone válido.");
      return;
    }

    // Redireciona para a próxima tela
    navigate("/recuperar-senha2"); // Substitua "/proxima-tela" pela rota correta
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
            Recuperar Senha
          </h2>
          <p className="text-1xl text-center">
            Preencha o campo abaixo com o seu telefone
          </p>

          <div className="relative w-[400px]">
            <img
              src={iconTelefone}
              alt="icon telefone"
              className="absolute left-3 bottom-0.25 transform -translate-y-1/2 w-6 h-5 text-gray-400"
            />

            <Input
              type="tel"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="h-[40px] bg-gray rounded-[36px] text-[16px] px-10 
                         placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1] mt-7 left-3"
            />
          </div>

          {/* Botão para avançar */}
          <Button
            onClick={handleNextStep}
            className="mt-10 bg-[#25992E] w-[200px] h-[50px] 
            text-white px-10 py-2 rounded-full text-lg font-bold hover:bg-[#4D8832]"
          >
            Avançar
          </Button>



        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;