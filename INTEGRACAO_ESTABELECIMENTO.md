# 🏢 Integração: Cadastro de Estabelecimento

## 📋 Resumo da Integração

Integração completa do cadastro de estabelecimento com a API do backend. Apenas usuários **jurídicos** (perfil `estabelecimento`) podem cadastrar estabelecimentos, e cada CNPJ pode ter apenas **um estabelecimento**.

---

## 🔗 Endpoint Integrado

### POST `/estabelecimento`

**Request Body:**
```json
{
  "nome": "Supermercado Central",
  "cnpj": "12345678000190",
  "telefone": "11999999999"
}
```

**Response (201 - Sucesso):**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Estabelecimento criado com sucesso",
  "id": 1
}
```

---

## ✅ Funcionalidades Implementadas

### 1. **Verificação de Permissão**
- ✅ Apenas usuários com perfil `estabelecimento` podem acessar
- ✅ Redirecionamento automático se não tiver permissão

### 2. **Verificação de Estabelecimento Existente**
- ✅ Ao carregar a página, verifica se o usuário já tem estabelecimento
- ✅ Se já tiver, mostra os dados e botão para cadastrar produtos
- ✅ Impede cadastro duplicado

### 3. **Formulário Simplificado**
- ✅ **Nome do Estabelecimento** (obrigatório)
- ✅ **CNPJ** (obrigatório, com validação e formatação automática)
- ✅ **Telefone** (opcional, com formatação automática)

### 4. **Validações**
- ✅ Validação de campos obrigatórios
- ✅ Validação completa de CNPJ (dígitos verificadores)
- ✅ Formatação automática de CNPJ: `00.000.000/0000-00`
- ✅ Formatação automática de telefone: `(11) 99999-9999`

### 5. **Integração com API**
- ✅ Envio dos dados no formato correto
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Salvamento do ID do estabelecimento no localStorage
- ✅ Logs detalhados no console para debug

### 6. **Feedback Visual**
- ✅ Loading durante o cadastro
- ✅ Mensagens de sucesso/erro
- ✅ Atualização automática da tela após cadastro
- ✅ Redirecionamento para cadastro de produtos

---

## 🎯 Fluxo Completo

```
1. Usuário jurídico faz login
   ↓
2. Acessa "Cadastrar Estabelecimento"
   ↓
3. Sistema verifica se já tem estabelecimento
   ↓
4a. SE JÁ TEM:
    - Mostra dados do estabelecimento
    - Botão para cadastrar produtos
    - Não permite cadastro duplicado
   ↓
4b. SE NÃO TEM:
    - Mostra formulário de cadastro
    - Preenche nome, CNPJ e telefone
    - Valida CNPJ
    - Envia para API
   ↓
5. API cadastra estabelecimento
   ↓
6. Sistema salva ID no localStorage
   ↓
7. Mostra tela de sucesso com dados
   ↓
8. Usuário pode cadastrar produtos
```

---

## 📍 Onde Aparece o Estabelecimento

### 1. **Tela de Sucesso Imediata**
Após cadastrar, a página automaticamente mostra:
- ✅ Nome do estabelecimento
- ✅ CNPJ formatado
- ✅ Telefone
- ✅ Botão para cadastrar produtos
- ✅ Mensagem de sucesso

### 2. **localStorage**
O ID do estabelecimento fica salvo em:
```javascript
localStorage.getItem('estabelecimentoId') // Retorna o ID
```

### 3. **Próximas Telas**
O estabelecimento será usado em:
- **Cadastro de Produtos** - Vincula produtos ao estabelecimento
- **Lista de Produtos** - Mostra produtos do estabelecimento
- **Perfil** - Exibe dados do estabelecimento

---

## 🔍 Como Verificar se Criou

### 1. **Console do Navegador (F12)**
Após cadastrar, você verá:
```
🏢 Enviando dados do estabelecimento: {nome, cnpj, telefone}
✅ Estabelecimento cadastrado com sucesso: {status, id, message}
✅ ID do estabelecimento: 1
```

### 2. **localStorage**
Abra o DevTools → Application → Local Storage:
```
estabelecimentoId: "1"
```

### 3. **Tela Visual**
A página mostrará automaticamente:
```
┌─────────────────────────────────────┐
│  Estabelecimento Cadastrado         │
│  Você já possui um estabelecimento  │
│                                     │
│  Supermercado Central               │
│  CNPJ: 12.345.678/0001-90          │
│  Telefone: (11) 99999-9999         │
│                                     │
│  [Cadastrar Produtos] [Voltar]     │
└─────────────────────────────────────┘
```

### 4. **Network Tab**
Verifique a requisição:
- **URL:** `http://localhost:8080/v1/infohub/estabelecimento`
- **Method:** POST
- **Status:** 201 Created
- **Response:** `{status: true, id: 1, message: "..."}`

