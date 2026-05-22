# Guia Manual - Configuração Final

Este projeto já tem o app Expo/WebView e a API Next.js de notificações implementados. Este guia lista o que ainda precisa ser configurado manualmente para testar push real e publicar.

## 1. Variáveis Do App

Arquivo: `.env`

Já configurado:

```env
EAS_PROJECT_ID=e78b1455-d8d0-41a7-b9e3-16b6a67abff4
EXPO_PUBLIC_EAS_PROJECT_ID=e78b1455-d8d0-41a7-b9e3-16b6a67abff4
EXPO_PUBLIC_SITE_URL=https://maxxxmoveis.com.br
EXPO_PUBLIC_ALLOWED_ORIGINS=https://maxxxmoveis.com.br,https://www.maxxxmoveis.com.br
```

Ainda precisa preencher quando o backend estiver rodando:

```env
EXPO_PUBLIC_API_URL=https://api.seudominio.com.br
```

Para teste local em celular físico, use o IP da máquina na rede:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

Não use `localhost` no celular.

## 1.1 Onde Conseguir Cada Credencial

### EAS Project ID

Usado em:

```env
EAS_PROJECT_ID=
EXPO_PUBLIC_EAS_PROJECT_ID=
```

Onde pegar:

```bash
npx eas project:info
```

No projeto atual:

```txt
e78b1455-d8d0-41a7-b9e3-16b6a67abff4
```

Também aparece no painel:

```txt
https://expo.dev/accounts/matheus.matta/projects/maxxx-moveis-app
```

### Expo Login / Conta Expo

Usado para:

```txt
- eas build
- eas credentials
- projectId
- gerenciamento de builds
```

Como configurar:

```bash
npx eas login
npx eas whoami
```

Conta atual:

```txt
matheus.matta
```

### API URL

Usado em:

```env
EXPO_PUBLIC_API_URL=
```

Onde pegar:

```txt
- Desenvolvimento local: IP da máquina onde roda notifications-api
- Produção: domínio HTTPS da API no servidor
```

Exemplo local:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

Como descobrir o IP no Windows:

```powershell
ipconfig
```

Procure o IPv4 da rede Wi-Fi/Ethernet.

Exemplo produção:

```env
EXPO_PUBLIC_API_URL=https://api.maxxxmoveis.com.br
```

### WebView URL

Usado em:

```env
EXPO_PUBLIC_SITE_URL=
EXPO_PUBLIC_ALLOWED_ORIGINS=
```

Onde pegar:

```txt
É o domínio do site/sistema que vai abrir dentro do app.
```

Projeto atual:

```env
EXPO_PUBLIC_SITE_URL=https://maxxxmoveis.com.br
EXPO_PUBLIC_ALLOWED_ORIGINS=https://maxxxmoveis.com.br,https://www.maxxxmoveis.com.br
```

### Package Android

Usado em:

```js
android: {
  package: "br.com.maxxxmoveis.app"
}
```

Onde definir:

```txt
app.config.js
```

Importante:

```txt
O mesmo package deve ser usado no Firebase ao registrar o app Android.
```

Projeto atual:

```txt
br.com.maxxxmoveis.app
```

### Bundle Identifier iOS

Usado em:

```js
ios: {
  bundleIdentifier: "br.com.maxxxmoveis.app"
}
```

Onde definir:

```txt
app.config.js
```

Onde usar:

```txt
Apple Developer / App Store Connect / EAS credentials
```

Projeto atual:

```txt
br.com.maxxxmoveis.app
```

### NOTIFICATION_API_KEY

Usado em:

```env
NOTIFICATION_API_KEY=
```

Onde criar:

```txt
Você mesmo cria essa chave. Ela é uma senha interna para proteger o endpoint de envio.
```

Como gerar uma chave forte no PowerShell:

```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Onde colocar:

```txt
notifications-api/.env
```

Exemplo:

```env
NOTIFICATION_API_KEY=cole-a-chave-gerada-aqui
```

Onde usar:

```http
x-api-key: cole-a-chave-gerada-aqui
```

Nunca coloque essa chave no app Expo, porque o app vai para o celular do cliente.

### DATABASE_URL

Usado em:

```env
DATABASE_URL=
```

Onde pegar:

```txt
No painel/servidor do banco escolhido.
```

Exemplos:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/maxxx_notifications
DATABASE_URL=mysql://usuario:senha@host:3306/maxxx_notifications
```

