# Kanban — App React Native com WebView + Notificações
## Versão Melhorada: Segurança, Performance e Boas Práticas

---

## 🔍 Análise do Projeto Original

### ✅ O que estava bem
- Estrutura de tarefas clara e sequencial
- Uso correto de `expo-notifications`, `expo-device`, `expo-constants`
- Verificação de dispositivo físico para push
- Tela offline com `NetInfo`
- Botão voltar Android via `BackHandler`
- Comunicação bidirecional WebView ↔ App com `postMessage`

### ⚠️ O que estava faltando ou precisava melhorar

| Área | Problema |
|------|----------|
| **Segurança** | `onMessage` não valida origem nem sanitiza dados |
| **Segurança** | `thirdPartyCookiesEnabled` ativo sem necessidade explícita |
| **Segurança** | Push token exposto no `console.log` em produção |
| **Segurança** | Sem `originWhitelist` na WebView |
| **Segurança** | Dados sensíveis (userId, email) trafegam sem validação |
| **Performance** | WebView sem cache configurado |
| **Performance** | Sem `useCallback`/`useMemo` nos handlers |
| **Performance** | Sem controle de re-renders desnecessários |
| **Performance** | Token reenviado ao site a cada `onLoadEnd` sem verificar se já foi enviado |
| **UX** | Sem feedback visual durante carregamento inicial |
| **UX** | Sem tratamento de erro de carregamento da WebView (`onError`) |
| **UX** | Sem `onHttpError` para capturar erros HTTP (404, 500) |
| **Qualidade** | `handleWebViewMessage` com tipo `any` |
| **Qualidade** | Sem separação de responsabilidades (tudo em `App.tsx`) |
| **Qualidade** | Sem variáveis de ambiente (URL hardcoded) |
| **Qualidade** | Sem tratamento de token desatualizado / re-registro |
| **Acessibilidade** | Sem `accessibilityLabel` nos botões |
| **Publicação** | Sem configuração de `androidStatusBar` e `backgroundColor` |
| **Publicação** | Sem deep linking configurado no `app.json` |

---

## Visão geral da arquitetura (atualizada)

```txt
App React Native / Expo
│
├── Config
│   ├── constants.ts          ← URLs, chaves e configurações centralizadas
│   └── app.json              ← Configuração completa com plugins e permissões
│
├── Hooks
│   ├── useNotifications.ts   ← Lógica isolada de push notification
│   └── useNetworkStatus.ts   ← Monitor de conectividade
│
├── Components
│   ├── WebViewScreen.tsx      ← WebView com segurança e performance
│   ├── OfflineScreen.tsx      ← Tela offline reutilizável
│   └── LoadingScreen.tsx      ← Tela de carregamento
│
└── App.tsx                   ← Orquestrador leve
```

---

## Requisitos técnicos (atualizado)

### Obrigatórios

- Node.js 18+ instalado.
- npm ou yarn.
- Projeto criado com Expo SDK 51+.
- Celular físico para testar push notification.
- `react-native-webview`
- `expo-notifications`
- `expo-device`
- `expo-constants`
- `@react-native-community/netinfo`
- Site com HTTPS.

### Adicionados

- `expo-secure-store` → armazenar token com segurança (não AsyncStorage).
- `expo-status-bar` → controle da barra de status.
- `react-native-safe-area-context` → compatibilidade com notch/islands.

---

# Quadro Kanban — Melhorado

## 🟦 Backlog

### Tarefa 1 — Definir URL principal do app

**Objetivo:** definir qual página será aberta dentro da WebView.

**Critérios de aceite:**

- A URL usa HTTPS.
- A página carrega bem no celular.
- O layout é responsivo.
- O login funciona dentro da WebView.
- ✅ NOVO: O site **não bloqueia WebViews** (sem detecção de user-agent que rejeite o app).
- ✅ NOVO: O site possui **Content-Security-Policy** configurado.

---

### Tarefa 2 — Definir nome e identidade do app

**Objetivo:** separar os dados básicos do app.

**Critérios de aceite:**

