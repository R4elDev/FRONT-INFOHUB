/**
 * EXEMPLOS DE USO DAS APIs CORRIGIDAS
 * 
 * Este arquivo demonstra como usar corretamente as funções de API
 * com os endpoints corretos integrados.
 */

import { 
    cadastrarEndereco, 
    cadastrarCategoria, 
    cadastrarProduto,
    listarCategorias,
    listarProdutos
} from './apiServices'

import type {
    enderecoRequest,
    categoriaRequest,
    produtoRequest
} from './types'

// ============================================
// EXEMPLO 1: CADASTRAR ENDEREÇO
// ============================================

/**
 * Exemplo de como cadastrar um endereço de usuário
 * Endpoint: POST /endereco-usuario
 */
export async function exemploEndereco() {
    const enderecoData: enderecoRequest = {
        id_usuario: 123,
        cep: "01310-100",
        logradouro: "Av. Paulista",
        numero: "1000",
        complemento: "Apto 101", // opcional
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        latitude: -23.5613, // opcional
        longitude: -46.6565  // opcional
    }

    try {
        const response = await cadastrarEndereco(enderecoData)
        console.log('Endereço cadastrado com sucesso:', response)
        return response
    } catch (error) {
        console.error('Erro ao cadastrar endereço:', error)
        throw error
    }
}

// ============================================
// EXEMPLO 2: CADASTRAR CATEGORIA
// ============================================

/**
 * Exemplo de como cadastrar uma categoria
 * Endpoint: POST /categoria
 */
export async function exemploCategoria() {
    const categoriaData: categoriaRequest = {
        nome: "Eletrônicos"
    }

    try {
        const response = await cadastrarCategoria(categoriaData)
        console.log('Categoria cadastrada com sucesso:', response)
        return response
    } catch (error) {
        console.error('Erro ao cadastrar categoria:', error)
        throw error
    }
}

// ============================================
// EXEMPLO 3: CADASTRAR PRODUTO
// ============================================

/**
 * Exemplo de como cadastrar um produto com promoção
 * Endpoint: POST /produtos
 */
export async function exemploProdutoComPromocao() {
    const produtoData: produtoRequest = {
        nome: "Smartphone Samsung Galaxy",
        descricao: "Smartphone com 128GB de armazenamento e câmera de 64MP",
        id_estabelecimento: 5, // ID do estabelecimento
        preco: 1200.00,
        promocao: {
            preco_promocional: 999.99,
            data_inicio: "2024-01-15",
            data_fim: "2024-01-31"
        }
    }

    try {
        const response = await cadastrarProduto(produtoData)
        console.log('Produto cadastrado com sucesso:', response)
        return response
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error)
        throw error
    }
}

/**
 * Exemplo de como cadastrar um produto sem promoção
 */
export async function exemploProdutoSemPromocao() {
    const produtoData: produtoRequest = {
        nome: "Notebook Dell Inspiron",
        descricao: "Notebook para uso profissional com 16GB RAM e SSD 512GB",
        id_estabelecimento: 5, // ID do estabelecimento
        preco: 2500.00
        // promocao é opcional, então não incluímos
    }

    try {
        const response = await cadastrarProduto(produtoData)
        console.log('Produto cadastrado com sucesso:', response)
        return response
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error)
        throw error
    }
}

// ============================================
// EXEMPLO 4: LISTAR DADOS
// ============================================

/**
 * Exemplo de como listar categorias
 */
export async function exemploListarCategorias() {
    try {
        const response = await listarCategorias()
        console.log('Categorias encontradas:', response.data)
        return response
    } catch (error) {
        console.error('Erro ao listar categorias:', error)
        throw error
    }
}

/**
 * Exemplo de como listar produtos com filtros
 */
