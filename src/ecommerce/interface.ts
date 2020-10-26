import { PurchaseInfo } from './models/transaction';
import { Item, Promotion } from './models';

export interface EcommerceTracker {
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

  /* TODO: Implement below methods */

  sendScreenView(
    screenName: string,
    previousScreenName: string,
    referrer?: string,
    ts?: Date,
  ): void;

  /**
   * @deprecated Use sendItemViewFromList instead.
   * @see sendViewItemFromList
   */

  sendStartSubscription(args?: Record<string, unknown>, ts?: Date): void;

  sendImpression(items: Item[], ts?: Date): void;

  sendViewItem(items: Item[], ts?: Date): void;

  sendViewItemFromList(items: Item[], ts?: Date): void;

  sendRefund(purchaseInfo: PurchaseInfo, items: Item[], ts?: Date): void;

  sendAddToCart(items: Item[], ts?: Date): void;

  sendRemoveFromCart(items: Item[], ts?: Date): void;

  sendSearch(searchTerm: string, ts?: Date): void;

  sendViewPromotion(promotion: Promotion, items?: Item[], ts?: Date): void;
}
