# Maxxx Móveis — App Mobile

E-commerce mobile para Android e iOS construído com **Expo React Native**, **NativeWind (Tailwind CSS)** e **Shopify Storefront API**.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalar |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (vem com Node) |
| Git | qualquer | https://git-scm.com |
| Expo Go (celular) | atual | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779) |
| Expo CLI (opcional) | atual | `npm install -g expo-cli` |

---

## 1. Clonar o repositório

```bash
git clone https://github.com/Matheus-Matta/mobile-ecommerce-maxxxmoveis.git
cd mobile-ecommerce-maxxxmoveis
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais Shopify:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=sua-loja.myshopify.com
EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=seu-token-aqui
EXPO_PUBLIC_SHOPIFY_API_VERSION=2025-04
```

### Como obter o token Shopify

1. No painel do Shopify: **Configurações → Apps e canais de venda → Desenvolver apps**
2. Clique em **Criar um app**
3. Em **Configuração da API Storefront**, habilite as permissões:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_customer_tags` (para autenticação)
4. Copie o **Storefront API access token**

---

## 4. Iniciar o servidor de desenvolvimento

```bash
npm start
```

O terminal exibirá um QR code. Escaneie com o app **Expo Go** no celular.

### Atalhos para emuladores

```bash
# Android (requer Android Studio + emulador configurado)
npm run android

# iOS (requer macOS + Xcode)
npm run ios

# Web (apenas para testes)
npm run web
```

---

## Estrutura do projeto

```
mobile-ecommerce-maxxxmoveis/
├── app/                          # Rotas (Expo Router)
│   ├── _layout.tsx               # Root layout (providers globais)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar
│   │   ├── index.tsx             # Tela inicial (Home)
│   │   ├── search.tsx            # Busca de produtos
│   │   ├── cart.tsx              # Carrinho
│   │   ├── orders.tsx            # Pedidos
│   │   └── profile.tsx           # Perfil / Login
│   ├── product/
│   │   └── [handle].tsx          # Detalhe do produto
│   └── collection/
│       └── [handle].tsx          # Produtos de uma coleção
│
├── src/
│   ├── lib/
│   │   ├── shopify.ts            # Client Shopify Storefront API
│   │   ├── queries.ts            # GraphQL queries e mutations
│   │   └── notifications.ts      # Push notifications (Expo)
│   ├── services/
│   │   └── shopify.service.ts    # Funções de acesso à API
│   ├── store/
│   │   ├── cartStore.ts          # Estado do carrinho (Zustand)
│   │   └── authStore.ts          # Auth do cliente (Zustand)
│   ├── types/
│   │   └── shopify.ts            # Tipos TypeScript
│   └── utils/
│       └── format.ts             # Formatação de moeda
│
├── assets/                       # Ícones e imagens
├── global.css                    # Entrypoint Tailwind
├── tailwind.config.js            # Configuração Tailwind
├── babel.config.js               # NativeWind babel preset
├── app.json                      # Configuração Expo
├── .env.example                  # Modelo de variáveis de ambiente
└── tsconfig.json                 # TypeScript config
```

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Expo SDK 54 + Expo Router | Navegação file-based + build nativo |
| React Native 0.81 | Framework mobile |
| NativeWind v4 (Tailwind CSS) | Estilização utilitária |
| Shopify Storefront API v2025-04 | Catálogo, carrinho e checkout |
| React Query (@tanstack/react-query) | Cache e sincronização de dados |
| Zustand | Gerenciamento de estado global |
| Expo Notifications | Push notifications (Android + iOS) |
| TypeScript | Tipagem estática |

---

## Funcionalidades

- **Home** — banner, categorias e produtos em destaque
- **Busca** — pesquisa de produtos em tempo real
- **Detalhe do produto** — galeria, seleção de variante, add ao carrinho
- **Carrinho** — gerenciar itens, atualizar quantidades, checkout via Shopify
- **Pedidos** — histórico do cliente autenticado
- **Perfil** — login e cadastro via Shopify Customer API
- **Notificações** — push notifications para Android e iOS

---

## Push Notifications em produção

1. Crie uma conta em https://expo.dev e instale o EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. Atualize o `projectId` no `app.json`:
   ```json
   "extra": {
     "eas": { "projectId": "seu-id-aqui" }
   }
   ```

3. Para Android, adicione o arquivo `google-services.json` (Firebase Cloud Messaging) na raiz do projeto.

---

## Build para produção

```bash
# Android (.apk / .aab)
eas build --platform android

# iOS (.ipa — requer conta Apple Developer)
eas build --platform ios

# Ambos
eas build --platform all
```

---

## Comandos úteis

```bash
# Limpar cache do Metro bundler
npx expo start --clear

# Verificar erros TypeScript
npx tsc --noEmit

# Atualizar dependências Expo
npx expo install --check
```
