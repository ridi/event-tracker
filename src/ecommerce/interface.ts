export interface Displayable {
  display(isLastItem: boolean): void;
}

export interface Clickable {
  click(): void;
}

export interface Purchasable {
  readonly price: number;
  readonly quantity: number;
  purchase(): void;
}

export interface Archiveable {
  add(to: 'cart' | 'wishlist'): void;
  remove(from: 'cart' | 'wishlist'): void;
}

export interface EcommerceTracker {
  sendClick(...items: Clickable[]): void;

  sendPurchase(tId: string, ...items: Purchasable[]): void;

  sendDisplay(...items: Displayable[]): void;

  sendAdd(to: 'cart' | 'wishlist', ...items: Archiveable[]): void;

  sendRemove(from: 'cart' | 'wishlist', ...items: Archiveable[]): void;
}
