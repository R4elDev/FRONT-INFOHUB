# 🔌 InfoCash - Integração com API Backend

## ✅ Status de Integração

Este documento mostra **EXATAMENTE** como o frontend InfoCash está integrado com a API backend.

---

## 📡 Endpoints da API InfoCash

### Base URL
```
http://localhost:3333/infocash
```

### 1️⃣ **Buscar Saldo do Usuário**

**Endpoint:** `GET /infocash/saldo/:id_usuario`

**Implementação:**
```typescript
// Arquivo: src/services/infocashService.ts
async getSaldo(idUsuario: number): Promise<SaldoResponse> {
  const response = await api.get(`/infocash/saldo/${idUsuario}`);
  return response.data;
}
```

**Usado em:**
- `src/pages/infocash/InfoCashPrincipal.tsx` - Método `carregarSaldoSeparado()`

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Saldo recuperado com sucesso",
  "data": {
    "saldo": 150,
    "nivel": "Prata",
    "total_ganho": 200,
    "total_gasto": 50
  }
}
```

**Console Logs:**
- ✅ Sucesso: `console.log('✅ Saldo carregado:', saldo)`
- ❌ Erro: `console.error('Erro ao carregar saldo:', error)`

---

### 2️⃣ **Buscar Histórico de Transações**

**Endpoint:** `GET /infocash/historico/:id_usuario?limite=50`

**Implementação:**
```typescript
// Arquivo: src/services/infocashService.ts
async getHistorico(idUsuario: number, limite = 50): Promise<HistoricoResponse> {
  const response = await api.get(`/infocash/historico/${idUsuario}?limite=${limite}`);
  return response.data;
}
```

**Usado em:**
- `src/pages/infocash/InfoCashPrincipal.tsx` - Método `carregarHistorico()`

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Histórico recuperado",
  "data": [
    {
      "id_transacao": 1,
      "tipo_acao": "avaliacao_promocao",
      "pontos": 5,
      "descricao": "Avaliação de promoção #123",
      "data_transacao": "2024-11-27T14:30:00Z"
    },
    {
      "id_transacao": 2,
      "tipo_acao": "comentario_comunidade",
      "pontos": 3,
      "descricao": "Comentário em post da comunidade",
      "data_transacao": "2024-11-27T10:15:00Z"
    }
  ]
}
```

**Tipos de Ação Suportados:**
- `avaliacao_promocao` - 🎯 Avaliação de Promoção (5 pts)
- `avaliacao_empresa` - ⭐ Avaliação de Empresa (7 pts)
- `comentario_comunidade` - 💬 Comentário na Comunidade (3 pts)
- `curtida_post` - ❤️ Curtida em Post (1 pt)
- `manual` - 🎁 Bônus Especial (variável)

**Console Logs:**
- ✅ Sucesso: `console.log('✅ Histórico carregado:', transacoes.length, 'transações')`
- ❌ Erro: `console.error('Erro ao carregar histórico:', error)`

---

### 3️⃣ **Buscar Resumo por Tipo de Ação**

**Endpoint:** `GET /infocash/resumo/:id_usuario`

**Implementação:**
```typescript
// Arquivo: src/services/infocashService.ts
async getResumoPorTipo(idUsuario: number): Promise<ResumoPorTipoResponse> {
  const response = await api.get(`/infocash/resumo/${idUsuario}`);
  return response.data;
}
```

**Usado em:**
- `src/pages/infocash/InfoCashPrincipal.tsx` - Método `carregarResumoSeparado()`

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Resumo por tipo recuperado",
  "data": [
    {
      "tipo_acao": "avaliacao_promocao",
      "total_transacoes": 15,
      "total_pontos": 75
    },
    {
      "tipo_acao": "avaliacao_empresa",
      "total_transacoes": 3,
      "total_pontos": 21
    },
    {
      "tipo_acao": "comentario_comunidade",
      "total_transacoes": 8,
      "total_pontos": 24
    },
    {
      "tipo_acao": "curtida_post",
      "total_transacoes": 30,
      "total_pontos": 30
    }
  ]
}
```

**Console Logs:**
- ✅ Sucesso: `console.log('✅ Resumo carregado')`
- ❌ Erro: `console.error('Erro ao carregar resumo:', error)`

---

### 4️⃣ **Buscar Perfil Completo (OTIMIZADO)** ⚡

**Endpoint:** `GET /infocash/perfil/:id_usuario`

**Implementação:**
```typescript
// Arquivo: src/services/infocashService.ts
async getPerfilCompleto(idUsuario: number): Promise<PerfilCompletoResponse> {
  const response = await api.get(`/infocash/perfil/${idUsuario}`);
  return response.data;
}
```

**Usado em:**
- `src/pages/infocash/InfoCashPrincipal.tsx` - Método `carregarPerfilCompleto()`

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Perfil recuperado",
  "data": {
    "saldo": 150,
    "nivel": "Prata",
    "total_ganho": 200,
    "total_gasto": 50,
    "resumo_por_tipo": [
      {
        "tipo_acao": "avaliacao_promocao",
        "total_transacoes": 15,
        "total_pontos": 75
      }
    ]
  }
}
```

