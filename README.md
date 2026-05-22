# Maxxx Móveis - App Mobile

App mobile Expo/React Native que abre o site da Maxxx Móveis em uma WebView segura, com suporte a push notifications, tela offline, tratamento de erros e abertura de links externos fora do app.

## Requisitos

- Node.js 18+
- npm
- Expo CLI via `npx expo`
- Aparelho físico para testar push notification
- Site HTTPS acessível e responsivo

## Instalação

```bash
npm install
cp .env.example .env
npm start
```

O Expo iniciará o Metro Bundler. Abra no Expo Go ou em um development build.

## Variáveis de Ambiente

Configure o arquivo `.env`:

```env
APP_ENV=development
EAS_PROJECT_ID=
EXPO_PUBLIC_SITE_URL=https://maxxxmoveis.com.br
EXPO_PUBLIC_ALLOWED_ORIGINS=https://maxxxmoveis.com.br,https://www.maxxxmoveis.com.br
EXPO_PUBLIC_API_URL=https://api.maxxxmoveis.com.br
EXPO_PUBLIC_NOTIFICATION_CHANNEL_ID=maxxx-moveis-default
EXPO_PUBLIC_PUSH_TOKEN_STORAGE_KEY=expo_push_token
```

`EAS_PROJECT_ID` é necessário para gerar o Expo Push Token em aparelho físico.

`EXPO_PUBLIC_API_URL` deve apontar para a API Next.js de notificações. Em celular físico, use uma URL acessível pelo aparelho, por exemplo um domínio HTTPS ou o IP da sua máquina na rede local.

## Scripts

```bash
npm start
npm run android
npm run ios
npx tsc --noEmit
npx expo-doctor
```

## Estrutura

```txt
App.tsx
src/
  components/
    LoadingScreen.tsx
    OfflineScreen.tsx
    WebViewScreen.tsx
  hooks/
    useNetworkStatus.ts
    useNotifications.ts
  constants.ts
app.config.js
eas.json
```

## Recursos Implementados

- WebView com `originWhitelist`
- Navegação do domínio Maxxx Móveis dentro da própria WebView
- Links com `target="_blank"` e `window.open` abrindo fora do app
- Links fora de `maxxxmoveis.com.br` abrindo fora do app
- `thirdPartyCookiesEnabled={false}`
- Cache WebView habilitado
- Tela de carregamento
- Tela offline com retry
- Tratamento de `onError` e `onHttpError`
- Botão voltar Android navegando no histórico da WebView
- Push token salvo no SecureStore
- Envio do token para a WebView apenas uma vez por sessão
- Envio de `{ userId, token, platform }` para `/api/device-token` após `USER_LOGGED`
- Handler para URL recebida via notificação
- Notificação local de teste apenas em desenvolvimento
- Configuração EAS para development, preview e production

## Comunicação Site -> App

O site deve avisar quando estiver pronto para receber o push token:

```html
<script>
  function notificarPaginaPronta() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "PAGE_READY" }));
    }
  }

  document.addEventListener("DOMContentLoaded", notificarPaginaPronta);
</script>
```

No login, envie:

```js
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    type: "USER_LOGGED",
    userId,
    email,
  })
);
```

## Build

```bash
eas build -p android --profile preview
eas build -p android --profile production
eas build -p ios --profile production
```

Antes do build real, configure `EAS_PROJECT_ID`, credenciais EAS/Firebase/APNs e substitua os assets provisórios pelos arquivos finais da marca.

## Backend De Notificações

O backend do guia foi criado em `notifications-api/`.

```bash
cd notifications-api
npm install
cp .env.example .env
npm run dev
```

Endpoints principais:

- `POST /api/device-token`: recebe `{ userId, token, platform }`.
- `POST /api/notifications/send`: envia notificação via Expo Push Service. Requer header `x-api-key`.
- `POST /api/notifications/receipts`: consulta receipts da Expo e marca tokens inválidos.

O backend usa memória como armazenamento local de desenvolvimento. Em produção, substitua `notifications-api/lib/db.ts` por PostgreSQL, MySQL ou MongoDB.
