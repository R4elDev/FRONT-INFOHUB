import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png";
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png";
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importação do useNavigate

function RecuperarSenhaFinal() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const navigate = useNavigate(); // Hook para navegação

  const handleNextStep = () => {
    // Validações
    if (novaSenha.trim() === "" || confirmarSenha.trim() === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem. Por favor, tente novamente.");
      return;
    }

    // Redireciona para a tela de login
    navigate("/login"); // Substitua "/login" pela rota correta
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

          <h2 className="text-3xl font-bold mb-1 text-left w-[400px]">Criar nova senha</h2>
          <p className="text-1xl text-left w-[400px] mb-4">Preencha o campo abaixo com a nova senha:</p>

          <div className="relative w-[400px] mb-6">
            <Input
              type="password"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="h-[40px] bg-gray rounded-[36px] text-[16px] px-10 
                         placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1]"
            />
          </div>

          <h2 className="text-3xl font-bold mb-1 text-left w-[400px]">Confirmar nova senha</h2>
          <p className="text-1xl text-left w-[400px] mb-4">Confirme sua nova senha:</p>

          <div className="relative w-[400px] mb-6">
            <Input
              type="password"
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="h-[40px] bg-gray rounded-[36px] text-[16px] px-10 
                         placeholder:text-[20px] placeholder:text-gray-20 font-[Poppins]
                         border-2 border-[#b2b1b1]"
            />
          </div>

          <Button
            onClick={handleNextStep}
            className="mt-5 bg-[#25992E] w-[200px] h-[50px] 
                       text-white px-10 py-2 rounded-full text-lg font-bold hover:bg-[#4D8832]"
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

export default RecuperarSenhaFinal;