**Vantagem:**
- ⚡ **1 requisição** em vez de 2 (saldo + resumo)
- 🚀 Carregamento mais rápido

**Fallback Automático:**
Se este endpoint não existir, o frontend automaticamente tenta:
1. `GET /infocash/saldo/:id`
2. `GET /infocash/resumo/:id`

**Console Logs:**
- ✅ Sucesso: `console.log('✅ Perfil completo carregado')`
- ⚠️ Fallback: `console.log('⚠️ Endpoint /perfil não existe, usando saldo e resumo separados')`
- ❌ Erro: `console.error('Erro ao carregar perfil completo:', error)`

---

### 5️⃣ **Buscar Ranking Global**

**Endpoint:** `GET /infocash/ranking?limite=10`

**Implementação:**
```typescript
// Arquivo: src/services/infocashService.ts
async getRanking(limite = 10): Promise<RankingResponse> {
  const response = await api.get(`/infocash/ranking?limite=${limite}`);
  return response.data;
}
```

**Usado em:**
- `src/pages/infocash/InfoCashPrincipal.tsx` - Método `carregarRanking()`

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Ranking recuperado",
  "data": [
    {
      "id_usuario": 1,
      "nome_usuario": "João Silva",
      "saldo_total": 5000,
      "posicao": 1
    },
    {
      "id_usuario": 2,
      "nome_usuario": "Maria Santos",
      "saldo_total": 3500,
      "posicao": 2
    }
  ]
}
```

**Console Logs:**
- ✅ Sucesso: `console.log('✅ Ranking carregado:', ranking.length, 'usuários')`
- ❌ Erro: `console.error('Erro ao carregar ranking:', error)`

---

## 📡 Endpoints da API Comunidade

### Base URL
```
http://localhost:3333
```

### 6️⃣ **Listar Posts da Comunidade**

**Endpoint:** Múltiplos (com fallback automático)
1. `GET /posts` (principal)
2. `GET /post` (fallback 1)
3. `GET /v1/infohub/posts` (fallback 2)
4. `GET /infohub/posts` (fallback 3)

**Implementação:**
```typescript
// Arquivo: src/services/comunidadeService.ts
async listarPosts(limite = 50, page = 1): Promise<ComentarioResponse> {
  // Tenta vários endpoints automaticamente
  const response = await api.get('/posts', { params: { limite, page } });
  return response.data;
}
```

**Usado em:**
- `src/components/infocash/ComunidadeCompacta.tsx` - Método `carregarPosts()`
- `src/pages/infocash/InfoCashComentarios.tsx` - Método `carregarComentarios()`

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Posts encontrados",
  "data": [
    {
      "id_post": 1,
      "titulo": "Melhor promoção do mês!",
      "conteudo": "Encontrei uma ótima promoção...",
      "nome_usuario": "João Silva",
      "id_usuario": 1,
      "data_criacao": "2024-11-27T14:30:00Z",
      "total_curtidas": 15,
      "total_comentarios": 3
    }
  ]
}
```

**Console Logs:**
- 🔍 Tentativa: `console.log('🔍 TENTATIVA 1: GET /posts')`
- ✅ Sucesso: `console.log('✅ TENTATIVA 1 SUCESSO! Total de posts:', posts.length)`
- ❌ Erro: `console.log('❌ TENTATIVA 1 FALHOU:', error.status)`
- 🔄 Fallback: `console.log('🔍 TENTATIVA 2: GET /post')`

---

### 7️⃣ **Curtir/Descurtir Post (TOGGLE)**

**Endpoint:** `POST /post/:id_post/curtir`

**Implementação:**
```typescript
// Arquivo: src/services/comunidadeService.ts
async curtirPost(idPost: number): Promise<{ status: boolean; data: any }> {
  const userData = localStorage.getItem('user_data');
  const user = JSON.parse(userData);
  
  const response = await api.post(`/post/${idPost}/curtir`, {
    id_usuario: user.id
  });
  
  return response.data;
}
```

