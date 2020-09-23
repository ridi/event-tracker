import {
  Archiveable,
  Clickable,
  EcommerceTracker,
  Purchasable,
  Displayable,
} from './common';
import { Trackable } from './legacy';

export class Impression implements Clickable, Displayable {
  public static from(trackable: Trackable): Impression {
    return new Impression(
      trackable.objId,
      trackable.tags.name,
      trackable.sectionFull,
      trackable.tags.brand,
      trackable.tags.category,
      null,
      trackable.position + 1,
    );
  }

  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly list?: string,
    public readonly brand?: string,
    public readonly category?: string,
    public readonly variant?: string,
    public readonly position?: number,
    public readonly price?: number,
  ) {}

  public click(): void {
    ga('ec:addProduct', this);
    ga('ec:setAction', 'click', { list: this.list });

    ga('send', 'event', 'click', this.toString().toLowerCase(), this.list);
  }

  public display(isLastItem = false): void {
    GAHelper.addImpression(this);
    if (isLastItem) {
      ga('send', 'event', 'display', this.toString().toLowerCase(), this.list);
    }
  }
}

export class Product implements Archiveable, Displayable, Purchasable {
  public static from(trackable: Trackable): Product {
    return new Product(
      trackable.objId,
      trackable.tags.name,
      trackable.tags.quantity,
      trackable.tags.price,
      trackable.tags.category,
      null,
      trackable.tags.brand,
      null,
      trackable.position + 1,
    );
  }

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly brand?: string,
    public readonly category?: string,
    public readonly variant?: string,
    public readonly coupon?: string,
    public readonly position?: number,
  ) {}

  display(isLastItem = false): void {
    GAHelper.addProduct(this);
    GAHelper.setAction('detail');
    if (isLastItem) {
      // TODO: Replace section_full

      ga('send', 'event', 'product', 'display', 'section_full');
    }
  }

  public purchase(): void {
    GAHelper.addProduct(this);
  }

  public add(to: 'cart' | 'wishlist'): void {
    GAHelper.addProduct(this);
    GAHelper.setAction('add');
    ga('send', 'event', to, 'click', 'section_full');
  }

  public remove(from: 'cart' | 'wishlist'): void {
    GAHelper.addProduct(this);
    GAHelper.setAction('remove');
    ga('send', 'event', from, 'click', 'section_full');
  }
}

export class Promotion implements Clickable, Displayable {
  public static from(trackable: Trackable): Promotion {
    return new Promotion(
      trackable.objId,
      `[${trackable.genreKor}]${trackable.section}_${trackable.tags.name}`,
      trackable.sectionFull,
      trackable.position,
    );
  }

  constructor(
    public readonly id?: string,
    public readonly name?: string,
    public readonly creative?: string,
    public readonly position?: number,
  ) {}

  click(): void {
    GAHelper.addPromotion(this);
    GAHelper.setAction('promo_click');
  }

  display(isLastItem = false): void {
    GAHelper.addPromotion(this);
    GAHelper.setAction('promo_click');

    if (isLastItem) {
      ga(
        'send',
        'event',
        this.toString().toLowerCase(),
        'display',
        'section_full',
      );
    }
  }
}

export class GAEcommerceTracker implements EcommerceTracker {
  sendClick(...items: Clickable[]): void {
    items.forEach(it => it.click());
  }

  sendDisplay(...items: Displayable[]): void {
    items.forEach((it, idx) => {
      const isLastItem = idx === items.length - 1;
      it.display(isLastItem);
    });
  }

  sendPurchase(tId: string, ...items: Purchasable[]): void {
    let totalRevenue = 0;

    items.forEach(it => {
      it.purchase();
      totalRevenue += it.quantity > 0 ? it.price : 0;
    });

    GAHelper.setAction('purchase', { id: tId, revenue: totalRevenue });
    GAHelper.sendEvent('purchase', 'event', 'section_full');
    ga('send', 'event', 'purchase', 'event', 'section_full');
  }

  sendRemove(from: 'cart' | 'wishlist', ...items: Archiveable[]): void {
    items.forEach(it => {
      it.remove(from);
    });
  }

  sendAdd(to: 'cart' | 'wishlist', ...items: Archiveable[]): void {
    items.forEach(it => {
      it.add(to);
    });
  }
}

class GAHelper {
  public static addProduct(product: Product): void {
    ga('ec:addProduct', product);
  }

  public static addPromotion(promotion: Promotion): void {
    ga('ec:addPromo', promotion);
  }

  public static addImpression(impression: Impression): void {
    ga('ec:addImpression', impression);
  }

  public static setAction(action: string, ...args: Record<string, unknown>[]) {
    ga('ec:setAction', action, ...args);
  }

  public static sendEvent(...args: any[]) {
    ga('send', 'event', ...args);
  }
}
