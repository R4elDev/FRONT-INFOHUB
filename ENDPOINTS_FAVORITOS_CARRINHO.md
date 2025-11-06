# 📋 Endpoints Necessários - Favoritos e Carrinho

Este documento descreve os endpoints que precisam ser implementados no backend para suportar as funcionalidades de **Favoritos** e **Carrinho**.

---

## 🎯 FAVORITOS

### 1. Buscar Favoritos do Usuário
**GET** `/v1/infohub/favoritos/usuario/:idUsuario`

**Descrição:** Retorna todos os produtos favoritos de um usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Favoritos encontrados",
  "favoritos": [
    {
      "id_favorito": 1,
      "id_usuario": 1,
      "id_produto": 5,
      "data_adicao": "2025-11-06T12:30:00Z",
      "produto": {
        "id_produto": 5,
        "nome": "Smartphone Samsung Galaxy",
        "descricao": "Smartphone com 128GB",
        "preco": 999.99,
        "preco_promocional": 899.99,
        "imagem": "url_da_imagem",
        "categoria": "Eletrônicos",
        "id_estabelecimento": 1
      }
    }
  ]
}
```

---

### 2. Adicionar aos Favoritos
**POST** `/v1/infohub/favoritos`

**Descrição:** Adiciona um produto aos favoritos do usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_usuario": 1,
  "id_produto": 5
}
```

**Response (201):**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Produto adicionado aos favoritos",
  "data": {
    "id_favorito": 1,
    "id_usuario": 1,
    "id_produto": 5,
    "data_adicao": "2025-11-06T12:30:00Z"
  }
}
```

**Response (409) - Já existe:**
```json
{
  "status": false,
  "status_code": 409,
  "message": "Produto já está nos favoritos"
}
```

---

### 3. Remover dos Favoritos
**DELETE** `/v1/infohub/favoritos/:idFavorito`

**Descrição:** Remove um produto dos favoritos

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Produto removido dos favoritos"
}
```

---

### 4. Verificar se está nos Favoritos
**GET** `/v1/infohub/favoritos/verificar/:idUsuario/:idProduto`

**Descrição:** Verifica se um produto está nos favoritos do usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Produto está nos favoritos"
}
```

**Response (404):**
```json
{
  "status": false,
  "status_code": 404,
  "message": "Produto não está nos favoritos"
}
```

---

### 5. Limpar Todos os Favoritos
**DELETE** `/v1/infohub/favoritos/usuario/:idUsuario`

**Descrição:** Remove todos os favoritos de um usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Todos os favoritos foram removidos"
}
```

---

## 🛒 CARRINHO

### 1. Buscar Carrinho do Usuário
**GET** `/v1/infohub/carrinho/usuario/:idUsuario`

**Descrição:** Retorna todos os itens do carrinho de um usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Carrinho encontrado",
  "itens": [
    {
      "id_carrinho": 1,
      "id_usuario": 1,
      "id_produto": 5,
      "quantidade": 2,
      "data_adicao": "2025-11-06T12:30:00Z",
      "produto": {
        "id_produto": 5,
        "nome": "Smartphone Samsung Galaxy",
        "descricao": "Smartphone com 128GB",
        "preco": 999.99,
        "preco_promocional": 899.99,
        "imagem": "url_da_imagem",
        "categoria": "Eletrônicos",
        "id_estabelecimento": 1
      }
    }
  ],
  "total": 1799.98,
  "subtotal": 1799.98
}
```

---

### 2. Adicionar ao Carrinho
**POST** `/v1/infohub/carrinho`

**Descrição:** Adiciona um produto ao carrinho ou atualiza a quantidade se já existir

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_usuario": 1,
  "id_produto": 5,
  "quantidade": 2
}
```

**Response (201):**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Produto adicionado ao carrinho",
  "data": {
    "id_carrinho": 1,
    "id_usuario": 1,
    "id_produto": 5,
    "quantidade": 2,
    "data_adicao": "2025-11-06T12:30:00Z"
  }
}
```

---

### 3. Atualizar Quantidade
**PUT** `/v1/infohub/carrinho/:idCarrinho`

**Descrição:** Atualiza a quantidade de um item no carrinho

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "quantidade": 3
}
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Quantidade atualizada",
  "data": {
    "id_carrinho": 1,
    "id_usuario": 1,
    "id_produto": 5,
    "quantidade": 3,
    "data_adicao": "2025-11-06T12:30:00Z"
  }
}
```

---

### 4. Remover do Carrinho
**DELETE** `/v1/infohub/carrinho/:idCarrinho`

**Descrição:** Remove um item do carrinho

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Item removido do carrinho"
}
```

---

### 5. Limpar Carrinho
**DELETE** `/v1/infohub/carrinho/usuario/:idUsuario`

**Descrição:** Remove todos os itens do carrinho de um usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Carrinho limpo com sucesso"
}
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `favoritos`
```sql
CREATE TABLE favoritos (
  id_favorito INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_produto INT NOT NULL,
  data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
  UNIQUE KEY unique_favorito (id_usuario, id_produto)
);
```

### Tabela: `carrinho`
```sql
CREATE TABLE carrinho (
  id_carrinho INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
  UNIQUE KEY unique_carrinho (id_usuario, id_produto)
);
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend (Node.js/Express)
- [ ] Criar tabelas `favoritos` e `carrinho` no banco de dados
- [ ] Criar controllers para favoritos
- [ ] Criar controllers para carrinho
- [ ] Criar rotas para favoritos
- [ ] Criar rotas para carrinho
- [ ] Adicionar middleware de autenticação
- [ ] Testar todos os endpoints

### Frontend (React) - ✅ CONCLUÍDO
- [x] Criar serviços de API (`favoritosService.ts`, `carrinhoService.ts`)
- [x] Criar contextos globais (`FavoritosContext.tsx`, `CarrinhoContext.tsx`)
- [x] Integrar providers no `main.tsx`
- [x] Atualizar tela de Favoritos
- [x] Atualizar tela de Carrinho
- [x] Adicionar loading states
- [x] Adicionar tratamento de erros

---

## 🔧 NOTAS DE IMPLEMENTAÇÃO

1. **Autenticação**: Todos os endpoints requerem token JWT no header `Authorization`

2. **Validações**:
   - Verificar se o usuário está autenticado
   - Verificar se o produto existe antes de adicionar
   - Verificar se o usuário é dono do favorito/carrinho antes de modificar

3. **Regras de Negócio**:
   - Um produto não pode ser adicionado duas vezes aos favoritos (usar UNIQUE KEY)
   - No carrinho, se o produto já existe, atualizar a quantidade ao invés de duplicar
   - Quantidade mínima no carrinho: 1
   - Ao deletar um produto, remover também dos favoritos e carrinho

4. **Performance**:
   - Usar JOIN para retornar dados do produto junto com favoritos/carrinho
   - Criar índices nas colunas `id_usuario` e `id_produto`

5. **Frontend já está pronto**:
   - As telas já estão integradas e funcionais
   - Assim que os endpoints forem implementados, tudo funcionará automaticamente
   - O frontend já trata loading, erros e estados vazios

---

## 📞 PRÓXIMOS PASSOS

1. Implementar os endpoints no backend conforme especificado acima
2. Criar as tabelas no banco de dados
3. Testar cada endpoint usando Postman ou similar
4. O frontend já está pronto e começará a funcionar automaticamente! 🎉
