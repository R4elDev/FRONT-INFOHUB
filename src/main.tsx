import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import RecuperarSenha from './pages/RecuperarSenha1'
import RecuperarSenha2 from './pages/RecuperarSenha2'
import RecuperarSenhaFinal from './pages/RecuperarSenhaFinal'
import CadastroDeEndereco from './pages/CadastroDeEndereco'
import Localizacao from './pages/TelaLocalizacao'
import HomeInicial from './pages/HomeInicial'
import ChatPrecos from './pages/ChatPrecos'
import Promocoes from './pages/Promocoes'
import DetalhesProduto from './pages/DetalhesProduto'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import PagamentoSucesso from './pages/PagamentoSucesso'
import PerfilUsuario from './pages/PerfilUsuario'
import PerfilEmpresa from './pages/PerfilEmpresa'
import DashboardEmpresa from './pages/DashboardEmpresa'
import ConfiguracoesEmpresa from './pages/ConfiguracoesEmpresa'
import ConfiguracoesUsuario from './pages/ConfiguracoesUsuario'
import InfoCash from './pages/InfoCash'
import InfoCashComentarios from './pages/InfoCashComentarios'
import InfoCashNovoComentario from './pages/InfoCashNovoComentario'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha/>} />
        <Route path="/recuperar-senha2" element={<RecuperarSenha2/>} />
        <Route path="/recuperar-senha-final" element={<RecuperarSenhaFinal/>} />
        <Route path="/CadastroDeEndereco" element={<CadastroDeEndereco/>} />
        <Route path="/Localizacao" element={<Localizacao/>} />
        <Route path="/HomeInicial" element={<HomeInicial/>} />
        <Route path="/ChatPrecos" element={<ChatPrecos/>} />
        <Route path="/promocoes" element={<Promocoes/>} />
        <Route path="/produto/:id" element={<DetalhesProduto/>} />
        <Route path="/carrinho" element={<Carrinho/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/pagamento-sucesso" element={<PagamentoSucesso/>} />
        <Route path="/perfil" element={<PerfilUsuario/>} />
        <Route path="/perfil-empresa" element={<DashboardEmpresa/>} />
        <Route path="/editar-perfil-empresa" element={<PerfilEmpresa/>} />
        <Route path="/configuracoes-empresa" element={<ConfiguracoesEmpresa/>} />
        <Route path="/configuracoes" element={<ConfiguracoesUsuario/>} />
        <Route path="/infocash" element={<InfoCash/>} />
        <Route path="/infocash/comentarios" element={<InfoCashComentarios/>} />
        <Route path="/infocash/novo" element={<InfoCashNovoComentario/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
