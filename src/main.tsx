import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './contexts/UserContext'
import SmartRoute from './components/common/SmartRoute'
import ProtectedRoute from './components/common/ProtectedRoute'
import './index.css'

// Páginas de início
import Home from './pages/inicio/Home'
import HomeInicial from './pages/inicio/HomeInicial'
import HomeInicialAdmin from './pages/inicio/HomeInicialAdmin'
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

// Páginas de Admin
import UsuariosAdmin from './pages/admin/UsuariosAdmin'
import EmpresasAdmin from './pages/admin/EmpresasAdmin'
import RelatoriosAdmin from './pages/admin/RelatoriosAdmin'

// Páginas de Empresa
import CadastroPromocao from './pages/empresa/CadastroPromocao'
import CadastroEstabelecimento from './pages/empresa/CadastroEstabelecimento'
import MeuEstabelecimento from './pages/empresa/MeuEstabelecimento'

// Páginas de Promoções
import ListaPromocoes from './pages/promocoes/ListaPromocoes'

// Páginas de Perfil
import CadastroEndereco from './pages/perfil/CadastroEndereco'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
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
        <Route path="/HomeInicial" element={
          <ProtectedRoute requireAuth={true}>
            <SmartRoute 
              userComponent={<HomeInicial />}
              adminComponent={<HomeInicialAdmin />}
            />
          </ProtectedRoute>
        } />
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
        
        {/* Admin Routes */}
        <Route path="/usuarios-admin" element={
          <ProtectedRoute requireAdmin={true}>
            <UsuariosAdmin />
          </ProtectedRoute>
        } />
        <Route path="/empresas-admin" element={
          <ProtectedRoute requireAdmin={true}>
            <EmpresasAdmin />
          </ProtectedRoute>
        } />
        <Route path="/relatorios-admin" element={
          <ProtectedRoute requireAdmin={true}>
            <RelatoriosAdmin />
          </ProtectedRoute>
        } />
        <Route path="/cadastro-promocao" element={
          <ProtectedRoute requireCompany={true}>
            <CadastroPromocao />
          </ProtectedRoute>
        } />
        <Route path="/empresa/cadastro-promocao" element={
          <ProtectedRoute requireCompany={true}>
            <CadastroPromocao />
          </ProtectedRoute>
        } />
        <Route path="/empresa/cadastro-estabelecimento" element={
          <ProtectedRoute requireCompany={true}>
            <CadastroEstabelecimento />
          </ProtectedRoute>
        } />
        <Route path="/empresa/meu-estabelecimento" element={
          <ProtectedRoute requireCompany={true}>
            <MeuEstabelecimento />
          </ProtectedRoute>
        } />
        <Route path="/promocoes" element={<ListaPromocoes />} />
        <Route path="/cadastro-endereco" element={
          <ProtectedRoute requireAuth={true}>
            <CadastroEndereco />
          </ProtectedRoute>
        } />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
)
