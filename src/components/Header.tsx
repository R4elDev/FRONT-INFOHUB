import { useState } from "react"
import Sidebar from "./Sidebar"
import Notificacoes from "./Notificacoes"
import logoHome from "../assets/logo da home.png"
import { Bell, Menu, ShoppingCart, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCarrinho } from "../contexts/CarrinhoContext"

export default function Header() {
  const [open, setOpen] = useState(false)
  const [notificacoesOpen, setNotificacoesOpen] = useState(false)
  const navigate = useNavigate()
  const { items } = useCarrinho()
  
  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0)

  return (
    <>
      {/* Header Premium */}
      <header className="w-full h-20 bg-gradient-to-r from-[#FFA726] via-[#FF8C00] to-[#FFA726] shadow-[0_4px_20px_rgba(249,160,27,0.3)] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50 backdrop-blur-sm">
        {/* Logo e Título */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative group cursor-pointer" onClick={() => navigate('/HomeInicial')}>
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:bg-white/30 transition-all"></div>
            <img 
              src={logoHome} 
              alt="Início" 
              className="h-12 sm:h-14 drop-shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 relative z-10" 
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-lg tracking-tight">
              InfoHub
            </h1>
            <p className="text-xs text-white/80 font-medium hidden sm:block">Sua central de ofertas</p>
          </div>
        </div>
        
        {/* Ações */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Botão Buscar */}
          <button 
            onClick={() => navigate('/promocoes')}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
            title="Buscar produtos"
          >
            <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Botão Notificações */}
          <button 
            onClick={() => setNotificacoesOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
            title="Notificações"
          >
            <Bell className="w-5 h-5 text-white group-hover:animate-pulse" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
              3
            </span>
          </button>
          
          {/* Botão Carrinho */}
          <button 
            onClick={() => navigate('/carrinho')}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
            title="Carrinho de compras"
          >
            <ShoppingCart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            {totalItens > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-green-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                {totalItens}
              </span>
            )}
          </button>
          
          {/* Botão Menu */}
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md transition-all hover:scale-110 active:scale-95 group" 
            onClick={() => setOpen(true)}
            title="Menu"
          >
            <Menu className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      
      {/* Notificações */}
      <Notificacoes isOpen={notificacoesOpen} onClose={() => setNotificacoesOpen(false)} />
    </>
  )
}