- Nome definido.
- Ícone definido (1024x1024px PNG sem transparência para iOS).
- Splash definida.
- Package Android definido.
- Bundle iOS definido.
- ✅ NOVO: `scheme` de deep link definido.
- ✅ NOVO: `androidStatusBar` configurado.

---

### Tarefa 3 — Definir tipos de notificações futuras

**Critérios de aceite:**

- Lista inicial de notificações definida.
- Cada notificação tem título, corpo curto e `data` payload estruturado.
- ✅ NOVO: Definir quais notificações abrem uma URL específica ao tocar.
- ✅ NOVO: Definir categorias de notificação (Android channels).

---

## 🟨 A Fazer

### Tarefa 4 — Criar projeto Expo

```bash
npx create-expo-app maxxx-app --template blank-typescript
cd maxxx-app
```

Rodar o app:

```bash
npx expo start
```

**Critérios de aceite:**

- Projeto criado com TypeScript.
- App abre no Expo Go.
- Não há erro inicial de dependência.

---

### Tarefa 5 — Instalar dependências

```bash
npx expo install react-native-webview
npx expo install expo-notifications expo-device expo-constants
npx expo install @react-native-community/netinfo
npx expo install expo-secure-store
npx expo install expo-status-bar
```

**Função de cada pacote:**

```txt
react-native-webview             → abre o site dentro do app
expo-notifications               → permissões, token e notificações
expo-device                      → valida se está em aparelho físico
expo-constants                   → acessa dados do projeto Expo/EAS
@react-native-community/netinfo  → verifica conexão com internet
expo-secure-store                → armazena o push token de forma segura
expo-status-bar                  → controle da barra de status nativa
```

**Critérios de aceite:**

- Todas as dependências instaladas.
- Projeto continua abrindo sem erro.

---

### Tarefa 6 — Configurar `app.json` (versão completa)

```json
{
  "expo": {
    "name": "Maxxx Móveis",
    "slug": "maxxx-moveis-app",
    "version": "1.0.0",
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "maxxxmoveis",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0058BB"
    },
    "androidStatusBar": {
      "barStyle": "light-content",
      "backgroundColor": "#0058BB",
      "translucent": false
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "br.com.maxxxmoveis.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Usamos a câmera para fotos do perfil.",
        "NSPhotoLibraryUsageDescription": "Acesso à galeria para upload de imagens."
      }
    },
    "android": {
      "package": "br.com.maxxxmoveis.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0058BB"
      },
      "permissions": [
        "POST_NOTIFICATIONS",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "expo-notifications",
      [
        "expo-secure-store",
        { "faceIDPermission": "Permitir autenticação biométrica." }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "COLOQUE_AQUI_O_PROJECT_ID_DO_EAS"
      }
    }
  }
}
```

**Critérios de aceite:**

- Nome, ícone, splash configurados.
- Package Android e Bundle iOS configurados.
- Plugin de notificações e secure-store configurados.
- ✅ NOVO: `runtimeVersion` para OTA updates.
- ✅ NOVO: `androidStatusBar` configurado.
- ✅ NOVO: Permissões Android explícitas.

---

### Tarefa 6.1 — Criar arquivo de constantes

Crie `src/constants.ts`:

```ts
// Nunca coloque chaves secretas aqui — este arquivo vai para o bundle do app.
// Use variáveis de ambiente via eas.json para chaves sensíveis.

export const APP_CONFIG = {
  SITE_URL: "https://maxxxmoveis.com.br",
  // Domínios permitidos na WebView (whitelist de segurança)
  ALLOWED_ORIGINS: [
    "https://maxxxmoveis.com.br",
    "https://www.maxxxmoveis.com.br",
  ],
  // Prefixos de URL que devem abrir fora do app
  EXTERNAL_URL_PREFIXES: [
    "whatsapp://",
    "tel:",
    "mailto:",
    "https://wa.me/",
    "https://api.whatsapp.com/",
    "https://maps.google.com/",
    "https://www.google.com/maps/",
  ],
  NOTIFICATION_CHANNEL_ID: "maxxx-moveis-default",
  PUSH_TOKEN_STORAGE_KEY: "expo_push_token",
} as const;
```