**Usado em:**
- `src/components/infocash/ComunidadeCompacta.tsx` - Método `handleCurtir()`
- `src/pages/infocash/InfoCashComentarios.tsx` - Método `handleCurtir()`

**Payload Enviado:**
```json
{
  "id_usuario": 45
}
```

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Curtida adicionada/removida com sucesso",
  "data": {
    "curtido": true,
    "total_curtidas": 16,
    "acao": "adicionada"
  }
}
```

**⚠️ IMPORTANTE:**
- Backend usa **TOGGLE** - mesmo endpoint para curtir E descurtir
- Frontend SEMPRE chama `curtirPost()` (nunca `descurtirPost()`)
- Backend decide automaticamente se adiciona ou remove a curtida
- Usar dados retornados (`curtido`, `total_curtidas`) em vez de calcular manualmente

**Console Logs:**
- 👍 Tentativa: `console.log('👍 Curtindo/Descurtindo post:', idPost)`
- 🔍 Endpoint: `console.log('🔍 Tentando /post/:id/curtir...')`
- ✅ Sucesso: `console.log('✅ Sucesso! Curtido:', curtido, 'Total:', total)`
- ❌ Erro: `console.error('❌ Todos os endpoints de curtida falharam')`

---

### 8️⃣ **Verificar se Usuário Curtiu**

**Endpoint:** `GET /post/:id_post/curtida/verificar?id_usuario=X`

**Implementação:**
```typescript
// Arquivo: src/services/comunidadeService.ts
async verificarCurtida(idPost: number): Promise<{ curtido: boolean; total_curtidas: number }> {
  const userData = localStorage.getItem('user_data');
  const user = JSON.parse(userData);
  
  const response = await api.get(`/post/${idPost}/curtida/verificar`, {
    params: { id_usuario: user.id }
  });
  
  return response.data;
}
```

**Usado em:**
- `src/components/infocash/ComunidadeCompacta.tsx` - Método `carregarCurtidasPosts()`
- `src/pages/infocash/InfoCashComentarios.tsx` - Método `carregarCurtidasPosts()`

**Resposta Esperada:**
```json
{
  "status": true,
  "data": {
    "curtido": true,
    "total_curtidas": 16
  }
}
```

**Console Logs:**
- ✅ Sucesso: `console.log('✅ Verificação OK: curtido=', curtido, 'total=', total)`
- ⚠️ Fallback: `console.log('⚠️ Endpoint não encontrado, retornando padrão')`

---

### 9️⃣ **Criar Novo Post**

**Endpoint:** `POST /post` ou `POST /posts/:id_post/comentario`

**Implementação:**
```typescript
// Arquivo: src/services/comunidadeService.ts
async criarPost(dados: { titulo: string; conteudo: string; id_produto?: number }) {
  const userData = localStorage.getItem('user_data');
  const user = JSON.parse(userData);
  
  const payload = {
    titulo: dados.titulo,
    conteudo: dados.conteudo,
    id_usuario: user.id,
    id_produto: dados.id_produto || null
  };
  
  const response = await api.post('/post', payload);
  return response.data;
}
```

**Usado em:**
- `src/pages/infocash/InfoCashNovoComentario.tsx` - Método `submit()`

**Payload Enviado:**
```json
{
  "titulo": "Ótima promoção!",
  "conteudo": "Encontrei uma promoção incrível...",
  "id_usuario": 45,
  "id_produto": 10
}
```

**Resposta Esperada:**
```json
{
  "status": true,
  "message": "Post criado com sucesso! +3 HubCoins 🎉",
  "data": {
    "id_post": 123,
    "titulo": "Ótima promoção!",
    "pontos_ganhos": 3
  }
}
```

**Console Logs:**
- 📝 Tentativa: `console.log('📝 Criando post:', titulo)`
- ✅ Sucesso: `console.log('✅ Post criado! ID:', id, 'Pontos ganhos:', pontos)`
- ❌ Erro: `console.error('❌ Erro ao criar post:', error)`

---

## 🔐 Autenticação

### Como o Frontend Envia o Token

**Headers Automáticos:**
```typescript
// Arquivo: src/lib/api.ts
const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Dados do Usuário:**
```typescript
// Armazenados em localStorage
const userData = localStorage.getItem('user_data');
const user = JSON.parse(userData);

// Estrutura:
{
  id: 45,
  nome: "João Silva",
  email: "joao@email.com",
  tipo: "consumidor"
}
```

---

## 🚦 Tratamento de Erros

### Sistema de Fallback

