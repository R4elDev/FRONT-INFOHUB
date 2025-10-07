import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'

// Páginas de início
import Home from './pages/inicio/Home'
import HomeInicial from './pages/inicio/HomeInicial'
import Localizacao from './pages/inicio/TelaLocalizacao'
import CadastroDeEndereco from './pages/inicio/CadastroDeEndereco'

// Páginas de autenticação
import Login from './pages/autenticacao/Login'
import Cadastro from './pages/autenticacao/Cadastro'
import RecuperarSenha from './pages/autenticacao/RecuperarSenha1'
import RecuperarSenha2 from './pages/autenticacao/RecuperarSenha2'
import RecuperarSenhaFinal from './pages/autenticacao/RecuperarSenhaFinal'

// Páginas de produtos
import ChatPrecos from './pages/produtos/ChatPrecos'
import Promocoes from './pages/produtos/Promocoes'
import DetalhesProduto from './pages/produtos/DetalhesProduto'
import Favoritos from './pages/produtos/Favoritos'

// Páginas de carrinho
import Carrinho from './pages/carrinho/Carrinho'
import Checkout from './pages/carrinho/Checkout'
import PagamentoSucesso from './pages/carrinho/PagamentoSucesso'

// Páginas de perfil
import PerfilUsuario from './pages/perfil/PerfilUsuario'
import PerfilEmpresa from './pages/perfil/PerfilEmpresa'
import DashboardEmpresa from './pages/perfil/DashboardEmpresa'
import ConfiguracoesEmpresa from './pages/perfil/ConfiguracoesEmpresa'
import ConfiguracoesUsuario from './pages/perfil/ConfiguracoesUsuario'

// Páginas de InfoCash
import InfoCash from './pages/infocash/InfoCash'
import InfoCashComentarios from './pages/infocash/InfoCashComentarios'
import InfoCashNovoComentario from './pages/infocash/InfoCashNovoComentario'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
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
        <Route path="/favoritos" element={<Favoritos/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
