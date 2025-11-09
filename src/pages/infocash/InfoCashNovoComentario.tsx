import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Camera, MapPin, Send, X, ArrowLeft, Star } from "lucide-react"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"


export default function InfoCashNovoComentario() {
  const [text, setText] = useState("")
  const [img, setImg] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const navigate = useNavigate()

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImg(reader.result as string)
    reader.readAsDataURL(file)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // Simula envio e volta para lista
    setTimeout(() => navigate("/infocash/comentarios"), 400)
  }

  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="px-4 sm:px-6 md:px-12 py-6">
          {/* Header Moderno */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-orange-100 p-4 mb-6 sticky top-4 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Novo Comentário</h1>
                <p className="text-xs text-gray-500">Compartilhe sua experiência</p>
              </div>
            </div>
          </div>

          {/* Card do Formulário Moderno */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fadeInDown">
            {/* Perfil */}
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={iconPerfilComentario} 
                alt="perfil" 
                className="w-12 h-12 rounded-full border-2 border-orange-200 shadow-sm"
              />
              <div>
                <p className="font-bold text-gray-800">Você</p>
                <p className="text-xs text-gray-500">Usuário verificado</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Avaliação */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Avaliação</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-semibold text-gray-700">{rating}/5</span>
                  )}
                </div>
              </div>

              {/* Campo de Texto */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Seu comentário</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Compartilhe sua experiência sobre este estabelecimento..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 outline-none transition-all resize-none text-sm"
                />
              </div>

              {/* Preview da Imagem */}
              {img && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200">
                  <img src={img} alt="preview" className="w-full max-h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImg(null)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="group cursor-pointer">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 px-4 py-2.5 rounded-xl transition-all">
                      <Camera className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">Foto</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                  </label>

                  <button 
                    type="button" 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Local</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!text.trim() || rating === 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
