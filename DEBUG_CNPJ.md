# 🔍 Debug: CNPJ não aparece automaticamente

## 🐛 Problema

O CNPJ aparece como `00.000.000/0000-00` ou não é preenchido automaticamente.

---

## 🔧 Solução Implementada

### 1. **Logs de Debug Adicionados**

Agora o sistema mostra logs detalhados no console:

```javascript
// Ao fazer login
📥 Dados do usuário recebidos da API: {...}
✅ Dados salvos no contexto: {...}

// Ao abrir cadastro de estabelecimento
🔍 Verificando dados do usuário: {...}
✅ CNPJ do usuário pré-preenchido: 12.345.678/0001-90
// OU
⚠️ CNPJ não encontrado ou inválido no contexto do usuário
```

### 2. **Campo Adaptativo**

- ✅ **Se API retornar CNPJ:** Campo bloqueado e pré-preenchido
- ✅ **Se API NÃO retornar CNPJ:** Campo editável para digitar manualmente

---

## 🧪 Como Verificar o Problema

### Passo 1: Abrir Console (F12)

```
1. Pressione F12 no navegador
2. Vá para a aba "Console"
3. Faça login novamente
```

### Passo 2: Verificar Logs do Login

Procure por:
```
📥 Dados do usuário recebidos da API: {
  id: 1,
  nome: "...",
  email: "...",
  perfil: "estabelecimento",
  cnpj: "12345678000190"  ← DEVE APARECER AQUI
}
```

**Se o CNPJ não aparecer aqui, o problema é no BACKEND!**

### Passo 3: Verificar localStorage

```javascript
// No console, digite:
JSON.parse(localStorage.getItem('user_data'))

// Deve retornar:
{
  id: 1,
  nome: "...",
  email: "...",
  perfil: "estabelecimento",
  cnpj: "12345678000190"  ← DEVE ESTAR AQUI
}
```

### Passo 4: Acessar Cadastro de Estabelecimento

Veja os logs:
```
🔍 Verificando dados do usuário: {...}
```

**Verifique se o CNPJ está presente nos dados.**

---

## 🎯 Cenários Possíveis

### ✅ Cenário 1: API Retorna CNPJ

```
Login → API retorna CNPJ → Campo bloqueado e preenchido
```

**Console:**
```
📥 Dados do usuário recebidos da API: {cnpj: "12345678000190"}
✅ Dados salvos no contexto: {cnpj: "12345678000190"}
✅ CNPJ do usuário pré-preenchido: 12.345.678/0001-90
```

**Tela:**
- Campo CNPJ cinza (bloqueado)
- Valor: `12.345.678/0001-90`
- Mensagem: "ℹ️ CNPJ vinculado ao seu cadastro"

---

### ⚠️ Cenário 2: API NÃO Retorna CNPJ

```
Login → API NÃO retorna CNPJ → Campo editável
```

**Console:**
```
📥 Dados do usuário recebidos da API: {cnpj: undefined}
⚠️ CNPJ não encontrado ou inválido no contexto do usuário
```

**Tela:**
- Campo CNPJ branco (editável)
- Placeholder: `00.000.000/0000-00`
- Pode digitar manualmente

**Solução:** Digite o CNPJ manualmente

---

## 🔧 Soluções por Cenário

### Se API não retorna CNPJ:

#### Opção 1: Corrigir Backend
```
O endpoint de login deve retornar:
{
  "usuario": {
    "id": 1,
    "nome": "...",
    "email": "...",
    "perfil": "estabelecimento",
    "cnpj": "12345678000190"  ← ADICIONAR ISSO
  }
}
```

#### Opção 2: Usar Campo Manual (Atual)
```
- Sistema detecta que não tem CNPJ
- Mostra campo editável
- Usuário digita manualmente
- Funciona normalmente
```

---

## 📋 Checklist de Verificação

### ✅ Frontend (Já Implementado)

- [x] Logs de debug no login
- [x] Logs de debug no cadastro de estabelecimento
- [x] Campo adaptativo (bloqueado ou editável)
- [x] Validação de CNPJ com 14 dígitos
- [x] Formatação automática

### ⚠️ Backend (Verificar)

- [ ] API de login retorna campo `cnpj`
- [ ] CNPJ está salvo no banco de dados
- [ ] CNPJ é retornado na resposta do login

---

## 🧪 Teste Completo

### 1. Limpar Dados
```javascript
// No console:
localStorage.clear()
// Recarregue a página
```

### 2. Fazer Novo Cadastro
```
1. Cadastre novo usuário jurídico
2. Use CNPJ: 12.345.678/0001-90
3. Complete o cadastro
```

### 3. Fazer Login
```
1. Faça login com as credenciais
2. Abra console (F12)
3. Veja os logs
```

### 4. Verificar Dados
```javascript
// No console:
console.log(JSON.parse(localStorage.getItem('user_data')))
```

### 5. Acessar Cadastro de Estabelecimento
```
1. Vá para "Cadastrar Estabelecimento"
2. Veja se CNPJ aparece
3. Verifique os logs no console
```

---

## 💡 Comportamento Atual (Inteligente)

O sistema agora é **adaptativo**:

### Se Backend Retorna CNPJ:
```
✅ Campo bloqueado
✅ CNPJ pré-preenchido
✅ Não pode editar
✅ Mensagem informativa
```

### Se Backend NÃO Retorna CNPJ:
```
✅ Campo editável
✅ Pode digitar manualmente
✅ Validação funciona
✅ Formatação automática
```

**Ambos os casos funcionam!** 🎉

---

## 🚨 Mensagens de Erro Comuns

### "CNPJ é obrigatório"
**Causa:** Campo vazio ao tentar cadastrar  
**Solução:** Digite o CNPJ manualmente

### "CNPJ inválido"
**Causa:** CNPJ com dígitos verificadores incorretos  
**Solução:** Use um CNPJ válido

### Campo mostra "00.000.000/0000-00"
**Causa:** API retornou CNPJ como "00000000000000"  
**Solução:** Backend precisa retornar CNPJ real do usuário

---

## 📞 Próximos Passos

### Para Resolver Definitivamente:

1. **Verificar Backend:**
   ```
   - Endpoint de login deve retornar CNPJ
   - Verificar se CNPJ está no banco
   - Adicionar CNPJ na resposta
   ```

2. **Enquanto isso:**
   ```
   - Sistema funciona com digitação manual
   - Validação está ativa
   - Formatação automática funciona
   ```

---

## ✅ Resumo

**Problema:** API não retorna CNPJ  
**Solução Implementada:** Campo adaptativo  
**Status:** ✅ Funcional (com ou sem CNPJ da API)  

**Como usar agora:**
1. Faça login
2. Veja os logs no console
3. Se CNPJ não aparecer → Digite manualmente
4. Se CNPJ aparecer → Campo bloqueado automaticamente

O sistema está preparado para ambos os casos! 🚀
