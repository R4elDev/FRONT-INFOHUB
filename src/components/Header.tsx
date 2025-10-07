import { useState } from "react"
import Sidebar from "./Sidebar"
import logoHome from "../assets/logo da home.png"
import iconMenu from "../assets/icon de menu.png"
import iconNotificacao from "../assets/icon de notificacao.png"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Header */}
      <header className="w-full h-20 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] shadow-lg flex items-center justify-between px-8 sticky top-0 z-50">
        <img 
          src={logoHome} 
          alt="Início" 
          className="h-14 drop-shadow-md transition-transform hover:scale-105 cursor-pointer" 
        />
        <div className="flex items-center gap-6">
          <button className="relative transition-transform hover:scale-110">
            <img 
              src={iconNotificacao} 
              alt="Notificações" 
              className="w-9 h-11 drop-shadow-sm" 
            />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center"></span>
          </button>
          <button 
            className="transition-transform hover:scale-110" 
            onClick={() => setOpen(true)}
          >
            <img 
              src={iconMenu} 
              alt="Menu" 
              className="w-16 h-12 drop-shadow-sm" 
            />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
