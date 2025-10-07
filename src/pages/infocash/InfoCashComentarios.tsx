import { Link } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"
import iconDeCurtida from "../../assets/iconDeCurtida.png"
import iconDeComentarios from "../../assets/iconDeComentarios.png"
import iconDePaginaComentario from "../../assets/iconDePaginaComentario.png"
import iconFazerComentario from "../../assets/iconFazerComentario.png"


const comments = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 1,
  title: "Ótimo atendimento e produtos de qualidade",
  author: "Usuário anônimo",
  body:
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  rating: 4,
}))

export default function InfoCashComentarios() {
  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-white">
        <div className="px-4 sm:px-6 md:px-12 py-4">
          

          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <img src={iconDePaginaComentario} alt="comentários" className="w-6 h-6" />
            <h1 className="text-xl font-bold text-[#F9A01B]">InfoCash</h1>
          </div>

          {/* Lista de Comentários */}
          <div className="space-y-3 mb-20">
            {comments.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover-lift transition-smooth">
                <div className="flex items-center gap-2 mb-2">
                  <img src={iconPerfilComentario} alt="perfil" className="w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-800">{c.title}</span>
                </div>
                
                <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-md p-2.5 mb-2">
                  <p className="text-xs leading-relaxed line-clamp-3">
                    {c.body}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-smooth">
                      <img src={iconDeCurtida} alt="curtir" className="w-4 h-4" />
                      <span className="text-xs">Curtir</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-smooth">
                      <img src={iconDeComentarios} alt="comentar" className="w-4 h-4" />
                      <span className="text-xs">Comentar</span>
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
            ))}
          </div>

          {/* Botão Fixo - Novo Comentário */}
          <Link to="/infocash/novo">
            <button className="fixed right-6 bottom-6 bg-[#F9A01B] text-white rounded-full shadow-xl px-5 py-3 hover-scale transition-smooth flex items-center gap-2 z-50">
              <img src={iconFazerComentario} alt="novo" className="w-5 h-5" />
              <span className="font-semibold">Novo comentário</span>
            </button>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  )
}
