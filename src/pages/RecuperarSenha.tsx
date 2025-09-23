import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import bolaVermelhaBrancaDireta from "../assets/BolaVermelhaBrancaDireta.png"
import bolaVermelhaBrancaEsquerda from "../assets/BolaVermelhaBrancaEsquerda.png"
import LogoDeRecuperarSenha from "../assets/LogoDeRecuperarSenha.png"

function RecuperarSenha (){

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
                    className="w-40 h-50 mb-5"
                    />

                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Recuperar Senha</h2>
                    <p className="text-1xl  mb-1 text-center">
                        Preencha o campo abaixo com o seu telefone</p>
                    
                    {/* Conteúdo adicional (input, botão) */}
                    
                </div>
                
                

            </div>

        </div>
    )
}
export default RecuperarSenha;