# 🔧 Solução para Erro 404 - Endpoints não encontrados

## 🚨 **Problema Identificado**
O erro `Cannot GET /v1/infohub/categoria` indica que os endpoints não existem no backend ou estão com nomes diferentes.

## ✅ **Solução Implementada**

### 1. **Arquivo de Serviços Corrigido**
Criei o arquivo `apiServicesFixed.ts` que testa múltiplas variações de endpoints:

```typescript
// Testa tanto singular quanto plural
/categoria OU /categorias
/produto OU /produtos  
/endereco OU /enderecos OU /endereco-usuario
```

### 2. **Função de Teste Automática**
Adicionei uma função que testa todos os endpoints possíveis:

```typescript
export async function testarEndpoints(): Promise<void> {
    const endpoints = [
        '/categoria',
        '/categorias', 
        '/produto',
        '/produtos',
        '/endereco',
        '/enderecos',
        '/endereco-usuario'
    ]
    
    // Testa cada endpoint e mostra o resultado no console
}
```

### 3. **Componentes Atualizados**
- ✅ `CadastroPromocao.tsx` - Agora usa `apiServicesFixed`
- ✅ `ListaPromocoes.tsx` - Agora usa `apiServicesFixed`  
- ✅ `CadastroEndereco.tsx` - Agora usa `apiServicesFixed`

## 🧪 **Como Testar**

### **Passo 1: Verificar Console**
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Acesse a página de Cadastro de Promoção
4. Você verá os resultados dos testes de endpoint:

```
🔍 Testando endpoints disponíveis...
✅ /categorias - Disponível
❌ /categoria - Não encontrado (404)
🔒 /produtos - Requer autenticação (401)
```

### **Passo 2: Identificar Endpoints Corretos**
Com base nos resultados, você saberá quais endpoints funcionam.

### **Passo 3: Ajustar se Necessário**
Se nenhum endpoint funcionar, pode ser que:

1. **Backend não está rodando**
2. **URL base está incorreta** (verifique `.env`)
3. **Endpoints têm nomes diferentes**

## 🔍 **Possíveis Endpoints Alternativos**

Se os endpoints testados não funcionarem, tente estas variações:

```typescript
// Possibilidades para categorias:
/api/categoria
/api/categorias
/v1/categoria
/v1/categorias
/categoria
/categorias

// Possibilidades para produtos:
/api/produto
/api/produtos
/v1/produto  
/v1/produtos
/produto
/produtos

// Possibilidades para endereços:
/api/endereco
/api/enderecos
/api/endereco-usuario
/v1/endereco
/v1/enderecos
/endereco
/enderecos
```

## 🛠️ **Verificações Importantes**

### **1. Verificar Backend**
```bash
# Certifique-se que o backend está rodando
curl http://localhost:8080/v1/infohub/
```

### **2. Verificar .env**
```bash
# Arquivo: .env
VITE_API_BASE_URL=http://localhost:8080/v1/infohub
```

### **3. Verificar Documentação da API**
Consulte a documentação do backend para ver os endpoints corretos.

## 🎯 **Próximos Passos**

1. **Execute o teste** - Acesse a página de cadastro e veja o console
2. **Identifique os endpoints corretos** - Com base nos resultados
3. **Ajuste se necessário** - Modifique os endpoints no `apiServicesFixed.ts`
4. **Teste novamente** - Verifique se o cadastro funciona

## 📞 **Se Ainda Não Funcionar**

Se mesmo com os testes os endpoints não funcionarem:

1. **Verifique se o backend está rodando**
2. **Confirme a URL base no .env**
3. **Consulte a documentação da API do backend**
4. **Verifique se precisa de autenticação prévia**

## 🔧 **Comandos Úteis**

```bash
# Testar se o backend responde
curl http://localhost:8080/v1/infohub/

# Testar endpoint específico
curl http://localhost:8080/v1/infohub/categorias

# Testar com autenticação
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:8080/v1/infohub/categorias
```

---

**Com essas correções, o sistema deve identificar automaticamente quais endpoints funcionam e usar os corretos!** 🚀
