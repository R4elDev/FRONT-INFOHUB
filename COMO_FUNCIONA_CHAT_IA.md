# 🤖 Como Funciona o Chat IA (Versão Mockada)

## 📊 Status Atual: **MOCKADO (Simulado)**

A integração está **funcionando perfeitamente**, mas os dados **NÃO vêm do backend real**. É uma simulação completa que se comporta exatamente como a API real funcionaria.

---

## 🔄 Fluxo Completo de uma Mensagem

### 1. **Usuário digita e envia** (ex: "carne moída perto de mim")
```
ChatPrecos.tsx → handleSendMessage()
```

### 2. **Componente chama a função da API**
```typescript
const response = await interagirComIA({
  mensagem: "carne moída perto de mim",
  idUsuario: 1
})
```

### 3. **Função simula chamada real** (`requests.ts`)
```typescript
// Simula delay de rede (200-500ms)
const delay = Math.floor(Math.random() * 300) + 200;
await new Promise(resolve => setTimeout(resolve, delay));
```

### 4. **Análise inteligente da mensagem**
A função `generateMockedResponse()` analisa:
- ✅ Palavras-chave do produto ("carne", "moída")
- ✅ Filtros de localização ("perto", "próximo")
- ✅ Filtros de preço ("barato", "mais barato")

### 5. **Busca nos dados mockados**
```typescript
// Array com 8 produtos mockados
const promocoesMockadas = [
  { produto: 'Carne Moída Bovina 1kg', preco: 22.90, distancia: 0.8, ... },
  { produto: 'Carne Moída Premium 1kg', preco: 28.50, distancia: 2.6, ... },
  { produto: 'Carne Moída Especial 1kg', preco: 24.90, distancia: 1.2, ... },
  // ... mais 5 produtos
]
```

### 6. **Ordena resultados**
- Se pediu "perto" → Ordena por **distância** (menor primeiro)
- Se pediu "barato" → Ordena por **preço** (menor primeiro)
- Caso contrário → Ordem padrão

### 7. **Retorna resposta formatada**
```typescript
{
  status: true,
  status_code: 200,
  data: {
    reply: "🎯 **Encontrei 3 oferta(s) de 'carne moída':**...",
    confidence: 0.9,
    response_time_ms: 234
  }
}
```

### 8. **Componente exibe resposta**
- Mostra mensagem formatada
- Exibe badge de confiança (90%)
- Salva no localStorage automaticamente

---

## 🎯 Exemplos de Perguntas e Respostas

### Exemplo 1: "carne moída perto de mim"
**O que acontece:**
1. Busca produtos com "carne" e "moída"
2. Detecta palavra "perto"
3. Ordena por distância (0.8km primeiro)
4. Retorna:
```
🎯 **Encontrei 3 oferta(s) de "carne moída":**

**🏆 MELHOR OFERTA MAIS PRÓXIMA:**
Carne Moída Bovina 1kg
💰 **R$ 22.90**
🏪 Açougue Bom Corte
📍 0.8 km - Rua do Comércio, 456 - Centro
👤 Cadastrado por: Roberto Alves

**Outras opções:**
2. Carne Moída Especial 1kg - R$ 24.90 • Mercado Bom Preço (1.2 km)
3. Carne Moída Premium 1kg - R$ 28.50 • Supermercado Central (2.6 km)
```

### Exemplo 2: "leite mais barato"
**O que acontece:**
1. Busca produtos com "leite"
2. Detecta palavra "barato"
3. Ordena por preço (R$ 4.99)
4. Retorna oferta mais barata

### Exemplo 3: "quais as promoções?"
**O que acontece:**
1. Detecta palavra "promoções"
2. Lista top 3 promoções gerais
3. Não filtra por produto específico

---

## 🔧 Dados Mockados Incluem

Cada promoção tem **TODOS** os dados que você pediu:

```typescript
{
  produto: 'Carne Moída Bovina 1kg',      // ✅ PRODUTO
  preco: 22.90,                            // ✅ PREÇO
  empresa: 'Açougue Bom Corte',           // ✅ EMPRESA
  distancia: 0.8,                          // ✅ DISTÂNCIA
  endereco: 'Rua do Comércio, 456',       // ✅ ENDEREÇO EMPRESA
  usuario: 'Roberto Alves',                // ✅ USUÁRIO
  enderecoUsuario: 'Av. Principal, 789'   // ✅ ENDEREÇO USUÁRIO
}
```

**Total de produtos mockados:** 8
- 3x Carne Moída (diferentes tipos)
- 1x Leite
- 1x Arroz
- 1x Feijão
- 1x Óleo
- 1x Açúcar

---

## 🚀 Como Migrar para API Real

### Passo 1: Abra `src/services/requests.ts`

### Passo 2: Na função `interagirComIA()`, linha ~93:

**COMENTE estas linhas (mockadas):**
```typescript
// ===== VERSÃO MOCKADA =====
// const delay = Math.floor(Math.random() * 300) + 200;
// await new Promise(resolve => setTimeout(resolve, delay));
// const mockedResponse = generateMockedResponse(payload.mensagem, delay);
// console.log('✅ Resposta da IA (mockada):', mockedResponse);
// return mockedResponse;
```

**DESCOMENTE estas linhas (reais):**
```typescript
// ===== VERSÃO REAL =====
const { data } = await api.post<chatIAResponse>("/interagir", payload)
console.log('✅ Resposta da IA:', data);
return data
```

### Passo 3: Pronto! 🎉
A integração vai funcionar **exatamente igual**, mas agora com dados reais do backend.

---

## 💾 Persistência no localStorage

### Como funciona:
1. **Ao enviar mensagem** → Salva automaticamente
2. **Ao recarregar página** → Recupera histórico
3. **Ao sair da página** → Limpa tudo (começa do zero)

### Chave usada:
```typescript
localStorage.getItem('infohub_chat_messages')
```

### Estrutura salva:
```json
[
  {
    "text": "carne moída perto de mim",
    "time": "22:15",
    "isBot": false
  },
  {
    "text": "🎯 **Encontrei 3 oferta(s)...",
    "time": "22:15",
    "isBot": true,
    "confidence": 0.9
  }
]
```

---

## 🎨 Recursos Visuais

### Loading State
- ✅ Ícone do robô pulsando
- ✅ Texto "A IA está analisando sua pergunta..."
- ✅ Spinner animado no botão de enviar

### Badge de Confiança
- ✅ Mostra porcentagem (ex: "90% confiança")
- ✅ Apenas em mensagens do bot
- ✅ Baseado no campo `confidence` da resposta

### Auto-scroll
- ✅ Rola automaticamente para última mensagem
- ✅ Smooth scroll (animado)

---

## 🧪 Teste Você Mesmo!

Experimente estas perguntas:

1. **"carne moída perto de mim"** → Ordena por distância
2. **"leite mais barato"** → Ordena por preço
3. **"arroz"** → Busca simples
4. **"quais as promoções?"** → Lista geral
5. **"como funciona?"** → Ajuda do sistema
6. **"produtos perto de mim"** → Ordena tudo por distância

---

## 📝 Resumo Final

| Aspecto | Status |
|---------|--------|
| **Conexão com API** | ✅ Simulada (mockada) |
| **Dados retornados** | ✅ Mockados (8 produtos) |
| **Lógica de busca** | ✅ Funcional (palavras-chave) |
| **Ordenação** | ✅ Por distância ou preço |
| **Persistência** | ✅ localStorage |
| **Loading states** | ✅ Implementado |
| **Confiança da IA** | ✅ Exibida |
| **Pronto para produção** | ⚠️ Precisa trocar mock por API real |

---

## 🔍 Diferença: Mock vs Real

### MOCK (Atual):
```
Usuário → Componente → interagirComIA() → generateMockedResponse() → Array local → Resposta
```

### REAL (Futuro):
```
Usuário → Componente → interagirComIA() → api.post("/interagir") → Backend → IA → Resposta
```

**A estrutura é IDÊNTICA!** Só muda de onde vêm os dados. 🎯