export async function exemploListarProdutos() {
    try {
        // Listar todos os produtos
        const todosProdutos = await listarProdutos()
        console.log('Todos os produtos:', todosProdutos.data)

        // Listar produtos de uma categoria específica
        const produtosEletronicos = await listarProdutos({ categoria: 1 })
        console.log('Produtos eletrônicos:', produtosEletronicos.data)

        // Listar produtos em promoção
        const produtosPromocao = await listarProdutos({ promocao: true })
        console.log('Produtos em promoção:', produtosPromocao.data)

        // Listar produtos com filtro de preço
        const produtosFaixaPreco = await listarProdutos({ 
            preco_min: 500, 
            preco_max: 1500 
        })
        console.log('Produtos entre R$ 500 e R$ 1500:', produtosFaixaPreco.data)

        return {
            todos: todosProdutos,
            eletronicos: produtosEletronicos,
            promocao: produtosPromocao,
            faixaPreco: produtosFaixaPreco
        }
    } catch (error) {
        console.error('Erro ao listar produtos:', error)
        throw error
    }
}

// ============================================
// EXEMPLO 5: FLUXO COMPLETO
// ============================================

/**
 * Exemplo de fluxo completo: criar categoria, produto e endereço
 */
export async function exemploFluxoCompleto() {
    try {
        console.log('Iniciando fluxo completo...')

        // 1. Criar categoria
        const categoria = await cadastrarCategoria({ nome: "Livros" })
        console.log('✅ Categoria criada:', categoria.data?.nome)

        // 2. Criar produto
        const produto = await cadastrarProduto({
            nome: "Dom Casmurro",
            descricao: "Clássico da literatura brasileira por Machado de Assis",
            id_estabelecimento: 10,
            preco: 29.90,
            promocao: {
                preco_promocional: 19.90,
                data_inicio: "2024-02-01",
                data_fim: "2024-02-14"
            }
        })
        console.log('✅ Produto criado:', produto.id)

        // 3. Cadastrar endereço para entrega
        const endereco = await cadastrarEndereco({
            id_usuario: 456,
            cep: "04038-001",
            logradouro: "Rua Vergueiro",
            numero: "3185",
            complemento: "Loja 2",
            bairro: "Vila Mariana",
            cidade: "São Paulo",
            estado: "SP"
        })
        console.log('✅ Endereço cadastrado para:', endereco.data?.logradouro)

        return {
            categoria,
            produto,
            endereco
        }
    } catch (error) {
        console.error('❌ Erro no fluxo completo:', error)
        throw error
    }
}

// ============================================
// VALIDAÇÕES E HELPERS
// ============================================

/**
 * Valida se os dados do endereço estão corretos antes de enviar
 */
export function validarDadosEndereco(endereco: enderecoRequest): boolean {
    const camposObrigatorios = [
        'id_usuario', 'cep', 'logradouro', 'numero', 
        'bairro', 'cidade', 'estado'
    ]

    for (const campo of camposObrigatorios) {
        if (!endereco[campo as keyof enderecoRequest]) {
            console.error(`Campo obrigatório ausente: ${campo}`)
            return false
        }
    }

    // Validar formato do CEP (XXXXX-XXX)
    const cepRegex = /^\d{5}-?\d{3}$/
    if (!cepRegex.test(endereco.cep)) {
        console.error('CEP deve estar no formato XXXXX-XXX')
        return false
    }

    return true
}

/**
 * Valida se os dados do produto estão corretos antes de enviar
 */
export function validarDadosProduto(produto: produtoRequest): boolean {
    const camposObrigatorios = [
        'nome', 'descricao', 'id_estabelecimento', 'preco'
    ]

    for (const campo of camposObrigatorios) {
        if (!produto[campo as keyof produtoRequest]) {
            console.error(`Campo obrigatório ausente: ${campo}`)
            return false
        }
    }

    // Validar preço
    if (produto.preco <= 0) {
        console.error('Preço deve ser maior que zero')
        return false
    }

    // Validar promoção se existir
    if (produto.promocao) {
        if (produto.promocao.preco_promocional >= produto.preco) {
            console.error('Preço promocional deve ser menor que o preço normal')
            return false
        }

        const dataInicio = new Date(produto.promocao.data_inicio)
        const dataFim = new Date(produto.promocao.data_fim)
        
        if (dataFim <= dataInicio) {
            console.error('Data fim da promoção deve ser posterior à data início')
            return false
        }
    }

    return true
}
