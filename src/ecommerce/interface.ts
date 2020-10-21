import { PaymentInfo, Item, Promotion, PurchaseInfo, UIElement } from './model';

export interface EcommerceTracker {
  sendStartSubscription(args?: Record<string, unknown>, ts?: Date): void;

  /**
   * @deprecated Use sendItemViewFromList instead.
   * @see sendItemViewFromList
   */

  sendImpression(items: Item[], ts?: Date): void;

  sendItemView(items: Item[], ts?: Date): void;

  sendItemViewFromList(items: Item[], ts?: Date): void;

  sendClick(items: UIElement[], ts?: Date): void;

  sendAddPaymentInfo(payInfo: PaymentInfo, items: Item[], ts?: Date): void;

  sendPurchase(purchaseInfo: PurchaseInfo, items: Item[], ts?: Date): void;

  sendRefund(purchaseInfo: PurchaseInfo, items: Item[], ts?: Date): void;

  sendAddToCart(items: Item[], ts?: Date): void;

  sendRemoveFromCart(items: Item[], ts?: Date): void;

  sendSearch(searchTerm: string, ts?: Date): void;

  sendViewPromotion(promotion: Promotion, items?: [Item][], ts?: Date): void;
}