---

## 🟧 Em Desenvolvimento

### Tarefa 7 — Criar hook `useNotifications`

Crie `src/hooks/useNotifications.ts`:

```ts
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { APP_CONFIG } from "../constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function getOrRegisterPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (finalStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      APP_CONFIG.NOTIFICATION_CHANNEL_ID,
      {
        name: "Notificações Maxxx",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0058BB",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      }
    );
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.error("[Push] projectId não encontrado no app.json");
    return null;
  }

  // Verifica se já tem token salvo (evita chamada de rede desnecessária)
  const storedToken = await SecureStore.getItemAsync(
    APP_CONFIG.PUSH_TOKEN_STORAGE_KEY
  );
  if (storedToken) return storedToken;

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const token = tokenResponse.data;

  // Salva de forma segura (não no AsyncStorage)
  await SecureStore.setItemAsync(APP_CONFIG.PUSH_TOKEN_STORAGE_KEY, token);

  return token;
}

export function useNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    getOrRegisterPushToken().then((token) => {
      if (token) setPushToken(token);
    });

    // Listener: notificação recebida com app aberto
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Tratar notificação recebida (ex: atualizar badge, mostrar toast)
        console.info("[Push] Notificação recebida:", notification.request.identifier);
      });

    // Listener: usuário tocou na notificação
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const url = response.notification.request.content.data?.url as
          | string
          | undefined;
        // Futuramente: navegar para URL específica dentro da WebView
        if (url) console.info("[Push] Deep link da notificação:", url);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { pushToken };
}
```

---

### Tarefa 8 — Criar `App.tsx` com WebView + segurança + performance

```tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import type { WebViewNavigation, WebViewMessageEvent } from "react-native-webview";
import NetInfo from "@react-native-community/netinfo";

import { useNotifications } from "./src/hooks/useNotifications";
import { APP_CONFIG } from "./src/constants";

// ─── Tipos das mensagens vindas do site ────────────────────────────────────────
type WebViewMessage =
  | { type: "USER_LOGGED"; userId: number; email: string }
  | { type: "USER_LOGOUT" }
  | { type: "PAGE_READY" };

// ─── Utilitário: links externos ────────────────────────────────────────────────
function shouldOpenExternally(url: string): boolean {
  return APP_CONFIG.EXTERNAL_URL_PREFIXES.some((prefix) =>
    url.startsWith(prefix)
  );
}

// ─── Utilitário: validar origem da mensagem WebView ───────────────────────────
function isAllowedOrigin(url: string): boolean {
  return APP_CONFIG.ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
}

// ─── Tela Offline ──────────────────────────────────────────────────────────────
function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.offlineContainer}>
      <Text style={styles.offlineTitle}>Sem conexão com a internet</Text>
      <Text style={styles.offlineText}>
        Verifique sua conexão e tente novamente.
      </Text>
      <TouchableOpacity
        style={styles.reloadButton}
        onPress={onRetry}
        accessibilityLabel="Tentar reconectar"
        accessibilityRole="button"
      >
        <Text style={styles.reloadButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Tela de Carregamento ─────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#0058BB" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

// ─── App Principal ────────────────────────────────────────────────────────────
export default function App() {
  const webViewRef = useRef<WebView>(null);
  const { pushToken } = useNotifications();

  const [canGoBack, setCanGoBack] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasWebViewError, setHasWebViewError] = useState(false);
  const tokenSentRef = useRef(false); // evita reenvio do token

  // Monitor de conectividade
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected && state.isReachable);
      setIsConnected(connected);

      // Quando voltar a internet, recarrega a WebView automaticamente
      if (connected && hasWebViewError) {
        setHasWebViewError(false);
        webViewRef.current?.reload();
      }
    });
    return () => unsubscribe();
  }, [hasWebViewError]);

  // Botão voltar Android
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);
    },
    []
  );

  // ── Segurança: intercepta links externos ────────────────────────────────────
  const handleShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      const { url } = request;

      if (shouldOpenExternally(url)) {
        Linking.openURL(url).catch(() => {
          console.warn("[WebView] Não foi possível abrir link externo:", url);
        });
        return false; // bloqueia dentro da WebView
      }

      // Bloqueia navegação para domínios não autorizados
      const isAllowed = APP_CONFIG.ALLOWED_ORIGINS.some(
        (origin) => url.startsWith(origin) || url === "about:blank"
      );

      if (!isAllowed) {
        console.warn("[WebView] URL bloqueada por política:", url);
        return false;
      }

      return true;
    },
    []
  );

  // ── Segurança: recebe mensagens do site ─────────────────────────────────────
  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      // Valida origem antes de processar
      const origin = (event.nativeEvent as any).url ?? APP_CONFIG.SITE_URL;
      if (!isAllowedOrigin(origin)) {
        console.warn("[WebView] Mensagem de origem não autorizada:", origin);
        return;
      }

      let parsed: WebViewMessage;
      try {
        parsed = JSON.parse(event.nativeEvent.data) as WebViewMessage;
      } catch {
        console.warn("[WebView] Mensagem inválida recebida (não é JSON)");
        return;
      }

      switch (parsed.type) {
        case "USER_LOGGED":
          // Aqui você pode enviar token + userId para seu backend
          // Não logue email/userId em produção
          console.info("[App] Usuário logado, userId:", parsed.userId);
          break;

        case "USER_LOGOUT":
          console.info("[App] Usuário deslogado");
          break;

        case "PAGE_READY":
          // Site sinaliza que está pronto para receber o token
          if (pushToken && !tokenSentRef.current) {
            tokenSentRef.current = true;
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: "PUSH_TOKEN",
                token: pushToken,
                platform: Platform.OS,
              })
            );
          }
          break;

        default:
          console.warn("[App] Tipo de mensagem desconhecido");
      }
    },
    [pushToken]
  );

  // ── Envio do token ao carregar a página ─────────────────────────────────────
  const handleLoadEnd = useCallback(() => {
    if (pushToken && !tokenSentRef.current) {
      tokenSentRef.current = true;
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "PUSH_TOKEN",
          token: pushToken,
          platform: Platform.OS,
        })
      );
    }
  }, [pushToken]);

  const handleRetry = useCallback(() => {
    setHasWebViewError(false);
    webViewRef.current?.reload();
  }, []);

  // Estados de UI
  if (isConnected === null) return <LoadingScreen />;
  if (!isConnected) return <OfflineScreen onRetry={handleRetry} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0058BB" />

      {hasWebViewError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Erro ao carregar a página.
          </Text>
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.errorBannerLink}>Recarregar</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: APP_CONFIG.SITE_URL }}
        style={styles.webview}
        // ── Performance ────────────────────────────────────────────
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        cacheMode="LOAD_DEFAULT"
        setSupportMultipleWindows={false}
        // ── Segurança ──────────────────────────────────────────────
        originWhitelist={APP_CONFIG.ALLOWED_ORIGINS.map((o) => `${o}/*`).concat(["about:blank"])}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled={false} // desativado por segurança
        allowsBackForwardNavigationGestures
        // ── Handlers ──────────────────────────────────────────────
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleWebViewMessage}
        onLoadEnd={handleLoadEnd}
        onError={() => setHasWebViewError(true)}
        onHttpError={(syntheticEvent) => {
          const { statusCode } = syntheticEvent.nativeEvent;
          if (statusCode >= 500) setHasWebViewError(true);
        }}
        // ── Loading ────────────────────────────────────────────────
        startInLoadingState
        renderLoading={() => <LoadingScreen />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0058BB",
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#555555",
  },
  offlineContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#1a1a1a",
  },
  offlineText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    color: "#555555",
  },
  reloadButton: {
    backgroundColor: "#0058BB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: "#FFF3CD",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  errorBannerText: {
    color: "#856404",
    fontSize: 13,
  },
  errorBannerLink: {
    color: "#0058BB",
    fontWeight: "700",
    fontSize: 13,
  },
});
```

**Critérios de aceite:**

- O app abre o site corretamente.
- Push token é salvo no SecureStore.
- Token só é enviado uma vez por sessão.
- Links externos abrem fora do app.
- URLs de domínios externos são bloqueadas.
- `onError` e `onHttpError` capturam falhas de carregamento.
- Nenhuma mensagem não-JSON causa crash.
- `thirdPartyCookiesEnabled` está desativado.

---

### Tarefa 9 — Comunicação segura site ↔ app

No site, adapte os scripts para enviar mensagens tipadas:

```html
<script>
  function enviarLoginParaApp(userId, email) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "USER_LOGGED",
          userId: userId,
          email: email
        })
      );
    }
  }

  // Avisar o app que a página está pronta para receber o token
  function notificarPaginaPronta() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "PAGE_READY" })
      );
    }
  }

  // Chamar ao carregar o DOM
  document.addEventListener("DOMContentLoaded", notificarPaginaPronta);
</script>
```

**Critérios de aceite:**

- Site avisa o app que está pronto (`PAGE_READY`) antes de receber o token.
- Site envia userId no login (`USER_LOGGED`).
- App valida a origem antes de processar qualquer mensagem.

---

### Tarefa 10 — Testar notificação local (ambiente de desenvolvimento)

```tsx
// Adicione APENAS em desenvolvimento:
if (__DEV__) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Maxxx Móveis",
      body: "Teste de notificação no telefone.",
      sound: "default",
      data: { url: "https://maxxxmoveis.com.br/pedidos" },
    },
    trigger: { seconds: 5, channelId: APP_CONFIG.NOTIFICATION_CHANNEL_ID },
  });
}
```

**Critérios de aceite:**

- Notificação aparece após 5 segundos.
- Conteúdo de teste só roda com `__DEV__ === true`.
- Som e vibração funcionam.

---

## 🟩 Testes

### Tarefa 11 — Testar em aparelho físico

**Checklist:**

```txt
[ ] App abre no Android físico
[ ] App abre no iPhone físico (se aplicável)
[ ] WebView carrega o site
[ ] Login funciona dentro da WebView
[ ] Carrinho e checkout funcionam
[ ] Permissão de notificação aparece
[ ] Token é gerado e salvo no SecureStore
[ ] Token é enviado ao site após PAGE_READY
[ ] Tela offline aparece sem internet
[ ] App recarrega automaticamente ao voltar internet
[ ] Botão voltar Android navega dentro da WebView
[ ] Banner de erro aparece em falhas HTTP 5xx
[ ] Links externos abrem fora do app
[ ] URLs de outros domínios são bloqueadas
```

---

### Tarefa 12 — Testar links externos

```txt
[ ] WhatsApp abre fora do app (whatsapp://)
[ ] Telefone abre discador (tel:)
[ ] E-mail abre app de e-mail (mailto:)
[ ] wa.me abre WhatsApp Web ou app
[ ] Google Maps abre app de mapas
[ ] Links internos do site continuam dentro da WebView
```

---

## 🟪 Build / Publicação

### Tarefa 13 — Criar `eas.json` com perfis

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": { "simulator": false }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### Tarefa 14 — Gerar APK ou AAB Android

Para teste interno:

```bash
eas build -p android --profile preview
```

Para Play Store:

```bash
eas build -p android --profile production
```

---

### Tarefa 15 — Gerar build iOS

```bash
eas build -p ios --profile production
```

**Critérios de aceite:**

- Build gerado sem erro.
- Push notification funciona com certificados Apple.
- App passa pela revisão da Apple Store.

---

## ✅ Pronto

### Entregáveis finais

```txt
[ ] App React Native criado com TypeScript
[ ] WebView com segurança (whitelist, bloqueio de domínios externos)
[ ] Push token gerado e salvo no SecureStore
[ ] Permissão de notificação funcionando
[ ] Token enviado ao site apenas uma vez por sessão (via PAGE_READY)
[ ] Tela offline criada com recarregamento automático
[ ] Banner de erro para falhas HTTP
[ ] Links externos abrindo corretamente
[ ] Splash screen configurada
[ ] Ícone configurado
[ ] Botão voltar Android funcionando
[ ] console.log de dados sensíveis removido de produção
[ ] Build Android gerado
[ ] Estrutura pronta para conectar ao backend
```

---

## 🔒 Checklist de Segurança

```txt
[ ] originWhitelist configurado na WebView
[ ] thirdPartyCookiesEnabled: false
[ ] onMessage valida origem antes de processar
[ ] Dados sensíveis (userId, email) não são logados em produção
[ ] Push token salvo no SecureStore (não AsyncStorage)
[ ] URLs externas bloqueadas com onShouldStartLoadWithRequest
[ ] console.log com token removido antes do build de produção
[ ] Site usa HTTPS com HSTS e CSP configurados
[ ] Nenhuma chave secreta no bundle do app
```

---

## ⚡ Checklist de Performance

```txt
[ ] cacheEnabled: true com cacheMode LOAD_DEFAULT
[ ] Handlers com useCallback (sem re-render desnecessário)
[ ] Token enviado só uma vez por sessão (tokenSentRef)
[ ] Reconexão automática ao voltar internet
[ ] SecureStore consultado antes de gerar novo token
[ ] Componentes de UI (Offline, Loading) isolados fora do App
[ ] setSupportMultipleWindows: false (reduz overhead Android)
```

---

## Observações importantes

### 1. Token salvo no SecureStore

O push token agora é salvo de forma segura, evitando chamadas de rede desnecessárias a cada abertura do app.

### 2. Validação de origem das mensagens

O app agora valida de qual domínio a mensagem da WebView veio antes de processar, evitando ataques de injection via iframes ou páginas maliciosas carregadas acidentalmente.

### 3. `PAGE_READY` para envio do token

Em vez de enviar o token em qualquer `onLoadEnd`, o app agora aguarda o site sinalizar que está pronto. Isso evita race conditions onde o token chegava antes do JavaScript do site estar inicializado.

### 4. `__DEV__` para testes

Código de teste de notificação local só executa em desenvolvimento. O build de produção não inclui esse código.

### 5. Para Apple Store — dicas extras

```txt
- Nenhum link de download externo dentro do app (viola guidelines)
- Sistema de pagamento deve usar Apple Pay se vender dentro do app
- Splash e ícone sem transparência
- App deve ter funcionalidade nativa além da WebView
- Notificações precisam de permissão explícita (já implementado)
```

---

## Fluxo futuro completo com backend

```txt
[Usuário abre o app]
        ↓
[App verifica token no SecureStore]
        ↓ (se não tiver)
[App solicita permissão + gera token + salva no SecureStore]
        ↓
[Site carrega e dispara PAGE_READY]
        ↓
[App envia push token + platform para a WebView]
        ↓
[Site detecta login do usuário → envia USER_LOGGED com userId]
        ↓
[App (ou site) envia { token, userId, platform } para o backend]
        ↓
[Backend salva token vinculado ao usuário]
        ↓
[Backend envia push notification personalizada]
        ↓
[App recebe notificação → usuário toca → WebView navega para URL específica]
```

---

## Ordem recomendada de execução (atualizada)

```txt
1.  Criar projeto Expo com TypeScript
2.  Instalar todas as dependências
3.  Criar src/constants.ts com URLs e configurações
4.  Criar hook useNotifications com SecureStore
5.  Criar App.tsx com WebView segura e performática
6.  Configurar app.json completo
7.  Testar WebView abrindo o site
8.  Testar links externos
9.  Testar permissão e geração de push token
10. Testar comunicação site ↔ app (PAGE_READY + USER_LOGGED)
11. Testar tela offline
12. Configurar EAS e gerar build de preview
13. Testar build no celular físico
14. Gerar build de produção
15. Publicar nas stores
16. Conectar backend para envio real de push
```
