import api from '../lib/api'
import type  { loginRequest,loginResponse,cadastroRequest,cadastroResponse  } from './types'


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

