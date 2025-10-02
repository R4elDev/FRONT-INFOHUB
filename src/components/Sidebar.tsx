import { Link, useLocation } from "react-router-dom"
import iconCasa from "../assets/iconCasa.png"
import iconProduto from "../assets/iconProduto.png"
import iconDeLocalizacao from "../assets/iconDeLocalizacao.png"
import iconDolar from "../assets/iconDolar.png"
import iconChat from "../assets/iconChat.png"
import iconFavorito from "../assets/iconFavorito.png"
import iconCompras from "../assets/iconCompras.png"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { to: "/HomeInicial", label: "Início", icon: iconCasa },
  { to: "/promocoes", label: "Promoções", icon: iconProduto },
  { to: "/localizacao", label: "Localização", icon: iconDeLocalizacao },
  { to: "/infocash", label: "InfoCash", icon: iconDolar },
  { to: "/ia", label: "IA", icon: iconChat },
  { to: "/favoritos", label: "Favoritos", icon: iconFavorito },
  { to: "/lista-de-compras", label: "Lista de compras", icon: iconCompras },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

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
        <nav className="mt-8 flex flex-col gap-3 px-4">
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
