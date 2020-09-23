export interface Tag {
  name: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;
  receiptId: number;
  receiptTitle: string;
}

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
