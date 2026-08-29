import { writable, derived } from 'svelte/store';
import type { CartItem, BookingState } from '$lib/types';
import { browser } from '$app/environment';

const STORAGE_KEY = 'handymandy_booking_draft';

const initialBookingState: BookingState = {
  items: [],
  locationId: null,
  includeInstallation: true,
  includeHub: false,
  scheduledDate: null,
  notes: null
};

function createBookingStore() {
  let savedState = initialBookingState;

  if (browser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedState = { ...initialBookingState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to restore booking store from localStorage:', e);
    }
  }

  const { subscribe, set, update } = writable<BookingState>(savedState);

  // Sync to localStorage on every change
  if (browser) {
    subscribe((state) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to sync booking store to localStorage:', e);
      }
    });
  }

  return {
    subscribe,
    set,
    update,
    addItem: (product: Omit<CartItem, 'quantity'>, qty = 1) => {
      update((state) => {
        const existingIndex = state.items.findIndex((item) => item.productId === product.productId);
        if (existingIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIndex].quantity += qty;
          return { ...state, items: updatedItems };
        } else {
          return {
            ...state,
            items: [...state.items, { ...product, quantity: qty }]
          };
        }
      });
    },
    removeItem: (productId: string) => {
      update((state) => ({
        ...state,
        items: state.items.filter((item) => item.productId !== productId)
      }));
    },
    updateQuantity: (productId: string, quantity: number) => {
      update((state) => {
        if (quantity <= 0) {
          return {
            ...state,
            items: state.items.filter((item) => item.productId !== productId)
          };
        }
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        };
      });
    },
    setLocation: (locationId: string) => {
      update((state) => ({ ...state, locationId }));
    },
    setInstallationOptions: (options: { includeInstallation?: boolean; includeHub?: boolean }) => {
      update((state) => ({
        ...state,
        includeInstallation: options.includeInstallation ?? state.includeInstallation,
        includeHub: options.includeHub ?? state.includeHub
      }));
    },
    setSchedule: (scheduledDate: string | null, notes: string | null) => {
      update((state) => ({ ...state, scheduledDate, notes }));
    },
    reset: () => {
      set(initialBookingState);
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };
}

export const bookingStore = createBookingStore();

// Derived store for quick summary statistics
export const bookingSummary = derived(bookingStore, ($booking) => {
  const totalItemsCount = $booking.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = $booking.items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const hasHubRequiredProduct = $booking.items.some((item) => item.requiresHub);

  // Pricing constants (defaults in IDR)
  const installationFee = $booking.includeInstallation ? totalItemsCount * 150000 : 0;
  const hubFee = $booking.includeHub ? 450000 : 0;
  const totalAmount = subtotal + installationFee + hubFee;

  return {
    totalItemsCount,
    subtotal,
    hasHubRequiredProduct,
    installationFee,
    hubFee,
    totalAmount
  };
});
