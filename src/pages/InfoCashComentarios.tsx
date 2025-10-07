import { Link } from "react-router-dom"
import iconPerfilComentario from "../assets/iconPerfilComentario.png"
import iconDeCurtida from "../assets/iconDeCurtida.png"
import iconDeComentarios from "../assets/iconDeComentarios.png"
import iconDePaginaComentario from "../assets/iconDePaginaComentario.png"
import estrelaCash from "../assets/estrelaCash.png"

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
    <div className="min-h-screen bg-[#F9A01B] flex flex-col items-center py-6 px-3">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-6">
          <img src={iconDePaginaComentario} alt="comentários" className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-[#F9A01B]">InfoCash</h1>
        </div>

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border shadow p-4 hover-lift transition-smooth">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <img src={iconPerfilComentario} alt="perfil" className="w-5 h-5" />
                <span>{c.author}</span>
              </div>
              <h3 className="font-semibold mb-2">{c.title}</h3>
              <div className="bg-[#F9A01B]/90 text-white rounded-md p-3 text-sm">
                {c.body}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <img src={iconDeCurtida} alt="curtir" className="w-4 h-4" />
                    <span>Curtir</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={iconDeComentarios} alt="comentar" className="w-4 h-4" />
                    <span>Comentar</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <img
                      key={i}
                      src={estrelaCash}
                      alt="estrela"
                      className={`w-4 h-4 ${i < c.rating ? "opacity-100" : "opacity-40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed right-6 bottom-6">
          <Link to="/infocash/novo" className="inline-block">
            <button className="bg-[#F9A01B] text-white rounded-full shadow-lg px-5 py-3 hover-scale transition-smooth">
              Novo comentário
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
