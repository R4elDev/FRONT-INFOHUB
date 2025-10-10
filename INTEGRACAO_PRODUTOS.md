# 📦 Integração: Cadastro de Produtos

## ✅ Integração Completa

Integração do cadastro de produtos com a API do backend. Produtos são vinculados ao estabelecimento do usuário jurídico.

---

## 🔗 Endpoint Integrado

### POST `/produtos`

**Request Body:**
```json
{
  "nome": "Smartphone Samsung Galaxy",
  "descricao": "Smartphone com 128GB de armazenamento",
  "id_categoria": 1,
  "id_estabelecimento": 1,
  "preco": 999.99,
  "promocao": {
    "preco_promocional": 899.99,
    "data_inicio": "2025-10-01",
    "data_fim": "2025-10-31"
  }
}
```

**Response (201 - Sucesso):**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Produto criado com sucesso",
  "id": 1
}
```

---

## ✅ Funcionalidades Implementadas

### 1. **Verificação de Estabelecimento**
- ✅ Verifica se usuário tem estabelecimento cadastrado
- ✅ Busca ID do estabelecimento no localStorage
- ✅ Redireciona para cadastro se não tiver

### 2. **Formulário de Produto**
- ✅ **Nome** (obrigatório)
- ✅ **Descrição** (obrigatório)
- ✅ **Preço Normal** (obrigatório)
- ✅ **Preço Promocional** (opcional)
- ✅ **Data de Validade** (opcional)
- ✅ **Categoria** (ID fixo: 1 por enquanto)

### 3. **Validações**
- ✅ Campos obrigatórios
- ✅ Preço deve ser maior que zero
- ✅ Preço promocional deve ser menor que preço normal
- ✅ Validação de números

### 4. **Integração com API**
- ✅ Envia dados no formato correto
- ✅ Vincula produto ao estabelecimento
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Logs detalhados no console
- ✅ Limpa formulário após sucesso

### 5. **Feedback Visual**
- ✅ Loading durante o cadastro
- ✅ Mensagens de sucesso/erro
- ✅ Mostra ID do produto cadastrado
- ✅ Limpa formulário automaticamente

---

## 🎯 Fluxo Completo

```
1. Usuário jurídico faz login
   ↓
2. Cadastra estabelecimento (se não tiver)
   ↓
3. Acessa "Cadastrar Produto"
   ↓
4. Sistema verifica se tem estabelecimento
   ↓
5a. SE NÃO TEM:
    - Redireciona para cadastro de estabelecimento
   ↓
5b. SE TEM:
    - Mostra formulário de produto
    - Preenche nome, descrição, preços
    - Opcionalmente adiciona promoção
    - Envia para API
   ↓
6. API cadastra produto vinculado ao estabelecimento
   ↓
7. Sistema mostra sucesso com ID do produto
   ↓
8. Formulário é limpo automaticamente
```

---

## 📋 Campos do Formulário

### Obrigatórios:
- **Nome do Produto** - Ex: "Arroz 5kg"
- **Descrição** - Ex: "Arroz branco tipo 1"
- **Preço Normal** - Ex: 25.90

### Opcionais:
- **Preço Promocional** - Ex: 19.90
- **Data de Validade** - Ex: 2025-10-31
- **Imagem** - Upload de foto (futuro)

### Automáticos:
- **ID Categoria** - Fixo em 1 por enquanto
- **ID Estabelecimento** - Pego do localStorage
- **Data Início** - Data atual
- **Data Fim** - 30 dias se não especificado

---

## 🔍 Como Verificar se Criou

### 1. **Console do Navegador (F12)**
Após cadastrar, você verá:
```
📦 Payload do produto: {nome, descricao, preco, ...}
✅ Resposta do cadastro: {status: true, id: 1}
✅ ID do produto cadastrado: 1
```

### 2. **Mensagem na Tela**
```
✅ Produto cadastrado com sucesso! ID: 1
```

### 3. **Network Tab**
Verifique a requisição:
- **URL:** `http://localhost:8080/v1/infohub/produtos`
- **Method:** POST
- **Status:** 201 Created
- **Response:** `{status: true, id: 1, message: "..."}`

### 4. **Banco de Dados**
```sql
SELECT * FROM produtos WHERE id = 1;

-- Resultado esperado:
-- id | nome | descricao | preco | id_estabelecimento | id_categoria
-- 1  | ... | ...       | 25.90 | 1                  | 1
```

---

## 📊 Exemplo de Payload

### Produto SEM Promoção:
```json
{
  "nome": "Arroz 5kg",
  "descricao": "Arroz branco tipo 1",
  "id_categoria": 1,
  "id_estabelecimento": 1,
  "preco": 25.90
}
```

