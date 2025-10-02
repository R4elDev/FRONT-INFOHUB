import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
//import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import RecuperarSenha from './pages/RecuperarSenha1'
import RecuperarSenha2 from './pages/RecuperarSenha2'
import RecuperarSenhaFinal from './pages/RecuperarSenhaFinal'
import CadastroDeEndereco from './pages/CadastroDeEndereco'
import Localizacao from './pages/TelaLocalizacao'
import ChatPrecos from './pages/TelaChat'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<ChatPrecos />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha/>} />
        <Route path="/recuperar-senha2" element={<RecuperarSenha2/>} />
        <Route path="/recuperar-senha-final" element={<RecuperarSenhaFinal/>} />
        <Route path="/CadastroDeEndereco" element={<CadastroDeEndereco/>} />
        <Route path="/Localizacao" element={<Localizacao/>} />
        {/* <Route path="/ChatPrecos" element={<ChatPrecos/>} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
