import { Button } from '../components/ui/button'
import { Input } from "../components/ui/input"
import bolalaranjaCadastro from '../assets/bolalaranjaCadastro.png'
import bolavermelhaCadastro from '../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../assets/muiemexendonoscompuiter.png'
import { useState } from "react"
import { useNavigate } from "react-router-dom";

function CadastroDeEndereco (){
  const [cep, setCep] = useState("")
  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")

  const navigate = useNavigate(); // Hook para navegação

  const handleNextStep = () => {
    // Validações
    if (cep.trim() === "" || rua.trim() === "" || numero.trim() === "" || bairro.trim() === "" || cidade.trim() === "" || estado.trim() === "" ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }


    // Redireciona para a tela de login
    navigate("/login"); // Substitua "/login" pela rota correta
  };

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col'>
      <div className='bg-[#FFFF] relative min-h-screen'>
        {/* Imagens decorativas */}
        <img src={bolalaranjaCadastro} alt="bola laranja" className="absolute top-0 right-0 w-40 sm:w-52 md:w-94 max-w-full" />
        <img src={bolavermelhaCadastro} alt="bola vermelha" className="absolute top-36 left-0 w-16 sm:w-28 md:w-66 max-w-full" />

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <img
            src={muiemexendonoscompuiter}
            alt="mulher mexendo no computador"
            className="w-40 sm:w-56 md:w-72 lg:w-80 h-auto object-contain mb-4"
          />

          {/* Área de título/especificação */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <div className="px-6 py-2 rounded-full text-sm font-medium text-white bg-orange-500 shadow-md">
              Cadastro de Endereço
            </div>
          </div>

          {/* Formulário de Endereço */}
          <form className="w-full max-w-md space-y-4 mt-4 px-2 sm:px-4">
            <Input 
            type='cep'
            placeholder="CEP *" 
            value={cep} 
            onChange={e => setCep(e.target.value)} 
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"/>
            
            <Input 
            type='rua'
            placeholder="Rua *" 
            value={rua} 
            onChange={e => setRua(e.target.value)} 
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"/>
            
            <Input 
            type='numero'
            placeholder="Número *" 
            value={numero} 
            onChange={e => setNumero(e.target.value)} 
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"/>
            
            <Input 
            type='complemento'
            placeholder="Complemento *" 
            value={complemento} 
            onChange={e => setComplemento(e.target.value)} 
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"/>
            
            <Input 
            type='bairro'
            placeholder="Bairro *" 
            value={bairro} 
            onChange={e => setBairro(e.target.value)} 
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"/>
            
            <Input 
            type='cidade'
            placeholder="Cidade *" 
            value={cidade} 
            onChange={e => setCidade(e.target.value)} 
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"/>
            
            <Input 
            type='estado'
            placeholder="Estado *" 
            value={estado} 
            onChange={e => setEstado(e.target.value)}
            className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]" />
            
            <Button 
              type="button" 
              onClick={handleNextStep}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Cadastrar Endereço
            </Button>
            
          </form>
        </div>
      </div>
    </div>
  )
}

export default CadastroDeEndereco