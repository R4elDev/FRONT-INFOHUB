# 🔧 Alterações Necessárias no Backend - Controller de Produto

## 📋 Arquivo: `produto.js` (Controller)

---

## ❌ CÓDIGO ATUAL (Com Erro)

```javascript
const createProduto = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.nome == '' || dadosBody.nome == undefined || 
            dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||  // ← REMOVER ESTA LINHA
            dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
            dadosBody.preco == '' || dadosBody.preco == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let novoProduto = await produtoDAO.insertProduto(dadosBody);

            if (novoProduto) {
                status = true;
                status_code = 201;
                mensagem.message = message.SUCCESS_CREATED_ITEM;
                mensagem.id = novoProduto;
            } else {
                status_code = 500;
                mensagem.message = message.ERROR_INTERNAL_SERVER;
            }
        }
    } else {
        status_code = 415;
        mensagem.message = message.ERROR_INCORRECT_CONTENT_TYPE;
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message,
        id: mensagem.id
    };
}
```

---

## ✅ CÓDIGO CORRIGIDO (Sem id_categoria obrigatório)

```javascript
const createProduto = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        // Validação apenas dos campos REALMENTE obrigatórios
        if (
            dadosBody.nome == '' || dadosBody.nome == undefined || 
            dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
            dadosBody.preco == '' || dadosBody.preco == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let novoProduto = await produtoDAO.insertProduto(dadosBody);

            if (novoProduto) {
                status = true;
                status_code = 201;
                mensagem.message = message.SUCCESS_CREATED_ITEM;
                mensagem.id = novoProduto;
            } else {
                status_code = 500;
                mensagem.message = message.ERROR_INTERNAL_SERVER;
            }
        }
    } else {
        status_code = 415;
        mensagem.message = message.ERROR_INCORRECT_CONTENT_TYPE;
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message,
        id: mensagem.id
    };
}
```

---

## 🔧 O QUE MUDAR:

### **Linha 18 - REMOVER:**
```javascript
dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||  // ← DELETAR ESTA LINHA INTEIRA
```

### **Resultado:**
```javascript
// ANTES (4 validações):
if (
    dadosBody.nome == '' || dadosBody.nome == undefined || 
    dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||  // ← REMOVER
    dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
    dadosBody.preco == '' || dadosBody.preco == undefined
)

// DEPOIS (3 validações):
if (
    dadosBody.nome == '' || dadosBody.nome == undefined || 
    dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
    dadosBody.preco == '' || dadosBody.preco == undefined
)
```

---

## 📦 Payload que o Frontend Está Enviando:

```json
{
  "nome": "Arroz Integral 1Kg",
  "descricao": "pacote de arroz integral em promocao",
  "id_estabelecimento": 1,
  "preco": 39.99,
  "foto": "https://via.placeholder.com/300x300.png?text=Produto",
  "estoque": 100,
  "unidade": "un",
  "ativo": true,
  "promocao": {
    "preco_promocional": 27.99,
    "data_inicio": "2025-10-10",
    "data_fim": "2025-10-20"
  }
}
```

**Observe:** NÃO tem `id_categoria`!

---

## ⚠️ TAMBÉM CORRIGIR NO `updateProduto`:

```javascript
const updateProduto = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.id_produto == '' || dadosBody.id_produto == undefined ||
            dadosBody.nome == '' || dadosBody.nome == undefined || 
            dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||  // ← REMOVER ESTA LINHA
            dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
            dadosBody.preco == '' || dadosBody.preco == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let resultado = await produtoDAO.updateProduto(dadosBody);

            if (resultado) {
                status = true;
                status_code = 200;
                mensagem.message = message.SUCCESS_UPDATED_ITEM;
            } else {
                status_code = 500;
                mensagem.message = message.ERROR_INTERNAL_SERVER;
            }
        }
    } else {
        status_code = 415;
        mensagem.message = message.ERROR_INCORRECT_CONTENT_TYPE;
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message
    };
}
```

**Remover a linha 54:**
```javascript
dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||  // ← DELETAR
```

---

## 📋 Resumo das Alterações:

### **Arquivo:** `controller/produto.js`

### **Função:** `createProduto`
- **Linha 18:** Remover validação de `id_categoria`

### **Função:** `updateProduto`
- **Linha 54:** Remover validação de `id_categoria`

---

## ✅ Campos Obrigatórios (Após Correção):

### Para `createProduto`:
1. ✅ `nome`
2. ✅ `id_estabelecimento`
3. ✅ `preco`

### Para `updateProduto`:
1. ✅ `id_produto`
2. ✅ `nome`
3. ✅ `id_estabelecimento`
4. ✅ `preco`

---

## 🎯 Campos Opcionais (Frontend pode enviar ou não):

- `descricao`
- `id_categoria` (se quiser adicionar depois)
- `foto`
- `estoque`
- `unidade`
- `ativo`
- `promocao` (objeto com preco_promocional, data_inicio, data_fim)

---

## 🧪 Teste Após Correção:

1. **Faça as alterações no backend**
2. **Reinicie o servidor backend**
3. **No frontend, tente cadastrar um produto**
4. **Deve retornar:**
   ```json
   {
     "status": true,
     "status_code": 201,
     "message": "Produto criado com sucesso",
     "id": 1
   }
   ```

---

## 💡 Alternativa (Se não puder remover id_categoria):

Se por algum motivo você PRECISA manter `id_categoria` no backend, então:

**No Frontend, adicione:**
```typescript
const produtoData = {
  nome: formData.name.trim(),
  descricao: formData.description.trim(),
  id_categoria: 1,  // ← Adicionar com valor fixo
  id_estabelecimento: estabelecimento.id,
  preco: preco,
  ...
}
```

**E crie a categoria no banco:**
```sql
INSERT INTO categorias (id, nome, descricao) 
VALUES (1, 'Geral', 'Categoria padrão para produtos');
```

---

## 📝 Checklist:

- [ ] Abrir arquivo `controller/produto.js`
- [ ] Localizar função `createProduto` (linha ~15)
- [ ] Remover linha de validação de `id_categoria` (linha ~18)
- [ ] Localizar função `updateProduto` (linha ~45)
- [ ] Remover linha de validação de `id_categoria` (linha ~54)
- [ ] Salvar arquivo
- [ ] Reiniciar servidor backend
- [ ] Testar cadastro de produto no frontend

---

## ✅ Resultado Esperado:

**Antes:** Erro 400 - "Campos obrigatórios não preenchidos"  
**Depois:** Sucesso 201 - "Produto criado com sucesso"

---

**Envie este arquivo para o desenvolvedor do backend fazer as alterações!** 📤
