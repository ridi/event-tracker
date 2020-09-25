import { loadGTag } from '../../utils/externalServices';
import { BaseTracker, PageMeta } from '../base';
import { Product, PurchaseInfo } from '../../ecommerce/model';

export interface GTagOptions {
  trackingId: string;
  autoPageView?: boolean;
  defaultCurrency?: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

export class GTagTracker extends BaseTracker {
  constructor(private options: GTagOptions) {
    super();
    options.defaultCurrency = options.defaultCurrency || 'KRW';
  }

  public async initialize(): Promise<void> {
    await loadGTag(this.options.trackingId);
    gtag('config', this.options.trackingId, {
      send_page_view: this.options.autoPageView,
    });
    gtag('set', { currency: this.options.defaultCurrency });
  }

  public isInitialized(): boolean {
    return typeof gtag === 'function';
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    gtag('event', 'page_view', {
      page_location: pageMeta.href,
      page_path: pageMeta.path,
      page_title: pageMeta.page,
    });
  }

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {
    gtag('event', name, data);
  }

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {
    gtag('event', 'add_payment_info');
  }

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {
    gtag('event', 'sign_up', {
      method: 'ridi',
    });
  }

  public sendImpression(items: Product[], ts?: Date): void {
    this.sendItemView(items, ts);
  }

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendAddToCart(items: Product[], ts?: Date): void {
    gtag('event', 'add_to_cart', {
      value: items.map(p => p.price).reduce((pre, cur) => pre + cur),
      items,
    });
  }

  public sendClick(items: Product[], ts?: Date): void {}

  public sendItemView(items: Product[], ts?: Date): void {
    gtag('event', 'view_item', { items });
  }

  public sendItemViewFromList(items: Product[], ts?: Date): void {
    gtag('event', 'view_item_list', { items });
  }

  public sendPurchase(
    purchaseInfo: PurchaseInfo,
    items: Product[],
    ts?: Date,
  ): void {
    gtag('event', 'purchase', {
      purchaseInfo,
      items,
    });
  }

  public sendRefund(
    purchaseInfo: PurchaseInfo,
    items: Product[],
    ts?: Date,
  ): void {
    gtag('event', 'refund', {
      purchaseInfo,
      items,
    });
  }

  public sendRemoveFromCart(items: Product[], ts?: Date): void {
    gtag('event', 'remove_from_cart', {
      value: items.map(p => p.price).reduce((pre, cur) => pre + cur),
      items,
    });
  }

  public sendSearch(searchTerm: string, ts?: Date): void {}
}
