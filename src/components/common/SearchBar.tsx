import { Input } from "../ui/input"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import microfoneVoz from "../../assets/microfone de voz.png"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onVoiceSearch?: () => void
}

export default function SearchBar({ 
  placeholder = "Digite para buscar produtos...",
  value,
  onChange,
  onVoiceSearch
}: SearchBarProps) {
  return (
    <div className="relative w-full bg-white rounded-3xl border border-gray-100 shadow-md">
      <img
        src={lupaPesquisa}
        alt="Pesquisar"
        className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
      />
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-14 pl-14 pr-14 rounded-3xl border-0 text-gray-700 focus-visible:ring-2 focus-visible:ring-[#F9A01B] placeholder:text-gray-400"
      />
      <button 
        onClick={onVoiceSearch}
        className="absolute right-5 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
      >
        <img src={microfoneVoz} alt="Pesquisar por voz" className="w-5 h-6" />
      </button>
    </div>
  )
}
