import { createStorefrontApiClient } from "@shopify/storefront-api-client";

if (!process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN) {
  throw new Error("EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN is not defined in .env");
}
if (!process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error(
    "EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in .env"
  );
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion:
    process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION ?? "2025-04",
  publicAccessToken: process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});
