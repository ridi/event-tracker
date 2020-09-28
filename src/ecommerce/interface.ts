import { Product, PurchaseInfo, UIElement } from './model';

export interface EcommerceTracker {
  sendStartSubscription(args?: Record<string, unknown>, ts?: Date): void;

  /**
   * @deprecated Use sendItemView instead.
   * @see sendItemView
   */

  sendImpression(items: Product[], ts?: Date): void;

  sendItemView(items: Product[], ts?: Date): void;

  sendItemViewFromList(items: Product[], ts?: Date): void;

  sendClick(items: UIElement[], ts?: Date): void;

  sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void;

  sendPurchase(purchaseInfo: PurchaseInfo, items: Product[], ts?: Date): void;

  sendRefund(purchaseInfo: PurchaseInfo, items: Product[], ts?: Date): void;

  sendAddToCart(items: Product[], ts?: Date): void;

  sendRemoveFromCart(items: Product[], ts?: Date): void;

  sendSearch(searchTerm: string, ts?: Date): void;
}
