import { useState, useEffect } from 'react'
import { Button as Botao } from "../../components/ui/button"
import { Input as CampoTexto } from "../../components/ui/input"
import { useNavigate } from "react-router-dom"
import iconJarra from "../../assets/icon de jara.png"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import microfoneVoz from "../../assets/microfone de voz.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarCategorias, listarProdutos, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"

function HomeInicialAdmin() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState<Array<{ id: number; nome: string }>>([]) 
  const [produtos, setProdutos] = useState<Array<any>>([]) 
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  // Carrega categorias e produtos ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        
        // Tenta carregar categorias da API, mas usa categorias padrão se falhar
        try {
          const categoriasResponse = await listarCategorias()
          if (categoriasResponse.status && categoriasResponse.data) {
            setCategorias(categoriasResponse.data)
          }
        } catch (error) {
          console.log('ℹ️ Usando categorias padrão (endpoint não disponível)')
          // Usa categorias padrão se API não estiver disponível
          setCategorias([
            { id: 1, nome: "Alimentos e Bebidas" },
            { id: 2, nome: "Eletrônicos" },
            { id: 3, nome: "Roupas e Acessórios" },
            { id: 4, nome: "Casa e Decoração" },
            { id: 5, nome: "Saúde e Beleza" },
            { id: 6, nome: "Outros" }
          ])
        }
        
        // Carrega todos os produtos para admin
        const produtosResponse = await listarProdutos()
        if (produtosResponse.status && produtosResponse.data) {
          setProdutos(produtosResponse.data.slice(0, 4)) // Apenas os primeiros 4
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarDados()
  }, [])

  const handleProdutoClick = (produtoId: number) => {
    navigate(`/produto/${produtoId}`)
  }

  const handleCategoriaClick = (categoriaId: number) => {
    navigate(`/promocoes?categoria=${categoriaId}`)
  }

  const handleBusca = () => {
    if (busca.trim()) {
      navigate(`/promocoes?busca=${encodeURIComponent(busca.trim())}`)
    }
  }

  return (
    <SidebarLayout>
      {/* Banner Principal */}
      <section className="mt-8">
        <div 
          className="w-full h-52 md:h-80 bg-gradient-to-br from-[#F9A01B] 
                     via-[#FF8C00] to-[#FFA500] rounded-3xl shadow-2xl 
                     relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')']"
          ></div>
          
          
          <div className="absolute top-6 right-6">
            <button 
              onClick={() => navigate('/cadastro-promocao')}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
            >
              ➕ Nova Promoção
            </button>
          </div>
        </div>
        {/* Pontinhos do Carrossel */}
        <div className="flex items-center justify-center gap-2.5 mt-5">
          <span 
            className="w-3 h-3 rounded-full bg-[#F9A01B] shadow-md 
                       transition-all hover:scale-125 cursor-pointer" 
          />
          <span 
            className="w-3 h-3 rounded-full bg-[#F9A01B]/60 shadow-sm 
                       transition-all hover:scale-125 cursor-pointer" 
          />
          <span 
            className="w-3 h-3 rounded-full bg-[#F9A01B]/40 shadow-sm 
                       transition-all hover:scale-125 cursor-pointer" 
          />
        </div>
      </section>

      {/* Search Bar */}
      <section className="mt-10">
        <div className="relative w-full bg-white rounded-3xl border-2 border-gray-200 shadow-lg transition-all hover:shadow-xl">
          <img
            src={lupaPesquisa}
            alt="Pesquisar"
            className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
          />
          <CampoTexto
            placeholder="Buscar produtos, empresas, usuários..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
            className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                       focus-visible:ring-2 focus-visible:ring-blue-400 
                       placeholder:text-gray-400"
          />
          <button 
            onClick={handleBusca}
            className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
          >
            <img
              src={microfoneVoz}
              alt="Pesquisar por voz"
              className="w-5 h-6"
            />
          </button>
        </div>
      </section>

      {/* Category Filters */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categorias</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Botão "Todas" */}
          <button 
            onClick={() => navigate('/promocoes')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0"
          >
            📊 Todas
          </button>
          
          {/* Categorias dinâmicas da API */}
          {categorias.map((categoria, index) => {
            const cores = [
              'bg-green-500 hover:bg-green-600',
              'bg-purple-500 hover:bg-purple-600', 
              'bg-red-500 hover:bg-red-600',
              'bg-yellow-500 hover:bg-yellow-600',
              'bg-indigo-500 hover:bg-indigo-600',
              'bg-pink-500 hover:bg-pink-600',
              'bg-teal-500 hover:bg-teal-600',
              'bg-orange-500 hover:bg-orange-600'
            ]
            const cor = cores[index % cores.length]
            
            return (
              <button 
                key={categoria.id}
                onClick={() => handleCategoriaClick(categoria.id)}
                className={`${cor} text-white px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0`}
              >
                {categoria.nome}
              </button>
            )
          })}
          
          {/* Loading de categorias */}
          {loading && categorias.length === 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Carregando categorias...</span>
            </div>
          )}
        </div>
      </section>

      {/* Products Section - Admin View */}
      <section className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            📦 Produtos em Destaque
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/cadastro-promocao')}
              className="text-sm md:text-base font-semibold bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-4 py-2 rounded-xl transition-colors"
            >
              ➕ Adicionar
            </button>
            <button 
              onClick={() => navigate('/promocoes')}
              className="text-sm md:text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              Ver Todos <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border-2 border-gray-200 bg-white p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-24 bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : produtos.length === 0 ? (
            // Sem produtos
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-500 mb-4">Comece adicionando produtos ao sistema</p>
              <button 
                onClick={() => navigate('/cadastro-promocao')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                ➕ Adicionar Produto
              </button>
            </div>
          ) : (
            // Produtos reais da API
            produtos.map((produto) => {
              const emPromocao = isProdutoEmPromocao(produto)
              const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao!.preco_promocional) : 0
              
              return (
                <article
                  key={produto.id}
                  onClick={() => handleProdutoClick(produto.id)}
                  className="rounded-2xl border-2 border-gray-200 bg-white p-4 cursor-pointer
                             shadow-md transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-300"
                >
                  {/* Admin Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                      {emPromocao ? 'PROMOÇÃO' : 'PRODUTO'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/cadastro-promocao')
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors text-lg"
                    >
                      ⚙️
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="flex items-center justify-center py-4 bg-gray-50 rounded-xl mb-3">
                    <img 
                      src={iconJarra} 
                      alt={produto.nome} 
                      className="w-24 h-24 object-contain drop-shadow-md" 
                    />
                  </div>

                  {/* Price + Status */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 font-bold px-2 py-1 rounded-md">
                      ATIVO
                    </span>
                    <span className="text-gray-600 font-medium">
                      {emPromocao ? formatarPreco(produto.promocao!.preco_promocional) : formatarPreco(produto.preco)}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800">ID: #{produto.id}</p>
                    <Botao 
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Edit product', produto.id)
                      }}
                      className="h-8 w-8 rounded-full p-0 text-white font-bold 
                                 bg-gradient-to-r from-blue-600 to-blue-700 
                                 hover:from-blue-700 hover:to-blue-800 
                                 shadow-md hover:shadow-lg transition-all hover:scale-110"
                    >
                      ✏️
                    </Botao>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {produto.nome}
                  </p>
                  
                  {/* Categoria */}
                  <p className="text-xs text-gray-400 mt-1">
                    {produto.categoria?.nome}
                  </p>
                  
                  {/* Estabelecimento */}
                  <p className="text-xs text-blue-500 mt-1">
                    {produto.estabelecimento?.nome}
                  </p>
                </article>
              )
            })
          )}
        </div>
      </section>
    </SidebarLayout>
  )
}

export default HomeInicialAdmin
