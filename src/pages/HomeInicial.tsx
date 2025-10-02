import { Button as Botao } from "../components/ui/button"
import { Input as CampoTexto } from "../components/ui/input"

import iconJarra from "../assets/icon de jara.png"
import iconMenu from "../assets/icon de menu.png"
import iconNotificacao from "../assets/icon de notificacao.png"
import logoHome from "../assets/logo da home.png"
import lupaPesquisa from "../assets/lupa de pesquisa .png"
import microfoneVoz from "../assets/microfone de voz.png"

function HomeInicial() {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Barra Superior */}
      <header 
        className="w-full h-20 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] 
                   shadow-lg flex items-center justify-between px-8 sticky top-0 z-50"
      >
        <img 
          src={logoHome} 
          alt="Início" 
          className="h-14 drop-shadow-md transition-transform hover:scale-105" 
        />
        <div className="flex items-center gap-6">
          <button className="relative transition-transform hover:scale-110">
            <img src={iconNotificacao} alt="Notificações" className="w-9 h-11 drop-shadow-sm" />
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                         text-white text-[10px] font-bold flex items-center justify-center"
            ></span>
          </button>
          <button className="transition-transform hover:scale-110">
            <img src={iconMenu} alt="Menu" className="w-16 h-12 drop-shadow-sm" />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full px-6 md:px-12 pb-12">
        {/* Banner Principal */}
        <section className="mt-8">
          <div 
            className="w-full h-52 md:h-80 bg-gradient-to-br from-[#F9A01B] 
                       via-[#FF8C00] to-[#FFA500] rounded-3xl shadow-2xl 
                       relative overflow-hidden"
          >
            <div 
              className="absolute inset-0 opacity-30
                         bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" 
            ></div>
          </div>
          {/* Pontinhos do Carrossel */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B] shadow-md 
                         transition-all hover:scale-125 cursor-pointer" 
            />
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B]/60 shadow-sm 
                         transition-all hover:scale-125 cursor-pointer" 
            />
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B]/40 shadow-sm 
                         transition-all hover:scale-125 cursor-pointer" 
            />
          </div>
        </section>

        {/* Barra de Pesquisa */}
        <section className="mt-10">
          <div 
            className="relative w-full bg-white rounded-3xl border border-gray-100 
                       shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all 
                       hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)]"
          >
            <img
              src={lupaPesquisa}
              alt="Pesquisar"
              className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
            />
            <CampoTexto
              placeholder="Digite para buscar produtos..."
              className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                         focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                         placeholder:text-gray-400"
            />
            <button className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110">
              <img
                src={microfoneVoz}
                alt="Pesquisar por voz"
                className="w-5 h-6"
              />
            </button>
          </div>
        </section>

        {/* Lista de Promoções */}
        <section 
          className="mt-12 bg-white rounded-3xl border border-gray-100 
                     shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl md:text-3xl font-bold text-gray-800 
                         flex items-center gap-2"
            >
               Promoções
            </h2>
            <button 
              className="text-sm md:text-base font-semibold text-[#F9A01B] 
                         hover:text-[#FF8C00] transition-colors flex items-center gap-1"
            >
              Ver Mais <span className="text-lg">→</span>
            </button>
          </div>

          {/* Cards de Produtos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-30">
            {[0, 1, 2, 3].map((i) => (
              <article
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer
                           shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                           hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
              >
                {/* Oferta + Favorito */}
                <div className="flex items-start justify-between mb-2">
                  <span 
                    className="bg-gradient-to-r from-green-600 to-green-500 
                               text-white text-[10px] font-semibold px-2.5 py-1 
                               rounded-md shadow-sm"
                  >
                    OFERTA
                  </span>
                  <button 
                    className="text-gray-300 hover:text-red-500 transition-colors text-xl"
                  >
                    ♡
                  </button>
                </div>

                {/* Imagem do Produto */}
                <div 
                  className="flex items-center justify-center py-4 bg-gray-50 
                             rounded-xl mb-3"
                >
                  <img 
                    src={iconJarra} 
                    alt="Produto" 
                    className="w-24 h-24 object-contain drop-shadow-md" 
                  />
                </div>

                {/* Preço antigo + desconto */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span 
                    className="bg-gradient-to-r from-orange-100 to-orange-50 
                               text-orange-700 font-bold px-2 py-1 rounded-md"
                  >
                    -33%
                  </span>
                  <span className="text-gray-400 line-through">R$ 11,98</span>
                </div>

                {/* Preço atual + botão adicionar */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-700 font-bold text-lg">R$ 8,99</p>
                  <Botao 
                    className="h-8 w-8 rounded-full p-0 text-white font-bold 
                               bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] 
                               hover:from-[#FF8C00] hover:to-[#F9A01B] 
                               shadow-md hover:shadow-lg transition-all hover:scale-110"
                  >
                    +
                  </Botao>
                </div>

                {/* Descrição */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  Garrafa de suco de laranja 250 ml
                </p>
              </article>
            ))}
          </div>

          {/* Pontinhos de navegação */}
          <div className="flex items-center justify-center gap-2.5 mt-8">
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B] shadow-md 
                         transition-all hover:scale-125 cursor-pointer" 
            />
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B]/60 shadow-sm 
                         transition-all hover:scale-125 cursor-pointer" 
            />
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B]/40 shadow-sm 
                         transition-all hover:scale-125 cursor-pointer" 
            />
            <span 
              className="w-3 h-3 rounded-full bg-[#F9A01B]/20 shadow-sm 
                         transition-all hover:scale-125 cursor-pointer" 
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomeInicial
