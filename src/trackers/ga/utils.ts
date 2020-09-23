import { Impression, Product, Promotion } from './ecommerce';

export class GAHelper {
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
