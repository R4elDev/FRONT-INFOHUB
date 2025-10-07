import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../components/layouts/SidebarLayout"
import { Input } from "../components/ui/input"
import iconCameraComentario from "../assets/iconCameraComentario.png"
import iconDeLocalizacaoDoComentario from "../assets/iconDeLocalizacaoDoComentario.png"
import iconFazerComentario from "../assets/iconFazerComentario.png"
import iconPerfilComentario from "../assets/iconPerfilComentario.png"


export default function InfoCashNovoComentario() {
  const [text, setText] = useState("")
  const [img, setImg] = useState<string | null>(null)
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
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-white">
        <div className="px-4 sm:px-6 md:px-12 py-4">
          
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-[#F9A01B] transition-smooth"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Voltar</span>
          </button>

          {/* Card do Formulário */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 animate-fadeInDown">
            <div className="flex items-center gap-2 mb-4">
              <img src={iconPerfilComentario} alt="perfil" className="w-6 h-6" />
              <span className="font-semibold text-gray-800">Qual sua opinião?</span>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Qual sua opinião?"
                className="w-full h-14 px-4 rounded-full focus-visible:ring-2 focus-visible:ring-[#F9A01B]"
              />

              {img && (
                <div className="relative">
                  <img src={img} alt="preview" className="max-h-48 rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => setImg(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-smooth">
                    <img src={iconCameraComentario} alt="câmera" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700">Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                  </label>

                  <button type="button" className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-smooth">
                    <img src={iconDeLocalizacaoDoComentario} alt="localização" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700">Localização</span>
                  </button>
                  
                  
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#F9A01B] text-white px-6 py-2.5 rounded-full shadow-md hover-scale transition-smooth font-semibold"
                >
                  <img src={iconFazerComentario} alt="enviar" className="w-5 h-5" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