### Produto COM Promoção:
```json
{
  "nome": "Arroz 5kg",
  "descricao": "Arroz branco tipo 1",
  "id_categoria": 1,
  "id_estabelecimento": 1,
  "preco": 25.90,
  "promocao": {
    "preco_promocional": 19.90,
    "data_inicio": "2025-10-10",
    "data_fim": "2025-10-31"
  }
}
```

---

## 🚨 Regras de Negócio

### ✅ Permitido
- Cadastrar múltiplos produtos por estabelecimento
- Produtos com ou sem promoção
- Preço promocional menor que preço normal
- Data de validade futura

### ❌ Não Permitido
- Cadastrar produto sem estabelecimento
- Preço zero ou negativo
- Preço promocional maior que preço normal
- Campos obrigatórios vazios

---

## 📁 Arquivos Modificados

### 1. **`src/services/types.ts`**
```typescript
export interface produtoPromocao {
  preco_promocional: number;
  data_inicio: string;
  data_fim: string;
}

export interface produtoRequest {
  nome: string;
  descricao: string;
  id_categoria: number;
  id_estabelecimento: number;
  preco: number;
  promocao?: produtoPromocao;
}

export interface produtoResponse {
  status: boolean;
  status_code: number;
  message: string;
  id?: number;
}
```

### 2. **`src/services/apiServicesFixed.ts`**
```typescript
export async function cadastrarProduto(payload: produtoRequest): Promise<produtoResponse> {
    try {
        console.log('📦 Enviando dados do produto:', payload)
        const { data } = await api.post<produtoResponse>("/produtos", payload)
        console.log('✅ Produto cadastrado com sucesso:', data)
        return data
    } catch (error: any) {
        console.error('❌ Erro ao cadastrar produto:', error.response?.data || error.message)
        throw error
    }
}
```

### 3. **`src/pages/empresa/CadastroPromocao.tsx`**
- Busca estabelecimento do localStorage
- Monta payload correto
- Envia para API
- Trata erros
- Mostra feedback

---

## 🧪 Como Testar

### Passo 1: Ter Estabelecimento
```
1. Faça login como usuário jurídico
2. Cadastre um estabelecimento (se não tiver)
3. Verifique que o ID está no localStorage
```

### Passo 2: Acessar Cadastro de Produto
```
1. No menu, clique em "Cadastrar Produto"
2. Ou acesse: /empresa/cadastro-promocao
```

### Passo 3: Preencher Formulário
```
Nome: Arroz 5kg
Descrição: Arroz branco tipo 1
Preço Normal: 25.90
Preço Promocional: 19.90 (opcional)
Data Validade: 2025-10-31 (opcional)
```

### Passo 4: Cadastrar
```
1. Clique em "Cadastrar Produto"
2. Veja loading
3. Veja mensagem de sucesso
4. Formulário limpa automaticamente
```

### Passo 5: Verificar Console
```
Abra F12 e veja os logs:
📦 Payload do produto: {...}
✅ Resposta do cadastro: {status: true, id: 1}
✅ ID do produto cadastrado: 1
```

---

## 🐛 Troubleshooting

### Erro: "Redireciona para cadastro de estabelecimento"
**Causa:** Não tem estabelecimento cadastrado  
**Solução:** Cadastre um estabelecimento primeiro

### Erro: "Dados inválidos"
**Causa:** Campos obrigatórios vazios ou preços inválidos  
**Solução:** Preencha todos os campos obrigatórios

### Erro: "Preço promocional deve ser menor"
**Causa:** Preço promocional >= preço normal  
**Solução:** Coloque preço promocional menor

### Erro: "Sessão expirada"
**Causa:** Token expirado  
**Solução:** Faça login novamente

---

## 💡 Melhorias Futuras

### 1. **Categorias Dinâmicas**
- Buscar categorias da API
- Dropdown para selecionar categoria
- Criar novas categorias

### 2. **Upload de Imagem**
- Permitir upload de foto do produto
- Preview da imagem
- Compressão automática

### 3. **Validações Avançadas**
- Validar formato de data
- Validar tamanho da descrição
- Sugestões de preço

### 4. **Lista de Produtos**
- Ver produtos cadastrados
- Editar produtos
- Excluir produtos
- Filtros e busca

---

## ✅ Resumo

**Integração:** 100% Funcional ✅  
**Endpoint:** POST /produtos ✅  
**Validações:** Completas ✅  
**Feedback:** Visual e logs ✅  
**Tratamento de Erros:** Implementado ✅  

**Status:** Pronto para uso! 🚀

Agora você pode:
- Cadastrar produtos vinculados ao estabelecimento
- Adicionar promoções opcionais
- Ver feedback em tempo real
- Gerenciar seu catálogo de produtos

🎉 Sistema de produtos totalmente integrado!
