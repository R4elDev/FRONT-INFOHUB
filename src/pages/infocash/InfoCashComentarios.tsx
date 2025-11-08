import { Link } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { MessageCircle, ThumbsUp, Star, Edit3, ArrowLeft } from "lucide-react"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"


const comments = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 1,
  title: "Ótimo atendimento e produtos de qualidade",
  author: "Usuário anônimo",
  body:
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  rating: 4,
}))

// Animação CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
if (!document.head.querySelector('style[data-infocash-animations]')) {
  style.setAttribute('data-infocash-animations', 'true')
  document.head.appendChild(style)
}

export default function InfoCashComentarios() {
  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="px-4 sm:px-6 md:px-12 py-6">
          {/* Header Moderno */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-orange-100 p-4 mb-6 sticky top-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link 
                  to="/infocash" 
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Comunidade</h1>
                  <p className="text-xs text-gray-500">Todos os comentários</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#F9A01B]" />
                <span className="text-sm font-bold text-gray-700">{comments.length}</span>
              </div>
            </div>
          </div>

          {/* Lista de Comentários Modernizada */}
          <div className="space-y-4 mb-24">
            {comments.map((c, index) => (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 hover:shadow-xl transition-all"
                style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
              >
                {/* Cabeçalho do Comentário */}
                <div className="flex items-start gap-3 mb-3">
                  <img 
                    src={iconPerfilComentario} 
                    alt="perfil" 
                    className="w-12 h-12 rounded-full border-2 border-orange-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-base mb-0.5">{c.author}</p>
                    <p className="text-xs text-gray-500">Há {index + 1} hora{index !== 0 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-sm font-bold text-gray-800 mb-2">{c.title}</h3>
                
                {/* Corpo do Comentário */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {c.body.slice(0, 150)}...
                  </p>
                </div>
                
                {/* Ações */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-[#F9A01B] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{Math.floor(Math.random() * 20 + 5)}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-[#F9A01B] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{Math.floor(Math.random() * 10 + 1)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Flutuante Moderno */}
          <Link to="/infocash/novo">
            <button className="fixed right-6 bottom-6 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-2xl shadow-2xl px-6 py-4 hover:shadow-[0_10px_40px_rgba(249,160,27,0.4)] hover:scale-105 transition-all flex items-center gap-3 z-50 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base">Novo Comentário</span>
            </button>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  )
}
