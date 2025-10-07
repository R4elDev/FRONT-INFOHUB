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
    <div className='bg-[#F9A01B] relative min-h-screen overflow-hidden'>
      {/* Elementos decorativos com animação 3D */}
      <img 
        src={bolaLaranjaBaixo} 
        alt="bola laranja" 
        className='absolute bottom-0 right-0 transition-all duration-1000 ease-in-out 
                    transform hover:scale-110 hover:rotate-12 hover:translate-x-2 hover:translate-y-2 animate-float'
        style={{
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
        }}
      />
      <img 
        src={bolaLaranjaCima} 
        alt="bola laranja" 
        className='absolute top-0 left-0 transition-all duration-1000 ease-in-out 
                  transform hover:scale-110 hover:rotate-[-12deg] hover:translate-x-[-2px] hover:translate-y-[-2px] animate-float-reverse'
        style={{
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
        }}
      />
      
      <div className='flex flex-col items-center justify-center h-screen gap-4 sm:gap-6 md:gap-8 relative z-10 px-4'>
        {/* Logo container com efeito 3D */}
        <div 
          className='flex items-center justify-center bg-white w-[250px] h-[250px] sm:w-[350px] sm:h-[320px] md:w-[400px] md:h-[370px] rounded-full 
                      transition-all duration-700 ease-out transform cursor-pointer group logo-container'
          style={{
            boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)'
          }}
        >
          <img 
            src={imgLogo} 
            alt="Logo InfoHub" 
            className='w-[180px] h-[180px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3'
            style={{
              filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))'
            }}
          />  
        </div>
        
        {/* Barra de progresso com animação */}
        <div 
          className='w-[180px] sm:w-[220px] md:w-[252px] h-[8px] md:h-[10px] bg-[#25992E] rounded-full transition-all 
                      duration-500 hover:scale-110 hover:h-[10px] md:hover:h-[12px] cursor-pointer progress-bar'
          style={{
            boxShadow: '0 5px 15px rgba(37, 153, 46, 0.4)',
            background: 'linear-gradient(90deg, #25992E 0%, #2EBF37 100%)'
          }}
        ></div>
        
        {/* Texto principal com efeito 3D */}
        <div className='transition-all duration-500 hover:scale-105 cursor-default px-4'>
          <h1 className='text-[24px] sm:text-[30px] md:text-[36px] font-semibold text-center font-[Poppins] text-white transition-all duration-300 text-shadow-lg'>
            FAZER COMPRAS PODE SER SIMPLES
          </h1>
          <p className='text-[16px] sm:text-[20px] md:text-[24px] text-center font-[Poppins] text-white transition-all duration-300 text-shadow-md'>
            Lugar para fazer compras rapidamente
          </p>
        </div>

        {/* Botão LOGIN com efeito 3D avançado */}
        <Button 
            onClick={() => navigate('/login')}
            className='w-[280px] sm:w-[350px] md:w-[410px] h-[70px] sm:h-[80px] md:h-[92px] bg-[#25992E] rounded-[66px] text-white text-[24px] sm:text-[30px] md:text-[36px] font-bold font-[Poppins] transition-all 
                                  duration-300 ease-out transform hover:translate-y-[-4px] active:scale-95 active:translate-y-0 cursor-pointer 
                                  group relative overflow-hidden button-3d'
            style={{
              boxShadow: '0 15px 30px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.2)',
              border: '2px solid rgba(37, 153, 46, 0.6)'
            }}
          >
            <span className='relative z-10 transition-all duration-300 group-hover:text-shadow-sm'>LOGIN</span>
            
          </Button>
        
        {/* Botão CADASTRE-SE com efeito 3D avançado */}
        <Button 
          onClick={() => navigate('/cadastro')}
          className='w-[280px] sm:w-[350px] md:w-[410px] h-[70px] sm:h-[80px] md:h-[92px] bg-white rounded-[66px] text-[#25992E] text-[24px] sm:text-[30px] md:text-[36px] font-bold font-[Poppins] transition-all 
                                duration-300 ease-out transform hover:translate-y-[-4px] active:scale-95 active:translate-y-0 cursor-pointer 
                                group relative overflow-hidden button-3d-white'
          style={{
            boxShadow: '0 15px 30px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
            border: '2px solid rgba(37, 153, 46, 0.3)'
          }}
        >
          <span className='relative z-10 transition-all duration-300 group-hover:text-shadow-sm'>CADASTRE-SE</span>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-[#25992E] to-transparent 
                          opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform -skew-x-12'></div>
        </Button>

        <p className='text-[16px] sm:text-[20px] md:text-[24px] text-center font-[Poppins] text-white transition-all duration-300 hover:scale-105 cursor-default text-shadow-md'>
          ou entre com
        </p>
        {/* Logos sociais com efeito 3D */}
        <div className='flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-10'>
          <div 
            className='transition-all duration-300 ease-out transform cursor-pointer social-icon'
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }}
          >
            <img 
              src={imgGoogleLogo} 
              alt="Google logo" 
              className='w-[45px] h-[50px] sm:w-[55px] sm:h-[60px] md:w-[61px] md:h-[67px] object-contain transition-all duration-300'
            />
          </div>
          <div 
            className='transition-all duration-300 ease-out transform cursor-pointer social-icon'
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }}
          >
            <img 
              src={imgAppleLogo} 
              alt="Apple logo" 
              className='w-[44px] h-[50px] sm:w-[54px] sm:h-[60px] md:w-[60px] md:h-[67px] object-contain transition-all duration-300'
            /> 
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home