import imgLogo from '../assets/infohub-logo.png'
import imgGoogleLogo from '../assets/google-logo.png'
import imgAppleLogo from '../assets/apple-logo.png'
import bolaLaranjaCima from '../assets/bolaLaranjaCima.png'
import bolaLaranjaBaixo from '../assets/bolaLaranja.png'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className='bg-[#F9A01B] relative min-h-screen'>
      <img src={bolaLaranjaBaixo} alt="bola laranja" className='absolute bottom-0 right-0' />
      <img src={bolaLaranjaCima} alt="bola laranja" className='absolute top-0 left-0' />
      <div className='flex flex-col items-center justify-center h-screen gap-10'>
        <div className='flex items-center justify-center bg-white w-[400px] h-[370px] rounded-[400px]'>
          <img src={imgLogo} alt="Logo InfoHub" className='w-[300px] h-[300px] object-contain' />  
        </div>
        <div className='w-[252px] h-[10px] bg-[#25992E] rounded-full'></div>
        <div>
          <h1 className='text-[36px] font-semibold text-center font-[Poppins] text-white'>FAZER COMPRAS PODE SER SIMPLES</h1>
          <p className='text-[24px] text-center font-[Poppins] text-white'>lugar para fazer compras rapidamente</p>
        </div>

        <Button 
          onClick={() => navigate('/login')}
          className='w-[410px] h-[92px] bg-[#25992E] rounded-[66px] text-white text-[36px] font-[Poppins]'
        >
          LOGIN
        </Button>
        <Button                 
          onClick={() => navigate('/cadastro')}
          className='w-[410px] h-[92px] bg-white rounded-[66px] text-[#25992E] text-[36px] font-bold font-[Poppins]'
        >
          CADASTRE-SE
        </Button>

        <p className='text-[24px] text-center font-[Poppins] text-white'>ou entre com</p>

        <div className='flex items-center justify-center space-x-10'>
          <img src={imgGoogleLogo} alt="Google logo" className='w-[61px] h-[67px] object-contain cursor-pointer' />
          <img src={imgAppleLogo} alt="Apple logo" className='w-[60px] h-[67px] object-contain cursor-pointer' /> 
        </div>
      </div>
    </div>
  )
}

export default Home