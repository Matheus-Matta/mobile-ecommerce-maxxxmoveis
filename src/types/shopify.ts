// ─── Shopify Storefront Types ─────────────────────────────────────────────────

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money;
  };
  featuredImage: Image | null;
  images: { edges: { node: Image }[] };
  variants: { edges: { node: ProductVariant }[] };
  options?: ProductOption[];
  tags: string[];
  vendor?: string;
  availableForSale: boolean;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: Image | null;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: Money;
    product: {
      title: string;
      featuredImage: Image | null;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
  };
  lines: { edges: { node: CartLine }[] };
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  orders: {
    edges: {
      node: {
        id: string;
        orderNumber: number;
        processedAt: string;
        financialStatus: string;
        fulfillmentStatus: string;
        currentTotalPrice: Money;
        lineItems: {
          edges: {
            node: {
              title: string;
              quantity: number;
              variant: {
                price: Money;
                image: Image | null;
              } | null;
            };
          }[];
        };
      };
    }[];
  };
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
