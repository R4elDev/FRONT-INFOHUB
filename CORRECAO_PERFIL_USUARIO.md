# 🔧 Correção - Atualização de Perfil do Usuário

## ❌ Problema Encontrado

```
400 (Bad Request)
Existem campos obrigatórios que não foram preenchidos ou ultrapassaram a quantidade de caracteres. 
A requisição não pode ser realizada !!!
```

### Causa
O backend estava recebendo um payload **incompleto**. Quando o usuário tentava atualizar apenas o nome ou email, os outros campos obrigatórios (como CPF, telefone, data_nascimento) não estavam sendo enviados, causando erro 400.

---

## ✅ Solução Aplicada

Modificamos a lógica para **sempre enviar todos os campos** que o usuário possui, mesmo que não tenham sido alterados no formulário.

### Antes (❌ Problema):
```typescript
const payload: atualizarUsuarioRequest = {
  nome: nome.trim(),
  email: email.trim(),
}

// Só adiciona CPF se o usuário digitou algo
if (cpf && cpf.trim()) {
  payload.cpf = cpf.trim().replace(/\D/g, '')
}

// Só adiciona telefone se o usuário digitou algo
if (telefone.trim()) payload.telefone = telefone.trim()
```

**Problema:** Se o usuário só alterou o nome, o CPF e telefone não eram enviados, causando erro 400.

### Depois (✅ Correto):
```typescript
// Busca dados atuais do usuário
const dadosAtuais = obterDadosUsuario()

const payload: atualizarUsuarioRequest = {
  nome: nome.trim(),
  email: email.trim(),
}

// CPF: usa o valor do formulário OU o valor atual do usuário
const cpfParaEnviar = cpf && cpf.trim() ? cpf.trim() : dadosAtuais?.cpf
if (cpfParaEnviar) {
  payload.cpf = cpfParaEnviar.replace(/\D/g, '')
}

// Telefone: usa o valor do formulário OU o valor atual
const telefoneParaEnviar = telefone.trim() || dadosAtuais?.telefone
if (telefoneParaEnviar) {
  payload.telefone = telefoneParaEnviar
}

// Data de nascimento: usa o valor do formulário OU o valor atual
const dataParaEnviar = dataNascimento || dadosAtuais?.data_nascimento
if (dataParaEnviar) {
  payload.data_nascimento = dataParaEnviar
}
```

**Solução:** Agora sempre enviamos os dados completos do usuário, mesmo que ele só tenha alterado um campo.

---

## 📝 Arquivo Corrigido

### `PerfilUsuario.tsx`
- ✅ Busca dados atuais do localStorage antes de montar o payload
- ✅ Usa valores do formulário OU valores atuais do usuário
- ✅ Garante que todos os campos obrigatórios sejam enviados
- ✅ Mantém dados existentes mesmo quando não alterados

---

## 🎯 Como Funciona Agora

### Cenário 1: Usuário altera apenas o nome
```
Formulário:
- Nome: "João Silva Atualizado" ✏️ (alterado)
- Email: "joao@email.com" (não alterado)
- CPF: "123.456.789-00" (não alterado)
- Telefone: "(11) 98765-4321" (não alterado)

Payload enviado:
{
  nome: "João Silva Atualizado",
  email: "joao@email.com",
  cpf: "12345678900",        // ✅ Enviado do localStorage
  telefone: "(11) 98765-4321", // ✅ Enviado do localStorage
  data_nascimento: "1990-01-01" // ✅ Enviado do localStorage
}
```

### Cenário 2: Usuário altera nome e telefone
```
Formulário:
- Nome: "João Silva Atualizado" ✏️ (alterado)
- Email: "joao@email.com" (não alterado)
- CPF: "123.456.789-00" (não alterado)
- Telefone: "(11) 99999-9999" ✏️ (alterado)

Payload enviado:
{
  nome: "João Silva Atualizado",
  email: "joao@email.com",
  cpf: "12345678900",        // ✅ Enviado do localStorage
  telefone: "(11) 99999-9999", // ✅ Novo valor do formulário
  data_nascimento: "1990-01-01" // ✅ Enviado do localStorage
}
```

---

## 🧪 Como Testar

```bash
1. Faça login como usuário consumidor
2. Vá para /perfil
3. Altere APENAS o nome
4. Clique em "Salvar Alterações"
5. ✅ Deve salvar com sucesso!

6. Altere APENAS o telefone
7. Clique em "Salvar Alterações"
8. ✅ Deve salvar com sucesso!

9. Altere nome, email e telefone
10. Clique em "Salvar Alterações"
11. ✅ Deve salvar com sucesso!
```

---

## 💡 Por que isso aconteceu?

O backend espera receber **todos os campos obrigatórios** em cada requisição de atualização, mesmo que não tenham sido alterados. Isso é uma característica comum em APIs REST que usam o método PUT (substituição completa do recurso).

### Alternativas de Design de API:

**PUT (atual):** Substitui o recurso completo
```
PUT /usuario/3
Body: { nome, email, cpf, telefone, data_nascimento }
```

**PATCH (alternativa):** Atualiza apenas campos específicos
```
PATCH /usuario/3
Body: { nome: "Novo Nome" }  // Só envia o que mudou
```

---

## ✅ Status

**PROBLEMA RESOLVIDO!** 🎉

Agora você pode atualizar qualquer campo do perfil sem erros 400.

---

**Data:** 06/11/2025 - 01:07
**Tipo:** Bug Fix - API Request Payload
**Arquivo:** `PerfilUsuario.tsx`
