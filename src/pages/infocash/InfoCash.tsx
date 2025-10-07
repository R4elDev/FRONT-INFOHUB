import { Link } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import esferaAmarela from "../../assets/esferaAmarelaInfoCash.png"
import esferaVermelha from "../../assets/esferaVermelhaInfoCah.png"
import estrelaCash from "../../assets/estrelaCash.png"
import iconDolarCash from "../../assets/iconDolarCash.png"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"
import iconDeCurtida from "../../assets/iconDeCurtida.png"
import iconDeComentarios from "../../assets/iconDeComentarios.png"
import iconDePaginaComentario from "../../assets/iconDePaginaComentario.png"


export default function InfoCash() {
  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-white overflow-hidden w-full max-w-full">
        {/* Esferas decorativas otimizadas - sem overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src={esferaAmarela} 
            alt="decoração" 
            className="absolute left-0 bottom-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 
                      transition-transform duration-700 ease-out transform-gpu will-change-transform
                      animate-float opacity-80 z-0"
            style={{
              transform: 'translate3d(0, 0, 0)'
            }}
          />
          <img 
            src={esferaVermelha} 
            alt="decoração" 
            className="absolute right-0 bottom-0 w-22 h-22 sm:w-26 sm:h-26 md:w-30 md:h-30 
                      transition-transform duration-700 ease-out transform-gpu will-change-transform
                      animate-float opacity-80 z-0"
            style={{
              animationDelay: '1s',
              transform: 'translate3d(0, 0, 0)'
            }}
          />
        </div>

        <div className="relative z-10 px-4 sm:px-6 md:px-12 py-4 w-full max-w-full overflow-hidden">
          

          {/* Header */}
          <h1 className="text-[#F9A01B] text-lg font-bold mb-3">InfoCash</h1>

          {/* Card Principal otimizado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 
                        transition-all duration-300 ease-out transform-gpu will-change-transform
                        hover:shadow-xl w-full max-w-full overflow-hidden">
            
            {/* HubCoin Section otimizada */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5 transition-colors duration-200 hover:bg-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={iconDolarCash} alt="HubCoin" className="w-5 h-5" />
                  <span className="font-semibold text-sm text-gray-800">HubCoin</span>
                </div>
                <span className="text-xs text-gray-500">972 no ranking</span>
              </div>
              <div className="text-xs text-gray-600 mb-1.5">1.285 HC</div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out transform-gpu will-change-transform"
                  style={{
                    width: '80%',
                    background: 'linear-gradient(90deg, #47B156 0%, #8BC34A 40%, #FFC107 70%, #F9A01B 100%)'
                  }}
                ></div>
              </div>
            </div>

            {/* Conquistas Section otimizada */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5 transition-colors duration-200 hover:bg-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={estrelaCash} alt="conquista" className="w-5 h-5" />
                  <span className="font-semibold text-sm text-gray-800">Conquistas</span>
                </div>
                <div className="bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Intermediário
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-full overflow-hidden">
                <div className="bg-white border border-green-200 rounded-lg p-2 transition-all duration-200 hover:shadow-md hover:scale-105 transform-gpu will-change-transform">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">3</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Caçador de Ofertas</p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-2 transition-all duration-200 hover:shadow-md hover:scale-105 transform-gpu will-change-transform">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">4</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Top Colaborador</p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-2 transition-all duration-200 hover:shadow-md hover:scale-105 transform-gpu will-change-transform">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">3</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Verificador Expert</p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-2 transition-all duration-200 hover:shadow-md hover:scale-105 transform-gpu will-change-transform">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">4</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Economizador Pro</p>
                </div>
              </div>
            </div>

            {/* Como ganhar HubCoins otimizada */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5 transition-colors duration-200 hover:bg-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-sm text-gray-800">Como ganhar HubCoins</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 w-full max-w-full overflow-hidden">
                <div className="text-center transition-transform duration-200 hover:scale-105 transform-gpu will-change-transform">
                  <div className="bg-purple-100 rounded-full w-10 h-10 mx-auto mb-1.5 flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">✓</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Verificar preço</p>
                  <p className="text-xs text-gray-500">Confira se o preço está correto</p>
                </div>

                <div className="text-center transition-transform duration-200 hover:scale-105 transform-gpu will-change-transform">
                  <div className="bg-orange-100 rounded-full w-10 h-10 mx-auto mb-1.5 flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">$</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Cadastrar</p>
                  <p className="text-xs text-gray-500">Envie sua promoção</p>
                </div>

                <div className="text-center transition-transform duration-200 hover:scale-105 transform-gpu will-change-transform">
                  <div className="bg-pink-100 rounded-full w-10 h-10 mx-auto mb-1.5 flex items-center justify-center">
                    <span className="text-pink-600 text-sm font-bold">★</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Avaliar</p>
                  <p className="text-xs text-gray-500">Avalie sua interação</p>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-full text-white font-semibold text-sm shadow-md 
                              transition-all duration-200 ease-out transform-gpu will-change-transform
                              hover:scale-105 hover:shadow-lg active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #47B156 0%, #8BC34A 30%, #FFC107 60%, #F9A01B 100%)'
                }}>
                Começar a ganhar
              </button>
            </div>

            {/* Último comentário otimizado */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5 transition-colors duration-200 hover:bg-gray-100 w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <img src={iconPerfilComentario} alt="perfil" className="w-5 h-5" />
                <span className="font-semibold text-sm text-gray-800 truncate">Ótimo atendimento e produtos de qualidade</span>
              </div>

              <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-md p-2.5 mb-2 w-full max-w-full overflow-hidden">
                <p className="text-xs leading-relaxed line-clamp-3 break-words">
                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                </p>
              </div>

              <div className="flex items-center justify-between w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-110 transform-gpu will-change-transform">
                    <img src={iconDeCurtida} alt="curtir" className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-110 transform-gpu will-change-transform">
                    <img src={iconDeComentarios} alt="comentar" className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                  <span className="text-gray-300 text-sm">★</span>
                </div>
              </div>
            </div>

            {/* Botão para ver todos os comentários otimizado */}
            <Link to="/infocash/comentarios" className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-3 
                                                        transition-all duration-200 ease-out transform-gpu will-change-transform
                                                        hover:bg-gray-100 hover:scale-105 hover:shadow-md active:scale-95 
                                                        border border-gray-200 w-full max-w-full overflow-hidden">
              <img src={iconDePaginaComentario} alt="comentários" className="w-5 h-5" />
              <span className="text-gray-700 text-sm font-semibold hover:text-[#F9A01B] transition-colors duration-200 truncate">
                Ver todos os comentários
              </span>
            </Link>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
