export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  order: number;
}

export interface Category {
  id: string;
  cafeId: string;
  name: string;
  order: number;
}

export interface Cafe {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export type AuthState = {
  user: any | null; // Firebase User type
  loading: boolean;
};
