import api from '../lib/api'
import type  { loginRequest,loginResponse,cadastroRequest,cadastroResponse,solicitarCodigoRequest,
    solicitarCodigoResponse,
    validarCodigoRequest,
    validarCodigoResponse,
    redefinirSenhaRequest,
    redefinirSenhaResponse,
    chatIARequest,
    chatIAResponse  } from './types'


// Endpoint de login
export async function login(payload: loginRequest){
    const { data } = await api.post<loginResponse>("/login", payload)

    // Guardando o token e dados do usuário
    if (data.token){
        localStorage.setItem('auth_token', data.token)
        
        // Salvar dados do usuário para identificação automática
        if (data.usuario) {
            localStorage.setItem('user_data', JSON.stringify({
                id: data.usuario.id,
                nome: data.usuario.nome,
                email: data.usuario.email,
                perfil: data.usuario.perfil,
                cpf: data.usuario.cpf,
                cnpj: data.usuario.cnpj,
                telefone: data.usuario.telefone,
                endereco: data.usuario.endereco,
                razao_social: data.usuario.razao_social
            }))
        }
    }

    return data
}

// Função para obter dados do usuário logado
export function getLoggedUserData() {
    const userData = localStorage.getItem('user_data')
    if (userData) {
        try {
            return JSON.parse(userData)
        } catch (error) {
            console.error('Erro ao parsear dados do usuário:', error)
            return null
        }
    }
    return null
}

// Função para verificar se usuário é empresa
export function isUserCompany(): boolean {
    const userData = getLoggedUserData()
    return userData?.perfil === 'estabelecimento'
}

// Função para limpar dados de autenticação
export function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
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

// ============================================
// CHAT IA - MOCKED IMPLEMENTATION
// ============================================

/**
 * Função para interagir com a IA (VERSÃO MOCKADA)
 * 
 * Esta função simula a chamada real à API, mas retorna dados mockados.
 * A resposta funciona perfeitamente, mas não vem do backend real.
 * 
 * COMO FUNCIONA:
 * 1. Recebe a mensagem do usuário e o ID do usuário
 * 2. Simula um delay de rede (200-500ms) para parecer real
 * 3. Analisa a mensagem e retorna uma resposta contextual baseada em palavras-chave
 * 4. Retorna dados mockados de promoções, produtos, empresas, usuários e endereços
 * 
 * QUANDO INTEGRAR COM O BACKEND REAL:
 * - Descomente a linha: const { data } = await api.post<chatIAResponse>("/interagir", payload)
 * - Comente/remova toda a lógica de mock (generateMockedResponse)
 * 
 * @param payload - Objeto contendo mensagem e idUsuario
 * @returns Promise com a resposta mockada da IA
 */
export async function interagirComIA(payload: chatIARequest): Promise<chatIAResponse> {
    try {
        console.log('🤖 Enviando mensagem para IA:', payload.mensagem);
        
        // ===== VERSÃO MOCKADA =====
        // Simula delay de rede (200-500ms)
        const delay = Math.floor(Math.random() * 300) + 200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Gera resposta mockada baseada na mensagem
        const mockedResponse = generateMockedResponse(payload.mensagem, delay);
        
        console.log('✅ Resposta da IA (mockada):', mockedResponse);
        return mockedResponse;
        
        // ===== VERSÃO REAL (DESCOMENTE QUANDO INTEGRAR) =====
        // const { data } = await api.post<chatIAResponse>("/interagir", payload)
        // console.log('✅ Resposta da IA:', data);
        // return data
        
    } catch (error: any) {
        console.error('❌ Erro ao interagir com IA:', error);
        
        // Retorna erro mockado
        return {
            status: false,
            status_code: 400,
            message: 'Erro ao processar sua mensagem',
            error: 'Serviço temporariamente indisponível'
        };
    }
}

/**
 * Função auxiliar para gerar respostas mockadas da IA
 * 
 * COMO FUNCIONA:
 * - Analisa a mensagem do usuário procurando por palavras-chave
 * - Retorna respostas contextuais baseadas no que o usuário perguntou
 * - Simula dados de promoções, produtos, empresas, usuários e endereços
 * 
 * TIPOS DE PERGUNTAS SUPORTADAS:
 * 1. Busca de produtos específicos: "leite", "arroz", "feijão", etc.
 * 2. Lista geral: "promoções", "ofertas", "lista"
 * 3. Como funciona: "como funciona", "ajuda", "help"
 * 4. Localização: "perto", "próximo", "região"
 * 5. Preços: "barato", "melhor preço", "mais barato"
 * 
 * @param mensagem - Mensagem do usuário
 * @param responseTime - Tempo de resposta simulado em ms
 * @returns Objeto chatIAResponse mockado
 */
