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

  sendViewItem(items: Item[], ts?: Date): void;

  sendAddToPreference(items: Item[], ts?: Date): void;

  sendAddToNewBookNotification(items: Item[], ts?: Date): void;

  sendViewContent(item: Item, ts?: Date): void;

  sendViewItemList(items: Item[], ts?: Date): void;

  /**
   * @deprecated
   */
  sendStartSubscription(args?: Record<string, unknown>, ts?: Date): void;

  /**
   * @deprecated Use sendItemViewFList instead.
   * @see sendViewItemList
   */

  sendImpression(items: Item[], ts?: Date): void;

  sendRefund(purchaseInfo: PurchaseInfo, items: Item[], ts?: Date): void;

  sendAddToCart(items: Item[], ts?: Date): void;

  sendRemoveFromCart(items: Item[], ts?: Date): void;

  sendSearch(searchTerm: string, ts?: Date): void;

  sendViewPromotion(promotion: Promotion, items?: Item[], ts?: Date): void;
}
