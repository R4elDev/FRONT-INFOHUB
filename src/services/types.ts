// Tipo para os dados do login
export type loginRequest = {
    email: string,
    senha: string
}

export type loginResponse = {
    status: boolean,
    status_code: number,
    token: string,
    usuario: {
        id: number,
        nome: string,
        email: string,
        perfil: string
    }
}

export type cadastroRequest = {
  nome: string;
  email: string;
  senha_hash: string;
  perfil: 'consumidor' | 'admin' | 'estabelecimento';
  cpf?: string | null;
  cnpj?: string | null;
  telefone?: string | null
  data_nascimento: string;
};


export type cadastroResponse = {
  status: boolean,
  status_code: number,
  message: string,
}



// Solicitar código por email
export interface solicitarCodigoRequest {
  email: string;
}

export interface solicitarCodigoResponse {
  status: boolean;
  status_code?: number;
  message: string;
}

// Validar código
export interface validarCodigoRequest {
  email: string;
  codigo: string;
}

export interface validarCodigoResponse {
  status: boolean;
  status_code?: number;
  message: string;
  // Pode retornar dados adicionais se necessário
  data?: any;
}

// Redefinir senha
export interface redefinirSenhaRequest {
  codigo: string;
  novaSenha: string;
}

export interface redefinirSenhaResponse {
  status: boolean;
  status_code?: number;
  message: string;
}