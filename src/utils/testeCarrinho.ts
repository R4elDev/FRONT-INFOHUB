import { CarrinhoAPI } from '../services/carrinhoService'

// ============================================
// FUNÇÃO DE TESTE COMPLETA DA API DE CARRINHO
// ============================================

export const testeCompletoCarrinho = async (idUsuario: number) => {
  console.log('🧪 === INICIANDO TESTE COMPLETO DA API DE CARRINHO ===')
  console.log(`👤 Usuário ID: ${idUsuario}`)
  
  try {
    // 1. Listar carrinho inicial
    console.log('\n1️⃣ === LISTANDO CARRINHO INICIAL ===')
    const carrinhoInicial = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho inicial:', carrinhoInicial)

    // 2. Contar itens inicial
    console.log('\n2️⃣ === CONTANDO ITENS INICIAL ===')
    const contadorInicial = await CarrinhoAPI.contarItens(idUsuario)
    console.log('📊 Contador inicial:', contadorInicial)

    // 3. Adicionar item de teste
    console.log('\n3️⃣ === ADICIONANDO ITEM DE TESTE ===')
    console.log('🛒 Adicionando produto ID: 1, quantidade: 2')
    const itemAdicionado = await CarrinhoAPI.adicionarItem(idUsuario, 1, 2)
    console.log('✅ Item adicionado:', itemAdicionado)

    // 4. Listar carrinho após adicionar
    console.log('\n4️⃣ === LISTANDO CARRINHO APÓS ADICIONAR ===')
    const carrinhoAposAdicionar = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho após adicionar:', carrinhoAposAdicionar)

    // 5. Contar itens após adicionar
    console.log('\n5️⃣ === CONTANDO ITENS APÓS ADICIONAR ===')
    const contadorAposAdicionar = await CarrinhoAPI.contarItens(idUsuario)
    console.log('📊 Contador após adicionar:', contadorAposAdicionar)

    // 6. Adicionar mesmo item novamente (deve somar quantidade)
    console.log('\n6️⃣ === ADICIONANDO MESMO ITEM NOVAMENTE ===')
    console.log('🛒 Adicionando produto ID: 1, quantidade: 1 (deve somar)')
    const itemSomado = await CarrinhoAPI.adicionarItem(idUsuario, 1, 1)
    console.log('✅ Item somado:', itemSomado)

    // 7. Listar carrinho após somar
    console.log('\n7️⃣ === LISTANDO CARRINHO APÓS SOMAR ===')
    const carrinhoAposSomar = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho após somar:', carrinhoAposSomar)

    // 8. Atualizar quantidade
    console.log('\n8️⃣ === ATUALIZANDO QUANTIDADE ===')
    console.log('🔄 Atualizando produto ID: 1 para quantidade: 5')
    await CarrinhoAPI.atualizarQuantidade(idUsuario, 1, 5)
    console.log('✅ Quantidade atualizada')

    // 9. Listar carrinho após atualizar
    console.log('\n9️⃣ === LISTANDO CARRINHO APÓS ATUALIZAR ===')
    const carrinhoAposAtualizar = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho após atualizar:', carrinhoAposAtualizar)

    // 10. Adicionar outro produto
    console.log('\n🔟 === ADICIONANDO OUTRO PRODUTO ===')
    console.log('🛒 Adicionando produto ID: 2, quantidade: 3')
    const outroItem = await CarrinhoAPI.adicionarItem(idUsuario, 2, 3)
    console.log('✅ Outro item adicionado:', outroItem)

    // 11. Listar carrinho com múltiplos itens
    console.log('\n1️⃣1️⃣ === LISTANDO CARRINHO COM MÚLTIPLOS ITENS ===')
    const carrinhoMultiplo = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho múltiplo:', carrinhoMultiplo)

    // 12. Contar itens múltiplos
    console.log('\n1️⃣2️⃣ === CONTANDO ITENS MÚLTIPLOS ===')
    const contadorMultiplo = await CarrinhoAPI.contarItens(idUsuario)
    console.log('📊 Contador múltiplo:', contadorMultiplo)

    // 13. Remover um item específico
    console.log('\n1️⃣3️⃣ === REMOVENDO ITEM ESPECÍFICO ===')
    console.log('🗑️ Removendo produto ID: 1')
    await CarrinhoAPI.removerItem(idUsuario, 1)
    console.log('✅ Item removido')

    // 14. Listar carrinho após remover
    console.log('\n1️⃣4️⃣ === LISTANDO CARRINHO APÓS REMOVER ===')
    const carrinhoAposRemover = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho após remover:', carrinhoAposRemover)

    // 15. Limpar carrinho completo
    console.log('\n1️⃣5️⃣ === LIMPANDO CARRINHO COMPLETO ===')
    console.log('🧹 Limpando todo o carrinho')
    await CarrinhoAPI.limparCarrinho(idUsuario)
    console.log('✅ Carrinho limpo')

    // 16. Listar carrinho final (deve estar vazio)
    console.log('\n1️⃣6️⃣ === LISTANDO CARRINHO FINAL ===')
    const carrinhoFinal = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho final:', carrinhoFinal)

    // 17. Contar itens final
    console.log('\n1️⃣7️⃣ === CONTANDO ITENS FINAL ===')
    const contadorFinal = await CarrinhoAPI.contarItens(idUsuario)
    console.log('📊 Contador final:', contadorFinal)

    console.log('\n✅ === TESTE COMPLETO CONCLUÍDO COM SUCESSO ===')
    
    return {
      sucesso: true,
      carrinhoInicial,
      carrinhoFinal,
      contadorInicial,
      contadorFinal
    }
    
  } catch (error) {
    console.error('\n❌ === ERRO DURANTE O TESTE ===')
    console.error('Erro:', error)
    
    return {
      sucesso: false,
      erro: error
    }
  }
}

