
import { useState } from "react";
import type { ChangeEvent } from "react";
import { Input } from "../components/ui/input";
import { Search, Mic, Menu } from "lucide-react";
import logoCarrinho from "../assets/Adobe Express - file (1) 1 (2).png";

function Localizacao() {
  const [searchText, setSearchText] = useState<string>("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value);
  };

  const handleSearchClick = (): void => {
    // Implementar lógica de busca aqui
    console.log("Buscando por:", searchText);
  };

  const handleVoiceClick = (): void => {
    // Implementar lógica de reconhecimento de voz aqui
    console.log("Ativar microfone");
  };

  const handleMenuClick = (): void => {
    // Implementar lógica do menu
    console.log("Abrir menu");
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="bg-[#F9A825] px-5 py-4 flex justify-between items-center">
        <div className="relative flex justify-center items-center">
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full z-0"></span>
          <img
            src={logoCarrinho}
            alt="Carrinho"
            className="w-[70px] relative z-10"
          />
        </div>
        <button onClick={handleMenuClick} className="cursor-pointer">
          <Menu className="w-12 h-12 text-white" />
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 bg-[#EAEAEA] overflow-auto">
        {/* MAPA */}
        <div className="w-full h-[80vh] rounded-2xl overflow-hidden bg-gray-300 mb-5 shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.9303189718253!2d-46.9172282237502!3d-23.498100659421677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf01aef76e0b5f%3A0x6f6c2b28b2f40c1f!2sAssa%C3%AD%20Atacadista!5e0!3m2!1spt-BR!2sbr!4v1694698700000!5m2!1spt-BR!2sbr"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            title="Mapa de Localização"
          />
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="bg-white rounded-full flex items-center px-4 py-3 shadow-sm">
          <button onClick={handleSearchClick} className="cursor-pointer">
            <Search className="w-6 h-6 text-gray-500 mr-3" />
          </button>
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchText}
            onChange={handleSearchChange}
            className="flex-1 border-0 outline-none text-base bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button onClick={handleVoiceClick} className="cursor-pointer">
            <Mic className="w-6 h-6 text-gray-500 ml-3" />
          </button>
        </div>
      </main>
    </div>
  );
}

export default Localizacao;