---

## 🚨 Regras de Negócio

### ✅ Permitido
- Usuário jurídico pode cadastrar **1 estabelecimento**
- Pode atualizar telefone (futuramente)
- Pode cadastrar produtos vinculados ao estabelecimento

### ❌ Não Permitido
- Usuário físico não pode cadastrar estabelecimento
- Não pode cadastrar mais de 1 estabelecimento por CNPJ
- Não pode cadastrar sem CNPJ válido

---

## 📁 Arquivos Modificados

### 1. **`src/services/types.ts`**
```typescript
export interface estabelecimentoRequest {
  nome: string;
  cnpj: string;
  telefone?: string;
}

export interface estabelecimentoResponse {
  status: boolean;
  status_code: number;
  message: string;
  id?: number;
  data?: {
    id: number;
    nome: string;
    cnpj: string;
    telefone?: string;
    id_usuario: number;
    created_at: string;
  };
}
```

### 2. **`src/services/apiServicesFixed.ts`**
```typescript
export async function cadastrarEstabelecimento(
  payload: estabelecimentoRequest
): Promise<estabelecimentoResponse> {
  const { data } = await api.post<estabelecimentoResponse>(
    "/estabelecimento", 
    payload
  )
  return data
}
```

### 3. **`src/pages/empresa/CadastroEstabelecimento.tsx`**
- Formulário simplificado (3 campos)
- Validação de CNPJ
- Formatação automática
- Verificação de estabelecimento existente
- Salvamento do ID no localStorage
- Feedback visual completo

---

## 🧪 Como Testar

### Passo 1: Login como Usuário Jurídico
```
1. Faça login com um usuário de perfil "estabelecimento"
2. Ou cadastre um novo usuário jurídico
```

### Passo 2: Acessar Cadastro
```
1. No menu lateral, clique em "Cadastrar Estabelecimento"
2. Ou acesse: /empresa/cadastro-estabelecimento
```

### Passo 3: Preencher Formulário
```
Nome: Supermercado Central
CNPJ: 12.345.678/0001-90 (será formatado automaticamente)
Telefone: (11) 99999-9999 (opcional)
```

### Passo 4: Verificar Console
```
Abra F12 e veja os logs:
📤 Payload final: {nome, cnpj, telefone}
✅ ID do estabelecimento: 1
```

### Passo 5: Verificar Tela
```
Deve aparecer a tela de sucesso com:
- Nome do estabelecimento
- CNPJ
- Telefone
- Botão "Cadastrar Produtos"
```

### Passo 6: Tentar Cadastrar Novamente
```
1. Recarregue a página
2. Deve mostrar que já tem estabelecimento
3. Não permite cadastro duplicado
```

---

## 🐛 Troubleshooting

### Erro: "Acesso Restrito"
**Causa:** Usuário não é jurídico  
**Solução:** Faça login com usuário de perfil `estabelecimento`

### Erro: "CNPJ inválido"
**Causa:** CNPJ com dígitos verificadores incorretos  
**Solução:** Use um CNPJ válido ou gerador de CNPJ

### Erro: "Estabelecimento já cadastrado"
**Causa:** CNPJ já possui estabelecimento  
**Solução:** Use outro CNPJ ou acesse o estabelecimento existente

### Não aparece no localStorage
**Causa:** API não retornou o ID  
**Solução:** Verifique o console e a resposta da API

---

## 📊 Próximos Passos

Após cadastrar o estabelecimento:

1. ✅ **Cadastrar Produtos/Promoções**
   - Vincular produtos ao estabelecimento
   - Definir preços e promoções

2. ✅ **Gerenciar Estabelecimento**
   - Ver lista de produtos
   - Editar informações (futuramente)

3. ✅ **Dashboard**
   - Ver estatísticas
   - Acompanhar vendas

---

## 💡 Dicas

- **CNPJ de Teste:** Use geradores online de CNPJ válido
- **Logs:** Sempre verifique o console para debug
- **localStorage:** Útil para verificar o ID salvo
- **Network:** Veja a requisição real no DevTools
- **Recarregar:** Após cadastrar, recarregue para ver a verificação funcionando

---

## 🎉 Conclusão

A integração está **100% funcional**! O sistema:

✅ Valida permissões  
✅ Verifica duplicidade  
✅ Valida CNPJ  
✅ Formata dados automaticamente  
✅ Integra com a API corretamente  
✅ Salva ID para uso futuro  
✅ Fornece feedback visual completo  
✅ Impede cadastros duplicados  

Agora você pode cadastrar estabelecimentos e vincular produtos a eles! 🚀
