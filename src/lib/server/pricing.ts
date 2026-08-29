import { prisma } from '$lib/server/db';

export const PRICING_CONFIG = {
  INSTALLATION_FEE_PER_DEVICE: 150_000, // IDR 150,000 per unit
  SMART_HUB_UNIT_PRICE: 450_000         // IDR 450,000 for standard Zigbee Hub
};

export interface PricingBreakdown {
  items: Array<{
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    itemTotal: number;
    requiresHub: boolean;
  }>;
  subtotal: number;
  totalDeviceUnits: number;
  requiresHubAny: boolean;
  includeInstallation: boolean;
  includeHub: boolean;
  installationFee: number;
  hubFee: number;
  additionalFees: number;
  totalAmount: number;
}

export async function calculateOrderPricing(params: {
  rawItems: Array<{ productId: string; quantity: number }>;
  includeInstallation: boolean;
  includeHub: boolean;
}): Promise<PricingBreakdown> {
  if (!params.rawItems || params.rawItems.length === 0) {
    throw new Error('Cart cannot be empty');
  }

  const productIds = params.rawItems.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true }
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  let totalDeviceUnits = 0;
  let requiresHubAny = false;

  const itemBreakdown = params.rawItems.map((raw) => {
    const product = productMap.get(raw.productId);
    if (!product) {
      throw new Error(`Product with ID ${raw.productId} is invalid or no longer active`);
    }
    const quantity = Math.max(1, Math.floor(raw.quantity));
    const itemTotal = product.basePrice * quantity;
    subtotal += itemTotal;
    totalDeviceUnits += quantity;
    if (product.requiresHub) requiresHubAny = true;

    return {
      productId: product.id,
      name: product.name,
      unitPrice: product.basePrice,
      quantity,
      itemTotal,
      requiresHub: product.requiresHub
    };
  });

  // Calculate Installation Fee
  const installationFee = params.includeInstallation
    ? totalDeviceUnits * PRICING_CONFIG.INSTALLATION_FEE_PER_DEVICE
    : 0;

  // Calculate Hub Fee (if requested by user)
  const hubFee = params.includeHub ? PRICING_CONFIG.SMART_HUB_UNIT_PRICE : 0;

  const additionalFees = installationFee + hubFee;
  const totalAmount = subtotal + additionalFees;

  return {
    items: itemBreakdown,
    subtotal,
    totalDeviceUnits,
    requiresHubAny,
    includeInstallation: params.includeInstallation,
    includeHub: params.includeHub,
    installationFee,
    hubFee,
    additionalFees,
    totalAmount
  };
}
