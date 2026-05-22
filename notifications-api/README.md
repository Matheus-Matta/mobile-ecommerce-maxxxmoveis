# Maxxx Notifications API

Backend Next.js para salvar ExpoPushToken e enviar notificações via Expo Push Service, sem Firebase Admin.

## Instalação

```bash
cd notifications-api
npm install
cp .env.example .env
npm run dev
```

## Endpoints

### Salvar token

```http
POST /api/device-token
Content-Type: application/json
```

```json
{
  "userId": "123",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android"
}
```

### Enviar notificação

```http
POST /api/notifications/send
Content-Type: application/json
x-api-key: troque-esta-chave
```

```json
{
  "tokens": ["ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"],
  "title": "Maxxx Móveis",
  "message": "Seu pedido teve uma atualização.",
  "url": "https://maxxxmoveis.com.br/minha-conta/pedidos/123",
  "type": "pedido_atualizado"
}
```

Também é possível enviar para tokens salvos por usuário:

```json
{
  "userId": "123",
  "title": "Maxxx Móveis",
  "message": "Seu pedido teve uma atualização."
}
```

## Produção

Troque o repositório em memória de `lib/db.ts` por PostgreSQL, MySQL ou MongoDB antes de produção.
