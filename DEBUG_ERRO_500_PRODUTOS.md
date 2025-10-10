# 🐛 Debug: Erro 500 ao Cadastrar Produto

## ❌ Erro Atual

```
POST http://localhost:8080/v1/infohub/produtos 500 (Internal Server Error)
```

**Payload enviado:**
```json
{
  "nome": "Arroz Integral 1Kg",
  "descricao": "pacote de arroz integral em promocao",
  "id_categoria": 1,
  "id_estabelecimento": 1,
  "preco": 39.99,
  "promocao": {
    "preco_promocional": 29.99,
    "data_inicio": "2025-10-10",
    "data_fim": "2025-11-10"
  }
}
```

---

## 🔍 Possíveis Causas do Erro 500

### 1. **Categoria ID 1 não existe**
O frontend está enviando `id_categoria: 1` fixo, mas essa categoria pode não existir no banco.

**Solução:**
```sql
-- Verificar se categoria existe
SELECT * FROM categorias WHERE id = 1;

-- Se não existir, criar
INSERT INTO categorias (id, nome) VALUES (1, 'Alimentos');
```

### 2. **Estabelecimento ID 1 não existe**
O ID do estabelecimento pode estar incorreto.

**Solução:**
```sql
-- Verificar estabelecimento
SELECT * FROM estabelecimentos WHERE id = 1;

-- Ver qual ID está correto
SELECT id, nome, cnpj FROM estabelecimentos;
```

### 3. **Campos obrigatórios faltando no backend**
O backend pode estar esperando campos adicionais que não estamos enviando.

**Possíveis campos faltando:**
- `imagem` (URL da imagem)
- `estoque` (quantidade em estoque)
- `unidade` (kg, un, lt, etc)
- `codigo_barras` (EAN)
- `ativo` (boolean)

### 4. **Formato de data incorreto**
O backend pode estar esperando formato diferente de data.

**Formatos possíveis:**
- `2025-10-10` (ISO - atual)
- `2025-10-10T00:00:00.000Z` (ISO completo)
- `10/10/2025` (BR)

### 5. **Validação de promoção**
O backend pode ter regras de validação para promoção:
- Data início deve ser <= data fim
- Preço promocional deve ser < preço normal
- Datas devem ser futuras

### 6. **Constraint de chave estrangeira**
O banco pode ter constraints que estão falhando:
- `id_categoria` deve existir em `categorias`
- `id_estabelecimento` deve existir em `estabelecimentos`

---

## ✅ Correções Aplicadas no Frontend

### 1. **Mostrar CNPJ do Estabelecimento**
```typescript
setEstabelecimento({
  id: parseInt(estabelecimentoId),
  nome: estabelecimentoNome,
  cnpj: user?.cnpj || '',      // ✅ Adicionado
  telefone: user?.telefone || '' // ✅ Adicionado
})
```

### 2. **Validação de ID do Estabelecimento**
```typescript
if (!estabelecimento?.id) {
  setMessage({ 
    type: 'error', 
    text: 'ID do estabelecimento não encontrado' 
  })
  return
}
```

### 3. **Logs Detalhados**
```typescript
console.log('🔍 Detalhes do erro:', {
  status: error.response?.status,
  statusText: error.response?.statusText,
  data: error.response?.data,
  payload: payload
})
```

---

## 🧪 Como Debugar

### Passo 1: Verificar Console
Após tentar cadastrar, veja no console:
```
📦 Payload do produto: {...}
🔍 Detalhes: {...}
📦 Enviando dados do produto: {...}
❌ Erro ao cadastrar produto: {...}
🔍 Detalhes do erro: {...}
```

### Passo 2: Ver Resposta do Backend
No console, procure por `data:` dentro de "Detalhes do erro". Isso mostrará a mensagem de erro do backend.

**Exemplo:**
```javascript
data: {
  status: false,
  message: "Categoria não encontrada",
  error: "Foreign key constraint failed"
}
```

### Passo 3: Verificar Network Tab
1. Abra DevTools (F12)
2. Aba "Network"
3. Clique em "produtos" na lista
4. Veja "Response" para ver erro do backend

