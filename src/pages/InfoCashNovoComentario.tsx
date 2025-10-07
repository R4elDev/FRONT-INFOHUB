import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
    <div className="min-h-screen bg-[#F9A01B] flex flex-col items-center py-6 px-3">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 animate-fadeInDown">
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <img src={iconPerfilComentario} alt="perfil" className="w-6 h-6" />
          <span className="font-semibold">Qual sua opinião?</span>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="w-full min-h-40 p-4 border rounded-xl focus:ring-2 focus:ring-[#F9A01B] outline-none transition-smooth"
          />

          {img && (
            <div className="relative">
              <img src={img} alt="preview" className="max-h-56 rounded-lg border" />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover-glow">
                <img src={iconCameraComentario} alt="câmera" className="w-5 h-5" />
                <span className="text-sm">Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              </label>

              <button type="button" className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover-glow">
                <img src={iconDeLocalizacaoDoComentario} alt="localização" className="w-5 h-5" />
                <span className="text-sm">Localização</span>
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#F9A01B] text-white px-5 py-2 rounded-full shadow hover-scale"
            >
              <img src={iconFazerComentario} alt="enviar" className="w-5 h-5" />
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
