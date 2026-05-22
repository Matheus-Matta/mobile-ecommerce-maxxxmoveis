# Guia de Notificações Push com Expo, React Native, WebView e Backend Next.js

## Objetivo

Criar um app React Native/Expo que abre uma página web via WebView, mas também recebe notificações push no celular.

A ideia é manter o sistema principal no seu próprio servidor:

```txt
App Expo / React Native
↓
WebView do site/sistema
↓
Expo Push Token
↓
Backend Next.js
↓
Banco de dados
↓
Expo Push API
↓
Expo entrega para FCM/APNs
↓
Cliente recebe no celular
```

---

# 1. Conceito principal

## O que o app faz

O app terá duas responsabilidades principais:

```txt
1. Abrir o site/sistema dentro de uma WebView
2. Registrar o celular para receber notificações
```

## O que o backend faz

O backend Next.js será responsável por:

```txt
1. Receber o token de notificação do app
2. Salvar esse token no banco de dados
3. Receber solicitações de envio de notificação
4. Enviar a notificação para a Expo Push API
5. Registrar histórico de envio
6. Controlar falhas, tokens inválidos e tentativas futuras
```

---

# 2. Dá para fazer sem Firebase?

## Resposta direta

Dá para fazer **sem Firebase no backend**.

Mas para Android com push real, não dá para fugir totalmente do FCM, porque o Android usa a infraestrutura do Google para entrega de push.

O caminho mais simples é:

```txt
Backend Next.js
↓
Expo Push API
↓
Expo
↓
FCM no Android
↓
APNs no iPhone
```

## O que conseguimos evitar

Você pode evitar:

```txt
- Firebase Admin SDK no Next.js
- Envio direto para FCM
- Firestore
- Firebase Auth
- Firebase Hosting
- Firebase Functions
- Banco de dados do Firebase
```

## O mínimo de Firebase que pode ser necessário

Para Android em produção, o mínimo pode ser:

```txt
- Criar um projeto Firebase
- Registrar o app Android
- Baixar google-services.json
- Configurar credenciais FCM no EAS
```

Esse Firebase seria usado apenas como credencial para Android, não como backend.

---

# 3. Desenvolvimento: fase inicial sem Firebase

Nesta etapa o foco é testar:

```txt
- Layout
- WebView
- Navegação
- Permissões
- Notificação local
- Backend Next.js
- Salvamento de token
- Estrutura do projeto
```

No Expo Go, você não deve depender de push remoto real.

---

## 3.1 Criar app Expo

```bash
npx create-expo-app maxxx-app
cd maxxx-app
```

---

## 3.2 Instalar dependências

```bash
npx expo install expo-notifications expo-device expo-constants react-native-webview
```

Dependências principais:

```txt
expo-notifications  → Notificações
expo-device         → Verificar se é dispositivo físico
expo-constants      → Ler configurações do app
react-native-webview → Abrir site dentro do app
```

---

## 3.3 Instalar EAS CLI

```bash
npm install -g eas-cli
```

---

## 3.4 Login no Expo/EAS

```bash
npx eas login
```

---

## 3.5 Configurar EAS

```bash
npx eas build:configure
```

Depois rode:

```bash
npx eas project:info
```

Copie o `Project ID`.

---

## 3.6 Criar arquivo `.env`

```env
EXPO_PUBLIC_EAS_PROJECT_ID=seu-project-id
EXPO_PUBLIC_API_URL=https://api.seudominio.com.br
EXPO_PUBLIC_WEBVIEW_URL=https://seudominio.com.br
```

Exemplo para ambiente local:

```env
EXPO_PUBLIC_EAS_PROJECT_ID=seu-project-id
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
EXPO_PUBLIC_WEBVIEW_URL=https://maxxxmoveis.com.br
```

---

## 3.7 Configurar `app.config.js`

```js
export default {
  expo: {
    name: "Maxxx Móveis",
    slug: "maxxx-app",
    scheme: "maxxxapp",
    version: "1.0.0",
    orientation: "portrait",

    ios: {
      bundleIdentifier: "br.com.maxxxmoveis.app"
    },

    android: {
      package: "br.com.maxxxmoveis.app"
    },

    plugins: [
      "expo-notifications"
    ],

    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      webviewUrl: process.env.EXPO_PUBLIC_WEBVIEW_URL,
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    }
  }
};
```

---

# 4. App React Native com WebView

## 4.1 Estrutura simples do `App.tsx`

```tsx
import React from "react";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  const webviewUrl =
    Constants.expoConfig?.extra?.webviewUrl || "https://maxxxmoveis.com.br";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: webviewUrl }} />
    </SafeAreaView>
  );
}
```

---

# 5. Evitar erro no Expo Go

No Expo Go, não inicialize push remoto real.

## 5.1 Verificar se está no Expo Go

```ts
import Constants from "expo-constants";

export function isRunningInExpoGo() {
  return Constants.appOwnership === "expo";
}
```

## 5.2 Proteção para notificações

```ts
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

if (isExpoGo) {
  console.log("Expo Go detectado. Push remoto desativado.");
}
```

Resumo:

```txt
Expo Go:
- Testa layout
- Testa WebView
- Testa navegação
- Pode testar notificação local
- Não deve ser usado para validar push remoto real
```

---

# 6. Teste de notificação local

A notificação local serve apenas para validar se o app consegue exibir uma notificação no aparelho.

```ts
import * as Notifications from "expo-notifications";

export async function testLocalNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Maxxx Móveis",
      body: "Teste de notificação local no app.",
      data: {
        url: "https://maxxxmoveis.com.br"
      }
    },
    trigger: null
  });
}
```

---

# 7. Development Build

Para testar notificação real, gere uma development build.

## 7.1 Criar `eas.json`

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

---

## 7.2 Gerar build de desenvolvimento

```bash
npx eas build -p android --profile development
```

Ou gerar uma build preview:

```bash
npx eas build -p android --profile preview
```

---

## 7.3 Instalar APK no celular físico

Depois que o EAS terminar o build:

```txt
1. Baixe o APK
2. Instale no celular físico
3. Abra o app
4. Autorize notificações
5. Gere o ExpoPushToken
6. Envie o token para o backend
```

---

# 8. Função para registrar push token no app

Crie um arquivo:

```txt
src/services/pushNotifications.ts
```

Conteúdo:

```ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync(userId: string) {
  const isExpoGo = Constants.appOwnership === "expo";

  if (isExpoGo) {
    console.log("Expo Go detectado. Push remoto desativado.");
    return null;
  }

  if (!Device.isDevice) {
    throw new Error("Use um dispositivo físico para testar push.");
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Permissão de notificação negada.");
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error("EAS Project ID não encontrado.");
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId
    })
  ).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX
    });
  }

  const apiUrl = Constants.expoConfig?.extra?.apiUrl;

  await fetch(`${apiUrl}/api/device-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      token,
      platform: Platform.OS
    })
  });

  return token;
}
```

---

# 9. Como lidar com clique na notificação

Quando o cliente tocar na notificação, o app pode abrir uma URL específica dentro da WebView.

Exemplo de payload:

```json
{
  "title": "Pedido atualizado",
  "message": "Seu pedido teve uma nova atualização.",
  "data": {
    "url": "https://maxxxmoveis.com.br/minha-conta/pedidos/123",
    "type": "pedido_atualizado"
  }
}
```

Exemplo no app:

```tsx
import React, { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  const defaultUrl =
    Constants.expoConfig?.extra?.webviewUrl || "https://maxxxmoveis.com.br";

  const [url, setUrl] = useState(defaultUrl);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log("Notificação recebida:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;

        if (data?.url && typeof data.url === "string") {
          setUrl(data.url);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: url }} />
    </SafeAreaView>
  );
}
```

---

# 10. Backend Next.js sem Firebase Admin

O backend envia para a Expo Push API, não diretamente para o Firebase.

## 10.1 Criar projeto Next.js

```bash
npx create-next-app@latest maxxx-notifications-api
cd maxxx-notifications-api
```

---

## 10.2 Instalar Expo Server SDK

```bash
npm install expo-server-sdk
```

---

## 10.3 Estrutura sugerida

```txt
app/
  api/
    device-token/
      route.ts
    notifications/
      send/
        route.ts

lib/
  db.ts
  notifications.ts

prisma/
  schema.prisma
```

---

# 11. Banco de dados

## 11.1 Tabela de tokens

```txt
DeviceToken
- id
- userId
- expoPushToken
- platform
- active
- createdAt
- updatedAt
```

## 11.2 Tabela de notificações

```txt
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
```

## 11.3 Tabela de entregas/envios

```txt
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

---

# 12. Endpoint para salvar token

Arquivo:

```txt
app/api/device-token/route.ts
```

Exemplo simples:

```ts
import { NextRequest, NextResponse } from "next/server";

const fakeDb: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { userId, token, platform } = body;

  if (!userId || !token || !platform) {
    return NextResponse.json(
      { error: "userId, token e platform são obrigatórios." },
      { status: 400 }
    );
  }

  const existing = fakeDb.find((item) => item.expoPushToken === token);

  if (existing) {
    existing.userId = userId;
    existing.platform = platform;
    existing.active = true;
    existing.updatedAt = new Date();
  } else {
    fakeDb.push({
      id: crypto.randomUUID(),
      userId,
      expoPushToken: token,
      platform,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return NextResponse.json({
    success: true,
    message: "Token salvo com sucesso."
  });
}
```

Na produção, substitua `fakeDb` por banco real.

---

# 13. Endpoint para enviar notificação

Arquivo:

```txt
app/api/notifications/send/route.ts
```

```ts
import { Expo } from "expo-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const expo = new Expo();

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { token, title, message, url, type } = body;

  if (!Expo.isExpoPushToken(token)) {
    return NextResponse.json(
      { error: "Token Expo inválido." },
      { status: 400 }
    );
  }

  const messages = [
    {
      to: token,
      sound: "default",
      title,
      body: message,
      data: {
        url: url || "",
        type: type || "aviso_geral"
      }
    }
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return NextResponse.json({
    success: true,
    tickets
  });
}
```

---

# 14. Endpoint de produção com segurança

Em produção, proteja o endpoint com uma chave interna.