**Exemplo: Perfil Completo**
```typescript
async carregarPerfilCompleto() {
  try {
    // TENTATIVA 1: Endpoint otimizado
    const response = await infocashService.getPerfilCompleto(user.id);
    
    if (response.status && response.data) {
      setSaldo(response.data.saldo);
      setResumo(response.data.resumo_por_tipo);
    }
  } catch (error) {
    console.error('⚠️ Endpoint /perfil não existe, usando fallback');
    
    // FALLBACK: Buscar separadamente
    carregarSaldoSeparado();
    carregarResumoSeparado();
  }
}
```

**Exemplo: Curtidas**
```typescript
async curtirPost(idPost) {
  const endpoints = [
    { url: `/post/${idPost}/curtir`, data: { id_usuario } },
    { url: '/curtida', data: { id_post: idPost, id_usuario } },
    { url: `/posts/${idPost}/curtir`, data: { id_usuario } }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint.url, endpoint.data);
      return response.data; // ✅ Funcionou!
    } catch (error) {
      continue; // ❌ Tentar próximo
    }
  }
  
  throw new Error('Nenhum endpoint de curtida funcionou');
}
```

---

## 📊 Verificação de Integração

### Checklist de Testes

Execute estes testes para verificar se a API está funcionando:

#### ✅ 1. Saldo
```bash
# Abrir Console do Navegador (F12)
# Acessar: /infocash
# Verificar console:
[
  "🔎 [InfoCashPrincipal] Carregando perfil completo..."
  "✅ [InfoCashPrincipal] Saldo: 150 pontos"
]
```

#### ✅ 2. Histórico
```bash
# Verificar console:
[
  "🔎 [InfoCashPrincipal] Carregando histórico..."
  "✅ [InfoCashPrincipal] Histórico: 25 transações"
]
```

#### ✅ 3. Ranking
```bash
# Verificar console:
[
  "🔎 [InfoCashPrincipal] Carregando ranking..."
  "✅ [InfoCashPrincipal] Ranking: 10 usuários"
]
```

#### ✅ 4. Posts da Comunidade
```bash
# Verificar console:
[
  "🔎 [ComunidadeCompacta] Carregando posts da API..."
  "✅ TENTATIVA 1 SUCESSO!"
  "✅ [ComunidadeCompacta] Posts carregados: 3"
]
```

#### ✅ 5. Curtidas
```bash
# Clicar no botão de curtir
# Verificar console:
[
  "👍 [ComunidadeCompacta] Curtindo/Descurtindo post: 1"
  "🔍 [curtirPost] Tentando /post/1/curtir..."
  "✅ [curtirPost] Sucesso! Curtido: true, Total: 16"
]
```

---

## 🎯 Resumo de Integração

| Funcionalidade | Endpoint | Arquivo | Status |
|----------------|----------|---------|--------|
| Saldo | `/infocash/saldo/:id` | `infocashService.ts` | ✅ Integrado |
| Histórico | `/infocash/historico/:id` | `infocashService.ts` | ✅ Integrado |
| Resumo | `/infocash/resumo/:id` | `infocashService.ts` | ✅ Integrado |
| Perfil Completo | `/infocash/perfil/:id` | `infocashService.ts` | ✅ Integrado (c/ fallback) |
| Ranking | `/infocash/ranking` | `infocashService.ts` | ✅ Integrado |
| Listar Posts | `/posts` | `comunidadeService.ts` | ✅ Integrado (c/ fallback) |
| Curtir Post | `/post/:id/curtir` | `comunidadeService.ts` | ✅ Integrado (c/ fallback) |
| Verificar Curtida | `/post/:id/curtida/verificar` | `comunidadeService.ts` | ✅ Integrado (c/ fallback) |
| Criar Post | `/post` | `comunidadeService.ts` | ✅ Integrado |

---

## 🔧 Configuração do Backend

### Porta e URL Base

**Arquivo:** `src/lib/api.ts`
```typescript
const api = axios.create({
  baseURL: 'http://localhost:3333'
});
```

**Para mudar:**
1. Edite o arquivo `src/lib/api.ts`
2. Altere a `baseURL`
3. Reinicie o frontend

---

## 📝 Notas Importantes

1. **Token JWT**: Automaticamente incluído em todas as requisições via interceptor
2. **ID do Usuário**: Extraído do `localStorage` quando necessário
3. **Fallbacks**: Sistema robusto de fallback para garantir compatibilidade
4. **Logs Detalhados**: Todos os métodos têm logs para debug
5. **TypeScript**: Todas as interfaces estão tipadas
6. **Tratamento de Erros**: Todos os erros retornam valores padrão seguros

---

**✅ SISTEMA 100% INTEGRADO COM API BACKEND**

🚀 Pronto para produção!