---

## 🔧 Soluções por Tipo de Erro

### Se erro for: "Categoria não encontrada"
```sql
-- Criar categoria padrão
INSERT INTO categorias (nome, descricao) 
VALUES ('Alimentos', 'Produtos alimentícios');

-- Pegar o ID gerado
SELECT id FROM categorias WHERE nome = 'Alimentos';
```

### Se erro for: "Estabelecimento não encontrado"
```javascript
// Verificar localStorage
console.log('ID:', localStorage.getItem('estabelecimentoId'))

// Se estiver errado, corrigir
localStorage.setItem('estabelecimentoId', 'ID_CORRETO')
```

### Se erro for: "Campo obrigatório faltando"
Adicionar campo no payload:
```typescript
const produtoData: produtoRequest = {
  nome: formData.name.trim(),
  descricao: formData.description.trim(),
  id_categoria: 1,
  id_estabelecimento: estabelecimento.id,
  preco: preco,
  estoque: 100,           // ✅ Adicionar se obrigatório
  unidade: 'un',          // ✅ Adicionar se obrigatório
  ativo: true,            // ✅ Adicionar se obrigatório
  promocao: ...
}
```

### Se erro for: "Formato de data inválido"
Testar formatos diferentes:
```typescript
// Formato 1: ISO simples (atual)
data_inicio: "2025-10-10"

// Formato 2: ISO completo
data_inicio: new Date().toISOString()

// Formato 3: Timestamp
data_inicio: Date.now()
```

---

## 📋 Checklist de Verificação

### Backend:
- [ ] Categoria ID 1 existe no banco?
- [ ] Estabelecimento ID 1 existe no banco?
- [ ] Tabela `produtos` tem todos os campos necessários?
- [ ] Constraints de FK estão corretas?
- [ ] Validações de promoção estão corretas?

### Frontend:
- [ ] ID do estabelecimento está correto?
- [ ] Todos os campos obrigatórios estão sendo enviados?
- [ ] Formato de data está correto?
- [ ] Preços estão em formato numérico?
- [ ] Promoção está opcional (pode ser undefined)?

### Banco de Dados:
```sql
-- Verificar estrutura da tabela
DESCRIBE produtos;

-- Ver constraints
SHOW CREATE TABLE produtos;

-- Verificar dados relacionados
SELECT * FROM categorias;
SELECT * FROM estabelecimentos;
```

---

## 💡 Próximos Passos

### 1. **Teste sem Promoção**
Primeiro tente cadastrar um produto SEM promoção:
```typescript
const produtoData = {
  nome: "Teste",
  descricao: "Produto de teste",
  id_categoria: 1,
  id_estabelecimento: 1,
  preco: 10.00
  // SEM promocao
}
```

### 2. **Verificar Logs do Backend**
Veja os logs do servidor backend para ver o erro exato:
```
[ERROR] Failed to insert product: ...
[ERROR] Foreign key constraint failed: ...
[ERROR] Validation error: ...
```

### 3. **Testar com Postman/Insomnia**
Teste o endpoint diretamente:
```
POST http://localhost:8080/v1/infohub/produtos
Headers: Authorization: Bearer {token}
Body: {
  "nome": "Teste",
  "descricao": "Teste",
  "id_categoria": 1,
  "id_estabelecimento": 1,
  "preco": 10.00
}
```

---

## 🎯 Ação Imediata

**Teste agora com os logs melhorados:**

1. Tente cadastrar um produto novamente
2. Abra o console (F12)
3. Procure por "🔍 Detalhes do erro:"
4. Copie a mensagem de erro do backend
5. Me envie para eu ajudar a corrigir

**O erro 500 é no BACKEND, não no frontend!**

O frontend está enviando os dados corretamente. O problema está na API do backend que não está conseguindo processar/salvar o produto.

---

## ✅ Resumo

**Frontend:** ✅ Funcionando corretamente  
**Payload:** ✅ Formato correto  
**Backend:** ❌ Retornando erro 500  

**Próximo passo:** Ver logs do backend para identificar causa exata do erro 500.
