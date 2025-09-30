import { Button } from '../components/ui/button'
import { Input } from "../components/ui/input"
import bolalaranjaCadastro from '../assets/bolalaranjaCadastro.png'
import bolavermelhaCadastro from '../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../assets/muiemexendonoscompuiter.png'
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function CadastroDeEndereco() {
  const [cep, setCep] = useState("")
  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [carregandoCep, setCarregandoCep] = useState(false)

  const navigate = useNavigate()

  // Função para buscar CEP na API ViaCEP
  const buscarCep = async (cepValue: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cepValue.replace(/\D/g, '')
    
    // Valida se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return
    }

    setCarregandoCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro na requisição')
      }

      const data = await response.json()

      if (data.erro) {
        alert('CEP não encontrado!')
        setCarregandoCep(false)
        return
      }

      // Preenche os campos automaticamente
      setRua(data.logradouro || "")
      setBairro(data.bairro || "")
      setCidade(data.localidade || "")
      setEstado(data.uf || "")
      setComplemento(data.complemento || "")

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setCarregandoCep(false)
    }
  }

  // Função para formatar CEP com máscara
  const formatarCep = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    }
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
  }

  // Handler para mudança do CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const cepFormatado = formatarCep(valor)
    setCep(cepFormatado)

    // Busca automaticamente quando completar 8 dígitos
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length === 8) {
      buscarCep(apenasNumeros)
    }
  }

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validações
    if (!cep.trim() || !rua.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Salva os dados (opcional - localStorage, context, etc)
    const enderecoData = {
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado
    }
    
    console.log('Dados do endereço:', enderecoData)

    // Redireciona para a tela de login
    try {
      navigate("/login")
    } catch (error) {
      console.error('Erro ao navegar:', error)
      // Tente outras rotas possíveis
      // navigate("/") ou navigate("/home")
    }
  }

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col'>
      <div className='bg-[#FFFF] relative min-h-screen'>
        {/* Imagens decorativas */}
        <img 
          src={bolalaranjaCadastro} 
          alt="bola laranja" 
          className="absolute top-0 right-0 w-40 sm:w-52 md:w-94 max-w-full" 
        />
        <img 
          src={bolavermelhaCadastro} 
          alt="bola vermelha" 
          className="absolute top-36 left-0 w-16 sm:w-28 md:w-66 max-w-full" 
        />

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
          <form 
            className="w-full max-w-md space-y-4 mt-4 px-2 sm:px-4"
            onSubmit={handleNextStep}
          >
            <div className="relative">
              <Input 
                type='text'
                placeholder="CEP *" 
                value={cep} 
                onChange={handleCepChange}
                maxLength={9}
                disabled={carregandoCep}
                required
                className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"
              />
              {carregandoCep && (
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500 text-sm">
                  Buscando...
                </span>
              )}
            </div>
            
            <Input 
              type='text'
              placeholder="Rua *" 
              value={rua} 
              onChange={(e) => setRua(e.target.value)} 
              required
              className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"
            />
            
            <Input 
              type='text'
              placeholder="Número *" 
              value={numero} 
              onChange={(e) => setNumero(e.target.value)} 
              required
              className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"
            />
            
            <Input 
              type='text'
              placeholder="Complemento" 
              value={complemento} 
              onChange={(e) => setComplemento(e.target.value)} 
              className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"
            />
            
            <Input 
              type='text'
              placeholder="Bairro *" 
              value={bairro} 
              onChange={(e) => setBairro(e.target.value)} 
              required
              className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"
            />
            
            <Input 
              type='text'
              placeholder="Cidade *" 
              value={cidade} 
              onChange={(e) => setCidade(e.target.value)} 
              required
              className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]"
            />
            
            <Input 
              type='text'
              placeholder="Estado *" 
              value={estado} 
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              maxLength={2}
              required
              className="h-[48px] sm:h-[59px] bg-white rounded-[5px] text-[20px] sm:text-[32px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[22px]" 
            />
            
            <Button 
              type="submit"
              disabled={carregandoCep}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
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
