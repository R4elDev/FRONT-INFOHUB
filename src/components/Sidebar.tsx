import { Link, useLocation } from "react-router-dom"
import { useUser } from "../contexts/UserContext"
import { Home, Tag, MapPin, DollarSign, Bot, Heart, ShoppingCart, User, Plus, X, LayoutDashboard } from "lucide-react"
import logoHome from "../assets/logo da home.png"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  to: string
  label: string
  icon: any
  badge?: string
}

// Menu items for regular users
const userMenuItems: MenuItem[] = [
  { to: "/HomeInicial", label: "Início", icon: Home },
  { to: "/promocoes", label: "Promoções", icon: Tag, badge: "Hot" },
  { to: "/localizacao", label: "Localização", icon: MapPin },
  { to: "/infocash", label: "InfoCash", icon: DollarSign },
  { to: "/ChatPrecos", label: "IA", icon: Bot, badge: "Novo" },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { to: "/perfil", label: "Perfil", icon: User },
]

// Menu items for admin/company users
const adminMenuItems: MenuItem[] = [
  { to: "/HomeInicial", label: "Início", icon: Home },
  { to: "/promocoes", label: "Promoções", icon: Tag },
  { to: "/localizacao", label: "Localização", icon: MapPin },
  { to: "/infocash", label: "InfoCash", icon: DollarSign },
  { to: "/ChatPrecos", label: "IA", icon: Bot },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { to: "/perfil-empresa", label: "Perfil", icon: User },
]

// Menu items for company users (estabelecimentos)
const companyMenuItems: MenuItem[] = [
  { to: "/HomeInicial", label: "Início", icon: Home },
  { to: "/dashboard-empresa", label: "Dashboard", icon: LayoutDashboard },
  { to: "/empresa/meu-estabelecimento", label: "Meu Estabelecimento", icon: User },
  { to: "/empresa/cadastro-promocao", label: "Cadastrar Produto", icon: Tag },
  { to: "/promocoes", label: "Promoções", icon: Tag },
  { to: "/localizacao", label: "Localização", icon: MapPin },
  { to: "/infocash", label: "InfoCash", icon: DollarSign },
  { to: "/ChatPrecos", label: "IA", icon: Bot },
  { to: "/perfil-empresa", label: "Perfil", icon: User },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { isAdmin, isCompany } = useUser()
  
  // Choose menu items based on user type
  const menuItems = isAdmin ? adminMenuItems : 
                   isCompany ? companyMenuItems : 
                   userMenuItems

  return (
    <>
      {/* Overlay com blur */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-40 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Premium */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-[#FFA726] via-[#FF8C00] to-[#FFA726] text-white z-50 shadow-[0_0_40px_rgba(249,160,27,0.5)]
        transform transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header do Sidebar */}
        <div className="p-6 border-b border-white/30 bg-white/10 backdrop-blur-sm relative overflow-hidden">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <img 
                  src={logoHome} 
                  alt="InfoHub Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black">InfoHub</h1>
                <p className="text-xs text-white/80">Menu Principal</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-2 px-4 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-hide">
          {/* Botão Nova Promoção para empresas */}
          {(isAdmin || isCompany) && (
            <Link
              to="/cadastro-promocao"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl px-4 py-3.5 transition-all flex items-center gap-3 mb-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              onClick={onClose}
            >
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-base">Nova Promoção</span>
            </Link>
          )}
          
          {menuItems.map((item) => {
            const active = location.pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all ${
                  active 
                    ? "bg-white/25 shadow-lg scale-105" 
                    : "hover:bg-white/15 hover:scale-105"
                }`}
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    active ? "bg-white/30" : "bg-white/10 group-hover:bg-white/20"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* CSS para scrollbar */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </aside>
    </>
  )
}
