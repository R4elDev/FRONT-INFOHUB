import { listarProdutos, listarCategorias } from '../services/apiServicesFixed'

/**
 * Função para testar a conectividade da API e verificar se há dados
 */
export async function testarConectividadeAPI() {
  console.log('🔍 INICIANDO teste de conectividade da API')
  
  const resultados = {
    produtos: { sucesso: false, quantidade: 0, erro: null as any },
    categorias: { sucesso: false, quantidade: 0, erro: null as any }
  }

  // Teste de produtos
  try {
    console.log('📦 Testando endpoint de produtos...')
    const produtosResponse = await listarProdutos()
    console.log('📦 Resposta de produtos:', produtosResponse)
    
    if (produtosResponse.status && produtosResponse.data) {
      resultados.produtos.sucesso = true
      resultados.produtos.quantidade = produtosResponse.data.length
      console.log('✅ Produtos: OK -', produtosResponse.data.length, 'produtos encontrados')
    } else {
      console.log('⚠️ Produtos: Resposta inválida')
      resultados.produtos.erro = 'Resposta inválida da API'
    }
  } catch (error: any) {
    console.error('❌ Produtos: Erro na API:', error)
    resultados.produtos.erro = error.message || 'Erro desconhecido'
  }

  // Teste de categorias
  try {
    console.log('📋 Testando endpoint de categorias...')
    const categoriasResponse = await listarCategorias()
    console.log('📋 Resposta de categorias:', categoriasResponse)
    
    if (categoriasResponse.status && categoriasResponse.data) {
      resultados.categorias.sucesso = true
      resultados.categorias.quantidade = categoriasResponse.data.length
      console.log('✅ Categorias: OK -', categoriasResponse.data.length, 'categorias encontradas')
    } else {
      console.log('⚠️ Categorias: Resposta inválida')
      resultados.categorias.erro = 'Resposta inválida da API'
    }
  } catch (error: any) {
    console.error('❌ Categorias: Erro na API:', error)
    resultados.categorias.erro = error.message || 'Erro desconhecido'
  }

  console.log('🏁 RESULTADO FINAL do teste:', resultados)
  return resultados
}

/**
 * Função para gerar relatório de debug da API
 */
export function gerarRelatorioDebug(resultados: any): string {
  let relatorio = '🔍 RELATÓRIO DE DEBUG DA API\n\n'
  
  relatorio += `📦 PRODUTOS:\n`
  relatorio += `   Status: ${resultados.produtos.sucesso ? '✅ OK' : '❌ ERRO'}\n`
  relatorio += `   Quantidade: ${resultados.produtos.quantidade}\n`
  if (resultados.produtos.erro) {
    relatorio += `   Erro: ${resultados.produtos.erro}\n`
  }
  
  relatorio += `\n📋 CATEGORIAS:\n`
  relatorio += `   Status: ${resultados.categorias.sucesso ? '✅ OK' : '❌ ERRO'}\n`
  relatorio += `   Quantidade: ${resultados.categorias.quantidade}\n`
  if (resultados.categorias.erro) {
    relatorio += `   Erro: ${resultados.categorias.erro}\n`
  }
  
  relatorio += `\n💡 DIAGNÓSTICO:\n`
  if (resultados.produtos.sucesso && resultados.produtos.quantidade > 0) {
    relatorio += `   ✅ API funcionando e há ${resultados.produtos.quantidade} produtos cadastrados\n`
  } else if (resultados.produtos.sucesso && resultados.produtos.quantidade === 0) {
    relatorio += `   ⚠️ API funcionando mas não há produtos cadastrados\n`
  } else {
    relatorio += `   ❌ Problema na API de produtos\n`
  }
  
  return relatorio
}
