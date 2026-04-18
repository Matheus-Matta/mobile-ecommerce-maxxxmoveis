import { shopifyClient } from "@/lib/shopify";
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_COLLECTIONS,
  GET_COLLECTION_PRODUCTS,
  GET_MENU,
  GET_METAOBJECTS,
  GET_METAOBJECT_BY_HANDLE,
  GET_APP_BANNERS,
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
} from "@/lib/queries";
import type {
  Product,
  Collection,
  Cart,
  PageInfo,
  ShopifyMenu,
  MenuItem,
  Metaobject,
  BannerMetaobject,
} from "@/types/shopify";

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(
  first = 20,
  after?: string,
  query?: string
): Promise<{ products: Product[]; pageInfo: PageInfo }> {
  const { data, errors } = await shopifyClient.request(GET_PRODUCTS, {
    variables: { first, after, query },
  });

  if (errors) throw new Error(errors.message);

  const edges = data?.products?.edges ?? [];
  return {
    products: edges.map((e: { node: Product }) => e.node),
    pageInfo: data?.products?.pageInfo,
  };
}

export async function fetchProductByHandle(
  handle: string
): Promise<Product | null> {
  const { data, errors } = await shopifyClient.request(
    GET_PRODUCT_BY_HANDLE,
    { variables: { handle } }
  );

  if (errors) throw new Error(errors.message);
  return data?.productByHandle ?? null;
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function fetchCollections(
  first = 10
): Promise<Collection[]> {
  const { data, errors } = await shopifyClient.request(GET_COLLECTIONS, {
    variables: { first },
  });

  if (errors) throw new Error(errors.message);
  return (data?.collections?.edges ?? []).map(
    (e: { node: Collection }) => e.node
  );
}

export async function fetchCollectionProducts(
  handle: string,
  first = 20,
  after?: string
): Promise<{ collection: Partial<Collection>; products: Product[]; pageInfo: PageInfo }> {
  const { data, errors } = await shopifyClient.request(
    GET_COLLECTION_PRODUCTS,
    { variables: { handle, first, after } }
  );

  if (errors) throw new Error(errors.message);

  const col = data?.collectionByHandle;
  const edges = col?.products?.edges ?? [];
  return {
    collection: { id: col?.id, title: col?.title, description: col?.description },
    products: edges.map((e: { node: Product }) => e.node),
    pageInfo: col?.products?.pageInfo,
  };
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const { data, errors } = await shopifyClient.request(CREATE_CART, {
    variables: { lines },
  });

  if (errors) throw new Error(errors.message);
  const userErrors = data?.cartCreate?.userErrors ?? [];
  if (userErrors.length) throw new Error(userErrors[0].message);
  return data?.cartCreate?.cart;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const { data, errors } = await shopifyClient.request(ADD_CART_LINES, {
    variables: { cartId, lines },
  });

  if (errors) throw new Error(errors.message);
  const userErrors = data?.cartLinesAdd?.userErrors ?? [];
  if (userErrors.length) throw new Error(userErrors[0].message);
  return data?.cartLinesAdd?.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const { data, errors } = await shopifyClient.request(UPDATE_CART_LINES, {
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });

  if (errors) throw new Error(errors.message);
  const userErrors = data?.cartLinesUpdate?.userErrors ?? [];
  if (userErrors.length) throw new Error(userErrors[0].message);
  return data?.cartLinesUpdate?.cart;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const { data, errors } = await shopifyClient.request(REMOVE_CART_LINES, {
    variables: { cartId, lineIds },
  });

  if (errors) throw new Error(errors.message);
  const userErrors = data?.cartLinesRemove?.userErrors ?? [];
  if (userErrors.length) throw new Error(userErrors[0].message);
  return data?.cartLinesRemove?.cart;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

/** Extrai o handle da coleção a partir de uma URL do Shopify.
 *  Ex: "/collections/cozinha" ou "https://loja.myshopify.com/collections/cozinha" → "cozinha" */
function extractHandleFromUrl(url: string): string | null {
  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const segments = path.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? null;
  } catch {
    return null;
  }
}

function mapMenuItems(rawItems: any[]): MenuItem[] {
  return rawItems.map((item: any) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    type: item.type,
    resourceId: item.resourceId ?? null,
    handle: extractHandleFromUrl(item.url) ?? undefined,
    items: item.items ? mapMenuItems(item.items) : [],
  }));
}

export async function fetchMenu(handle: string): Promise<ShopifyMenu | null> {
  const { data, errors } = await shopifyClient.request(GET_MENU, {
    variables: { handle },
  });

  if (errors) throw new Error(errors.message);
  const menu = data?.menu;
  if (!menu) return null;

  return {
    handle: menu.handle,
    title: menu.title,
    items: mapMenuItems(menu.items ?? []),
  };
}

// ─── Metaobjects ──────────────────────────────────────────────────────────────

