import { Currency, ServiceType } from '../constants';
import { Promotion } from './promotion';

export interface Item extends Partial<Promotion> {
  readonly item_id: string;
  readonly item_name: string;
  readonly item_repr_id?: string;
  readonly item_repr_name?: string;
  readonly service_type: ServiceType;
  readonly author_id?: number;
  readonly author: string;
  readonly item_provider_id: number;
  readonly item_provider_name: string;
  readonly item_category: string;
  readonly item_genre?: string;
  readonly coupon?: string;
  readonly discount?: number;
  readonly price?: number;
  readonly currency?: Currency;
  readonly index?: number;
  readonly item_list_id?: string;
  readonly item_list_name?: string;
}
