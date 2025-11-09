import imgLogo from '../../assets/infohub-logo.png'
import imgGoogleLogo from '../../assets/google-logo.png'
import imgAppleLogo from '../../assets/apple-logo.png'
import bolaLaranjaCima from '../../assets/bolaLaranjaCima.png'
import bolaLaranjaBaixo from '../../assets/bolaLaranja.png'
import { Button } from '../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ShoppingCart, Zap, TrendingUp } from 'lucide-react'

function Home() {
  const navigate = useNavigate()

  return (
    <div className='bg-gradient-to-br from-[#FFA726] via-[#F9A01B] to-[#FF8C00] relative min-h-screen overflow-hidden w-full max-w-full'>
      {/* Background decorativo com gradientes animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes animados de fundo */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-orange-400/30 to-yellow-400/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        
        {/* Elementos decorativos com animação 3D - sem overflow */}
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
      
      <div className='flex flex-col items-center justify-center h-screen gap-3 sm:gap-4 md:gap-5 relative z-10 px-4 w-full max-w-full overflow-hidden'>
        {/* Ícones flutuantes decorativos */}
        <div className="absolute top-20 right-10 animate-float opacity-30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="absolute bottom-32 left-10 animate-float-reverse opacity-30" style={{animationDelay: '1s'}}>
          <ShoppingCart className="w-10 h-10 text-white" />
        </div>
        <div className="absolute top-40 left-20 animate-float opacity-20" style={{animationDelay: '2s'}}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-40 right-20 animate-float-reverse opacity-20" style={{animationDelay: '1.5s'}}>
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        {/* Logo container com efeito 3D otimizado e glassmorphism */}
        <div 
          className='flex items-center justify-center bg-white/95 backdrop-blur-sm w-[200px] h-[200px] sm:w-[230px] sm:h-[230px] md:w-[260px] md:h-[260px] rounded-full 
                      transition-all duration-500 ease-out transform-gpu cursor-pointer group will-change-transform 
                      hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:scale-105 animate-scaleIn
                      ring-4 ring-white/30 hover:ring-white/50'
          style={{
            boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2)',
            animation: 'scaleIn 0.8s ease-out forwards'
          }}
        >
          <img 
            src={imgLogo} 
            alt="Logo InfoHub" 
            className='w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] md:w-[190px] md:h-[190px] object-contain 
                      transition-all duration-300 transform-gpu will-change-transform group-hover:scale-110 group-hover:rotate-3'
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
            }}
          />  
        </div>
        
        {/* Barra de progresso otimizada com animação */}
        <div 
          className='w-[160px] sm:w-[180px] md:w-[200px] h-[8px] md:h-[10px] rounded-full 
                      transition-all duration-300 transform-gpu will-change-transform hover:scale-110 hover:shadow-xl
                      animate-fadeInUp relative overflow-hidden'
          style={{
            boxShadow: '0 4px 16px rgba(37, 153, 46, 0.4)',
            background: 'linear-gradient(90deg, #25992E 0%, #2EBF37 50%, #25992E 100%)',
            backgroundSize: '200% 100%',
            animation: 'fadeInUp 0.6s ease-out 0.3s forwards, gradientShift 3s ease infinite',
            opacity: 0
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        
        {/* Texto principal otimizado com animações */}
        <div className='transition-transform duration-300 transform-gpu will-change-transform cursor-default px-4 text-center max-w-full animate-fadeInUp' style={{animationDelay: '0.4s'}}>
          <h1 className='text-[22px] sm:text-[26px] md:text-[30px] font-bold text-center font-[Poppins] text-white transition-all duration-300 mb-2
                        drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]'>
            FAZER COMPRAS PODE SER SIMPLES
          </h1>
          <p className='text-[15px] sm:text-[17px] md:text-[19px] text-center font-[Poppins] text-white/95 transition-all duration-300
                      drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2'>
            <Sparkles className="w-4 h-4 animate-pulse" />
            Lugar para fazer compras rapidamente
            <Sparkles className="w-4 h-4 animate-pulse" style={{animationDelay: '0.5s'}} />
          </p>
        </div>

        {/* Botão LOGIN otimizado com animações */}
        <Button 
            onClick={() => navigate('/login')}
            className='w-[260px] sm:w-[280px] md:w-[320px] h-[56px] sm:h-[60px] md:h-[65px] rounded-[50px] text-white text-[18px] sm:text-[20px] md:text-[22px] font-bold font-[Poppins] 
                      transition-all duration-300 ease-out transform-gpu will-change-transform 
                      hover:translate-y-[-3px] hover:scale-105 active:scale-95 active:translate-y-0 cursor-pointer group relative overflow-hidden
                      animate-fadeInUp ring-2 ring-white/20 hover:ring-white/40'
            style={{
              background: 'linear-gradient(135deg, #25992E 0%, #2EBF37 50%, #25992E 100%)',
              backgroundSize: '200% 100%',
              boxShadow: '0 8px 20px rgba(37,153,46,0.4), 0 3px 10px rgba(0,0,0,0.2)',
              animationDelay: '0.6s'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className='relative z-10 transition-all duration-300 flex items-center justify-center gap-2 group-hover:tracking-wider'>
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              LOGIN
            </span>
          </Button>
        
        {/* Botão CADASTRE-SE otimizado com animações */}
        <Button 
          onClick={() => navigate('/cadastro')}
          className='w-[260px] sm:w-[280px] md:w-[320px] h-[56px] sm:h-[60px] md:h-[65px] bg-white/95 backdrop-blur-sm rounded-[50px] text-[#25992E] text-[18px] sm:text-[20px] md:text-[22px] font-bold font-[Poppins] 
                    transition-all duration-300 ease-out transform-gpu will-change-transform 
                    hover:translate-y-[-3px] hover:scale-105 hover:bg-white active:scale-95 active:translate-y-0 cursor-pointer group relative overflow-hidden
                    animate-fadeInUp ring-2 ring-white/40 hover:ring-white/60'
          style={{
            boxShadow: '0 8px 20px rgba(255,255,255,0.3), 0 3px 10px rgba(0,0,0,0.15)',
            border: '2px solid rgba(37, 153, 46, 0.3)',
            animationDelay: '0.7s'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className='relative z-10 transition-all duration-300 flex items-center justify-center gap-2 group-hover:tracking-wider'>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            CADASTRE-SE
          </span>
        </Button>

        <p className='text-[14px] sm:text-[15px] md:text-[16px] text-center font-[Poppins] text-white/90 transition-all duration-200 transform-gpu will-change-transform cursor-default
                  animate-fadeInUp drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' style={{animationDelay: '0.8s'}}>
          ou entre com
        </p>
        {/* Logos sociais otimizadas com animações */}
        <div className='flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-10 max-w-full overflow-hidden animate-fadeInUp' style={{animationDelay: '0.9s'}}>
          <div 
            className='transition-all duration-300 ease-out transform-gpu will-change-transform cursor-pointer hover:scale-115 hover:-translate-y-1
                      bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl hover:bg-white hover:shadow-xl group
                      ring-2 ring-white/30 hover:ring-white/50'
            style={{
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
            }}
          >
            <img 
              src={imgGoogleLogo} 
              alt="Google logo" 
              className='w-[38px] h-[42px] sm:w-[42px] sm:h-[46px] md:w-[46px] md:h-[50px] object-contain transition-transform duration-300 group-hover:rotate-6'
            />
          </div>
          <div 
            className='transition-all duration-300 ease-out transform-gpu will-change-transform cursor-pointer hover:scale-115 hover:-translate-y-1
                      bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl hover:bg-white hover:shadow-xl group
                      ring-2 ring-white/30 hover:ring-white/50'
            style={{
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
            }}
          >
            <img 
              src={imgAppleLogo} 
              alt="Apple logo" 
              className='w-[38px] h-[42px] sm:w-[42px] sm:h-[46px] md:w-[46px] md:h-[50px] object-contain transition-transform duration-300 group-hover:rotate-6'
            /> 
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
