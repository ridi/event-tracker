import { PurchaseInfo } from './models/transaction';
import { Item, Promotion } from './models';

export interface EcommerceTracker {
  sendStartSubscription(args?: Record<string, unknown>, ts?: Date): void;

  /**
   * @deprecated Use sendItemViewFromList instead.
   * @see sendItemViewFromList
   */

  sendImpression(items: Item[], ts?: Date): void;

  sendItemView(items: Item[], ts?: Date): void;

  sendItemViewFromList(items: Item[], ts?: Date): void;

  sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void;

  sendBeginCheckout(purchaseInfo: PurchaseInfo, ts?: Date): void;

  sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void;

  sendRefund(purchaseInfo: PurchaseInfo, items: Item[], ts?: Date): void;

  sendAddToCart(items: Item[], ts?: Date): void;

  sendRemoveFromCart(items: Item[], ts?: Date): void;

  sendSearch(searchTerm: string, ts?: Date): void;

  sendViewPromotion(promotion: Promotion, items?: Item[], ts?: Date): void;
}
