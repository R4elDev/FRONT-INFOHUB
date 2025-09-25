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







