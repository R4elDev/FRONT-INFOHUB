import type { CommentCardProps } from "../../types/comment"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"
import iconDeCurtida from "../../assets/iconDeCurtida.png"
import iconDeComentarios from "../../assets/iconDeComentarios.png"

export default function CommentCard({
  id,
  author,
  authorAvatar,
  title,
  body,
  rating,
  likes = 0,
  onLike,
  onComment
}: CommentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover-lift transition-smooth">
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={authorAvatar || iconPerfilComentario} 
          alt={author} 
          className="w-5 h-5 rounded-full" 
        />
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      
      <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-md p-2.5 mb-2">
        <p className="text-xs leading-relaxed line-clamp-3">
          {body}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onLike?.(id)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-smooth"
          >
            <img src={iconDeCurtida} alt="curtir" className="w-4 h-4" />
            <span className="text-xs">{likes > 0 ? likes : 'Curtir'}</span>
          </button>
          <button 
            onClick={() => onComment?.(id)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-smooth"
          >
            <img src={iconDeComentarios} alt="comentar" className="w-4 h-4" />
            <span className="text-xs">Comentar</span>
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
