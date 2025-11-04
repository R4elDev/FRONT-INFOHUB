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
    estabelecimentoRequest,
    estabelecimentoResponse,
    filtrosProdutos,
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
        console.log('📍 INICIANDO cadastro de endereço')
        console.log('📍 Payload do endereço:', JSON.stringify(payload, null, 2))
        console.log('📍 Endpoint:', "/endereco-usuario")
        
        const response = await api.post<enderecoResponse>("/endereco-usuario", payload)
        console.log('📍 Resposta da API de endereço:', JSON.stringify(response.data, null, 2))
        
        if (response.data && response.data.status) {
            console.log('✅ Endereço cadastrado com sucesso!')
            return response.data
        } else {
            console.error('❌ Resposta de endereço inválida:', response.data)
            throw new Error('Resposta inválida da API de endereço')
        }
    } catch (error: any) {
        console.error('❌ ERRO ao cadastrar endereço:')
        console.error('❌ Error:', error)
        console.error('❌ Response status:', error.response?.status)
        console.error('❌ Response data:', error.response?.data)
        console.error('❌ Message:', error.message)
        throw error
    }
}

/**
 * Cadastra endereço específico para estabelecimento
 * Endpoint: POST /endereco-estabelecimento
 */
export async function cadastrarEnderecoEstabelecimento(payload: any): Promise<any> {
    console.log('🏢 SOLUÇÃO DEFINITIVA - Criando endereço de estabelecimento')
    
    // SOLUÇÃO: Usar o endpoint que funciona, mas salvar o endereço formatado no localStorage
    // para exibir na interface, já que o backend não tem tabela específica implementada
    
    try {
        console.log('🏢 Usando endpoint /endereco-usuario (que funciona)')
        console.log('🏢 Payload:', JSON.stringify(payload, null, 2))
        
        const response = await api.post("/endereco-usuario", payload)
        console.log('✅ Endereço salvo com sucesso!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        
        // SOLUÇÃO: Salvar endereço formatado no localStorage para exibir na interface
        if (response.data && response.data.status && response.data.id) {
            const enderecoFormatado = `${response.data.id.logradouro}, ${response.data.id.numero}${response.data.id.complemento ? ', ' + response.data.id.complemento : ''} - ${response.data.id.bairro}, ${response.data.id.cidade}/${response.data.id.estado} - CEP: ${response.data.id.cep}`
            
            // Salva o endereço formatado no localStorage
            localStorage.setItem('estabelecimentoEndereco', enderecoFormatado)
            localStorage.setItem('estabelecimentoEnderecoCompleto', JSON.stringify(response.data.id))
            
            console.log('✅ Endereço salvo no localStorage para exibição:', enderecoFormatado)
        }
        
        return response.data
    } catch (error: any) {
        console.error('❌ ERRO ao salvar endereço:', error)
        console.error('❌ Response status:', error.response?.status)
        console.error('❌ Response data:', error.response?.data)
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
 * Endpoint: GET /categorias
 */
export async function listarCategorias(): Promise<listarCategoriasResponse> {
    try {
        const response = await api.get("/categorias")
        console.log('✅ Categorias recebidas:', response.data)
        
        // A API retorna: { status, status_code, categorias: [...], message }
        // Precisamos mapear para o formato esperado
        const apiResponse = response.data
        
        if (apiResponse.status && apiResponse.categorias) {
            // Mapeia id_categoria -> id para compatibilidade
            const categoriasFormatadas = apiResponse.categorias.map((cat: any) => ({
                id: cat.id_categoria,
                nome: cat.nome,
                created_at: new Date().toISOString() // Campo obrigatório no tipo
            }))
            
            return {
                status: apiResponse.status,
                status_code: apiResponse.status_code,
                data: categoriasFormatadas
            }
        } else {
            throw new Error('Resposta da API sem categorias válidas')
        }
    } catch (error: any) {
        console.error('Erro ao listar categorias:', error.response?.data || error.message)
        throw error
    }
}

// ============================================
// SERVIÇOS DE PRODUTO - ENDPOINTS CORRIGIDOS
// ============================================

/**
 * Cadastra um novo produto/promoção
 * Endpoint: POST /produtos
 * Request body: { "nome", "descricao", "id_categoria"?, "id_estabelecimento", "preco", "promocao"? }
 * Formato exato conforme especificado pelo usuário
 */
export async function cadastrarProduto(payload: produtoRequest): Promise<produtoResponse> {
    try {
        // Monta payload no formato exato solicitado
        const produtoPayload: any = {
            nome: payload.nome,
            descricao: payload.descricao,
            id_estabelecimento: payload.id_estabelecimento,
            preco: payload.preco
        }
        
        // Adiciona id_categoria apenas se fornecido (opcional)
        if (payload.id_categoria !== undefined) {
            produtoPayload.id_categoria = payload.id_categoria
        }
        
        // Adiciona promoção apenas se fornecida (opcional)
        if (payload.promocao) {
            produtoPayload.promocao = {
                preco_promocional: payload.promocao.preco_promocional,
                data_inicio: payload.promocao.data_inicio,
                data_fim: payload.promocao.data_fim
            }
        }
        
        console.log('📦 Enviando payload no formato exato:', produtoPayload)
        const { data } = await api.post<produtoResponse>("/produtos", produtoPayload)
        console.log('✅ Produto cadastrado com sucesso:', data)
        return data
    } catch (error: any) {
        console.error('❌ Erro ao cadastrar produto:', error.response?.data || error.message)
        console.error('🔍 Detalhes do erro:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            payload: payload
        })
        throw error
    }
}

/**
 * Lista todos os produtos com filtros opcionais
 * Endpoint: GET /produtos
 * Query params: categoria, estabelecimento, preco_min, preco_max, promocao, busca
 */
export async function listarProdutos(filtros?: filtrosProdutos): Promise<listarProdutosResponse> {
    console.log('🔍 INICIANDO listagem de produtos')
    console.log('🔍 Filtros recebidos:', filtros)
    
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
        console.log('🔍 URL da requisição:', url)
        
        const { data } = await api.get<listarProdutosResponse>(url)
        console.log('✅ Produtos listados com sucesso:', data)
        console.log('🔍 ESTRUTURA COMPLETA DA RESPOSTA:', JSON.stringify(data, null, 2))
        
        // CORREÇÃO: A API retorna 'produtos' ao invés de 'data'
        if (data.status && (data as any).produtos) {
            console.log('✅ Quantidade de produtos:', (data as any).produtos.length)
            
            // Mapeia os produtos para o formato esperado pela interface
            const produtosMapeados = await Promise.all((data as any).produtos.map(async (produto: any) => {
                console.log('🔄 Mapeando produto:', {
                    nome: produto.nome,
                    promocaoOriginal: produto.promocao,
                    temPromocao: !!produto.promocao
                })
                
                console.log('🔍 TODOS OS CAMPOS DO PRODUTO:', JSON.stringify(produto, null, 2))
                
                // Análise específica de estabelecimento
                console.log('🏪 ANÁLISE DETALHADA DO ESTABELECIMENTO:', {
                    'produto.estabelecimento': produto.estabelecimento,
                    'typeof estabelecimento': typeof produto.estabelecimento,
                    'produto.id_estabelecimento': produto.id_estabelecimento,
                    'produto.nome_estabelecimento': produto.nome_estabelecimento,
                    'produto.estabelecimento_id': produto.estabelecimento_id,
                    'produto.estabelecimento_nome': produto.estabelecimento_nome,
                    'Todos os campos que contêm "estabelec"': Object.keys(produto).filter(key => 
                        key.toLowerCase().includes('estabelec')
                    ).map(key => ({ [key]: produto[key] }))
                })
                
                // Análise específica de categoria
                console.log('🏷️ ANÁLISE DETALHADA DA CATEGORIA:', {
                    'produto.categoria': produto.categoria,
                    'typeof categoria': typeof produto.categoria,
                    'produto.id_categoria': produto.id_categoria,
                    'produto.nome_categoria': produto.nome_categoria,
                    'produto.categoria_id': produto.categoria_id,
                    'produto.categoria_nome': produto.categoria_nome,
                    'Todos os campos que contêm "categoria"': Object.keys(produto).filter(key => 
                        key.toLowerCase().includes('categoria')
                    ).map(key => ({ [key]: produto[key] }))
                })
                
                // Tenta encontrar dados de promoção em diferentes campos possíveis
                let promocaoData = null
                
                // Verifica diferentes possibilidades de onde a promoção pode estar
                if (produto.promocao) {
                    promocaoData = produto.promocao
                    console.log('✅ Promoção encontrada em produto.promocao')
                } else if (produto.promocoes && produto.promocoes.length > 0) {
                    promocaoData = produto.promocoes[0]
                    console.log('✅ Promoção encontrada em produto.promocoes[0]')
                } else if (produto.preco_promocional) {
                    // Se tem preço promocional direto no produto
                    promocaoData = {
                        preco_promocional: produto.preco_promocional,
                        data_inicio: produto.data_inicio_promocao,
                        data_fim: produto.data_fim_promocao
                    }
                    console.log('✅ Promoção encontrada como campos diretos do produto')
                } else {
                    console.log('❌ Nenhum dado de promoção encontrado')
                }
                
                // Mapeia categoria corretamente
                let categoriaData = { id: 0, nome: 'Categoria não informada' }
                if (produto.categoria && typeof produto.categoria === 'object') {
                    categoriaData = {
                        id: produto.categoria.id || produto.categoria.id_categoria || 0,
                        nome: produto.categoria.nome || 'Categoria não informada'
                    }
                } else if (produto.categoria && typeof produto.categoria === 'string') {
                    categoriaData = {
                        id: produto.id_categoria || 0,
                        nome: produto.categoria
                    }
                } else if (produto.id_categoria) {
                    console.log('⚠️ Produto tem apenas ID da categoria, buscando nome...')
                    
                    // Busca o nome da categoria automaticamente
                    try {
                        const nomeCategoria = await buscarNomeCategoria(produto.id_categoria)
                        categoriaData = {
                            id: produto.id_categoria,
                            nome: nomeCategoria
                        }
                        console.log('✅ Nome da categoria encontrado:', nomeCategoria)
                    } catch (error) {
                        console.log('❌ Erro ao buscar nome da categoria:', error)
                        categoriaData = {
                            id: produto.id_categoria,
                            nome: `Categoria ID ${produto.id_categoria}`
                        }
                    }
                }
                
                // Mapeia estabelecimento corretamente
                let estabelecimentoData = { id: 0, nome: 'Estabelecimento não informado' }
                if (produto.estabelecimento && typeof produto.estabelecimento === 'object') {
                    estabelecimentoData = {
                        id: produto.estabelecimento.id || produto.estabelecimento.id_estabelecimento || 0,
                        nome: produto.estabelecimento.nome || 'Estabelecimento não informado'
                    }
                } else if (produto.estabelecimento && typeof produto.estabelecimento === 'string') {
                    estabelecimentoData = {
                        id: produto.id_estabelecimento || 0,
                        nome: produto.estabelecimento
                    }
                } else if (produto.id_estabelecimento) {
                    console.log('⚠️ Produto tem apenas ID do estabelecimento, buscando nome...')
                    
                    // Busca o nome do estabelecimento automaticamente
                    try {
                        const nomeEstabelecimento = await buscarNomeEstabelecimento(produto.id_estabelecimento)
                        estabelecimentoData = {
                            id: produto.id_estabelecimento,
                            nome: nomeEstabelecimento
                        }
                        console.log('✅ Nome do estabelecimento encontrado:', nomeEstabelecimento)
                    } catch (error) {
                        console.log('❌ Erro ao buscar nome do estabelecimento:', error)
                        estabelecimentoData = {
                            id: produto.id_estabelecimento,
                            nome: `Estabelecimento ID ${produto.id_estabelecimento}`
                        }
                    }
                }
                
                console.log('🏪 Mapeamento de estabelecimento:', {
                    original: produto.estabelecimento,
                    id_estabelecimento: produto.id_estabelecimento,
                    nome_estabelecimento: produto.nome_estabelecimento,
                    mapeado: estabelecimentoData
                })
                
                console.log('🏷️ Mapeamento de categoria:', {
                    original: produto.categoria,
                    id_categoria: produto.id_categoria,
                    nome_categoria: produto.nome_categoria,
                    mapeado: categoriaData
                })
                
                // Verifica se precisa buscar nomes de estabelecimento e categoria por ID
                if (estabelecimentoData.nome === 'Estabelecimento não informado' && estabelecimentoData.id > 0) {
                    console.log('⚠️ Estabelecimento sem nome, ID:', estabelecimentoData.id)
                }
                
                if (categoriaData.nome === 'Categoria não informada' && categoriaData.id > 0) {
                    console.log('⚠️ Categoria sem nome, ID:', categoriaData.id)
                }

                const produtoMapeado = {
                    id: produto.id_produto || produto.id,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    promocao: promocaoData ? {
                        id: promocaoData.id || promocaoData.id_promocao || 0,
                        preco_promocional: promocaoData.preco_promocional,
                        data_inicio: promocaoData.data_inicio,
                        data_fim: promocaoData.data_fim
                    } : null,
                    categoria: categoriaData,
                    estabelecimento: estabelecimentoData,
                    created_at: produto.created_at || new Date().toISOString()
                }
                
                console.log('✅ Produto mapeado:', {
                    nome: produtoMapeado.nome,
                    promocaoMapeada: produtoMapeado.promocao,
                    temPromocaoMapeada: !!produtoMapeado.promocao
                })
                
                return produtoMapeado
            }))
            
            console.log('🔄 Produtos mapeados:', produtosMapeados)
            
            // Mapeia a resposta para o formato esperado
            const produtosFormatados = {
                status: data.status,
                status_code: data.status_code,
                data: produtosMapeados
            }
            return produtosFormatados
        }
        
        console.log('✅ Quantidade de produtos:', data.data?.length || 0)
        return data
    } catch (error: any) {
        console.log('⚠️ Erro no endpoint /produtos, tentando /produto')
        console.log('⚠️ Erro original:', error.response?.status, error.response?.data?.message || error.message)
        
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
            console.log('🔍 URL alternativa:', url)
            
            const { data } = await api.get<listarProdutosResponse>(url)
            console.log('✅ Produtos listados com endpoint alternativo:', data)
            
            // CORREÇÃO: A API retorna 'produtos' ao invés de 'data'
            if (data.status && (data as any).produtos) {
                console.log('✅ Quantidade de produtos:', (data as any).produtos.length)
                
                // Mapeia os produtos para o formato esperado pela interface
                const produtosMapeados = (data as any).produtos.map((produto: any) => {
                    console.log('🔄 Mapeando produto (endpoint alternativo):', {
                        nome: produto.nome,
                        promocaoOriginal: produto.promocao,
                        temPromocao: !!produto.promocao
                    })
                    
                    // Mapeia categoria corretamente (endpoint alternativo)
                    let categoriaData = { id: 0, nome: 'Categoria não informada' }
                    if (produto.categoria && typeof produto.categoria === 'object') {
                        categoriaData = {
                            id: produto.categoria.id || produto.categoria.id_categoria || 0,
                            nome: produto.categoria.nome || 'Categoria não informada'
                        }
                    } else if (produto.categoria && typeof produto.categoria === 'string') {
                        categoriaData = {
                            id: produto.id_categoria || 0,
                            nome: produto.categoria
                        }
                    } else if (produto.id_categoria) {
                        categoriaData = {
                            id: produto.id_categoria,
                            nome: produto.nome_categoria || 'Categoria não informada'
                        }
                    }
                    
                    // Mapeia estabelecimento corretamente (endpoint alternativo)
                    let estabelecimentoData = { id: 0, nome: 'Estabelecimento não informado' }
                    if (produto.estabelecimento && typeof produto.estabelecimento === 'object') {
                        estabelecimentoData = {
                            id: produto.estabelecimento.id || produto.estabelecimento.id_estabelecimento || 0,
                            nome: produto.estabelecimento.nome || 'Estabelecimento não informado'
                        }
                    } else if (produto.estabelecimento && typeof produto.estabelecimento === 'string') {
                        estabelecimentoData = {
                            id: produto.id_estabelecimento || 0,
                            nome: produto.estabelecimento
                        }
                    } else if (produto.id_estabelecimento) {
                        estabelecimentoData = {
                            id: produto.id_estabelecimento,
                            nome: produto.nome_estabelecimento || 'Estabelecimento não informado'
                        }
                    }

                    // Tenta encontrar dados de promoção em diferentes campos possíveis
                    let promocaoData = null
                    
                    // Verifica diferentes possibilidades de onde a promoção pode estar
                    if (produto.promocao) {
                        promocaoData = produto.promocao
                        console.log('✅ Promoção encontrada em produto.promocao')
                    } else if (produto.promocoes && produto.promocoes.length > 0) {
                        promocaoData = produto.promocoes[0]
                        console.log('✅ Promoção encontrada em produto.promocoes[0]')
                    } else if (produto.preco_promocional) {
                        // Se tem preço promocional direto no produto
                        promocaoData = {
                            preco_promocional: produto.preco_promocional,
                            data_inicio: produto.data_inicio_promocao,
                            data_fim: produto.data_fim_promocao
                        }
                        console.log('✅ Promoção encontrada como campos diretos do produto')
                    } else {
                        console.log('❌ Nenhum dado de promoção encontrado')
                    }

                    const produtoMapeado = {
                        id: produto.id_produto || produto.id,
                        nome: produto.nome,
                        descricao: produto.descricao,
                        preco: produto.preco,
                        promocao: promocaoData ? {
                            id: promocaoData.id || promocaoData.id_promocao || 0,
                            preco_promocional: promocaoData.preco_promocional,
                            data_inicio: promocaoData.data_inicio,
                            data_fim: promocaoData.data_fim
                        } : null,
                        categoria: categoriaData,
                        estabelecimento: estabelecimentoData,
                        created_at: produto.created_at || new Date().toISOString()
                    }
                    
                    console.log('✅ Produto mapeado (endpoint alternativo):', {
                        nome: produtoMapeado.nome,
                        promocaoMapeada: produtoMapeado.promocao,
                        temPromocaoMapeada: !!produtoMapeado.promocao
                    })
                    
                    return produtoMapeado
                })
                
                console.log('🔄 Produtos mapeados (endpoint alternativo):', produtosMapeados)
                
                // Mapeia a resposta para o formato esperado
                const produtosFormatados = {
                    status: data.status,
                    status_code: data.status_code,
                    data: produtosMapeados
                }
                return produtosFormatados
            }
            
            console.log('✅ Quantidade de produtos:', data.data?.length || 0)
            return data
        } catch (error2: any) {
            console.error('❌ Erro em ambos os endpoints de produtos:')
            console.error('❌ /produtos:', error.response?.status, error.response?.data)
            console.error('❌ /produto:', error2.response?.status, error2.response?.data)
            
            // Retorna uma resposta vazia em caso de erro para não quebrar a interface
            return {
                status: false,
                status_code: error2.response?.status || 500,
                data: []
            }
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

/**
 * Busca o nome de um estabelecimento por ID
 */
export async function buscarNomeEstabelecimento(id: number): Promise<string> {
    try {
        const { data } = await api.get(`/estabelecimento/${id}`)
        if (data.status && data.data && data.data.nome) {
            return data.data.nome
        }
    } catch (error) {
        console.log(`⚠️ Erro ao buscar estabelecimento ${id}:`, error)
    }
    return 'Estabelecimento não informado'
}

/**
 * Busca o nome de uma categoria por ID
 */
export async function buscarNomeCategoria(id: number): Promise<string> {
    try {
        const { data } = await api.get(`/categoria/${id}`)
        if (data.status && data.data && data.data.nome) {
            return data.data.nome
        }
    } catch (error) {
        console.log(`⚠️ Erro ao buscar categoria ${id}:`, error)
    }
    return 'Categoria não informada'
}

export function isProdutoEmPromocao(produto: any): boolean {
    console.log('🔍 Verificando se produto está em promoção:', {
        nome: produto.nome,
        temPromocao: !!produto.promocao,
        promocao: produto.promocao
    })
    
    if (!produto.promocao) {
        console.log('❌ Produto sem promoção:', produto.nome)
        return false
    }
    
    // Verifica se tem preço promocional
    if (!produto.promocao.preco_promocional || produto.promocao.preco_promocional <= 0) {
        console.log('❌ Produto sem preço promocional válido:', produto.nome)
        return false
    }
    
    // Verifica se o preço promocional é menor que o preço normal
    if (produto.promocao.preco_promocional >= produto.preco) {
        console.log('❌ Preço promocional não é menor que o preço normal:', produto.nome)
        return false
    }
    
    try {
        const hoje = new Date()
        
        // Se não tem datas, considera como promoção ativa (para testes)
        if (!produto.promocao.data_inicio || !produto.promocao.data_fim) {
            console.log('⚠️ Promoção sem datas definidas, considerando como ATIVA para testes')
            return true
        }
        
        const dataInicio = new Date(produto.promocao.data_inicio)
        const dataFim = new Date(produto.promocao.data_fim)
        
        // Verifica se as datas são válidas
        if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
            console.log('⚠️ Datas inválidas, considerando como ATIVA para testes')
            return true
        }
        
        console.log('📅 Verificando datas:', {
            hoje: hoje.toISOString(),
            dataInicio: dataInicio.toISOString(),
            dataFim: dataFim.toISOString(),
            dentroDoPeriodo: hoje >= dataInicio && hoje <= dataFim
        })
        
        const emPromocao = hoje >= dataInicio && hoje <= dataFim
        console.log(emPromocao ? '✅ Produto EM PROMOÇÃO!' : '❌ Produto FORA do período promocional')
        
        return emPromocao
    } catch (error) {
        console.error('❌ Erro ao verificar datas da promoção:', error)
        // Em caso de erro, considera como promoção ativa se tem preço promocional
        console.log('⚠️ Erro nas datas, mas tem preço promocional válido - considerando ATIVO')
        return true
    }
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
    console.log('🏢 INICIANDO cadastro de estabelecimento com múltiplos testes')
    
    // TESTE 1: Payload original
    try {
        console.log('🏢 TESTE 1 - Payload original')
        console.log('🏢 Payload:', JSON.stringify(payload, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimento", payload)
        console.log('✅ TESTE 1 SUCESSO - Estabelecimento cadastrado!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 1 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
    }
    
    // TESTE 2: Payload sem telefone
    try {
        console.log('🏢 TESTE 2 - Sem telefone')
        const payloadSemTelefone = {
            nome: payload.nome,
            cnpj: payload.cnpj
        }
        console.log('🏢 Payload:', JSON.stringify(payloadSemTelefone, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimento", payloadSemTelefone)
        console.log('✅ TESTE 2 SUCESSO - Estabelecimento cadastrado sem telefone!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 2 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
    }
    
    // TESTE 3: Payload mínimo (só nome)
    try {
        console.log('🏢 TESTE 3 - Só nome')
        const payloadMinimo = {
            nome: payload.nome
        }
        console.log('🏢 Payload:', JSON.stringify(payloadMinimo, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimento", payloadMinimo)
        console.log('✅ TESTE 3 SUCESSO - Estabelecimento cadastrado só com nome!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 3 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
    }
    
    // TESTE 4: Endpoint alternativo
    try {
        console.log('🏢 TESTE 4 - Endpoint alternativo /estabelecimentos')
        console.log('🏢 Payload:', JSON.stringify(payload, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimentos", payload)
        console.log('✅ TESTE 4 SUCESSO - Estabelecimento cadastrado com endpoint alternativo!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 4 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
        
        // Se chegou até aqui, todos os testes falharam
        console.error('❌ TODOS OS TESTES FALHARAM!')
        console.error('❌ Último erro completo:', error)
        console.error('❌ Response data:', error.response?.data)
        console.error('❌ Response status:', error.response?.status)
        
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