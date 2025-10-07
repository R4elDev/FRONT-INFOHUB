import { Link } from "react-router-dom"
import SidebarLayout from "../components/layouts/SidebarLayout"
import esferaAmarela from "../assets/esferaAmarelaInfoCash.png"
import esferaVermelha from "../assets/esferaVermelhaInfoCah.png"
import estrelaCash from "../assets/estrelaCash.png"
import iconDolarCash from "../assets/iconDolarCash.png"
import iconPerfilComentario from "../assets/iconPerfilComentario.png"
import iconDeCurtida from "../assets/iconDeCurtida.png"
import iconDeComentarios from "../assets/iconDeComentarios.png"
import iconDePaginaComentario from "../assets/iconDePaginaComentario.png"
import lupaPesquisa from "../assets/lupa de pesquisa .png"
import microfoneVoz from "../assets/microfone de voz.png"
import { Input as CampoTexto } from "../components/ui/input"

export default function InfoCash() {
  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-white overflow-hidden">
        {/* Esferas decorativas nas laterais - em baixo */}
        <img 
          src={esferaAmarela} 
          alt="decoração" 
          className="fixed left-0 bottom-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 animate-float opacity-90 z-0"
        />
        <img 
          src={esferaVermelha} 
          alt="decoração" 
          className="fixed right-0 bottom-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 animate-float opacity-90 z-0"
          style={{ animationDelay: '1s' }}
        />

        <div className="relative z-10 px-4 sm:px-6 md:px-12 py-4">
          {/* Barra de Pesquisa */}
          <section className="mb-4">
            <div className="relative w-full bg-white rounded-3xl border border-gray-100 shadow-md">
              <img
                src={lupaPesquisa}
                alt="Pesquisar"
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
              />
              <CampoTexto
                placeholder="Digite para buscar produtos..."
                className="h-14 pl-14 pr-14 rounded-3xl border-0 text-gray-700 focus-visible:ring-2 focus-visible:ring-[#F9A01B] placeholder:text-gray-400"
              />
              <button className="absolute right-5 top-1/2 -translate-y-1/2">
                <img src={microfoneVoz} alt="Voz" className="w-5 h-6" />
              </button>
            </div>
          </section>

          {/* Header */}
          <h1 className="text-[#F9A01B] text-lg font-bold mb-3">InfoCash</h1>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 animate-fadeInUp">
            
            {/* HubCoin Section */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5">
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
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '80%',
                    background: 'linear-gradient(90deg, #47B156 0%, #8BC34A 40%, #FFC107 70%, #F9A01B 100%)'
                  }}
                ></div>
              </div>
            </div>

            {/* Conquistas Section */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={estrelaCash} alt="conquista" className="w-5 h-5" />
                  <span className="font-semibold text-sm text-gray-800">Conquistas</span>
                </div>
                <div className="bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Intermediário
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-green-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">3</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Caçador de Ofertas</p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">4</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Top Colaborador</p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">3</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Verificador Expert</p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">4</div>
                    <span className="text-xs font-medium text-green-700">Conquistadas</span>
                  </div>
                  <p className="text-xs text-gray-700">Economizador Pro</p>
                </div>
              </div>
            </div>

            {/* Como ganhar HubCoins */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-sm text-gray-800">Como ganhar HubCoins</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-10 h-10 mx-auto mb-1.5 flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">✓</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Verificar preço</p>
                  <p className="text-xs text-gray-500">Confira se o preço está correto</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-100 rounded-full w-10 h-10 mx-auto mb-1.5 flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">$</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Cadastrar</p>
                  <p className="text-xs text-gray-500">Envie sua promoção</p>
                </div>

                <div className="text-center">
                  <div className="bg-pink-100 rounded-full w-10 h-10 mx-auto mb-1.5 flex items-center justify-center">
                    <span className="text-pink-600 text-sm font-bold">★</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Avaliar</p>
                  <p className="text-xs text-gray-500">Avalie sua interação</p>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-full text-white font-semibold text-sm shadow-md hover-scale transition-smooth"
                style={{
                  background: 'linear-gradient(90deg, #47B156 0%, #8BC34A 30%, #FFC107 60%, #F9A01B 100%)'
                }}>
                Começar a ganhar
              </button>
            </div>

            {/* Último comentário */}
            <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5">
              <div className="flex items-center gap-2 mb-2">
                <img src={iconPerfilComentario} alt="perfil" className="w-5 h-5" />
                <span className="font-semibold text-sm text-gray-800">Ótimo atendimento e produtos de qualidade</span>
              </div>

              <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-md p-2.5 mb-2">
                <p className="text-xs leading-relaxed line-clamp-3">
                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-smooth">
                    <img src={iconDeCurtida} alt="curtir" className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-smooth">
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

            {/* Botão para ver todos os comentários - DENTRO do card */}
            <Link to="/infocash/comentarios" className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-smooth border border-gray-200">
              <img src={iconDePaginaComentario} alt="comentários" className="w-5 h-5" />
              <span className="text-gray-700 text-sm font-semibold hover:text-[#F9A01B]">
                Ver todos os comentários
              </span>
            </Link>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
