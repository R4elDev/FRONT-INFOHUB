import api from '../lib/api'
import type { 
    enderecoRequest, enderecoResponse,
    estabelecimentoRequest, estabelecimentoResponse, listarEstabelecimentosResponse,
    categoriaRequest, categoriaResponse, listarCategoriasResponse,
    produtoRequest, produtoResponse, filtrosProdutos, listarProdutosResponse,
    atualizarUsuarioRequest, atualizarEmpresaRequest, atualizarUsuarioResponse,
    AdicionarFavoritoResponse,
    RemoverFavoritoRequest,
    ListarFavoritosResponse
} from './types'

// ============================================
// UTILITÁRIOS DE AUTENTICAÇÃO
// ============================================

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    return !!(token && userData)
}

/**
 * Obtém informações do usuário logado
 */
export function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user_data')
        return userData ? JSON.parse(userData) : null
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
        return null
    }
}

/**
 * Verifica se o token está válido (básico)
 */
export function checkTokenValidity(): { valid: boolean, token: string | null } {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
        return { valid: false, token: null }
    }
    
    // Verifica se o token não está vazio
    if (token.trim().length === 0) {
        return { valid: false, token }
    }
    
    return { valid: true, token }
}

/**
 * Função de teste para verificar se a API está funcionando
 */
export async function testarListagemProdutos() {
    console.log('🧪 TESTE - Iniciando teste de listagem de produtos')
    
    try {
        // Verifica token
        const { valid } = checkTokenValidity()
        console.log('🔐 Token válido:', valid)
        
        if (!valid) {
            console.error('❌ Token inválido - faça login novamente')
            return
        }
        
        // Testa requisição simples
        console.log('📞 Fazendo requisição GET /produtos')
        const response = await api.get('/produtos')
        console.log('✅ Resposta recebida:', response.data)
        console.log('📊 Status da resposta:', response.status)
        console.log('📋 Headers:', response.headers)
        
        return response.data
    } catch (error: any) {
        console.error('❌ ERRO no teste:', error)
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Data:', error.response?.data)
        console.error('❌ Message:', error.message)
        
        if (error.response?.status === 401) {
            console.error('🔐 ERRO 401 - Token inválido ou expirado')
        }
        
        throw error
    }
}

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
 * CORREÇÃO: Precisa passar id_estabelecimento, não id_usuario
 */
