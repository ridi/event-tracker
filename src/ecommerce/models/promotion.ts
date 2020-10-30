export interface Promotion {
  readonly promotion_id: string;
  readonly promotion_name: string;
  readonly creative_name?: string;
  readonly creative_slot?: number;
}
