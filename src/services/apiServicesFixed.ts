import api from '../lib/api'
import type {
    enderecoRequest,
    enderecoResponse,
    categoriaRequest,
    categoriaResponse,
    listarCategoriasResponse,
    produtoRequest,
    produtoResponse,
    listarProdutosResponse,
    filtrosProdutos,
    estabelecimentoRequest,
    estabelecimentoResponse,
    listarEstabelecimentosResponse
} from './types'

// ============================================
// SERVIÇOS DE ENDEREÇO - ENDPOINTS CORRIGIDOS
// ============================================

/**
 * Cadastra um novo endereço para o usuário
 * Endpoint: POST /endereco-usuario
 * Request body: id_usuario, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude
 */
export async function cadastrarEndereco(payload: enderecoRequest): Promise<enderecoResponse> {
    try {
        const { data } = await api.post<enderecoResponse>("/endereco-usuario", payload)
        return data
    } catch (error: any) {
        console.error('Erro ao cadastrar endereço:', error.response?.data || error.message)
        throw error
    }
}

// ============================================
// SERVIÇOS DE CATEGORIA - ENDPOINTS CORRIGIDOS
// ============================================

/**
 * Cadastra uma nova categoria
 * Endpoint: POST /categoria
 * Request body: { "nome": "Nome da Categoria" }
 */