export async function fetchMetaobjects(
  type: string,
  first = 20
): Promise<Metaobject[]> {
  const { data, errors } = await shopifyClient.request(GET_METAOBJECTS, {
    variables: { type, first },
  });

  if (errors) throw new Error(errors.message);
  return (data?.metaobjects?.edges ?? []).map((e: { node: any }) => e.node as Metaobject);
}

export async function fetchMetaobjectByHandle(
  type: string,
  handle: string
): Promise<Metaobject | null> {
  const { data, errors } = await shopifyClient.request(GET_METAOBJECT_BY_HANDLE, {
    variables: { type, handle },
  });

  if (errors) throw new Error(errors.message);
  return (data?.metaobject as Metaobject) ?? null;
}

/** Busca banners do tipo definido em EXPO_PUBLIC_BANNER_METAOBJECT_TYPE e mapeia para BannerMetaobject */
export async function fetchBanners(): Promise<BannerMetaobject[]> {
  const configuredType =
    process.env.EXPO_PUBLIC_BANNER_METAOBJECT_TYPE ?? "hero_banner";

  // Alguns projetos alternam hífen/sublinhado no type do metaobject.
  const typeCandidates = Array.from(
    new Set([
      configuredType,
      configuredType.replace(/-/g, "_"),
      configuredType.replace(/_/g, "-"),
    ])
  ).filter(Boolean);

  let nodes: any[] = [];
  let matchedType = configuredType;

  for (const candidateType of typeCandidates) {
    const { data, errors } = await shopifyClient.request(GET_APP_BANNERS, {
      variables: { type: candidateType, first: 20 },
    });

    if (errors) throw new Error(errors.message);

    const candidateNodes = data?.metaobjects?.nodes ?? [];

    if (candidateNodes.length > 0) {
      matchedType = candidateType;
      nodes = candidateNodes;
      break;
    }
  }

  if (__DEV__) {
    console.log("[fetchBanners] type configured:", configuredType);
    console.log("[fetchBanners] type matched:", matchedType);
    console.log("[fetchBanners] nodes found:", nodes.length);
    if (nodes[0]) {
      console.log("[fetchBanners] first node:", {
        id: nodes[0].id,
        handle: nodes[0].handle,
        active: nodes[0]?.active?.value,
        sortOrder: nodes[0]?.sortOrder?.value,
        position: nodes[0]?.position?.value,
        hasImageReference: Boolean(nodes[0]?.image?.reference?.image?.url),
        hasMobileImageReference: Boolean(
          nodes[0]?.mobileImage?.reference?.image?.url
        ),
      });
    }
  }

  const isTruthy = (value?: string | null): boolean => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  };

  const banners: BannerMetaobject[] = nodes
    .filter((item: any) => isTruthy(item?.active?.value ?? "true"))
    .map((item: any) => {
      const imageUrl =
        item?.mobileImage?.reference?.image?.url ??
        item?.image?.reference?.image?.url ??
        item?.mobileImage?.value ??
        item?.image?.value ??
        "";

      const alt =
        item?.mobileImage?.reference?.image?.altText ??
        item?.image?.reference?.image?.altText ??
        item?.title?.value ??
        undefined;

      const position = Number(
        item?.sortOrder?.value ?? item?.position?.value ?? "0"
      );

      return {
        id: item.id,
        imageUrl,
        linkUrl: item?.link?.value ?? item?.linkUrl?.value ?? undefined,
        alt,
        position: Number.isFinite(position) ? position : 0,
      };
    })
    .filter((banner: BannerMetaobject) => Boolean(banner.imageUrl))
    .sort((a: BannerMetaobject, b: BannerMetaobject) => a.position - b.position);

  if (banners.length > 0) {
    return banners;
  }

  // Fallback: algumas lojas usam um único metaobject com campos banner_1/banner_2/banner_3.
  const groupedBanners: BannerMetaobject[] = nodes
    .flatMap((item: any) => {
      const groupedFields = Array.isArray(item?.fields)
        ? item.fields.filter(
            (field: any) =>
              /^banner_\d+$/i.test(field?.key ?? "") &&
              String(field?.type ?? "").toLowerCase().includes("file_reference")
          )
        : [];

      return groupedFields.map((field: any) => {
        const match = String(field?.key ?? "").match(/(\d+)/);
        const position = Number(match?.[1] ?? "0");

        return {
          id: `${item.id}:${field.key}`,
          imageUrl: field?.reference?.image?.url ?? "",
          alt: field?.reference?.image?.altText ?? field?.key,
          position: Number.isFinite(position) ? position : 0,
        } as BannerMetaobject;
      });
    })
    .filter((banner: BannerMetaobject) => Boolean(banner.imageUrl))
    .sort((a: BannerMetaobject, b: BannerMetaobject) => a.position - b.position);

  if (__DEV__) {
    console.log("[fetchBanners] grouped fallback count:", groupedBanners.length);
  }

  return groupedBanners;
}