export async function cadastrarEnderecoEstabelecimento(payload: any): Promise<any> {
    console.log('🏢 Criando endereço de estabelecimento')
    console.log('🏢 Payload recebido:', JSON.stringify(payload, null, 2))
    
    // Obtém o ID do estabelecimento do localStorage
    const estabelecimentoId = localStorage.getItem('estabelecimentoId')
    console.log('🏢 ID do estabelecimento:', estabelecimentoId)
    
    // CORREÇÃO: Preparar payload com id_estabelecimento
    const payloadCorrigido = {
        ...payload,
        id_estabelecimento: estabelecimentoId ? parseInt(estabelecimentoId) : payload.id_estabelecimento
    }
    
    // TENTATIVA 1: Endpoint específico para estabelecimento
    try {
        console.log('🏢 TENTATIVA 1: POST /endereco-estabelecimento')
        console.log('🏢 Payload:', JSON.stringify(payloadCorrigido, null, 2))
        
        const response = await api.post("/endereco-estabelecimento", payloadCorrigido)
        console.log('✅ Endereço de estabelecimento salvo com sucesso!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        
        salvarEnderecoNoLocalStorage(response.data, payload)
        return response.data
    } catch (error1: any) {
        console.log('⚠️ TENTATIVA 1 FALHOU:', error1.response?.status, error1.response?.data?.message || error1.message)
    }
    
    // TENTATIVA 2: Endpoint de endereço do usuário (fallback)
    try {
        console.log('🏢 TENTATIVA 2: POST /endereco-usuario (fallback)')
        console.log('🏢 Payload:', JSON.stringify(payload, null, 2))
        
        const response = await api.post("/endereco-usuario", payload)
        console.log('✅ Endereço salvo via /endereco-usuario!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        
        salvarEnderecoNoLocalStorage(response.data, payload)
        return response.data
    } catch (error2: any) {
        console.log('⚠️ TENTATIVA 2 FALHOU:', error2.response?.status, error2.response?.data?.message || error2.message)
    }
    
    // TENTATIVA 3: PUT para atualizar estabelecimento com endereço
    try {
        if (estabelecimentoId) {
            console.log('🏢 TENTATIVA 3: PUT /estabelecimento/:id com endereço')
            
            const payloadUpdate = {
                cep: payload.cep,
                logradouro: payload.logradouro,
                numero: payload.numero,
                complemento: payload.complemento || '',
                bairro: payload.bairro,
                cidade: payload.cidade,
                estado: payload.estado,
                latitude: payload.latitude || null,
                longitude: payload.longitude || null
            }
            
            console.log('🏢 Payload:', JSON.stringify(payloadUpdate, null, 2))
            
            const response = await api.put(`/estabelecimento/${estabelecimentoId}`, payloadUpdate)
            console.log('✅ Estabelecimento atualizado com endereço!')
            console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
            
            salvarEnderecoNoLocalStorage(response.data, payload)
            return response.data
        }
    } catch (error3: any) {
        console.log('⚠️ TENTATIVA 3 FALHOU:', error3.response?.status, error3.response?.data?.message || error3.message)
    }
    
    // Se todas falharam, pelo menos salva no localStorage para exibição
    console.log('⚠️ Salvando endereço apenas no localStorage (backend indisponível)')
    salvarEnderecoNoLocalStorage(null, payload)
    
    return { status: true, message: 'Endereço salvo localmente' }
}

/**
 * Salva endereço formatado no localStorage para exibição
 * IMPORTANTE: Inclui latitude/longitude para exibição no mapa
 */
function salvarEnderecoNoLocalStorage(responseData: any, payload: any): void {
    try {
        const endereco = responseData?.id || responseData?.data || payload
        
        // Garante que as coordenadas do payload original sejam mantidas
        const enderecoCompleto = {
            ...endereco,
            latitude: payload.latitude || endereco.latitude || null,
            longitude: payload.longitude || endereco.longitude || null
        }
        
        const enderecoFormatado = `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ', ' + endereco.complemento : ''} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`
        
        localStorage.setItem('estabelecimentoEndereco', enderecoFormatado)
        localStorage.setItem('estabelecimentoEnderecoCompleto', JSON.stringify(enderecoCompleto))
        
        console.log('✅ Endereço salvo no localStorage:', enderecoFormatado)
        console.log('📍 Coordenadas salvas:', { lat: enderecoCompleto.latitude, lon: enderecoCompleto.longitude })
    } catch (error) {
        console.error('❌ Erro ao salvar endereço no localStorage:', error)
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
        const apiResponse = response.data as any
        
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
 * Request body: { "nome", "descricao", "id_categoria"?, "id_estabelecimento", "preco", "promocao"?, "imagem"? }
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
        
        // Adiciona imagem apenas se fornecida (opcional)
        if (payload.imagem) {
            produtoPayload.imagem = payload.imagem
        }
        
        // Adiciona promoção apenas se fornecida (opcional)
        if (payload.promocao) {
            produtoPayload.promocao = {
                preco_promocional: payload.promocao.preco_promocional,
                data_inicio: payload.promocao.data_inicio,
                data_fim: payload.promocao.data_fim
            }
        }
        
        console.log(' Enviando payload no formato exato:', produtoPayload)
        const { data } = await api.post<produtoResponse>("/produtos", produtoPayload)
        console.log(' Produto cadastrado com sucesso:', data)
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
    try {
        const params = new URLSearchParams()
        
        if (filtros) {
            if (filtros.categoria) {
                params.append('categoria', filtros.categoria.toString())
            }
            if (filtros.estabelecimento) {
                params.append('estabelecimento', filtros.estabelecimento.toString())
            }
            if (filtros.preco_min) {
                params.append('preco_min', filtros.preco_min.toString())
            }
            if (filtros.preco_max) {
                params.append('preco_max', filtros.preco_max.toString())
            }
            if (filtros.promocao !== undefined) {
                params.append('promocao', filtros.promocao.toString())
            }
            if (filtros.busca) {
                params.append('busca', filtros.busca)
            }
        }
        
        const url = params.toString() ? `/produtos?${params.toString()}` : '/produtos'
        
        const { data } = await api.get<listarProdutosResponse>(url)
        
        console.log('🔍 [RESPOSTA ORIGINAL DA API]:', JSON.stringify(data, null, 2))
        
        // Verifica se a resposta tem a estrutura esperada
        if (!data) {
            return { status: false, status_code: 500, data: [] }
        }
        
        if (!data.status) {
            return { status: false, status_code: data.status_code || 500, data: [] }
        }
        
        // CORREÇÃO: A API retorna 'produtos' ao invés de 'data'
        if (data.status && (data as any).produtos) {
            // Mapeia os produtos para o formato esperado pela interface
            const produtosMapeados = await Promise.all((data as any).produtos.map(async (produto: any) => {
                
                // Tenta encontrar dados de promoção em diferentes campos possíveis
                let promocaoData = null
                
                console.log('🔍 [MAPEAMENTO] Produto:', produto.nome)
                console.log('🔍 [MAPEAMENTO] preco_promocional:', produto.preco_promocional)
                console.log('🔍 [MAPEAMENTO] data_inicio:', produto.data_inicio)
                console.log('🔍 [MAPEAMENTO] data_fim:', produto.data_fim)
                
                // CORREÇÃO: A API retorna os campos diretos no produto
                if (produto.preco_promocional && produto.preco_promocional !== null) {
                    promocaoData = {
                        preco_promocional: produto.preco_promocional,
                        data_inicio: produto.data_inicio,
                        data_fim: produto.data_fim
                    }
                    console.log('✅ [MAPEAMENTO] Promoção encontrada nos campos diretos:', promocaoData)
                } else if (produto.promocao) {
                    promocaoData = produto.promocao
                    console.log('✅ [MAPEAMENTO] Promoção encontrada em produto.promocao:', promocaoData)
                } else if (produto.promocoes && produto.promocoes.length > 0) {
                    promocaoData = produto.promocoes[0]
                    console.log('✅ [MAPEAMENTO] Promoção encontrada em produto.promocoes[0]:', promocaoData)
                } else {
                    console.log('❌ [MAPEAMENTO] Nenhuma promoção encontrada')
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
                    // Busca o nome da categoria automaticamente
                    try {
                        const nomeCategoria = await buscarNomeCategoria(produto.id_categoria)
                        categoriaData = {
                            id: produto.id_categoria,
                            nome: nomeCategoria
                        }
                    } catch (error) {
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
                    // Busca o nome do estabelecimento automaticamente
                    try {
                        const nomeEstabelecimento = await buscarNomeEstabelecimento(produto.id_estabelecimento)
                        estabelecimentoData = {
                            id: produto.id_estabelecimento,
                            nome: nomeEstabelecimento
                        }
                    } catch (error) {
                        estabelecimentoData = {
                            id: produto.id_estabelecimento,
                            nome: `Estabelecimento ID ${produto.id_estabelecimento}`
                        }
                    }
                }
                

                const produtoMapeado = {
                    id: produto.id_produto || produto.id,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    imagem: produto.imagem || null,
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
                    
                    // CORREÇÃO: A API retorna os campos diretos no produto
                    if (produto.preco_promocional && produto.preco_promocional !== null) {
                        promocaoData = {
                            preco_promocional: produto.preco_promocional,
                            data_inicio: produto.data_inicio,
                            data_fim: produto.data_fim
                        }
                        console.log('✅ Promoção encontrada nos campos diretos (alternativo):', promocaoData)
                    } else if (produto.promocao) {
                        promocaoData = produto.promocao
                        console.log('✅ Promoção encontrada em produto.promocao')
                    } else if (produto.promocoes && produto.promocoes.length > 0) {
                        promocaoData = produto.promocoes[0]
                        console.log('✅ Promoção encontrada em produto.promocoes[0]')
                    } else {
                        console.log('❌ Nenhum dado de promoção encontrado')
                    }

                    const produtoMapeado = {
                        id: produto.id_produto || produto.id,
                        nome: produto.nome,
                        descricao: produto.descricao,
                        preco: produto.preco,
                        imagem: produto.imagem || null,
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
        console.log(`🔍 Buscando nome do estabelecimento ID: ${id}`)
        const response = await api.get(`/estabelecimento/${id}`)
        const data = response.data as any
        console.log(`📦 Resposta do estabelecimento ${id}:`, data)
        
        // Tenta diferentes estruturas de resposta
        if (data.status) {
            const estabelecimento = data.data || data.estabelecimento || data
            if (estabelecimento.nome) {
                console.log(`✅ Nome encontrado: ${estabelecimento.nome}`)
                return estabelecimento.nome
            }
        }
        
        // Fallback: verifica se o nome está diretamente no data
        if (data.nome) {
            return data.nome
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
        const response = await api.get(`/categoria/${id}`)
        const data = response.data as any
        if (data.status && data.data && data.data.nome) {
            return data.data.nome
        }
    } catch (error) {
        console.log(`⚠️ Erro ao buscar categoria ${id}:`, error)
    }
    return 'Categoria não informada'
}

export function isProdutoEmPromocao(produto: any): boolean {
    console.log('🔍 [isProdutoEmPromocao] Verificando produto:', produto.nome || produto.id)
    
    // Verifica diferentes estruturas de promoção que podem vir da API
    let promocaoData = null
    
    // Tenta encontrar dados de promoção em diferentes campos
    // PRIORIDADE 1: Objeto promocao já mapeado
    if (produto.promocao && typeof produto.promocao === 'object') {
        promocaoData = produto.promocao
        console.log('✅ [isProdutoEmPromocao] Promoção encontrada em produto.promocao')
    } 
    // PRIORIDADE 2: Campos diretos da API (preco_promocional, data_inicio, data_fim)
    else if (produto.preco_promocional !== undefined && produto.preco_promocional !== null) {
        promocaoData = {
            preco_promocional: produto.preco_promocional,
            data_inicio: produto.data_inicio,
            data_fim: produto.data_fim
        }
        console.log('✅ [isProdutoEmPromocao] Promoção encontrada como campos diretos')
    } 
    // PRIORIDADE 3: Array de promocoes
    else if (Array.isArray(produto.promocoes) && produto.promocoes.length > 0) {
        promocaoData = produto.promocoes[0]
        console.log('✅ [isProdutoEmPromocao] Promoção encontrada em produto.promocoes[0]')
    } else {
        console.log('❌ [isProdutoEmPromocao] Nenhum dado de promoção encontrado')
        return false
    }
    
    // Se não tem dados de promoção
    if (!promocaoData) {
        return false
    }
    
    // Verifica se tem preço promocional válido
    const precoPromocional = Number(promocaoData.preco_promocional)
    const precoNormal = Number(produto.preco)
    
    console.log('💰 [isProdutoEmPromocao] Preço promocional:', precoPromocional)
    console.log('💰 [isProdutoEmPromocao] Preço normal:', precoNormal)
    
    // CRITÉRIO PRINCIPAL: Preço promocional deve ser menor que o normal
    if (isNaN(precoPromocional) || precoPromocional <= 0) {
        console.log('❌ [isProdutoEmPromocao] Preço promocional inválido')
        return false
    }
    
    if (isNaN(precoNormal) || precoNormal <= 0) {
        console.log('❌ [isProdutoEmPromocao] Preço normal inválido')
        return false
    }
    
    if (precoPromocional >= precoNormal) {
        console.log('❌ [isProdutoEmPromocao] Preço promocional não é menor que o normal')
        return false
    }
    
    // VALIDAÇÃO DE DATAS (mais flexível)
    try {
        const dataInicio = promocaoData.data_inicio
        const dataFim = promocaoData.data_fim
        
        // Se não tem datas, ou são null/undefined, considera promoção ATIVA
        if (!dataInicio && !dataFim) {
            console.log('✅ [isProdutoEmPromocao] COM PROMOÇÃO (sem datas = sempre ativa)')
            return true
        }
        
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        
        // Se tem data de início, valida
        if (dataInicio) {
            const inicio = new Date(dataInicio)
            if (!isNaN(inicio.getTime())) {
                inicio.setHours(0, 0, 0, 0)
                if (hoje < inicio) {
                    console.log('❌ [isProdutoEmPromocao] Promoção ainda não começou')
                    return false
                }
            }
        }
        
        // Se tem data de fim, valida
        if (dataFim) {
            const fim = new Date(dataFim)
            if (!isNaN(fim.getTime())) {
                fim.setHours(23, 59, 59, 999)
                if (hoje > fim) {
                    console.log('❌ [isProdutoEmPromocao] Promoção já expirou')
                    return false
                }
            }
        }
        
        console.log('✅ [isProdutoEmPromocao] COM PROMOÇÃO (dentro do período)')
        return true
        
    } catch (error) {
        // Em caso de erro na validação de datas, se tem preço promocional válido, considera ativo
        console.log('✅ [isProdutoEmPromocao] COM PROMOÇÃO (erro nas datas, mas preço válido)')
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
    console.log('🏢 INICIANDO cadastro de estabelecimento')
    
    // Obtém o ID do usuário do localStorage
    const userData = localStorage.getItem('user_data')
    if (!userData) {
        throw new Error('Usuário não autenticado')
    }
    
    const user = JSON.parse(userData)
    console.log('👤 Usuário atual:', user.id)
    
    // VERIFICAÇÃO: Checar se o usuário já tem um estabelecimento cadastrado
    try {
        console.log('🔍 Verificando se usuário já possui estabelecimento...')
        const verificacao = await api.get<any>('/estabelecimentos/todos')
        
        if (verificacao.data?.status && verificacao.data?.data) {
            const estabelecimentoExistente = verificacao.data.data.find(
                (e: any) => e.id_usuario === user.id
            )
            
            if (estabelecimentoExistente) {
                console.log('⚠️ Usuário já possui estabelecimento:', estabelecimentoExistente.nome)
                
                // Salvar no localStorage e retornar o existente
                localStorage.setItem('estabelecimentoId', String(estabelecimentoExistente.id_estabelecimento))
                localStorage.setItem('estabelecimentoNome', estabelecimentoExistente.nome)
                localStorage.setItem('estabelecimentoUserId', String(user.id))
                localStorage.setItem('estabelecimentoCNPJ', estabelecimentoExistente.cnpj || '')
                
                return {
                    status: true,
                    status_code: 200,
                    message: 'Estabelecimento já cadastrado para este usuário',
                    data: estabelecimentoExistente
                } as estabelecimentoResponse
            }
        }
    } catch (error: any) {
        console.log('⚠️ Erro ao verificar estabelecimento existente:', error.message)
        // Continua com o cadastro se a verificação falhar
    }
    
    // TESTE 1: Payload com id_usuario (OBRIGATÓRIO segundo a API)
    try {
        console.log('🏢 TESTE 1 - Payload completo com id_usuario')
        const payloadCompleto = {
            id_usuario: user.id,
            nome: payload.nome,
            cnpj: payload.cnpj.replace(/\D/g, ''), // Remove formatação
            telefone: payload.telefone
        }
        console.log('🏢 Payload:', JSON.stringify(payloadCompleto, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimento", payloadCompleto)
        console.log('✅ TESTE 1 SUCESSO - Estabelecimento cadastrado!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 1 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
    }
    
    // TESTE 2: Payload sem telefone (mas com id_usuario)
    try {
        console.log('🏢 TESTE 2 - Sem telefone')
        const payloadSemTelefone = {
            id_usuario: user.id,
            nome: payload.nome,
            cnpj: payload.cnpj.replace(/\D/g, '') // Remove formatação
        }
        console.log('🏢 Payload:', JSON.stringify(payloadSemTelefone, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimento", payloadSemTelefone)
        console.log('✅ TESTE 2 SUCESSO - Estabelecimento cadastrado sem telefone!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 2 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
    }
    
    // TESTE 3: Payload mínimo com campos obrigatórios
    try {
        console.log('🏢 TESTE 3 - Campos obrigatórios mínimos')
        const payloadMinimo = {
            id_usuario: user.id,
            nome: payload.nome,
            cnpj: payload.cnpj.replace(/\D/g, '') // CNPJ também é obrigatório
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
        const payloadAlternativo = {
            id_usuario: user.id,
            nome: payload.nome,
            cnpj: payload.cnpj.replace(/\D/g, ''),
            telefone: payload.telefone
        }
        console.log('🏢 Payload:', JSON.stringify(payloadAlternativo, null, 2))
        
        const response = await api.post<estabelecimentoResponse>("/estabelecimentos", payloadAlternativo)
        console.log('✅ TESTE 4 SUCESSO - Estabelecimento cadastrado com endpoint alternativo!')
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2))
        return response.data
    } catch (error: any) {
        console.log('❌ TESTE 4 FALHOU:', error.response?.status, error.response?.data?.message || error.message)
        
        // Se chegou até aqui, todos os testes falharam
        console.error('❌ TODOS OS TESTES FALHARAM!')
        console.error('❌ Último erro completo:', error)
        
        throw error
    }
}

/**
 * Lista estabelecimentos do usuário logado
 * CORREÇÃO: Usa endpoint /estabelecimentos e filtra pelo usuário no frontend
 */
export async function listarEstabelecimentosUsuario(): Promise<listarEstabelecimentosResponse> {
    try {
        console.log(' Buscando estabelecimentos do usuário...')
        
        // Obtém dados do usuário atual
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            throw new Error('Usuário não encontrado')
        }
        
        const user = JSON.parse(userData)
        console.log('👤 Usuário atual ID:', user.id)
        
        // Tenta buscar estabelecimentos por usuário primeiro
        // Usando endpoint específico por usuário se existir
        try {
            const response = await api.get<any>(`/estabelecimentos/usuario/${user.id}`)
            const data = response.data as any
            console.log('📡 Resposta da API /estabelecimentos/usuario:', data)
            
            if (data.status && data.estabelecimentos && data.estabelecimentos.length > 0) {
                console.log('✅ Estabelecimentos do usuário encontrados:', data.estabelecimentos.length)
                return {
                    status: true,
                    status_code: 200,
                    data: data.estabelecimentos
                }
            }
        } catch (userError) {
            console.log('⚠️ Endpoint por usuário não encontrado, tentando busca alternativa...')
        }
            
        // Fallback: Busca todos os estabelecimentos e filtra pelo id_usuario
        try {
            const response = await api.get<any>("/estabelecimentos")
            const data = response.data as any
            console.log('📡 Resposta da API /estabelecimentos (todos):', data)
                
            if (data.status && data.estabelecimentos) {
                console.log('🔍 Debugando estabelecimentos:')
                data.estabelecimentos.forEach((estab: any, index: number) => {
                    console.log(`  [${index}] ID: ${estab.id_estabelecimento}, Usuario: ${estab.id_usuario}, Nome: ${estab.nome}`)
                })
                    
                // IMPORTANTE: Filtra estabelecimentos pelo id_usuario
                const estabelecimentosUsuario = data.estabelecimentos.filter((estab: any) => {
                    // Verifica se o estabelecimento tem id_usuario e se é igual ao usuário atual
                    const pertenceAoUsuario = estab.id_usuario === user.id || estab.usuario_id === user.id
                    if (pertenceAoUsuario) {
                        console.log(`✅ Estabelecimento ${estab.nome} pertence ao usuário ${user.id}`)
                    }
                    return pertenceAoUsuario
                })
                    
                console.log(`📊 Total de estabelecimentos: ${data.estabelecimentos.length}`)
                console.log(`👤 Estabelecimentos do usuário ${user.id}: ${estabelecimentosUsuario.length}`)
                    
                if (estabelecimentosUsuario.length > 0) {
                    console.log('✅ Estabelecimento(s) do usuário encontrado(s):', estabelecimentosUsuario[0].nome)
                    return {
                        status: true,
                        status_code: 200,
                        data: estabelecimentosUsuario
                    }
                } else {
                    console.log('ℹ️ Nenhum estabelecimento encontrado para o usuário', user.id)
                    return {
                        status: false,
                        status_code: 404,
                        data: []
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Erro ao buscar estabelecimentos gerais')
        }
        
        // Se nenhuma busca funcionou, retorna vazio
        console.log('❌ Nenhum estabelecimento encontrado para o usuário')
        return {
            status: false,
            status_code: 404,
            data: []
        }
        
    } catch (error: any) {
        console.error('Erro ao listar estabelecimentos do usuário:', error.response?.data || error.message)
        
        // Retorna resposta vazia ao invés de erro
        return {
            status: false,
            status_code: 500,
            data: []
        }
    }
}

/**
 * Busca dados atualizados do estabelecimento do usuário da API
 * Endpoint: GET /estabelecimento/{id}
 */
export async function buscarDadosEstabelecimentoAtualizado(): Promise<any> {
    try {
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            throw new Error('Usuário não encontrado')
        }
        
        const user = JSON.parse(userData)
        
        // Busca o ID do estabelecimento do localStorage (salvo durante o cadastro)
        const estabelecimentoIdStorage = localStorage.getItem('estabelecimentoId')
        const estabelecimentoId = estabelecimentoIdStorage ? parseInt(estabelecimentoIdStorage) : (user.estabelecimento_id || 1)
        
        console.log('🔍 ID do estabelecimento encontrado:', {
            localStorage: estabelecimentoIdStorage,
            userdata: user.estabelecimento_id,
            usado: estabelecimentoId
        })
        console.log('🔍 Buscando dados do estabelecimento:', estabelecimentoId)
        
        const response = await api.get(`/estabelecimento/${estabelecimentoId}`)
        const data = response.data as any
        console.log('✅ Dados do estabelecimento recebidos:', data)
        
        // Atualiza localStorage com dados mais recentes
        if (data && data.status) {
            const estabelecimento = data.data || data.estabelecimento || data
            console.log('📦 Objeto estabelecimento extraído:', estabelecimento)
            
            // IMPORTANTE: A tabela estabelecimento NÃO tem campo endereco
            // O endereço fica salvo apenas no localStorage
            // Atualiza apenas os campos que vêm da API
            const dadosAtualizados = {
                ...user, // Mantém todos os dados atuais
                nome: estabelecimento.nome, // Atualiza com o nome da API
                cnpj: estabelecimento.cnpj,
                telefone: estabelecimento.telefone,
                razao_social: estabelecimento.nome, // Sincroniza razão social com o nome
                // Mantém o endereço do localStorage pois a API não retorna
                endereco: user.endereco || ""
            }
            
            console.log('🔄 Comparação de dados:')
            console.log('  - Nome anterior:', user.nome)
            console.log('  - Nome da API:', estabelecimento.nome)
            console.log('  - Nome final:', dadosAtualizados.nome)
            
            localStorage.setItem('user_data', JSON.stringify(dadosAtualizados))
            
            // Salva também o CNPJ do estabelecimento separadamente para uso em CadastroPromocao
            if (estabelecimento.cnpj) {
                localStorage.setItem('estabelecimentoCNPJ', estabelecimento.cnpj)
                console.log('✅ estabelecimentoCNPJ salvo:', estabelecimento.cnpj)
            }
            
            console.log('✅ localStorage atualizado com dados da API')
            console.log('✅ Dados finais salvos:', dadosAtualizados)
            console.log('⚠️ NOTA: Endereço mantido do localStorage (API não retorna este campo)')
            
            return dadosAtualizados
        }
        
        return user
    } catch (error: any) {
        console.error('❌ Erro ao buscar dados do estabelecimento:', error.response?.data || error.message)
        // Retorna dados do localStorage como fallback
        return obterDadosUsuario()
    }
}

/**
 * Verifica se o usuário já possui estabelecimento
 * Endpoint: GET /estabelecimentos/verificar
 */
export async function verificarEstabelecimento(): Promise<{ possuiEstabelecimento: boolean; estabelecimento?: any }> {
    try {
        console.log('🔍 Verificando estabelecimentos do usuário...')
        
        // Busca todos os estabelecimentos
        const response = await listarEstabelecimentosUsuario()
        console.log('📡 Resposta da verificação:', response)
        
        if (response.status && response.data && response.data.length > 0) {
            // Encontrou estabelecimentos - pega o primeiro
            const estabelecimento = response.data[0]
            console.log('✅ Estabelecimento encontrado:', estabelecimento)
            
            return {
                possuiEstabelecimento: true,
                estabelecimento: {
                    id: (estabelecimento as any).id_estabelecimento || estabelecimento.id,
                    nome: estabelecimento.nome,
                    cnpj: estabelecimento.cnpj,
                    telefone: estabelecimento.telefone
                }
            }
        }
        
        console.log('ℹ️ Nenhum estabelecimento encontrado')
        return { possuiEstabelecimento: false }
        
    } catch (error: any) {
        console.error('Erro ao verificar estabelecimento:', error)
        return { possuiEstabelecimento: false }
    }
}

// ============================================
// SERVIÇOS DE ATUALIZAÇÃO DE USUÁRIO
// ============================================

/**
 * Atualiza dados do usuário (pessoa física)
 * Endpoint: PUT /usuario/{id}
 */
export async function atualizarUsuario(payload: atualizarUsuarioRequest): Promise<atualizarUsuarioResponse> {
    try {
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            throw new Error('Usuário não encontrado. Faça login novamente.')
        }
        
        const user = JSON.parse(userData)
        const userId = user.id
        
        console.log('👤 Atualizando usuário:', userId)
        console.log('👤 Dados para atualização:', payload)
        console.log('👤 Endpoint:', `/usuario/${userId}`)
        console.log('👤 Método: PUT')
        console.log('👤 Payload JSON:', JSON.stringify(payload, null, 2))
        console.log('👤 Campos no payload:', Object.keys(payload))
        console.log('👤 Tipos dos campos:', Object.keys(payload).map(key => `${key}: ${typeof payload[key as keyof typeof payload]}`))
        
        const { data } = await api.put<atualizarUsuarioResponse>(`/usuario/${userId}`, payload)
        
        // Atualiza dados no localStorage se a atualização foi bem-sucedida
        if (data.status && data.data) {
            const updatedUser = { ...user, ...data.data }
            localStorage.setItem('user_data', JSON.stringify(updatedUser))
            console.log('✅ Dados do usuário atualizados no localStorage')
        }
        
        return data
    } catch (error: any) {
        console.error('❌ Erro ao atualizar usuário:', error.response?.data || error.message)
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Detalhes completos do erro:', error.response)
        
        // Mostra mensagem mais clara sobre o que está faltando
        if (error.response?.data?.message) {
            console.error('💡 Mensagem do backend:', error.response.data.message)
        }
        
        throw error
    }
}

/**
 * Atualiza dados da empresa (pessoa jurídica)
 * Endpoint: PUT /estabelecimento/{id} (CORRETO - descoberto após testes)
 */
export async function atualizarEmpresa(payload: atualizarEmpresaRequest): Promise<atualizarUsuarioResponse> {
    try {
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            throw new Error('Usuário não encontrado. Faça login novamente.')
        }
        
        const user = JSON.parse(userData)
        const estabelecimentoId = user.estabelecimento_id || 1 // ID do estabelecimento
        
        console.log('🏢 Atualizando empresa via estabelecimento:', estabelecimentoId)
        console.log('🏢 Dados para atualização:', payload)
        console.log('🏢 Dados do usuário atual:', user)
        
        // Validação adicional antes do envio
        if (!payload.cnpj || payload.cnpj.trim().length === 0) {
            throw new Error('CNPJ é obrigatório')
        }
        
        // Prepara payload para estabelecimento
        const payloadEstabelecimento = {
            nome: payload.nome, // Envia o nome que o usuário digitou
            cnpj: payload.cnpj,
            telefone: payload.telefone || ''
        }
        
        console.log('📤 Enviando para API:', payloadEstabelecimento)
        
        const { data } = await api.put(`/estabelecimento/${estabelecimentoId}`, payloadEstabelecimento)
        console.log('✅ Estabelecimento atualizado com sucesso!', data)
        
        // Atualiza localStorage com os novos dados
        // IMPORTANTE: Mantém o nome que foi enviado para a API
        const updatedUser = { 
            ...user, 
            ...payload,
            nome: payload.nome, // Garante que o nome seja atualizado
            razao_social: payload.razao_social || payload.nome // Atualiza razão social também
        }
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
        console.log('✅ Dados atualizados no localStorage:', updatedUser)
        
        return {
            status: true,
            status_code: 200,
            message: 'Dados da empresa atualizados com sucesso!',
            data: updatedUser
        }
    } catch (error: any) {
        console.error('❌ Erro ao atualizar empresa:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Obtém dados atuais do usuário logado
 */
export function obterDadosUsuario() {
    try {
        const userData = localStorage.getItem('user_data')
        return userData ? JSON.parse(userData) : null
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
        return null
    }
}

/**
 * Busca dados do usuário diretamente da tabela usuario
 */
export async function buscarDadosUsuarioDireto() {
    try {
        console.log('👤 Buscando dados do usuário diretamente...')
        
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            throw new Error('Usuário não encontrado no localStorage')
        }
        
        const user = JSON.parse(userData)
        const userId = user.id
        const endpoints = [
            `/usuario/${userId}`,
            `/usuarios/${userId}`,
            `/user/${userId}`
        ]
        
        for (const endpoint of endpoints) {
            try {
                console.log(` Tentando endpoint: ${endpoint}`)
                const apiResponse = await api.get(endpoint)
                const response = apiResponse.data as any
                
                console.log(` Resposta do ${endpoint}:`, response)
                
                console.log(`📋 Resposta do ${endpoint}:`, response)
                
                if (response && (response.status || response.success || response.data || response.usuario)) {
                    let dadosUsuario = null
                    
                    // Verifica diferentes estruturas de resposta
                    if (response.data) {
                        dadosUsuario = response.data
                    } else if (response.usuario) {
                        dadosUsuario = response.usuario
                    } else if (response.id) {
                        dadosUsuario = response
                    }
                    
                    if (dadosUsuario) {
                        console.log('✅ Dados do usuário encontrados:', dadosUsuario)
                        
                        // Monta dados completos
                        const dadosCompletos = {
                            ...user,
                            cpf: dadosUsuario.cpf || dadosUsuario.cnpj || '',
                            cnpj: dadosUsuario.cnpj || dadosUsuario.cpf || '',
                            telefone: dadosUsuario.telefone || '',
                            email: dadosUsuario.email || user.email,
                            nome: dadosUsuario.nome || user.nome,
                            perfil: dadosUsuario.perfil || user.perfil,
                            data_nascimento: dadosUsuario.data_nascimento || ''
                        }
                        
                        // Atualiza localStorage
                        localStorage.setItem('user_data', JSON.stringify(dadosCompletos))
                        console.log('✅ Dados do usuário salvos no localStorage:', dadosCompletos)
                        
                        return dadosCompletos
                    }
                }
            } catch (endpointError: any) {
                console.log(`⚠️ Endpoint ${endpoint} falhou:`, endpointError.response?.status)
                continue
            }
        }
        
        // Verifica o perfil do usuário antes de buscar estabelecimento
        const perfil = user.perfil?.toLowerCase()
        if (perfil === 'consumidor' || perfil === 'usuario') {
            console.log('⚠️ Usuário é consumidor, não deve buscar dados de estabelecimento')
            console.log('⚠️ Retornando dados do localStorage')
            return obterDadosUsuario()
        }
        
        console.log('⚠️ Nenhum endpoint de usuário funcionou, retornando dados do localStorage...')
        return obterDadosUsuario()
        
    } catch (error: any) {
        console.error('❌ Erro ao buscar dados do usuário:', error)
        return obterDadosUsuario()
    }
}

/**
 * Busca dados completos do usuário na API e atualiza localStorage
 */
export async function buscarDadosCompletosDaAPI() {
    try {
        console.log('🔍 Buscando dados completos do usuário na API...')
        
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            throw new Error('Usuário não encontrado no localStorage')
        }
        
        const user = JSON.parse(userData)
        const userId = user.id
        
        console.log('👤 ID do usuário:', userId)
        console.log('👤 Perfil do usuário:', user.perfil)
        
        // Tenta diferentes endpoints baseados no perfil do usuário
        let dadosCompletos = user
        
        try {
            // Primeiro tenta o endpoint de usuário
            console.log('🔍 Tentando endpoint /usuario/:id...')
            const response = await api.get(`/usuario/${userId}`)
            const data = response.data as any
            
            if (data.status && data.data) {
                dadosCompletos = { ...user, ...data.data }
                console.log('✅ Dados obtidos via /usuario/:id:', dadosCompletos)
            }
        } catch (userError: any) {
            console.log('⚠️ Endpoint /usuario/:id falhou:', userError.response?.status)
            
            // Se for estabelecimento, tenta buscar dados do estabelecimento
            if (user.perfil === 'estabelecimento') {
                try {
                    console.log('🔍 Tentando buscar estabelecimento do usuário...')
                    const estResponse = await api.get('/estabelecimentos')
                    const estabelecimentos = estResponse.data as any
                    
                    if (estabelecimentos.status && estabelecimentos.data) {
                        // Procura estabelecimento do usuário
                        const meuEstabelecimento = estabelecimentos.data.find((est: any) => 
                            est.id_usuario === userId || est.usuario_id === userId
                        )
                        
                        if (meuEstabelecimento) {
                            dadosCompletos = {
                                ...user,
                                cnpj: meuEstabelecimento.cnpj,
                                telefone: meuEstabelecimento.telefone,
                                endereco: meuEstabelecimento.endereco ? 
                                    `${meuEstabelecimento.endereco.logradouro || ''}, ${meuEstabelecimento.endereco.bairro || ''}, ${meuEstabelecimento.endereco.cidade || ''} - ${meuEstabelecimento.endereco.estado || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') :
                                    '',
                                razao_social: meuEstabelecimento.nome || meuEstabelecimento.razao_social,
                                estabelecimento_id: meuEstabelecimento.id
                            }
                            console.log('✅ Dados obtidos via estabelecimento:', dadosCompletos)
                        } else {
                            console.log('⚠️ Estabelecimento do usuário não encontrado')
                        }
                    }
                } catch (estError: any) {
                    console.log('⚠️ Erro ao buscar estabelecimentos:', estError.response?.status)
                }
            }
        }
        
        // Atualiza localStorage com dados obtidos
        localStorage.setItem('user_data', JSON.stringify(dadosCompletos))
        console.log('✅ Dados finais salvos no localStorage:', dadosCompletos)
        
        return dadosCompletos
        
    } catch (error: any) {
        console.error('❌ Erro geral ao buscar dados da API:', error)
        return obterDadosUsuario() // Retorna dados do localStorage como fallback
    }
}

/**
 * Remove um produto dos favoritos do usuário
 * SOLUÇÃO DEFINITIVA: Usa POST /favoritos com campo 'remover' ou similar
 */
export async function removerFavorito(payload: RemoverFavoritoRequest): Promise<AdicionarFavoritoResponse> {
    try {
        console.log('💔 Removendo produto dos favoritos:', payload)
        
        // Verifica se usuário está autenticado
        const { valid } = checkTokenValidity()
        if (!valid) {
            throw new Error('Usuário não autenticado. Faça login novamente.')
        }
        
        // SOLUÇÃO: Usa o mesmo endpoint POST /favoritos mas com campo indicando remoção
        console.log('📡 Usando POST /favoritos com ação de remoção')
        
        try {
            // Primeira tentativa: POST /favoritos com campo 'acao'
            const response = await api.post<AdicionarFavoritoResponse>('/favoritos', {
                id_usuario: payload.id_usuario,
                id_produto: payload.id_produto,
                acao: 'remover'
            })
            // ATUALIZA CACHE LOCAL
            const cacheKey = `favoritos_cache_user_${payload.id_usuario}`
            const favoritosCache = JSON.parse(localStorage.getItem(cacheKey) || '[]')
            const favoritosAtualizados = favoritosCache.filter((fav: any) => fav.id_produto !== payload.id_produto)
            localStorage.setItem(cacheKey, JSON.stringify(favoritosAtualizados))
            console.log('📦 Cache de favoritos atualizado (removido)')
            
            console.log('✅ Produto removido dos favoritos (método 1):', response.data)
            return response.data
        } catch (error1: any) {
            console.log('⚠️ Método 1 falhou, tentando método 2...')
            
            try {
                // Segunda tentativa: POST /favoritos com campo 'remove'
                const response = await api.post<AdicionarFavoritoResponse>('/favoritos', {
                    id_usuario: payload.id_usuario,
                    id_produto: payload.id_produto,
                    remove: true
                })
                // ATUALIZA CACHE LOCAL
                const cacheKey2 = `favoritos_cache_user_${payload.id_usuario}`
                const favoritosCache2 = JSON.parse(localStorage.getItem(cacheKey2) || '[]')
                const favoritosAtualizados2 = favoritosCache2.filter((fav: any) => fav.id_produto !== payload.id_produto)
                localStorage.setItem(cacheKey2, JSON.stringify(favoritosAtualizados2))
                console.log('📦 Cache de favoritos atualizado (removido)')
                
                console.log('✅ Produto removido dos favoritos (método 2):', response.data)
                return response.data
            } catch (error2: any) {
                console.log('⚠️ Método 2 falhou, tentando método 3...')
                
                try {
                    // Terceira tentativa: POST /favoritos com campo 'tipo'
                    const response = await api.post<AdicionarFavoritoResponse>('/favoritos', {
                        id_usuario: payload.id_usuario,
                        id_produto: payload.id_produto,
                        tipo: 'remover'
                    })
                    // ATUALIZA CACHE LOCAL
                    const cacheKey = `favoritos_cache_user_${payload.id_usuario}`
                    const favoritosCache = JSON.parse(localStorage.getItem(cacheKey) || '[]')
                    const favoritosAtualizados = favoritosCache.filter((fav: any) => fav.id_produto !== payload.id_produto)
                    localStorage.setItem(cacheKey, JSON.stringify(favoritosAtualizados))
                    console.log('📦 Cache de favoritos atualizado (removido)')
                    
                    console.log('✅ Produto removido dos favoritos (método 3):', response.data)
                    return response.data
                } catch (error3: any) {
                    console.log('⚠️ Método 3 falhou. Tentando forçar remoção do banco...')
                    
                    try {
                        // MÉTODO 4: Tenta DELETE direto com ID do produto
                        console.log('📡 Tentando DELETE /favoritos/' + payload.id_produto + ' (método 4)')
                        const response4 = await api.delete(`/favoritos/${payload.id_produto}`)
                        console.log('✅ Produto removido do banco (método 4):', response4.data)
                        
                        // Atualiza cache também
                        const cacheKey4 = `favoritos_cache_user_${payload.id_usuario}`
                        const favoritosCache4 = JSON.parse(localStorage.getItem(cacheKey4) || '[]')
                        const favoritosAtualizados4 = favoritosCache4.filter((fav: any) => fav.id_produto !== payload.id_produto)
                        localStorage.setItem(cacheKey4, JSON.stringify(favoritosAtualizados4))
                        console.log('📦 Cache sincronizado após remoção do banco')
                        
                        return response4.data as AdicionarFavoritoResponse
                    } catch (error4: any) {
                        console.log('⚠️ Método 4 falhou. Tentando método 5...')
                        
                        try {
                            // MÉTODO 5: Tenta GET para listar favoritos e depois DELETE específico
                            console.log('📡 Buscando ID do favorito no banco para remoção específica')
                            const favoritosResponse = await api.get('/favoritos')
                            
                            const favData = favoritosResponse.data as any
                            if (favData && favData.data) {
                                const favorito = favData.data.find((fav: any) => 
                                    fav.id_produto === payload.id_produto && fav.id_usuario === payload.id_usuario
                                )
                                
                                if (favorito && favorito.id) {
                                    console.log('📡 Removendo favorito específico ID:', favorito.id)
                                    await api.delete(`/favoritos/${favorito.id}`)
                                    console.log('✅ Favorito removido do banco pelo ID específico')
                                    
                                    // Atualiza cache
                                    const cacheKey5 = `favoritos_cache_user_${payload.id_usuario}`
                                    const favoritosCache5 = JSON.parse(localStorage.getItem(cacheKey5) || '[]')
                                    const favoritosAtualizados5 = favoritosCache5.filter((fav: any) => fav.id_produto !== payload.id_produto)
                                    localStorage.setItem(cacheKey5, JSON.stringify(favoritosAtualizados5))
                                    
                                    return {
                                        status: true,
                                        status_code: 200,
                                        message: 'Produto removido do banco de dados'
                                    }
                                }
                            }
                            
                            throw new Error('Favorito não encontrado no banco')
                        } catch (error5: any) {
                            console.log('❌ Todos os métodos falharam. Produto pode não existir no banco.')
                            
                            // ÚLTIMO RECURSO: Remove do cache local
                            const cacheKey6 = `favoritos_cache_user_${payload.id_usuario}`
                            const favoritosCache6 = JSON.parse(localStorage.getItem(cacheKey6) || '[]')
                            const favoritosAtualizados6 = favoritosCache6.filter((fav: any) => fav.id_produto !== payload.id_produto)
                            localStorage.setItem(cacheKey6, JSON.stringify(favoritosAtualizados6))
                            console.log('📦 Cache limpo - produto pode não existir no banco')
                            
                            return {
                                status: true,
                                status_code: 200,
                                message: 'Produto removido (cache local - banco pode não ter o registro)'
                            }
                        }
                    }
                }
            }
        }
        
    } catch (error: any) {
        console.error('❌ Erro ao remover favorito:', error.message)
        
        if (error.response?.status === 401) {
            throw new Error('Sessão expirada. Faça login novamente.')
        }
        
        throw error
    }
}

/**
 * Lista todos os favoritos do usuário
 * SOLUÇÃO TEMPORÁRIA: Usa cache local até backend implementar GET /favoritos
 */
export async function listarFavoritos(): Promise<ListarFavoritosResponse> {
    try {
        console.log('📋 Listando favoritos do usuário...')
        
        // Verifica se usuário está autenticado
        const { valid } = checkTokenValidity()
        if (!valid) {
            throw new Error('Usuário não autenticado. Faça login novamente.')
        }
        
        // Obtém ID do usuário atual
        const user = getCurrentUser()
        if (!user) {
            throw new Error('Usuário não encontrado.')
        }
        
        try {
            // Primeira tentativa: GET /favoritos
            console.log('📡 Tentando GET /favoritos')
            const response = await api.get<ListarFavoritosResponse>('/favoritos')
            console.log('✅ Favoritos recebidos (método 1):', response.data)
            return response.data
        } catch (error1: any) {
            console.log('⚠️ GET /favoritos não implementado, usando cache local temporário')
            
            // SOLUÇÃO TEMPORÁRIA: Usa localStorage como cache
            const cacheKey = `favoritos_cache_user_${user.id}`
            const favoritosCache = JSON.parse(localStorage.getItem(cacheKey) || '[]')
            
            console.log('📦 Usando cache local de favoritos:', favoritosCache.length, 'itens')
            return {
                status: true,
                status_code: 200,
                data: favoritosCache
            }
        }
        
    } catch (error: any) {
        console.error('❌ Erro ao listar favoritos:', error.message)
        
        // Retorna lista vazia em caso de erro
        return {
            status: false,
            status_code: 500,
            data: [],
            message: error.message
        }
    }
}

/**
 * Verifica se um produto está nos favoritos do usuário
 * CORREÇÃO: Usa apenas cache local para verificação rápida e precisa
 */
export async function verificarFavorito(idProduto: number): Promise<boolean> {
    try {
        console.log('🔍 Verificando se produto está nos favoritos:', idProduto)
        
        // Verifica se usuário está autenticado
        const { valid } = checkTokenValidity()
        if (!valid) {
            console.log('⚠️ Usuário não autenticado - produto não está nos favoritos')
            return false
        }
        
        // Obtém ID do usuário atual
        const user = getCurrentUser()
        if (!user) {
            console.log('⚠️ Usuário não encontrado - produto não está nos favoritos')
            return false
        }
        
        // Verifica se produto está bloqueado para sincronização
        const blockedKey = `favoritos_blocked_user_${user.id}`
        const blockedProducts = JSON.parse(localStorage.getItem(blockedKey) || '[]')
        
        if (blockedProducts.includes(idProduto)) {
            console.log('🚫 Produto bloqueado - não é favorito (removido pelo usuário)')
            return false
        }
        
        // Verifica APENAS no cache local (mais rápido e preciso)
        const cacheKey = `favoritos_cache_user_${user.id}`
        const favoritosCache = JSON.parse(localStorage.getItem(cacheKey) || '[]')
        
        const isFavorito = favoritosCache.some((fav: any) => 
            fav.id_produto === idProduto || fav.produto?.id === idProduto
        )
        
        console.log('✅ Verificação no cache local:', {
            idProduto,
            totalFavoritos: favoritosCache.length,
            isFavorito,
            bloqueado: blockedProducts.includes(idProduto)
        })
        
        return isFavorito
        
    } catch (error: any) {
        console.error('❌ Erro ao verificar favorito:', error.message)
        return false
    }
}

/**
 * Limpa o cache de favoritos do usuário
 * Útil para resetar o estado quando necessário
 */
export function limparCacheFavoritos(): void {
    try {
        const user = getCurrentUser()
        if (user) {
            // Limpa TODOS os caches relacionados a favoritos
            const keys = Object.keys(localStorage).filter(key => 
                key.includes('favoritos') || key.includes('blocked')
            )
            keys.forEach(key => localStorage.removeItem(key))
            console.log('🗑️ Todos os caches de favoritos limpos:', keys)
        }
    } catch (error) {
        console.error('❌ Erro ao limpar cache de favoritos:', error)
    }
}

/**
 * Desbloqueia um produto específico para sincronização
 * Permite que o produto volte a ser sincronizado com o backend
 */
export function desbloquearProdutoFavorito(idProduto: number): void {
    try {
        const user = getCurrentUser()
        if (user) {
            const blockedKey = `favoritos_blocked_user_${user.id}`
            const blockedProducts = JSON.parse(localStorage.getItem(blockedKey) || '[]')
            const updatedBlocked = blockedProducts.filter((id: number) => id !== idProduto)
            localStorage.setItem(blockedKey, JSON.stringify(updatedBlocked))
            console.log('🔓 Produto desbloqueado para sincronização:', idProduto)
        }
    } catch (error) {
        console.error('❌ Erro ao desbloquear produto:', error)
    }
}