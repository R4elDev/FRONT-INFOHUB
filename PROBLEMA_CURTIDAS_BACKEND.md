# 🔴 PROBLEMA IDENTIFICADO - Sistema de Curtidas

## ❌ CAUSA DO ERRO 500

Analisando o controller do backend (`controller/post/postController.js`), identifiquei o problema:

### O Erro:
```
POST /post/1/curtir → 500 Internal Server Error
```

### A Causa:
**A rota está chamando uma função que NÃO EXISTE no controller!**

No arquivo `route/routes.js`, a rota provavelmente chama:
```javascript
controllerPost.curtirPost(...)  // ❌ ESTA FUNÇÃO NÃO EXISTE!
```

Mas no controller, a função correta é:
```javascript
toggleCurtidaPost(id_post, id_usuario, contentType)  // ✅ ESTA É A FUNÇÃO CORRETA
```

---

## ✅ SOLUÇÃO PARA O BACKEND

### Opção 1: Corrigir a Rota (RECOMENDADO)

No arquivo `route/routes.js`, encontre a rota de curtir e altere de:

```javascript
// ❌ ERRADO
app.post('/post/:id/curtir', verificarToken, (request, response) => {
    let dadosBody = request.body;
    let contentType = request.headers['content-type'];
    let id_post = request.params.id;
    
    dadosBody.id_post = id_post;
    
    controllerPost.curtirPost(dadosBody, contentType)  // ❌ Função não existe!
        .then(result => response.status(result.status_code).json(result))
        .catch(error => response.status(500).json(MESSAGE.ERROR_INTERNAL_SERVER));
});
```

Para:

```javascript
// ✅ CORRETO
app.post('/post/:id/curtir', verificarToken, (request, response) => {
    let dadosBody = request.body;
    let contentType = request.headers['content-type'];
    let id_post = request.params.id;
    let id_usuario = dadosBody.id_usuario;
    
    controllerPost.toggleCurtidaPost(id_post, id_usuario, contentType)  // ✅ Função correta!
        .then(result => response.status(result.status_code).json(result))
        .catch(error => response.status(500).json(MESSAGE.ERROR_INTERNAL_SERVER));
});
```

### Opção 2: Criar Alias no Controller (ALTERNATIVA)

No `controller/post/postController.js`, adicione no final:

```javascript
module.exports = {
    criarPost,
    atualizarPost,
    deletarPost,
    buscarPostPorId,
    listarPostsUsuario,
    listarTodosPosts,
    listarFeed,
    listarPostsProduto,
    listarPostsEstabelecimento,
    comentarPost,
    listarComentarios,
    atualizarComentario,
    deletarComentario,
    toggleCurtidaPost,
    verificarCurtidaUsuario,
    
    // Alias para compatibilidade com rotas antigas
    curtirPost: toggleCurtidaPost  // ✅ Adicione esta linha
};
```

---

## 📋 FORMATO ESPERADO

### Request (POST /post/:id/curtir)
```json
{
  "id_usuario": 45
}
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "status": true,
  "status_code": 200,
  "message": "Curtida adicionada com sucesso.",
  "data": {
    "curtido": true,
    "total_curtidas": 5
  }
}
```

---

## 🔍 ENDPOINT DE VERIFICAR CURTIDA

Você também precisa criar a rota para verificar curtidas:

```javascript
// GET /post/:id/curtida/verificar?id_usuario=X
app.get('/post/:id/curtida/verificar', verificarToken, (request, response) => {
    let id_post = request.params.id;
    let id_usuario = request.query.id_usuario;
    
    controllerPost.verificarCurtidaUsuario(id_post, id_usuario)
        .then(result => response.status(result.status_code).json(result))
        .catch(error => response.status(500).json(MESSAGE.ERROR_INTERNAL_SERVER));
});
```

---

## ⚠️ OUTROS PROBLEMAS ENCONTRADOS

1. **Notificação ausente**: O controller tenta chamar `notificacaoDAO.notificarCurtidaPost(...)` mas essa função não existe no `model/DAO/notificacao.js`. Isso pode quebrar o fluxo.

2. **Duplicidade no DAO**: Existem duas funções de toggle:
   - `toggleCurtidaPost` (retorna `{ curtiu, mensagem }`)
   - `toggleCurtida` (retorna `{ curtido, acao }`)
   
   O controller usa `toggleCurtida`. Recomendo padronizar.

---

## 🎯 FRONTEND ESTÁ CORRETO

O frontend agora está tentando os seguintes endpoints (em ordem de prioridade):
1. ✅ `/post/:id/curtir` com payload `{ id_usuario: X }`
2. `/curtida` com payload `{ id_post: X, id_usuario: Y }`
3. Outros endpoints alternativos

**Assim que o backend corrigir a rota, as curtidas vão funcionar automaticamente!**
