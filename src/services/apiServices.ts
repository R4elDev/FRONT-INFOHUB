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
    filtrosProdutos
} from './types'

// ============================================
// SERVIÇOS DE ENDEREÇO
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

/**
 * Busca endereços do usuário logado
 */
export async function buscarEnderecosUsuario(): Promise<enderecoResponse[]> {
    try {
        const { data } = await api.get<{ status: boolean; data: enderecoResponse[] }>("/enderecos")
        return data.data || []
    } catch (error: any) {
        console.error('Erro ao buscar endereços:', error.response?.data || error.message)
        throw error
    }
}

// ============================================
// SERVIÇOS DE CATEGORIA
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
        const { data } = await api.get<listarCategoriasResponse>("/categorias")
        return data
    } catch (error: any) {
        console.error('Erro ao listar categorias:', error.response?.data || error.message)
        throw error
    }
}

// ============================================
// SERVIÇOS DE PRODUTO
// ============================================

/**
 * Cadastra um novo produto/promoção
 * Endpoint: POST /produtos
 * Request body: { "nome", "descricao", "id_categoria", "id_estabelecimento", "preco", "promocao": { "preco_promocional", "data_inicio", "data_fim" } }
 */
export async function cadastrarProduto(payload: produtoRequest): Promise<produtoResponse> {
    try {
        const { data } = await api.post<produtoResponse>("/produtos", payload)
        return data
    } catch (error: any) {
        console.error('Erro ao cadastrar produto:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Lista todos os produtos com filtros opcionais
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
        console.error('Erro ao listar produtos:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Busca produtos por categoria específica
 */
export async function buscarProdutosPorCategoria(categoriaId: number): Promise<listarProdutosResponse> {
    return listarProdutos({ categoria: categoriaId })
}

/**
 * Busca produtos em promoção
 */
export async function buscarProdutosPromocao(): Promise<listarProdutosResponse> {
    return listarProdutos({ promocao: true })
}

/**
 * Busca produtos por texto
 */
export async function buscarProdutosPorTexto(texto: string): Promise<listarProdutosResponse> {
    return listarProdutos({ busca: texto })
}

/**
 * Busca produtos de um estabelecimento específico
 */
export async function buscarProdutosPorEstabelecimento(estabelecimentoId: number): Promise<listarProdutosResponse> {
    return listarProdutos({ estabelecimento: estabelecimentoId })
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Formata preço para exibição
 */
export function formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(preco)
}

/**
 * Calcula desconto percentual
 */
export function calcularDesconto(precoNormal: number, precoPromocional: number): number {
    return Math.round(((precoNormal - precoPromocional) / precoNormal) * 100)
}

/**
 * Verifica se produto está em promoção ativa
 */
export function isProdutoEmPromocao(produto: any): boolean {
    if (!produto.promocao) return false
    
    const hoje = new Date()
    const dataInicio = new Date(produto.promocao.data_inicio)
    const dataFim = new Date(produto.promocao.data_fim)
    
    return hoje >= dataInicio && hoje <= dataFim
}
