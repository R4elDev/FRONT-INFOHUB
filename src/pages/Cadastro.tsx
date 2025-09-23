import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

function Cadastro() {
  const navigate = useNavigate()

  return (
    <div className='bg-[#F9A01B] relative min-h-screen'>
      <div className='flex flex-col items-center justify-center h-screen gap-6'>
        <h1 className='text-[48px] font-semibold text-center font-[Poppins] text-white mb-8'>Cadastro</h1>
        
        {/* Aqui você pode adicionar seus campos de formulário */}
        
        <Button 
          onClick={() => navigate('/')}
          className='w-[410px] h-[92px] bg-[#25992E] rounded-[66px] text-white text-[36px] font-[Poppins] mt-6'
        >
          Voltar
        </Button>
      </div>
    </div>
  )
}

export default Cadastro