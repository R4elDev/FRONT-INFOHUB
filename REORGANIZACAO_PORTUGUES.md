# 🇧🇷 Reorganização com Nomes em Português

## 📁 Nova Estrutura Proposta

```
src/
├── componentes/
│   ├── compartilhados/          # Era "common" - componentes usados em várias páginas
│   │   ├── BarraPesquisa.tsx    # Era "SearchBar" 
│   │   ├── CardProduto.tsx      # Era "ProductCard"
│   │   ├── Banner.tsx           # Mantém
│   │   ├── EstadoVazio.tsx      # Era "EmptyState"
│   │   ├── BotaoVoltar.tsx      # Era "BackButton"
│   │   ├── ExibicaoPreco.tsx    # Era "PriceDisplay"
│   │   └── CardComentario.tsx   # Era "CommentCard"
│   │
│   ├── layouts/                 # Mantém - estruturas de página
│   │   ├── LayoutSidebar.tsx    # Era "SidebarLayout"
│   │   └── LayoutAuth.tsx       # Para login/cadastro
│   │
│   └── ui/                      # Mantém - componentes shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
│
├── paginas/                     # Era "pages" - organizadas por funcionalidade
│   ├── autenticacao/            # Login, cadastro, recuperar senha
│   │   ├── Login.tsx
│   │   ├── Cadastro.tsx
│   │   └── RecuperarSenha/
│   │       ├── Passo1.tsx
│   │       ├── Passo2.tsx
│   │       └── Final.tsx
│   │
│   ├── inicio/                  # Páginas iniciais
│   │   ├── Home.tsx
│   │   ├── HomeInicial.tsx
│   │   └── Localizacao.tsx
│   │
│   ├── produtos/                # Tudo relacionado a produtos
│   │   ├── DetalhesProduto.tsx
│   │   ├── Promocoes.tsx
│   │   ├── Favoritos.tsx
│   │   └── ChatPrecos.tsx
│   │
│   ├── carrinho/                # Fluxo de compra
│   │   ├── Carrinho.tsx
│   │   ├── Checkout.tsx
│   │   └── PagamentoSucesso.tsx
│   │
│   ├── perfil/                  # Área do usuário
│   │   ├── usuario/
│   │   │   ├── PerfilUsuario.tsx
│   │   │   └── ConfiguracoesUsuario.tsx
│   │   └── empresa/
│   │       ├── DashboardEmpresa.tsx
│   │       ├── PerfilEmpresa.tsx
│   │       └── ConfiguracoesEmpresa.tsx
│   │
│   └── infocash/                # Sistema de pontos
│       ├── InfoCash.tsx
│       ├── Comentarios.tsx      # Era "InfoCashComentarios"
│       └── NovoComentario.tsx   # Era "InfoCashNovoComentario"
│
├── hooks/                       # Mantém - lógica reutilizável
│   ├── useFavoritos.ts          # Era "useFavorites"
│   ├── useCarrinho.ts           # Era "useCart"
│   ├── useAuth.ts               # Para autenticação
│   └── useProdutos.ts           # Para produtos
│
├── servicos/                    # ✅ JÁ EXISTE - chamadas de API
│   ├── api.ts
│   ├── types.ts                 # ✅ JÁ TEM - tipos da API
│   └── ...
│
├── tipos/                       # Era "types" - interfaces do frontend
│   ├── produto.ts               # Era "product.ts"
│   ├── usuario.ts               # Era "user.ts"
│   ├── carrinho.ts              # Era "cart.ts"
│   └── comentario.ts            # Era "comment.ts"
│
├── utilitarios/                 # Era "utils" - funções auxiliares
│   ├── constantes.ts            # Era "constants.ts" - cores, rotas
│   ├── formatadores.ts          # Era "formatters.ts" - formatar preço, CPF
│   └── validadores.ts           # Validar email, CPF, etc.
│
└── assets/                      # Mantém - imagens
    ├── icones/
    ├── imagens/
    └── logos/
```

## 🎯 O que cada pasta faz:

### **📁 `componentes/compartilhados/`**
**Por que existe:** Evita repetir código
**Exemplo:** 
- BarraPesquisa é usada em 5+ páginas
- CardProduto é usado em HomeInicial, Promocoes, Favoritos
- Ao invés de copiar/colar, usa 1 componente

### **📁 `utilitarios/`**
**Por que existe:** Funções que ajudam em todo projeto
**Exemplos:**
- `formatadores.ts`: R$ 8,99, (11) 99999-9999, 123.456.789-00
- `constantes.ts`: Cores (#F9A01B), rotas (/favoritos)
- `validadores.ts`: Validar se email é válido

### **📁 `tipos/`** 
**Por que existe:** TypeScript precisa saber formato dos dados
**Diferença de `servicos/types.ts`:**
- `servicos/types.ts` = Dados que vêm da API (loginRequest, cadastroResponse)
- `tipos/produto.ts` = Dados usados no frontend (Product, ProductCardProps)

### **📁 `paginas/` organizadas**
**Por que organizar:** Fácil de encontrar
- `autenticacao/` = Login, cadastro, recuperar senha
- `produtos/` = Tudo sobre produtos
- `carrinho/` = Fluxo de compra
- `perfil/` = Área do usuário

## 🚀 Próximos Passos:

1. **Renomear pastas** para português
2. **Mover arquivos** para organização
3. **Atualizar imports** em todas as páginas
4. **Testar** se tudo funciona

**Quer que eu faça essa reorganização?** 🤔
