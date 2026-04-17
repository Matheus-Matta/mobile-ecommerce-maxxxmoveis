import { create } from "zustand";
import type { Customer } from "@/types/shopify";
import { shopifyClient } from "@/lib/shopify";
import {
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_CREATE,
  GET_CUSTOMER,
} from "@/lib/queries";

interface AuthState {
  customer: Customer | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  fetchCustomer: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  accessToken: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data, errors } = await shopifyClient.request(
        CUSTOMER_ACCESS_TOKEN_CREATE,
        { variables: { input: { email, password } } }
      );
      if (errors) throw new Error(errors.message);

      const tokenErrors =
        data?.customerAccessTokenCreate?.customerUserErrors ?? [];
      if (tokenErrors.length) throw new Error(tokenErrors[0].message);

      const token =
        data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
      set({ accessToken: token });
      await get().fetchCustomer();
    } finally {
      set({ loading: false });
    }
  },

  register: async (firstName, lastName, email, password) => {
    set({ loading: true });
    try {
      const { data, errors } = await shopifyClient.request(CUSTOMER_CREATE, {
        variables: { input: { firstName, lastName, email, password } },
      });
      if (errors) throw new Error(errors.message);

      const customerErrors =
        data?.customerCreate?.customerUserErrors ?? [];
      if (customerErrors.length) throw new Error(customerErrors[0].message);

      // Auto-login after register
      await get().login(email, password);
    } finally {
      set({ loading: false });
    }
  },

  logout: () => set({ customer: null, accessToken: null }),

  fetchCustomer: async () => {
    const { accessToken } = get();
    if (!accessToken) return;

    const { data, errors } = await shopifyClient.request(GET_CUSTOMER, {
      variables: { customerAccessToken: accessToken },
    });
    if (errors) throw new Error(errors.message);
    set({ customer: data?.customer ?? null });
  },
}));