No estado atual, a API usa memória para desenvolvimento. Em produção, configure banco real e substitua `notifications-api/lib/db.ts`.

### google-services.json

Usado para:

```txt
Android push real via FCM
```

Onde pegar:

```txt
Firebase Console
```

Passo a passo:

```txt
1. Acesse https://console.firebase.google.com
2. Crie ou abra o projeto Firebase
3. Clique em Adicionar app
4. Escolha Android
5. Package name:
   br.com.maxxxmoveis.app
6. Baixe o arquivo google-services.json
7. Coloque na raiz deste projeto Expo:
   /google-services.json
```

O `app.config.js` já está preparado para detectar esse arquivo automaticamente.

### Firebase Service Account Key / FCM V1

Usado para:

```txt
Credencial FCM V1 no EAS para Android push
```

Onde pegar:

```txt
Firebase Console > Configurações do projeto > Contas de serviço
```

Passo a passo:

```txt
1. Acesse Firebase Console
2. Abra o projeto
3. Configurações do projeto
4. Aba Contas de serviço
5. Gerar nova chave privada
6. Baixe o JSON
```

Onde enviar:

```bash
npx eas credentials
```

Caminho:

```txt
Android
production
Google Service Account
Manage your Google Service Account Key for Push Notifications (FCM V1)
Upload a new service account key
```

Não coloque essa chave no Git.

### Credenciais Apple / APNs

Usado para:

```txt
Push notification no iPhone
```

Onde pegar/configurar:

```txt
Apple Developer
EAS Credentials
```

Caminho mais simples:

```bash
npx eas build -p ios --profile production
```

Durante o processo, deixe o EAS gerenciar as credenciais automaticamente, se possível.

Se configurar manualmente:

```txt
1. Apple Developer Account
2. Identifiers
3. App ID com bundle:
   br.com.maxxxmoveis.app
4. Habilitar Push Notifications
5. Criar/configurar APNs key/certificate
6. Enviar para EAS credentials
```

### Ícone E Splash

Usado em:

```txt
assets/icon.png
assets/adaptive-icon.png
assets/splash.png
assets/notification-icon.png
```

Onde conseguir:

```txt
Com o designer/identidade visual da Maxxx Móveis.
```

Requisitos importantes:

```txt
- icon.png: 1024x1024 PNG
- iOS: ícone sem transparência
- splash.png: imagem de splash final
- notification-icon.png: ícone simples para Android notification
```

## 2. Site Dentro Da WebView

O site precisa enviar eventos para o app.

Quando a página estiver pronta:

```html
<script>
  document.addEventListener("DOMContentLoaded", function () {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "PAGE_READY" })
      );
    }
  });
</script>
```

Quando o usuário fizer login:

```js
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    type: "USER_LOGGED",
    userId: 123,
    email: "cliente@email.com"
  })
);
```

Quando o usuário sair:

```js
window.ReactNativeWebView.postMessage(
  JSON.stringify({ type: "USER_LOGOUT" })
);
```

## 3. Backend Next.js

Pasta: `notifications-api`

Configurar:

```bash
cd notifications-api
copy .env.example .env
npm install
npm run dev
```

Arquivo: `notifications-api/.env`

```env
NOTIFICATION_API_KEY=crie-uma-chave-secreta-forte
DATABASE_URL=
```

Hoje o backend usa memória para desenvolvimento. Em produção, trocar `notifications-api/lib/db.ts` por banco real:

- PostgreSQL
- MySQL
- MongoDB

Tabelas recomendadas:

```txt
DeviceToken
- id
- userId
- expoPushToken
- platform
- active
- createdAt
- updatedAt

Notification
- id
- title
- body
- type
- url
- targetType
- targetUserId
- sentAt
- status

NotificationDelivery
- id
- notificationId
- userId
- expoPushToken
- ticketId
- status
- errorMessage
- createdAt
- updatedAt
```

