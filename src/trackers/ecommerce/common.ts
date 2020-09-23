export interface Trackable {
  section: string;
  sectionFull: string;
  objId: string;
  position: number;
  genreEng: string;
  genreKor: string;
  tags: Tag;
  isLastItem: boolean;
  recommendId: number;
}

export interface Tag {
  name: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;
  receiptId: number;
  receiptTitle: string;
}

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
