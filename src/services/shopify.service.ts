import { shopifyClient } from "@/lib/shopify";
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_COLLECTIONS,
  GET_COLLECTION_PRODUCTS,
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
} from "@/lib/queries";
import type { Product, Collection, Cart, PageInfo } from "@/types/shopify";

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