## 4. Testar Backend

Salvar token:

```http
POST http://localhost:3000/api/device-token
Content-Type: application/json
```

```json
{
  "userId": "123",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android"
}
```

Enviar notificação:

```http
POST http://localhost:3000/api/notifications/send
Content-Type: application/json
x-api-key: sua-chave
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

Consultar receipts:

```http
POST http://localhost:3000/api/notifications/receipts
x-api-key: sua-chave
```

## 5. Expo Go

No Expo Go:

```txt
Funciona:
- WebView
- navegação
- layout
- web

Não funciona:
- push remoto real com expo-notifications
```

Push remoto precisa de development build ou build EAS.

## 6. Development Build Android

Gerar APK de desenvolvimento:

```bash
npx eas build -p android --profile development
```

Ou APK preview:

```bash
npx eas build -p android --profile preview
```

Depois:

```txt
1. Baixar o APK
2. Instalar no celular físico
3. Abrir o app
4. Aceitar permissão de notificação
5. Fazer login no site dentro da WebView
6. Conferir se o backend recebeu o token
7. Enviar uma notificação teste pela API
8. Tocar na notificação e conferir se a URL abriu
```

## 7. Firebase Mínimo Para Android

Para Android com push real em produção, configurar FCM no EAS.

Passos manuais:

```txt
1. Criar projeto no Firebase Console
2. Registrar app Android com package:
   br.com.maxxxmoveis.app
3. Baixar google-services.json
4. Colocar google-services.json na raiz do app Expo
5. Criar Service Account Key no Firebase
6. Rodar:
   npx eas credentials
7. Selecionar:
   Android
   production
   Google Service Account
   Manage your Google Service Account Key for Push Notifications (FCM V1)
   Upload a new service account key
```

O arquivo `app.config.js` já detecta `google-services.json` automaticamente quando ele existir.

Não precisa usar Firebase Admin no backend.

## 8. iOS

Para iPhone:

```txt
1. Ter Apple Developer Account
2. Configurar bundleIdentifier:
   br.com.maxxxmoveis.app
3. Rodar build iOS:
   npx eas build -p ios --profile production
4. Deixar o EAS gerenciar credenciais APNs ou configurar manualmente
```

## 9. Produção Do Backend

Subir `notifications-api` em servidor com:

```txt
- Node.js LTS
- PostgreSQL/MySQL/MongoDB
- HTTPS/SSL
- Nginx ou proxy equivalente
- PM2 ou Docker
```

Variáveis em produção:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/maxxx_notifications
NOTIFICATION_API_KEY=uma-chave-secreta-forte
```

Proteger o endpoint `/api/notifications/send` com `x-api-key`. Isso já está implementado.

## 10. Produção Do App

Antes do build final:

```txt
[ ] Trocar assets provisórios por ícone/splash finais
[ ] Preencher EXPO_PUBLIC_API_URL com domínio HTTPS real
[ ] Configurar Firebase mínimo Android
[ ] Configurar credenciais iOS se publicar para iPhone
[ ] Testar em celular físico
[ ] Confirmar envio do token ao backend
[ ] Confirmar envio de notificação pela API
[ ] Confirmar clique abrindo URL correta
```

Build Android produção:

```bash
npx eas build -p android --profile production
```

Build iOS produção:

```bash
npx eas build -p ios --profile production
```

## 11. Checklist Final

```txt
[ ] Backend com banco real
[ ] API em HTTPS
[ ] NOTIFICATION_API_KEY forte configurada
[ ] EXPO_PUBLIC_API_URL preenchida no app
[ ] Site envia PAGE_READY
[ ] Site envia USER_LOGGED
[ ] Site envia USER_LOGOUT
[ ] Development build instalado em celular físico
[ ] ExpoPushToken gerado
[ ] Token salvo no backend
[ ] Notificação enviada via Expo Push API
[ ] Clique na notificação abre URL correta
[ ] Firebase FCM V1 configurado no EAS para Android
[ ] APNs configurado para iOS se necessário
[ ] Assets finais adicionados
[ ] Build production gerado
```