// ============================================
// FUNÇÃO DE TESTE RÁPIDO
// ============================================

export const testeRapidoCarrinho = async (idUsuario: number) => {
  console.log('⚡ === TESTE RÁPIDO DA API DE CARRINHO ===')
  
  try {
    // Listar carrinho
    const carrinho = await CarrinhoAPI.listarCarrinho(idUsuario)
    console.log('📋 Carrinho atual:', carrinho)

    // Contar itens
    const contador = await CarrinhoAPI.contarItens(idUsuario)
    console.log('📊 Contador:', contador)

    console.log('✅ API funcionando corretamente!')
    
    return { sucesso: true, carrinho, contador }
    
  } catch (error) {
    console.error('❌ Erro na API:', error)
    return { sucesso: false, erro: error }
  }
}

// ============================================
// FUNÇÃO PARA TESTAR FUNÇÕES AUXILIARES
// ============================================

export const testarFuncoesAuxiliares = () => {
  console.log('🔧 === TESTANDO FUNÇÕES AUXILIARES ===')
  
  // Item de exemplo
  const itemExemplo = {
    id_carrinho: 1,
    id_usuario: 1,
    id_produto: 1,
    quantidade: 2,
    nome_produto: "Produto Teste",
    preco_atual: 100.00,
    preco_promocional: 80.00,
    data_adicionado: new Date().toISOString()
  }

  // Testar se está em promoção
  const emPromocao = CarrinhoAPI.itemEmPromocao(itemExemplo)
  console.log('🏷️ Item em promoção:', emPromocao)

  // Testar cálculo do total
  const totalItem = CarrinhoAPI.calcularTotalItem(itemExemplo)
  console.log('💰 Total do item:', totalItem)

  // Testar cálculo do desconto
  const desconto = CarrinhoAPI.calcularDesconto(itemExemplo)
  console.log('💸 Desconto:', desconto)

  console.log('✅ Funções auxiliares testadas!')
}
