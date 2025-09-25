import api from '../lib/api'
import type  { loginRequest,loginResponse,cadastroRequest,cadastroResponse,solicitarCodigoRequest,
    solicitarCodigoResponse,
    validarCodigoRequest,
    validarCodigoResponse,
    redefinirSenhaRequest,
    redefinirSenhaResponse  } from './types'


// Endpoint de login
export async function login(payload: loginRequest){
    const { data } = await api.post<loginResponse>("/login", payload)

    // Guardando o token devolvido pela api
    if (data.token){
        localStorage.setItem('auth_token', data.token)
    }

    return data
}

// Endpoint de cadastro
export async function cadastrarUsuario(payload: cadastroRequest){
    const { data } = await api.post<cadastroResponse>("/usuarios/cadastro", payload)

    return data
}

// Endpoint para solicitar código de recuperação
export async function solicitarCodigoRecuperacao(payload: solicitarCodigoRequest){
    try {
        console.log('Solicitando código para:', payload.email);
        const { data } = await api.post<solicitarCodigoResponse>("/recuperar-senha", payload)
        console.log('Resposta do servidor:', data);
        return data
    } catch (error: any) {
        console.error('Erro ao solicitar código:', error.response?.data || error.message);
        throw error;
    }
}

// Endpoint para validar código de recuperação
export async function validarCodigo(payload: validarCodigoRequest){
    try {
        console.log('Validando código:', payload.codigo);
        const { data } = await api.post<validarCodigoResponse>("/validar-codigo", payload)
        console.log('Resposta da validação:', data);
        return data
    } catch (error: any) {
        console.error('Erro ao validar código:', error.response?.data || error.message);
        throw error;
    }
}

// Endpoint para redefinir senha
export async function redefinirSenha(payload: redefinirSenhaRequest){
    try {
        console.log('Redefinindo senha com código:', payload.codigo);
        const { data } = await api.post<redefinirSenhaResponse>("/redefinir-senha", payload)
        console.log('Resposta da redefinição:', data);
        return data
    } catch (error: any) {
        console.error('Erro ao redefinir senha:', error.response?.data || error.message);
        throw error;
    }
}