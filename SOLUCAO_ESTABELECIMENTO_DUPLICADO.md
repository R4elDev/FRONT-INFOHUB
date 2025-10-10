# 🔧 Solução: Erro ao Cadastrar Estabelecimento (CNPJ Duplicado)

## ❌ Problema

Erro 500 ao tentar cadastrar estabelecimento:
```
POST http://localhost:8080/v1/infohub/estabelecimento 500 (Internal Server Error)
```

**Causa:** O CNPJ já possui um estabelecimento cadastrado no backend.

---

## ✅ Solução Implementada

### 1. **Mensagem de Erro Melhorada**

Agora quando tentar cadastrar com CNPJ duplicado, aparece:
```
❌ Este CNPJ já possui um estabelecimento cadastrado. 
   Cada CNPJ pode ter apenas um estabelecimento.
```

### 2. **Como Resolver**

Se você já tem estabelecimento cadastrado no backend, precisa sincronizar com o frontend:

#### Opção A: Limpar e Recadastrar (NÃO RECOMENDADO)
```
⚠️ Isso apagaria o estabelecimento do backend
```

#### Opção B: Sincronizar Dados (RECOMENDADO)
```javascript
// No console do navegador (F12):

// 1. Salvar ID do estabelecimento (substitua 1 pelo ID real)
localStorage.setItem('estabelecimentoId', '1')

// 2. Salvar nome do estabelecimento
localStorage.setItem('estabelecimentoNome', 'Supermercado Central')

// 3. Recarregar a página
location.reload()
```

---

## 🔍 Como Descobrir o ID do Estabelecimento

### Método 1: Verificar no Backend
```
Se você tem acesso ao banco de dados:
SELECT * FROM estabelecimentos WHERE cnpj = 'seu_cnpj';
```

### Método 2: Criar Endpoint de Listagem
```
Precisaria de um endpoint:
GET /estabelecimento/usuario
Que retorna o estabelecimento do usuário logado
```

---

## 🎯 Fluxo Correto

### Se NÃO tem estabelecimento:
```
1. Preenche formulário
2. Clica em "Cadastrar"
3. Sistema salva no backend
4. Sistema salva ID no localStorage
5. Mostra tela de sucesso
```

### Se JÁ tem estabelecimento:
```
1. Sistema verifica localStorage
2. Se tem ID salvo → Mostra tela de "já cadastrado"
3. Se não tem ID → Mostra formulário
4. Ao tentar cadastrar → Backend retorna erro 500
5. Sistema mostra mensagem clara
```

---

## 💡 Solução Temporária (Agora)

**Para sincronizar seu estabelecimento existente:**

1. **Abra o Console (F12)**

2. **Execute os comandos:**
```javascript
// Substitua os valores pelos seus dados reais
localStorage.setItem('estabelecimentoId', '1')  // ID do seu estabelecimento
localStorage.setItem('estabelecimentoNome', 'Supermercado Central')  // Nome do seu estabelecimento

// Recarrega a página
location.reload()
```

3. **Acesse a página:**
```
/empresa/meu-estabelecimento
```

4. **Deve aparecer:**
```
✓ Estabelecimento Cadastrado
Supermercado Central
[Cadastrar Produtos]
```

---

## 🚀 Solução Definitiva (Futuro)

### Criar Endpoint de Busca

O backend deveria ter um endpoint:
```
GET /estabelecimento/usuario
Authorization: Bearer {token}

Response:
{
  "status": true,
  "data": {
    "id": 1,
    "nome": "Supermercado Central",
    "cnpj": "12345678000190",
    "telefone": "11999999999",
    "id_usuario": 5
  }
}
```

Com esse endpoint, o frontend poderia:
1. Verificar se usuário já tem estabelecimento
2. Sincronizar automaticamente
3. Evitar duplicação

---

## 📋 Checklist de Verificação

### ✅ Verificar se tem estabelecimento:

**No Backend:**
```sql
SELECT * FROM estabelecimentos WHERE id_usuario = {seu_id_usuario};
```

**No Frontend:**
```javascript
// Console do navegador
localStorage.getItem('estabelecimentoId')
localStorage.getItem('estabelecimentoNome')
```

### ✅ Se retornar dados:
- Backend tem estabelecimento ✓
- Frontend precisa sincronizar

### ✅ Se não retornar:
- Pode cadastrar normalmente

---

## 🔧 Comandos Úteis

### Limpar localStorage (se precisar recomeçar):
```javascript
localStorage.removeItem('estabelecimentoId')
localStorage.removeItem('estabelecimentoNome')
location.reload()
```

### Ver todos os dados salvos:
```javascript
console.log('ID:', localStorage.getItem('estabelecimentoId'))
console.log('Nome:', localStorage.getItem('estabelecimentoNome'))
console.log('User:', localStorage.getItem('user_data'))
```

### Sincronizar estabelecimento existente:
```javascript
// Substitua pelos valores reais do seu estabelecimento
localStorage.setItem('estabelecimentoId', '1')
localStorage.setItem('estabelecimentoNome', 'Supermercado Central')
location.reload()
```

---

## 🎯 Próximos Passos

1. **Agora:** Use a solução temporária acima para sincronizar
2. **Depois:** Solicite ao backend o endpoint de listagem
3. **Futuro:** Sistema sincroniza automaticamente

---

## ✅ Resumo

**Problema:** CNPJ já cadastrado no backend  
**Causa:** Backend não permite duplicação (correto!)  
**Solução Imediata:** Sincronizar localStorage manualmente  
**Solução Definitiva:** Endpoint de busca de estabelecimento  

O sistema está funcionando corretamente ao bloquear duplicação! 🔒
