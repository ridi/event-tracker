/**
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs/enhanced-ecommerce#action-data
 */

export interface PurchaseInfo {
  readonly id: string;
  readonly affiliation?: string;
  readonly tax?: number;
  readonly shipping?: number;
  readonly checkoutOption?: string;
}

/**
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs/enhanced-ecommerce#product-data
 */

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand?: string;
  readonly category?: string;
  readonly variant?: string;
  readonly price?: number;
  readonly quantity?: number;
  readonly coupon?: string;
  readonly listPosition?: number;
}

/**
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs/enhanced-ecommerce#promotion-data
 */
export interface Promotion {
  readonly id?: string;
  readonly name?: string;
  readonly creativeName?: string;
  readonly positionSlot?: number;
}

/**
 * @example carousel, banner
 */

export interface UIElement {
  readonly section: string;
}

export interface PaymentInfo {
  readonly coupon?: string;
  readonly paymentType: string;
  readonly value: number;
}
