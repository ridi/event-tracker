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

export interface Archiveable<T> {
  add(to: T): void;
  remove(from: T): void;
}

export interface EcommerceTracker {
  sendClick(...items: Clickable[]): void;

  sendPurchase(tId: string, ...items: Purchasable[]): void;

  sendDisplay(...items: Displayable[]): void;
}
