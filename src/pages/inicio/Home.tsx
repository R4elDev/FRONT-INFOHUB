import imgLogo from '../../assets/infohub-logo.png'
import imgGoogleLogo from '../../assets/google-logo.png'
import imgAppleLogo from '../../assets/apple-logo.png'
import bolaLaranjaCima from '../../assets/bolaLaranjaCima.png'
import bolaLaranjaBaixo from '../../assets/bolaLaranja.png'
import { Button } from '../../components/ui/button'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className='bg-[#F9A01B] relative min-h-screen overflow-hidden w-full max-w-full'>
      {/* Elementos decorativos com animação 3D - sem overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src={bolaLaranjaBaixo} 
          alt="bola laranja" 
          className='absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 
                      transition-transform duration-700 ease-out transform-gpu will-change-transform
                      hover:scale-105 animate-float'
          style={{
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
        <img 
          src={bolaLaranjaCima} 
          alt="bola laranja" 
          className='absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 
                      transition-transform duration-700 ease-out transform-gpu will-change-transform
                      hover:scale-105 animate-float-reverse'
          style={{
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
            transform: 'translate3d(0, 0, 0)',
            animationDelay: '1s'
          }}
        />
      </div>
      
      <div className='flex flex-col items-center justify-center h-screen gap-4 sm:gap-6 md:gap-8 relative z-10 px-4 w-full max-w-full overflow-hidden'>
        {/* Logo container com efeito 3D otimizado */}
        <div 
          className='flex items-center justify-center bg-white w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] rounded-full 
                      transition-transform duration-500 ease-out transform-gpu cursor-pointer group will-change-transform'
          style={{
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)'
          }}
        >
          <img 
            src={imgLogo} 
            alt="Logo InfoHub" 
            className='w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[250px] md:h-[250px] object-contain 
                      transition-transform duration-300 transform-gpu will-change-transform group-hover:scale-105'
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
            }}
          />  
        </div>
        
        {/* Barra de progresso otimizada */}
        <div 
          className='w-[180px] sm:w-[220px] md:w-[252px] h-[8px] md:h-[10px] bg-[#25992E] rounded-full 
                      transition-transform duration-300 transform-gpu will-change-transform hover:scale-105'
          style={{
            boxShadow: '0 4px 12px rgba(37, 153, 46, 0.3)',
            background: 'linear-gradient(90deg, #25992E 0%, #2EBF37 100%)'
          }}
        ></div>
        
        {/* Texto principal otimizado */}
        <div className='transition-transform duration-300 transform-gpu will-change-transform hover:scale-102 cursor-default px-4 text-center max-w-full'>
          <h1 className='text-[24px] sm:text-[30px] md:text-[36px] font-semibold text-center font-[Poppins] text-white transition-all duration-300 text-shadow-lg'>
            FAZER COMPRAS PODE SER SIMPLES
          </h1>
          <p className='text-[16px] sm:text-[20px] md:text-[24px] text-center font-[Poppins] text-white transition-all duration-300 text-shadow-md'>
            Lugar para fazer compras rapidamente
          </p>
        </div>

        {/* Botão LOGIN otimizado */}
        <Button 
            onClick={() => navigate('/login')}
            className='w-[280px] sm:w-[320px] md:w-[360px] h-[60px] sm:h-[70px] md:h-[80px] bg-[#25992E] rounded-[50px] text-white text-[20px] sm:text-[24px] md:text-[28px] font-bold font-[Poppins] 
                      transition-all duration-200 ease-out transform-gpu will-change-transform 
                      hover:translate-y-[-2px] hover:scale-105 active:scale-95 active:translate-y-0 cursor-pointer group relative'
            style={{
              boxShadow: '0 8px 20px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <span className='relative z-10 transition-all duration-300 group-hover:text-shadow-sm'>LOGIN</span>
            
          </Button>
        
        {/* Botão CADASTRE-SE otimizado */}
        <Button 
          onClick={() => navigate('/cadastro')}
          className='w-[280px] sm:w-[320px] md:w-[360px] h-[60px] sm:h-[70px] md:h-[80px] bg-white rounded-[50px] text-[#25992E] text-[20px] sm:text-[24px] md:text-[28px] font-bold font-[Poppins] 
                    transition-all duration-200 ease-out transform-gpu will-change-transform 
                    hover:translate-y-[-2px] hover:scale-105 active:scale-95 active:translate-y-0 cursor-pointer group relative'
          style={{
            boxShadow: '0 8px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid rgba(37, 153, 46, 0.2)'
          }}
        >
          <span className='relative z-10 transition-all duration-300 group-hover:text-shadow-sm'>CADASTRE-SE</span>
        </Button>

        <p className='text-[16px] sm:text-[18px] md:text-[20px] text-center font-[Poppins] text-white transition-transform duration-200 transform-gpu will-change-transform hover:scale-102 cursor-default'>
          ou entre com
        </p>
        {/* Logos sociais otimizadas */}
        <div className='flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-10 max-w-full overflow-hidden'>
          <div 
            className='transition-transform duration-200 ease-out transform-gpu will-change-transform cursor-pointer hover:scale-110'
            style={{
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
            }}
          >
            <img 
              src={imgGoogleLogo} 
              alt="Google logo" 
              className='w-[40px] h-[45px] sm:w-[50px] sm:h-[55px] md:w-[55px] md:h-[60px] object-contain'
            />
          </div>
          <div 
            className='transition-transform duration-200 ease-out transform-gpu will-change-transform cursor-pointer hover:scale-110'
            style={{
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
            }}
          >
            <img 
              src={imgAppleLogo} 
              alt="Apple logo" 
              className='w-[40px] h-[45px] sm:w-[50px] sm:h-[55px] md:w-[55px] md:h-[60px] object-contain'
            /> 
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
