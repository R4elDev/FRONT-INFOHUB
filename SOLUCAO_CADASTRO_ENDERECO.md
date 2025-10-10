# 🔧 Solução: Problema de ID do Usuário no Cadastro de Endereço

## ❌ Problema Identificado

Ao cadastrar um novo usuário (físico ou jurídico), o sistema apresentava o erro:
```
"ID do usuário não retornado pela API"
"Erro: Dados do usuário não encontrados. Por favor, faça o cadastro novamente."
```

### Causa Raiz

A API de cadastro (`POST /usuarios/cadastro`) **não estava retornando o ID do usuário** na resposta, apenas:
```json
{
  "status": true,
  "status_code": 201,
  "message": "Usuário cadastrado com sucesso"
}
```

Mas o sistema precisava do ID para cadastrar o endereço na etapa seguinte.

---

## ✅ Solução Implementada

### 1. **Login Automático Após Cadastro**

Modificamos o arquivo `src/pages/autenticacao/Cadastro.tsx` para:

1. Tentar obter o ID diretamente da resposta do cadastro
2. Se não retornar, fazer **login automático** usando as credenciais recém-cadastradas
3. Obter o ID do usuário através da resposta do login
4. Salvar no `localStorage` para uso no cadastro de endereço

```typescript
// Tenta obter o ID da resposta direta
let userId = res.id || res.data?.id

// Se não retornou o ID, faz login automático para obter
if (!userId) {
  console.log('🔄 ID não retornado, fazendo login automático...')
  try {
    const loginRes = await login({
      email: payload.email,
      senha: payload.senha_hash
    })
    
    if (loginRes.status && loginRes.usuario) {
      userId = loginRes.usuario.id
      console.log('✅ ID obtido via login:', userId)
    }
  } catch (loginErr) {
    console.error('❌ Erro ao fazer login automático:', loginErr)
  }
}

// Salva o ID do usuário no localStorage
if (userId) {
  localStorage.setItem('usuarioCadastrado', JSON.stringify({
    id: userId,
    nome: payload.nome,
    email: payload.email,
    perfil: payload.perfil
  }))
  console.log('✅ ID do usuário salvo no localStorage:', userId)
  setTimeout(() => navigate(ROUTES.CADASTRO_ENDERECO), 1000)
} else {
  console.error('❌ Não foi possível obter o ID do usuário')
  toast.error('Cadastro realizado, mas houve um problema. Por favor, faça login manualmente.')
  setTimeout(() => navigate(ROUTES.LOGIN), 2000)
}
```

### 2. **Logs de Debug Adicionados**

Adicionamos logs detalhados em `src/pages/inicio/CadastroDeEndereco.tsx` para facilitar o debug:

```typescript
console.log('🔍 Verificando localStorage:', usuarioCadastrado)
console.log('📦 Dados do usuário parseados:', dadosUsuario)
console.log('✅ ID do usuário encontrado:', dadosUsuario.id)
console.log('📍 Enviando endereço para a API:', enderecoData)
```

---

## 🔄 Fluxo Completo Atualizado

```
1. Usuário preenche cadastro
   ↓
2. API cadastra usuário (pode ou não retornar ID)
   ↓
3. Sistema tenta obter ID da resposta
   ↓
4. Se não tiver ID → Faz login automático
   ↓
5. Obtém ID via resposta do login
   ↓
6. Salva ID no localStorage
   ↓
7. Redireciona para cadastro de endereço
   ↓
8. Página de endereço busca ID do localStorage
   ↓
9. Envia endereço com ID do usuário para API
   ↓
10. Sucesso → Limpa localStorage → Redireciona para login
```

---

## 🧪 Como Testar

1. **Abra o Console do Navegador** (F12)
2. Vá para a página de cadastro
3. Preencha os dados e clique em "Cadastrar"
4. Observe os logs no console:
   - `📥 Resposta do servidor:` - Resposta da API de cadastro
   - `🔄 ID não retornado, fazendo login automático...` - Se precisar fazer login
   - `✅ ID obtido via login:` - ID obtido com sucesso
   - `✅ ID do usuário salvo no localStorage:` - Confirmação de salvamento
5. Na página de endereço, observe:
   - `🔍 Verificando localStorage:` - Dados do localStorage
   - `📦 Dados do usuário parseados:` - Dados parseados
   - `✅ ID do usuário encontrado:` - ID encontrado
   - `📍 Enviando endereço para a API:` - Dados enviados

---

## 📝 Arquivos Modificados

1. **`src/services/types.ts`**
   - Atualizado `cadastroResponse` para incluir campos `id` e `data`

2. **`src/pages/autenticacao/Cadastro.tsx`**
   - Adicionado import da função `login`
   - Implementado login automático para obter ID
   - Melhorado tratamento de erros

3. **`src/pages/inicio/CadastroDeEndereco.tsx`**
   - Adicionados logs de debug detalhados
   - Mantida integração com API de endereço

---

## 🎯 Resultado Esperado

Agora, ao cadastrar um usuário:

✅ O sistema sempre consegue obter o ID (via resposta direta ou login automático)
✅ O ID é salvo corretamente no localStorage
✅ A página de endereço consegue acessar o ID
✅ O endereço é cadastrado com sucesso vinculado ao usuário
✅ Usuário é redirecionado para login após conclusão

---

## 🚨 Observação Importante

Se mesmo assim o problema persistir, verifique:

1. **Console do navegador** - Veja qual etapa está falando
2. **Network tab** - Verifique se as requisições estão sendo feitas corretamente
3. **localStorage** - Verifique se os dados estão sendo salvos (`Application > Local Storage`)
4. **Backend** - Confirme se a API de login está funcionando corretamente

---

## 📞 Próximos Passos (Opcional)

Para melhorar ainda mais, considere:

1. **Solicitar ao backend** que retorne o ID na resposta do cadastro
2. **Usar Context API** ao invés de localStorage para dados temporários
3. **Adicionar loading states** mais detalhados
4. **Implementar retry logic** em caso de falha no login automático
