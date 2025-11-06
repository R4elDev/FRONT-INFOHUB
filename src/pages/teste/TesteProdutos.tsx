import { useState, useEffect } from 'react'
import { listarProdutos, isProdutoEmPromocao, formatarPreco } from '../../services/apiServicesFixed'
import SidebarLayout from '../../components/layouts/SidebarLayout'

export function TesteProdutos() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      setLoading(true)
      console.log('🧪 [TESTE] ========================================')
      console.log('🧪 [TESTE] Carregando todos os produtos...')
      console.log('🧪 [TESTE] ========================================')
      
      const response = await listarProdutos()
      console.log('🧪 [TESTE] Resposta da API:', response)
      
      if (response.status && response.data) {
        console.log('🧪 [TESTE] Total de produtos:', response.data.length)
        setProdutos(response.data)
        
        // Testa cada produto
        response.data.forEach((produto: any, index: number) => {
          console.log(`\n🧪 [TESTE] ========== PRODUTO ${index + 1} ==========`)
          console.log('🧪 [TESTE] Nome:', produto.nome)
          console.log('🧪 [TESTE] Preço normal:', formatarPreco(produto.preco))
          console.log('🧪 [TESTE] Tem objeto promocao?', !!produto.promocao)
          if (produto.promocao) {
            console.log('🧪 [TESTE] Preço promocional:', formatarPreco(produto.promocao.preco_promocional))
            console.log('🧪 [TESTE] Data início:', produto.promocao.data_inicio)
            console.log('🧪 [TESTE] Data fim:', produto.promocao.data_fim)
          }
          
          const emPromocao = isProdutoEmPromocao(produto)
          console.log(`🧪 [TESTE] Está em promoção? ${emPromocao ? '✅ SIM' : '❌ NÃO'}`)
          console.log('🧪 [TESTE] =====================================\n')
        })
      }
    } catch (error) {
      console.error('🧪 [TESTE] Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Teste de Produtos e Promoções</h1>
          
          <button
            onClick={carregarProdutos}
            className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            🔄 Recarregar Produtos
          </button>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {produtos.map((produto, index) => {
                const emPromocao = isProdutoEmPromocao(produto)
                
                return (
                  <div
                    key={produto.id}
                    className={`border-2 rounded-xl p-6 ${
                      emPromocao 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {index + 1}. {produto.nome}
                        </h3>
                        <p className="text-sm text-gray-600">{produto.descricao}</p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${
                          emPromocao
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {emPromocao ? '✅ COM PROMOÇÃO' : '❌ SEM PROMOÇÃO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preço Normal</p>
                        <p className="text-lg font-bold text-gray-800">
                          {formatarPreco(produto.preco)}
                        </p>
                      </div>

                      {produto.promocao && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Preço Promocional</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatarPreco(produto.promocao.preco_promocional)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Data Início</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {produto.promocao.data_inicio 
                                ? new Date(produto.promocao.data_inicio).toLocaleDateString('pt-BR')
                                : 'Não definida'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Data Fim</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {produto.promocao.data_fim 
                                ? new Date(produto.promocao.data_fim).toLocaleDateString('pt-BR')
                                : 'Não definida'}
                            </p>
                          </div>
                        </>
                      )}

                      {!produto.promocao && (
                        <div className="col-span-3">
                          <p className="text-sm text-gray-500 italic">
                            Este produto não possui dados de promoção cadastrados
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">📋 Dados Técnicos:</p>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(produto, null, 2)}
                      </pre>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3">📝 Instruções:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Abra o Console do navegador (F12)</li>
              <li>Clique em "Recarregar Produtos"</li>
              <li>Veja os logs detalhados no console</li>
              <li>Cada produto mostra:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Se tem objeto promocao</li>
                  <li>Valores de preço normal e promocional</li>
                  <li>Datas de início e fim</li>
                  <li>Resultado da verificação</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default TesteProdutos
