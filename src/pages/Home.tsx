import imgLogo from '../assets/infohub-logo.png'
import imgGoogleLogo from '../assets/google-logo.png'
import imgAppleLogo from '../assets/apple-logo.png'
import bolaLaranjaCima from '../assets/bolaLaranjaCima.png'
import bolaLaranjaBaixo from '../assets/bolaLaranja.png'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const customStyles = `
    @keyframes float {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
      }
      50% { 
        transform: translateY(-20px) rotate(5deg); 
      }
    }

    @keyframes shimmer {
      0% { 
        transform: translateX(-100%) skewX(-12deg); 
      }
      100% { 
        transform: translateX(200%) skewX(-12deg); 
      }
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(37, 153, 46, 0.3);
      }
      50% {
        box-shadow: 0 0 40px rgba(37, 153, 46, 0.6);
      }
    }

    @keyframes bounce-in {
      0% {
        transform: scale(0.3) rotate(0deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.05) rotate(5deg);
      }
      70% {
        transform: scale(0.9) rotate(-2deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    @keyframes gradient-shift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    .animate-float-reverse {
      animation: float 6s ease-in-out infinite reverse;
    }

    .animate-shimmer {
      animation: shimmer 1.5s ease-in-out;
    }

    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }

    .animate-bounce-in {
      animation: bounce-in 0.8s ease-out;
    }

    .text-shadow-lg {
      text-shadow: 0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3);
    }

    .text-shadow-md {
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .text-shadow-sm {
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .logo-container {
      animation: bounce-in 0.8s ease-out 0.2s both;
      transform-style: preserve-3d;
      perspective: 1000px;
    }

    .logo-container:hover {
      transform: scale(1.05) rotateY(12deg) rotateX(5deg) !important;
      box-shadow: 0 35px 70px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2) !important;
    }

    .progress-bar:hover {
      animation: pulse-glow 1s ease-in-out;
    }

    .button-3d {
      animation: bounce-in 0.8s ease-out 0.6s both;
    }

    .button-3d:hover {
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 
                  0 10px 25px rgba(0,0,0,0.2) !important;
      transform: scale(1.05) translateY(-4px) rotateX(5deg) !important;
      background: linear-gradient(135deg, #25992E 0%, #2EBF37 100%) !important;
    }

    .button-3d-white {
      animation: bounce-in 0.8s ease-out 0.8s both;
    }

    .button-3d-white:hover {
      box-shadow: 0 25px 50px rgba(255, 255, 255, 0.5), 0 10px 25px rgba(0,0,0,0.3) !important;
      transform: scale(1.05) translateY(-4px) rotateX(5deg) !important;
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%) !important;
    }

    .social-icon {
      animation: bounce-in 0.8s ease-out 1s both;
    }

    .social-icon:nth-child(2) {
      animation: bounce-in 0.8s ease-out 1.2s both;
    }

    .social-icon:hover {
      transform: scale(1.25) rotate(12deg) translateY(-8px) rotateX(15deg) !important;
      filter: drop-shadow(0 15px 30px rgba(0,0,0,0.4)) !important;
    }

    .social-icon:nth-child(2):hover {
      transform: scale(1.25) rotate(-12deg) translateY(-8px) rotateX(15deg) !important;
    }

    .shimmer-effect:hover {
      animation: shimmer 1.5s ease-in-out;
    }

    @media (max-width: 768px) {
      .logo-container:hover {
        transform: scale(1.02) rotateY(6deg) rotateX(2deg) !important;
      }
      
      .button-3d:hover,
      .button-3d-white:hover {
        transform: scale(1.02) translateY(-2px) rotateX(2deg) !important;
      }
      
      .social-icon:hover {
        transform: scale(1.1) rotate(6deg) translateY(-4px) rotateX(8deg) !important;
      }
    }
  `

  return (
    <div className='bg-[#F9A01B] relative min-h-screen overflow-hidden'>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
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
      
      <div className='flex flex-col items-center justify-center h-screen gap-10 relative z-10'>
        {/* Logo container com efeito 3D */}
        <div 
          className='flex items-center justify-center bg-white w-[400px] h-[370px] rounded-[400px] 
                      transition-all duration-700 ease-out transform cursor-pointer group logo-container'
          style={{
            boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)'
          }}
        >
          <img 
            src={imgLogo} 
            alt="Logo InfoHub" 
            className='w-[300px] h-[300px] object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3'
            style={{
              filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))'
            }}
          />  
        </div>
        
        {/* Barra de progresso com animação */}
        <div 
          className='w-[252px] h-[10px] bg-[#25992E] rounded-full transition-all 
                      duration-500 hover:scale-110 hover:h-[12px] cursor-pointer progress-bar'
          style={{
            boxShadow: '0 5px 15px rgba(37, 153, 46, 0.4)',
            background: 'linear-gradient(90deg, #25992E 0%, #2EBF37 100%)'
          }}
        ></div>
        
        {/* Texto principal com efeito 3D */}
        <div className='transition-all duration-500 hover:scale-105 cursor-default'>
          <h1 className='text-[36px] font-semibold text-center font-[Poppins] text-white transition-all duration-300 text-shadow-lg'>
            FAZER COMPRAS PODE SER SIMPLES
          </h1>
          <p className='text-[24px] text-center font-[Poppins] text-white transition-all duration-300 text-shadow-md'>
            Lugar para fazer compras rapidamente
          </p>
        </div>

        {/* Botão LOGIN com efeito 3D avançado */}
        <Button 
            onClick={() => navigate('/login')}
            className='w-[410px] h-[92px] bg-[#25992E] rounded-[66px] text-white text-[36px] font-bold font-[Poppins] transition-all 
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
          className='w-[410px] h-[92px] bg-white rounded-[66px] text-[#25992E] text-[36px] font-bold font-[Poppins] transition-all 
                      duration-300 ease-out transform hover:translate-y-[-4px] active:scale-95 active:translate-y-0 cursor-pointer 
                      group relative overflow-hidden button-3d-white'
          style={{
            boxShadow: '0 15px 30px rgba(255, 255, 255, 0.3), 0 5px 15px rgba(0,0,0,0.2)',
            border: '2px solid rgba(37, 153, 46, 0.2)'
          }}
        >
          <span className='relative z-10 transition-all duration-300 group-hover:text-shadow-sm'>CADASTRE-SE</span>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-[#25992E] to-transparent 
                          opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform -skew-x-12'></div>
        </Button>

        <p className='text-[24px] text-center font-[Poppins] text-white transition-all duration-300 hover:scale-105 cursor-default text-shadow-md'>
          ou entre com
        </p>

        {/* Logos sociais com efeito 3D */}
        <div className='flex items-center justify-center space-x-10'>
          <div 
            className='transition-all duration-300 ease-out transform cursor-pointer social-icon'
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }}
          >
            <img 
              src={imgGoogleLogo} 
              alt="Google logo" 
              className='w-[61px] h-[67px] object-contain transition-all duration-300'
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
              className='w-[60px] h-[67px] object-contain transition-all duration-300'
            /> 
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home