## 14.1 Variáveis do backend

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/maxxx_notifications
NOTIFICATION_API_KEY=uma-chave-secreta-interna
```

## 14.2 Endpoint protegido

```ts
import { Expo } from "expo-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const expo = new Expo();

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== process.env.NOTIFICATION_API_KEY) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const { tokens, title, message, url, type } = body;

  if (!Array.isArray(tokens) || tokens.length === 0) {
    return NextResponse.json(
      { error: "Informe uma lista de tokens." },
      { status: 400 }
    );
  }

  const messages = tokens
    .filter((token) => Expo.isExpoPushToken(token))
    .map((token) => ({
      to: token,
      sound: "default",
      title,
      body: message,
      data: {
        url: url || "",
        type: type || "aviso_geral"
      }
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return NextResponse.json({
    success: true,
    sent: messages.length,
    tickets
  });
}
```

---

# 15. Teste de envio

Faça uma requisição para o backend:

```http
POST https://api.seudominio.com.br/api/notifications/send
Content-Type: application/json
x-api-key: sua-chave-interna
```

Body:

```json
{
  "tokens": [
    "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  ],
  "title": "Maxxx Móveis",
  "message": "Seu pedido teve uma nova atualização.",
  "url": "https://maxxxmoveis.com.br/minha-conta/pedidos/123",
  "type": "pedido_atualizado"
}
```

---

# 16. Tipos de notificação sugeridos

```txt
pedido_atualizado
entrega_agendada
pedido_saiu_para_entrega
montagem_agendada
assistencia_atualizada
promocao
cupom
financeiro
sac
aviso_geral
```

---

# 17. Produção no servidor

## 17.1 O que subir no servidor

```txt
- Next.js
- Banco PostgreSQL ou MySQL
- Nginx
- SSL
- PM2 ou Docker
```

## 17.2 Fluxo de produção

```txt
Sistema interno da Maxxx
↓
API Next.js
↓
Busca tokens no banco
↓
Envia para Expo Push API
↓
Registra tickets
↓
Consulta receipts depois
↓
Marca tokens inválidos como inativos
```

---

# 18. Produção Android com Firebase mínimo

Mesmo sem Firebase no backend, para Android real pode ser necessário configurar FCM no EAS.

## 18.1 Criar projeto Firebase

Crie um projeto no Firebase Console.

## 18.2 Registrar app Android

Use o mesmo package configurado no app:

```txt
br.com.maxxxmoveis.app
```

## 18.3 Baixar `google-services.json`

Coloque na raiz do projeto:

```txt
/google-services.json
```

## 18.4 Atualizar `app.config.js`

```js
export default {
  expo: {
    name: "Maxxx Móveis",
    slug: "maxxx-app",

    android: {
      package: "br.com.maxxxmoveis.app",
      googleServicesFile: "./google-services.json"
    },

    plugins: ["expo-notifications"],

    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    }
  }
};
```

## 18.5 Configurar credenciais no EAS

```bash
npx eas credentials
```

Caminho sugerido:

```txt
Android
production
Google Service Account
Manage your Google Service Account Key for Push Notifications (FCM V1)
Upload a new service account key
```

---

# 19. Build de produção

## Android

```bash
npx eas build -p android --profile production
```

## iOS

```bash
npx eas build -p ios --profile production
```

---

# 20. Checklist de desenvolvimento

```txt
[ ] Criar app Expo
[ ] Instalar expo-notifications
[ ] Instalar react-native-webview
[ ] Criar app.config.js
[ ] Criar .env
[ ] Configurar EAS
[ ] Obter EAS_PROJECT_ID
[ ] Testar WebView no Expo Go
[ ] Bloquear push remoto no Expo Go
[ ] Testar notificação local
[ ] Criar backend Next.js
[ ] Criar endpoint de token
[ ] Criar endpoint de envio
[ ] Gerar development build
[ ] Instalar APK no celular
[ ] Gerar ExpoPushToken
[ ] Salvar token no backend
[ ] Enviar notificação teste
[ ] Testar clique na notificação abrindo URL na WebView
```

---

# 21. Checklist de produção

```txt
[ ] Criar banco de dados real
[ ] Criar tabela de tokens
[ ] Criar tabela de notificações
[ ] Criar tabela de histórico de envios
[ ] Proteger API com x-api-key
[ ] Configurar domínio da API
[ ] Configurar SSL
[ ] Subir backend Next.js no servidor
[ ] Configurar Nginx
[ ] Configurar PM2 ou Docker
[ ] Configurar logs
[ ] Configurar retry de notificações
[ ] Consultar receipts da Expo
[ ] Desativar tokens inválidos
[ ] Configurar credenciais Android no EAS
[ ] Configurar credenciais iOS se for publicar para iPhone
[ ] Gerar build production
[ ] Publicar app
```

---

# 22. Resumo final

## Melhor arquitetura para o projeto

```txt
Expo / React Native
+ WebView
+ expo-notifications
+ EAS Build
+ Backend Next.js
+ Banco próprio
+ Expo Push API
```

## O que fica no seu servidor

```txt
- Backend Next.js
- Banco de dados
- Painel de envio
- Regras de segmentação
- Histórico das notificações
- Integração com sistemas internos
```

## O que fica fora do seu servidor

```txt
- Entrega nativa da notificação
- FCM no Android
- APNs no iOS
- Expo Push Service
```

## Decisão recomendada

Para a Maxxx, o caminho mais simples e profissional é:

```txt
Usar Expo Push API
Não usar Firebase Admin no backend
Manter Next.js como backend próprio
Usar Firebase apenas como credencial mínima do Android, se necessário
```

---

# 23. Referências oficiais

- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo Push Notifications Setup: https://docs.expo.dev/push-notifications/push-notifications-setup/
- Enviar notificações com Expo Push Service: https://docs.expo.dev/push-notifications/sending-notifications/
- Credenciais FCM no Android com Expo: https://docs.expo.dev/push-notifications/fcm-credentials/
- Expo SDK 53 Changelog: https://expo.dev/changelog/sdk-53
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
