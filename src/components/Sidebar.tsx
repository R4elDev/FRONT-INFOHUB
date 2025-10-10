import { Link, useLocation } from "react-router-dom"
import { useUser } from "../contexts/UserContext"
import iconCasa from "../assets/iconCasa.png"
import iconProduto from "../assets/iconProduto.png"
import iconDeLocalizacao from "../assets/iconDeLocalizacao.png"
import iconDolar from "../assets/iconDolar.png"
import iconChat from "../assets/iconChat.png"
import iconFavorito from "../assets/iconFavorito.png"
import iconCompras from "../assets/iconCompras.png"
import iconPerfil from "../assets/iconPerfil.png"
import logoHome from "../assets/logo da home.png"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Menu items for regular users
const userMenuItems = [
  { to: "/HomeInicial", label: "Início", icon: iconCasa },
  { to: "/promocoes", label: "Promoções", icon: iconProduto },
  { to: "/localizacao", label: "Localização", icon: iconDeLocalizacao },
  { to: "/infocash", label: "InfoCash", icon: iconDolar },
  { to: "/ChatPrecos", label: "IA", icon: iconChat },
  { to: "/favoritos", label: "Favoritos", icon: iconFavorito },
  { to: "/carrinho", label: "Carrinho", icon: iconCompras },
  { to: "/perfil", label: "Perfil", icon: iconPerfil },
]

// Menu items for admin/company users
const adminMenuItems = [
  { to: "/HomeInicial", label: "Início", icon: iconCasa },
  { to: "/promocoes", label: "Promoções", icon: iconProduto },
  { to: "/localizacao", label: "Localização", icon: iconDeLocalizacao },
  { to: "/infocash", label: "InfoCash", icon: iconDolar },
  { to: "/ChatPrecos", label: "IA", icon: iconChat },
  { to: "/favoritos", label: "Favoritos", icon: iconFavorito },
  { to: "/carrinho", label: "Carrinho", icon: iconCompras },
  { to: "/perfil-empresa", label: "Perfil", icon: iconPerfil },
]

// Menu items for company users (estabelecimentos)
const companyMenuItems = [
  { to: "/HomeInicial", label: "Início", icon: iconCasa },
  { to: "/empresa/cadastro-estabelecimento", label: "Estabelecimento", icon: iconPerfil },
  { to: "/empresa/cadastro-promocao", label: "Cadastrar Produto", icon: iconProduto },
  { to: "/promocoes", label: "Promoções", icon: iconProduto },
  { to: "/localizacao", label: "Localização", icon: iconDeLocalizacao },
  { to: "/infocash", label: "InfoCash", icon: iconDolar },
  { to: "/ChatPrecos", label: "IA", icon: iconChat },
  { to: "/perfil-empresa", label: "Perfil", icon: iconPerfil },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { isAdmin, isCompany, user } = useUser()
  
  // Choose menu items based on user type
  const menuItems = isAdmin ? adminMenuItems : 
                   isCompany ? companyMenuItems : 
                   userMenuItems

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#F9A01B] text-white z-50 shadow-2xl
        transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo + InfoHub + Nome da Empresa */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-4 mb-3">
            <img 
              src={logoHome} 
              alt="InfoHub Logo" 
              className="w-14 h-14 object-contain"
            />
            <h1 className="text-2xl font-bold">InfoHub</h1>
          </div>
         
        </div>

        <nav className="mt-4 flex flex-col gap-3 px-4">
          {/* Botão Nova Promoção para empresas */}
          {(isAdmin || isCompany) && (
            <Link
              to="/cadastro-promocao"
              className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 transition-colors flex items-center gap-3 mb-2"
              onClick={onClose}
            >
              <span className="text-lg">➕</span>
              <span className="font-bold">Nova Promoção</span>
            </Link>
          )}
          
          {menuItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  active ? "bg-white/20" : "hover:bg-white/10"
                }`}
                onClick={onClose}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
