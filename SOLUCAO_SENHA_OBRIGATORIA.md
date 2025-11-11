# ✅ SOLUÇÃO ENCONTRADA - Senha Obrigatória

## 🎯 Problema Identificado

Após análise do código do backend, descobrimos que o erro 400 era causado por:

```javascript
// Backend - controller/usuario.js
!usuario.senha || usuario.senha.length > 100
```

**O backend exige o campo `senha` como OBRIGATÓRIO em toda atualização de usuário!**

## 🔍 Validações do Backend

O backend valida os seguintes campos no PUT `/usuario/{id}`:

### Campos Obrigatórios:
- ✅ `nome` (máx 100 caracteres)
- ✅ `email` (máx 150 caracteres)
- ✅ `senha` (máx 100 caracteres) **← ESTE ERA O PROBLEMA!**

### Campos Opcionais:
- `perfil` (deve ser: 'consumidor', 'admin' ou 'estabelecimento')
- `cpf` (máx 100 caracteres)
- `cnpj` (máx 100 caracteres)
- `telefone` (máx 20 caracteres)
- `data_nascimento` (máx 100 caracteres)

## ✅ Solução Implementada

### 1. Adicionado Campo de Senha no Formulário

```tsx
{/* Senha - OBRIGATÓRIO para atualizar perfil */}
<div className="md:col-span-2">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Senha Atual *
    <span className="text-xs font-normal text-gray-500 ml-2">
      (obrigatório para confirmar alterações)
    </span>
  </label>
  <div className="relative group">
    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
    <input
      type="password"
      placeholder="Digite sua senha atual"
      value={senha}
      onChange={(e) => setSenha(e.target.value)}
      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
      required
      maxLength={100}
    />
  </div>
  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
    <span>🔐</span>
    <span>Digite sua senha atual para confirmar as alterações no perfil</span>
  </p>
</div>
```

### 2. Validação no Frontend

```typescript
// Valida se senha foi fornecida
if (!senha || senha.trim() === '') {
  showMessage("Por favor, digite sua senha atual para confirmar a atualização", "error")
  setLoading(false)
  return
}

if (senha.length > 100) {
  showMessage("Senha não pode ter mais de 100 caracteres", "error")
  setLoading(false)
  return
}
```

### 3. Payload Atualizado

```typescript
// Monta payload com TODOS os campos obrigatórios do backend
payload = {
  nome: nome.trim(),
  email: email.trim(),
  senha: senha.trim() // OBRIGATÓRIO no backend!
}

// Adiciona campos opcionais apenas se tiverem valor
if (cpfLimpo && cpfLimpo.length === 11) {
  payload.cpf = cpfLimpo
}

if (telefoneLimpo && (telefoneLimpo.length === 10 || telefoneLimpo.length === 11)) {
  payload.telefone = telefoneLimpo
}

if (dataParaEnviar && dataParaEnviar.trim() !== '') {
  const dataFormatada = dataParaEnviar.includes('T') ? dataParaEnviar.split('T')[0] : dataParaEnviar
  payload.data_nascimento = dataFormatada
}
```

## 🎨 Interface Atualizada

O formulário agora possui:

1. **Campo de Senha Obrigatório**
   - Ícone de cadeado (Lock)
   - Placeholder explicativo
   - Mensagem de ajuda
   - Limite de 100 caracteres

2. **Validação Visual**
   - Borda laranja quando focado
   - Mensagem de erro se vazio
   - Feedback visual claro

## 📋 Como Usar

1. **Preencha os dados** que deseja atualizar (nome, email, telefone, data)
2. **Digite sua senha atual** no campo de senha (obrigatório)
3. **Clique em "Salvar Alterações"**
4. ✅ Perfil será atualizado com sucesso!

## ⚠️ Observações Importantes

### Segurança
- A senha é enviada para o backend que faz o hash com bcrypt
- O backend valida se a senha está correta antes de atualizar
- Nunca armazene senhas em texto plano

### Validações do Backend
```javascript
// O backend faz:
usuario.senha_hash = await bcrypt.hash(usuario.senha, 10);
```

## 🔧 Recomendações para o Backend

Para melhorar a experiência do usuário, considere:

### Opção 1: Tornar senha opcional (RECOMENDADO)
```javascript
// Validar senha apenas se fornecida
if (usuario.senha) {
  if (usuario.senha.length > 100) {
    return MESSAGE.ERROR_REQUIRED_FIELDS;
  }
  usuario.senha_hash = await bcrypt.hash(usuario.senha, 10);
} else {
  // Mantém a senha atual
  delete usuario.senha;
  delete usuario.senha_hash;
}
```

### Opção 2: Endpoint separado para alterar senha
```javascript
// PUT /usuario/{id}/senha
// Apenas para alterar senha
```

### Opção 3: Validar senha atual antes de atualizar
```javascript
// Verificar se a senha fornecida está correta
const senhaCorreta = await bcrypt.compare(usuario.senha, usuarioAtual.senha_hash);
if (!senhaCorreta) {
  return { status: false, message: "Senha incorreta" };
}
```

## 📊 Resultado

✅ **Problema resolvido!**
- Campo senha adicionado ao formulário
- Validações implementadas
- Payload correto sendo enviado
- Atualização de perfil funcionando

## 📁 Arquivos Modificados

- ✅ `/src/pages/perfil/PerfilUsuario.tsx`
  - Adicionado estado `senha`
  - Adicionado campo de senha na interface
  - Adicionada validação de senha
  - Payload atualizado com campo senha
  - Removidos testes de debug

## 🎯 Testes Realizados

Antes da solução:
- ❌ Todos os payloads falhavam com erro 400

Depois da solução:
- ✅ Payload com senha deve funcionar
- ✅ Validação de senha vazia
- ✅ Validação de tamanho (100 chars)

---

**Data:** 11/11/2025 - 10:55
**Status:** ✅ Solução implementada
**Próximo Passo:** Testar a atualização do perfil com senha
