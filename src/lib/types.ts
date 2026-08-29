export interface CartItem {
  productId: string;
  name: string;
  basePrice: number;
  imageUrl: string | null;
  requiresHub: boolean;
  category: string;
  quantity: number;
}

export interface BookingState {
  items: CartItem[];
  locationId: string | null;
  includeInstallation: boolean;
  includeHub: boolean;
  scheduledDate: string | null;
  notes: string | null;
}

export interface LocationModel {
  id: string;
  userId: string;
  label: string | null;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
}