function generateMockedResponse(mensagem: string, responseTime: number): chatIAResponse {
    const mensagemLower = mensagem.toLowerCase();
    
    // DADOS MOCKADOS - Simulam dados reais do backend
    // Cada promoção tem: produto, empresa, usuário, endereço empresa e endereço usuário
    const promocoesMockadas = [
        // CARNES
        { produto: 'Carne Moída Bovina 1kg', preco: 22.90, empresa: 'Açougue Bom Corte', distancia: 0.8, endereco: 'Rua do Comércio, 456 - Centro', usuario: 'Roberto Alves', enderecoUsuario: 'Av. Principal, 789 - Centro' },
        { produto: 'Carne Moída Premium 1kg', preco: 28.50, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'João Silva', enderecoUsuario: 'Av. Principal, 456 - Jardim' },
        { produto: 'Carne Moída Especial 1kg', preco: 24.90, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Maria Santos', enderecoUsuario: 'Rua Secundária, 321 - Centro' },
        { produto: 'Frango Inteiro Congelado 1kg', preco: 12.90, empresa: 'Atacadão Popular', distancia: 3.5, endereco: 'Rod. Estadual, km 5 - Industrial', usuario: 'Pedro Costa', enderecoUsuario: 'Rua Terciária, 654 - Bairro Alto' },
        { produto: 'Peito de Frango 1kg', preco: 15.90, empresa: 'Açougue Bom Corte', distancia: 0.8, endereco: 'Rua do Comércio, 456 - Centro', usuario: 'Roberto Alves', enderecoUsuario: 'Av. Principal, 789 - Centro' },
        { produto: 'Picanha Bovina 1kg', preco: 52.90, empresa: 'Açougue Premium', distancia: 4.2, endereco: 'Av. Gourmet, 321 - Jardins', usuario: 'Fernando Lima', enderecoUsuario: 'Rua das Palmeiras, 159 - Jardins' },
        
        // LATICÍNIOS
        { produto: 'Leite Integral 1L', preco: 4.99, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'João Silva', enderecoUsuario: 'Av. Principal, 456 - Jardim' },
        { produto: 'Leite Desnatado 1L', preco: 5.49, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Maria Santos', enderecoUsuario: 'Rua Secundária, 321 - Centro' },
        { produto: 'Queijo Mussarela 500g', preco: 18.90, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'Ana Paula', enderecoUsuario: 'Av. Brasil, 987 - Centro' },
        { produto: 'Iogurte Natural 170g', preco: 2.99, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Carlos Mendes', enderecoUsuario: 'Rua das Acácias, 147 - Jardim' },
        { produto: 'Manteiga 200g', preco: 9.90, empresa: 'Atacadão Popular', distancia: 3.5, endereco: 'Rod. Estadual, km 5 - Industrial', usuario: 'Juliana Costa', enderecoUsuario: 'Rua Nova, 753 - Vila Nova' },
        
        // GRÃOS E CEREAIS
        { produto: 'Arroz Tipo 1 5kg', preco: 18.90, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Maria Santos', enderecoUsuario: 'Rua Secundária, 321 - Centro' },
        { produto: 'Arroz Integral 1kg', preco: 6.50, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'João Silva', enderecoUsuario: 'Av. Principal, 456 - Jardim' },
        { produto: 'Feijão Preto 1kg', preco: 7.50, empresa: 'Atacadão Popular', distancia: 3.5, endereco: 'Rod. Estadual, km 5 - Industrial', usuario: 'Pedro Costa', enderecoUsuario: 'Rua Terciária, 654 - Bairro Alto' },
        { produto: 'Feijão Carioca 1kg', preco: 6.90, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Carlos Mendes', enderecoUsuario: 'Rua das Acácias, 147 - Jardim' },
        { produto: 'Macarrão Espaguete 500g', preco: 3.99, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'Ana Paula', enderecoUsuario: 'Av. Brasil, 987 - Centro' },
        
        // ÓLEOS E TEMPEROS
        { produto: 'Óleo de Soja 900ml', preco: 6.99, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'Ana Paula', enderecoUsuario: 'Av. Brasil, 987 - Centro' },
        { produto: 'Azeite Extra Virgem 500ml', preco: 24.90, empresa: 'Mercado Gourmet', distancia: 5.1, endereco: 'Rua Premium, 852 - Jardins', usuario: 'Ricardo Souza', enderecoUsuario: 'Av. Luxo, 369 - Jardins' },
        { produto: 'Sal Refinado 1kg', preco: 1.99, empresa: 'Atacadão Popular', distancia: 3.5, endereco: 'Rod. Estadual, km 5 - Industrial', usuario: 'Pedro Costa', enderecoUsuario: 'Rua Terciária, 654 - Bairro Alto' },
        
        // AÇÚCARES E DOCES
        { produto: 'Açúcar Cristal 1kg', preco: 3.49, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Carlos Mendes', enderecoUsuario: 'Rua das Acácias, 147 - Jardim' },
        { produto: 'Açúcar Refinado 1kg', preco: 3.99, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'João Silva', enderecoUsuario: 'Av. Principal, 456 - Jardim' },
        { produto: 'Chocolate em Pó 400g', preco: 8.90, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Maria Santos', enderecoUsuario: 'Rua Secundária, 321 - Centro' },
        
        // BEBIDAS
        { produto: 'Café Torrado 500g', preco: 12.90, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'João Silva', enderecoUsuario: 'Av. Principal, 456 - Jardim' },
        { produto: 'Refrigerante 2L', preco: 5.99, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Carlos Mendes', enderecoUsuario: 'Rua das Acácias, 147 - Jardim' },
        { produto: 'Suco de Laranja 1L', preco: 7.50, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'Ana Paula', enderecoUsuario: 'Av. Brasil, 987 - Centro' },
        
        // HIGIENE E LIMPEZA
        { produto: 'Sabão em Pó 1kg', preco: 9.90, empresa: 'Atacadão Popular', distancia: 3.5, endereco: 'Rod. Estadual, km 5 - Industrial', usuario: 'Pedro Costa', enderecoUsuario: 'Rua Terciária, 654 - Bairro Alto' },
        { produto: 'Detergente Líquido 500ml', preco: 2.49, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Maria Santos', enderecoUsuario: 'Rua Secundária, 321 - Centro' },
        { produto: 'Papel Higiênico 12 rolos', preco: 15.90, empresa: 'Supermercado Central', distancia: 2.6, endereco: 'Rua das Flores, 123 - Centro', usuario: 'João Silva', enderecoUsuario: 'Av. Principal, 456 - Jardim' },
        { produto: 'Sabonete 90g', preco: 1.99, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Carlos Mendes', enderecoUsuario: 'Rua das Acácias, 147 - Jardim' },
        
        // FRUTAS E VERDURAS
        { produto: 'Banana Prata 1kg', preco: 4.99, empresa: 'Hortifruti Central', distancia: 1.8, endereco: 'Rua das Frutas, 258 - Centro', usuario: 'Lucia Oliveira', enderecoUsuario: 'Av. Verde, 741 - Centro' },
        { produto: 'Tomate 1kg', preco: 5.50, empresa: 'Hortifruti Central', distancia: 1.8, endereco: 'Rua das Frutas, 258 - Centro', usuario: 'Lucia Oliveira', enderecoUsuario: 'Av. Verde, 741 - Centro' },
        { produto: 'Batata 1kg', preco: 3.99, empresa: 'Mercado Bom Preço', distancia: 1.2, endereco: 'Av. Comercial, 789 - Vila Nova', usuario: 'Maria Santos', enderecoUsuario: 'Rua Secundária, 321 - Centro' },
        { produto: 'Cebola 1kg', preco: 4.50, empresa: 'Atacadão Popular', distancia: 3.5, endereco: 'Rod. Estadual, km 5 - Industrial', usuario: 'Pedro Costa', enderecoUsuario: 'Rua Terciária, 654 - Bairro Alto' }
    ];
    
    // LÓGICA DE RESPOSTA BASEADA EM PALAVRAS-CHAVE
    
    // Respostas variadas para parecer mais natural
    const respostasVariadas = {
        saudacoes: [
            "Olá! Como posso te ajudar hoje?",
            "Oi! Procurando alguma promoção?",
            "E aí! Bora economizar? Me diz o que você precisa!",
            "Olá! Estou aqui pra te ajudar a encontrar os melhores preços."
        ],
        naoEncontrado: [
            `Hmm, não encontrei nada sobre "${mensagem}" por aqui. Tenta me perguntar sobre produtos como leite, arroz, carne, frango, café... Tenho várias promoções!`,
            `Poxa, não achei "${mensagem}" nas promoções disponíveis. Que tal tentar: "frango perto de mim" ou "leite barato"?`,
            `Desculpa, não tenho informações sobre "${mensagem}" no momento. Posso te ajudar com outros produtos como carne, arroz, feijão, frutas...`,
            `Opa, "${mensagem}" não está na minha base agora. Mas posso te mostrar promoções de outros produtos! Me pergunta sobre algo específico.`
        ]
    };
    
    // 1. Saudações simples
    if (mensagemLower.match(/^(oi|olá|ola|hey|opa|e ai|eai)$/)) {
        const saudacao = respostasVariadas.saudacoes[Math.floor(Math.random() * respostasVariadas.saudacoes.length)];
        return {
            status: true,
            status_code: 200,
            data: {
                reply: saudacao,
                confidence: 1.0,
                response_time_ms: responseTime
            }
        };
    }
    
    // 2. Pergunta sobre como funciona o sistema
    if (mensagemLower.includes('como funciona') || mensagemLower.includes('ajuda') || mensagemLower.includes('help') || mensagemLower.includes('o que você faz')) {
        return {
            status: true,
            status_code: 200,
            data: {
                reply: `Eu te ajudo a encontrar os melhores preços dos produtos que você precisa! É bem simples:

Você me pergunta sobre um produto (tipo "carne moída barata" ou "leite perto de mim") e eu busco as melhores ofertas pra você, mostrando preço, distância e onde encontrar.

Alguns exemplos do que você pode me perguntar:
• "quero frango barato"
• "café perto de mim"  
• "onde tem arroz em promoção?"
• "preciso de leite"
• "quais as promoções hoje?"

É só me dizer o que você precisa e eu acho pra você! 😊`,
                confidence: 1.0,
                response_time_ms: responseTime
            }
        };
    }
    
    // 3. Lista geral de promoções
    if (mensagemLower.includes('promoções') || mensagemLower.includes('ofertas') || mensagemLower.includes('lista') || mensagemLower.includes('quais') && !mensagemLower.match(/\b(leite|carne|arroz|feijão|frango|café|óleo|açúcar|banana|tomate)\b/)) {
        const topPromocoes = [...promocoesMockadas].sort((a, b) => a.distancia - b.distancia).slice(0, 5);
        const listaPromocoes = topPromocoes.map((promo, index) => 
            `${index + 1}. ${promo.produto} - R$ ${promo.preco.toFixed(2)}\n   ${promo.empresa} (${promo.distancia} km)`
        ).join('\n\n');
        
        return {
            status: true,
            status_code: 200,
            data: {
                reply: `Olha só as promoções que achei perto de você:\n\n${listaPromocoes}\n\nQuer saber mais sobre algum produto específico? É só me perguntar!`,
                confidence: 0.95,
                response_time_ms: responseTime
            }
        };
    }
    
    // 3. Busca por produto específico
    // Melhor lógica: procura palavras-chave do produto na mensagem
    let produtosEncontrados = promocoesMockadas.filter(promo => {
        const produtoLower = promo.produto.toLowerCase();
        const palavrasProduto = produtoLower.split(' ');
        const palavrasMensagem = mensagemLower.split(' ');
        
        // Verifica se alguma palavra importante do produto está na mensagem
        return palavrasProduto.some(palavraProduto => 
            palavrasMensagem.some(palavraMensagem => 
                palavraProduto.includes(palavraMensagem) || palavraMensagem.includes(palavraProduto)
            )
        );
    });
    
    // Se o usuário pediu "perto" ou "próximo", ordena por distância
    const pedePerto = mensagemLower.includes('perto') || mensagemLower.includes('próximo') || mensagemLower.includes('proximo');
    if (pedePerto && produtosEncontrados.length > 0) {
        produtosEncontrados = produtosEncontrados.sort((a, b) => a.distancia - b.distancia);
    }
    
    // Se o usuário pediu "barato" ou "mais barato", ordena por preço
    const pedeBarato = mensagemLower.includes('barato') || mensagemLower.includes('mais barato');
    if (pedeBarato && produtosEncontrados.length > 0) {
        produtosEncontrados = produtosEncontrados.sort((a, b) => a.preco - b.preco);
    }
    
    if (produtosEncontrados.length > 0) {
        // Respostas mais naturais e variadas
        const intros = [
            `Achei ${produtosEncontrados.length > 1 ? `${produtosEncontrados.length} opções` : 'uma opção'} pra você!`,
            `Olha que legal, encontrei ${produtosEncontrados.length > 1 ? `${produtosEncontrados.length} ofertas` : 'uma oferta'} aqui:`,
            `Boa! Tenho ${produtosEncontrados.length > 1 ? `${produtosEncontrados.length} promoções` : 'uma promoção'} pra te mostrar:`,
            `Encontrei ${produtosEncontrados.length > 1 ? `${produtosEncontrados.length} opções` : 'uma opção'} interessantes:`
        ];
        
        const intro = intros[Math.floor(Math.random() * intros.length)];
        let resposta = intro + '\n\n';
        
        // Determina o título baseado no filtro
        let tituloSecao = '';
        if (pedePerto) {
            tituloSecao = produtosEncontrados.length > 1 ? '📍 Ordenadas da mais perto pra mais longe:' : '🎯 A mais perto de você:';
        } else if (pedeBarato) {
            tituloSecao = produtosEncontrados.length > 1 ? '💰 Ordenadas da mais barata pra mais cara:' : '💰 A mais barata:';
        } else {
            tituloSecao = produtosEncontrados.length > 1 ? '🏆 Todas as opções disponíveis:' : '🏆 Melhor opção:';
        }
        
        resposta += tituloSecao + '\n\n';
        
        // Mostra TODAS as opções com detalhes completos
        produtosEncontrados.forEach((promo, index) => {
            // Adiciona separador entre produtos (exceto antes do primeiro)
            if (index > 0) {
                resposta += '\n' + '─'.repeat(40) + '\n\n';
            }
            
            // Número da opção
            resposta += `${index + 1}. ${promo.produto}\n`;
            resposta += `💰 R$ ${promo.preco.toFixed(2)}\n`;
            resposta += `🏪 ${promo.empresa}\n`;
            resposta += `📍 ${promo.distancia} km - ${promo.endereco}\n`;
            resposta += `👤 Cadastrado por ${promo.usuario}`;
            
            // Destaca a melhor opção
            if (index === 0) {
                if (pedePerto) {
                    resposta += ` ⭐ (Mais perto!)`;
                } else if (pedeBarato) {
                    resposta += ` ⭐ (Mais barato!)`;
                } else {
                    resposta += ` ⭐ (Recomendado!)`;
                }
            }
            
            resposta += '\n';
        });
        
        // Adiciona dica final
        if (produtosEncontrados.length > 1) {
            resposta += `\n💡 Dica: ${pedePerto ? 'A primeira opção é a mais próxima de você!' : pedeBarato ? 'A primeira opção tem o melhor preço!' : 'Todas as opções estão disponíveis!'}`;
        }
        
        return {
            status: true,
            status_code: 200,
            data: {
                reply: resposta,
                confidence: 0.9,
                response_time_ms: responseTime
            }
        };
    }
    
    // 4. Busca por localização/proximidade
    if (mensagemLower.includes('perto') || mensagemLower.includes('próximo') || mensagemLower.includes('região')) {
        const promocoesProximas = [...promocoesMockadas].sort((a, b) => a.distancia - b.distancia).slice(0, 3);
        const listaProximas = promocoesProximas.map((promo, index) => 
            `**${index + 1}.** ${promo.produto} - ${promo.empresa}\n💰 R$ ${promo.preco.toFixed(2)} • 📍 **${promo.distancia} km** • ${promo.endereco}`
        ).join('\n\n');
        
        return {
            status: true,
            status_code: 200,
            data: {
                reply: `📍 **Promoções mais próximas de você:**\n\n${listaProximas}\n\n🚗 As distâncias são calculadas a partir da sua localização atual!`,
                confidence: 0.88,
                response_time_ms: responseTime
            }
        };
    }
    
    // 5. Busca por preço/barato
    if (mensagemLower.includes('barato') || mensagemLower.includes('preço') || mensagemLower.includes('econom')) {
        const promocoesBaratas = [...promocoesMockadas].sort((a, b) => a.preco - b.preco).slice(0, 3);
        const listaBaratas = promocoesBaratas.map((promo, index) => 
            `**${index + 1}.** ${promo.produto}\n💰 **R$ ${promo.preco.toFixed(2)}** • 🏪 ${promo.empresa} • 📍 ${promo.distancia} km`
        ).join('\n\n');
        
        return {
            status: true,
            status_code: 200,
            data: {
                reply: `💰 **Melhores preços encontrados:**\n\n${listaBaratas}\n\n✨ Economize comprando nas promoções certas!`,
                confidence: 0.92,
                response_time_ms: responseTime
            }
        };
    }
    
    // 6. Resposta padrão quando não entende a pergunta
    const respostaPadrao = respostasVariadas.naoEncontrado[Math.floor(Math.random() * respostasVariadas.naoEncontrado.length)];
    return {
        status: true,
        status_code: 200,
        data: {
            reply: respostaPadrao,
            confidence: 0.5,
            response_time_ms: responseTime
        }
    };
}