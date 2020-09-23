import {
  Archiveable,
  Clickable,
  EcommerceTracker,
  Purchasable,
  Trackable,
  Displayable,
} from './common';

// TODO: sectionName prop 가지고 있는 상위 class, interface 만들기

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

  // TODO: change isLastItem to protected

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
    GAEcommerceHelper.setImpression(this);
    if (isLastItem) {
      ga('send', 'event', 'display', this.toString().toLowerCase(), this.list);
    }
  }
}

export class Product
  implements Archiveable<'cart' | 'wishlist'>, Displayable, Purchasable {
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
    GAEcommerceHelper.addProduct(this);
    GAEcommerceHelper.setAction('detail');
    if (isLastItem) {
      // TODO: Replace section_full

      ga('send', 'event', 'product', 'display', 'section_full');
    }
  }

  public purchase(): void {
    GAEcommerceHelper.addProduct(this);
  }

  public add(to: 'cart' | 'wishlist'): void {
    GAEcommerceHelper.addProduct(this);
    GAEcommerceHelper.setAction('add');
  }

  public remove(from: 'cart' | 'wishlist'): void {
    GAEcommerceHelper.addProduct(this);
    GAEcommerceHelper.setAction('remove');
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
    GAEcommerceHelper.addPromotion(this);
    GAEcommerceHelper.setPromotionClick();
    ga('send', 'event', this.toString().toLowerCase(), 'click', 'section_full');
  }

  display(isLastItem = false): void {
    GAEcommerceHelper.addPromotion(this);
    GAEcommerceHelper.setPromotionClick();

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

export interface ActionMeta {
  id?: string;
  affiliation?: string;
  revenue?: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  list?: string;
  step?: number;
  option?: string;
}

class GAEcommerceHelper {
  public static addProduct(product: Product): void {
    ga('ec:addProduct', product);
  }

  public static addPromotion(promotion: Promotion): void {
    ga('ec:addPromo', promotion);
  }

  public static setImpression(impression: Impression): void {
    ga('ec:addImpression', impression);
  }

  public static setProductClick(obj: Product, meta?: ActionMeta): void {
    ga('ec:setAction', 'click', meta);
  }

  public static setPromotionClick(): void {
    ga('ec:setAction', 'promo_click');
  }

  public static setAddToCart(...obj: Product[]) {
    ga('ec:setAction', 'add');
  }

  public static setAction(action: string, ...args: any[]) {
    ga('ec:setAction', action);
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

    ga('ec:setAction', 'purchase', { id: tId, revenue: totalRevenue });
    ga('send', 'event', 'purchase', 'event', 'section_full');
  }
}