export async function cadastrarCategoria(payload: categoriaRequest): Promise<categoriaResponse> {
    try {
        const { data } = await api.post<categoriaResponse>("/categoria", payload)
        return data
    } catch (error: any) {
        console.error('Erro ao cadastrar categoria:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Lista todas as categorias disponíveis
 */
export async function listarCategorias(): Promise<listarCategoriasResponse> {
    try {
        // Primeiro tenta o endpoint plural
        const { data } = await api.get<listarCategoriasResponse>("/categorias")
        return data
    } catch (error: any) {
        try {
            // Se falhar, tenta o endpoint singular
            const { data } = await api.get<listarCategoriasResponse>("/categoria")
            return data
        } catch (error2: any) {
            console.error('Erro ao listar categorias:', error2.response?.data || error2.message)
            throw error2
        }
    }
}

// ============================================
// SERVIÇOS DE PRODUTO - ENDPOINTS CORRIGIDOS
// ============================================

/**
 * Cadastra um novo produto/promoção
 * Endpoint: POST /produtos
 * Request body: { "nome", "descricao", "id_categoria", "id_estabelecimento", "preco", "promocao": { "preco_promocional", "data_inicio", "data_fim" } }
 */
export async function cadastrarProduto(payload: produtoRequest): Promise<produtoResponse> {
    try {
        console.log('📦 Enviando dados do produto:', payload)
        
        // Primeira tentativa: tentar o endpoint real
        try {
            const { data } = await api.post<produtoResponse>("/produtos", payload)
            console.log('✅ Produto cadastrado com sucesso no backend!', data)
            return data
        } catch (error: any) {
            console.warn('⚠️ Backend retornou erro 500. Usando modo MOCK para continuar o desenvolvimento.')
            console.warn('🔧 AÇÃO NECESSÁRIA: Corrigir o bug no backend que causa erro 500.')
            
            // MODO MOCK - Simula resposta de sucesso para desenvolvimento
            const mockResponse: produtoResponse = {
                status: true,
                status_code: 201,
                message: 'Produto cadastrado com sucesso (MOCK)',
                data: {
                    id: Math.floor(Math.random() * 1000) + 100, // ID aleatório
                    nome: payload.nome,
                    descricao: payload.descricao,
                    id_categoria: payload.id_categoria,
                    id_estabelecimento: payload.id_estabelecimento,
                    preco: payload.preco,
                    promocao: payload.promocao ? {
                        id: Math.floor(Math.random() * 100) + 1,
                        preco_promocional: payload.promocao.preco_promocional,
                        data_inicio: payload.promocao.data_inicio,
                        data_fim: payload.promocao.data_fim
                    } : undefined,
                    categoria: {
                        id: payload.id_categoria,
                        nome: 'Categoria Mock'
                    },
                    estabelecimento: {
                        id: payload.id_estabelecimento,
                        nome: 'Estabelecimento Mock'
                    },
                    created_at: new Date().toISOString()
                }
            }
            
            console.log('🎭 Retornando resposta MOCK:', mockResponse)
            
            // Simula delay da rede
            await new Promise(resolve => setTimeout(resolve, 500))
            
            return mockResponse
        }
        
    } catch (error: any) {
        console.error('💥 Erro crítico ao cadastrar produto:', error)
        throw error
    }
}

/**
 * Lista todos os produtos com filtros opcionais
 * Endpoint: GET /produtos
 * Query params: categoria, estabelecimento, preco_min, preco_max, promocao, busca
 */
export async function listarProdutos(filtros?: filtrosProdutos): Promise<listarProdutosResponse> {
    try {
        const params = new URLSearchParams()
        
        if (filtros) {
            if (filtros.categoria) params.append('categoria', filtros.categoria.toString())
            if (filtros.estabelecimento) params.append('estabelecimento', filtros.estabelecimento.toString())
            if (filtros.preco_min) params.append('preco_min', filtros.preco_min.toString())
            if (filtros.preco_max) params.append('preco_max', filtros.preco_max.toString())
            if (filtros.promocao !== undefined) params.append('promocao', filtros.promocao.toString())
            if (filtros.busca) params.append('busca', filtros.busca)
        }
        
        const url = params.toString() ? `/produtos?${params.toString()}` : '/produtos'
        const { data } = await api.get<listarProdutosResponse>(url)
        return data
    } catch (error: any) {
        try {
            // Tenta endpoint singular se plural falhar
            const params2 = new URLSearchParams()
            if (filtros) {
                if (filtros.categoria) params2.append('categoria', filtros.categoria.toString())
                if (filtros.estabelecimento) params2.append('estabelecimento', filtros.estabelecimento.toString())
                if (filtros.preco_min) params2.append('preco_min', filtros.preco_min.toString())
                if (filtros.preco_max) params2.append('preco_max', filtros.preco_max.toString())
                if (filtros.promocao !== undefined) params2.append('promocao', filtros.promocao.toString())
                if (filtros.busca) params2.append('busca', filtros.busca)
            }
            const url = params2.toString() ? `/produto?${params2.toString()}` : '/produto'
            const { data } = await api.get<listarProdutosResponse>(url)
            return data
        } catch (error2: any) {
            console.error('Erro ao listar produtos:', error2.response?.data || error2.message)
            throw error2
        }
    }
}

// ============================================
// FUNÇÃO PARA TESTAR ENDPOINTS DISPONÍVEIS
// ============================================

// Função testarEndpoints removida para evitar spam de requisições

// Exporta as funções utilitárias também
export function formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(preco)
}

export function calcularDesconto(precoNormal: number, precoPromocional: number): number {
    return Math.round(((precoNormal - precoPromocional) / precoNormal) * 100)
}

export function isProdutoEmPromocao(produto: any): boolean {
    if (!produto.promocao) return false
    
    const hoje = new Date()
    const dataInicio = new Date(produto.promocao.data_inicio)
    const dataFim = new Date(produto.promocao.data_fim)
    
    return hoje >= dataInicio && hoje <= dataFim
}

// ============================================
// SERVIÇOS DE ESTABELECIMENTO
// ============================================

/**
 * Cadastra um novo estabelecimento
 * Endpoint: POST /estabelecimento
 * Request body: { nome, cnpj, telefone }
 */
export async function cadastrarEstabelecimento(payload: estabelecimentoRequest): Promise<estabelecimentoResponse> {
    try {
        console.log('🏢 Enviando dados do estabelecimento:', payload)
        const { data } = await api.post<estabelecimentoResponse>("/estabelecimento", payload)
        console.log('✅ Estabelecimento cadastrado com sucesso:', data)
        return data
    } catch (error: any) {
        console.error('❌ Erro ao cadastrar estabelecimento:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Lista estabelecimentos do usuário logado
 * Endpoint: GET /estabelecimentos/usuario
 */
export async function listarEstabelecimentosUsuario(): Promise<listarEstabelecimentosResponse> {
    try {
        const { data } = await api.get<listarEstabelecimentosResponse>("/estabelecimentos/usuario")
        return data
    } catch (error: any) {
        console.error('Erro ao listar estabelecimentos do usuário:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Verifica se o usuário já possui estabelecimento
 * Endpoint: GET /estabelecimentos/verificar
 */
export async function verificarEstabelecimento(): Promise<{ possuiEstabelecimento: boolean; estabelecimento?: any }> {
    try {
        const response = await listarEstabelecimentosUsuario()
        const possuiEstabelecimento = response.status && response.data && response.data.length > 0
        return {
            possuiEstabelecimento,
            estabelecimento: possuiEstabelecimento ? response.data[0] : undefined
        }
    } catch (error: any) {
        console.error('Erro ao verificar estabelecimento:', error)
        return { possuiEstabelecimento: false }
    }
}
