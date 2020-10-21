/* eslint-disable camelcase */

/**
 * @see https://developers.google.com/analytics/devguides/collection/app-web/ecommerce#action_data
 */

import { Currency, ServiceType } from './constants';

export interface PurchaseInfo {
  readonly coupon_name: string;
  readonly coupon: number;
  readonly cash: number;
  readonly point: number;
  readonly currency: Currency;
  readonly transaction_id: string;
  readonly value: number;
  readonly payment_type: string;
}

export interface Promotion {
  readonly promotion_id: string;
  readonly promotion_name: string;
  readonly creative_name?: string;
  readonly creative_slot?: number;
}

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
  readonly item_list_id: string;
  readonly item_list_name: string;
}

/**
 * @example carousel, banner
 */

export interface UIElement {
  readonly section: string;
}

export interface PaymentInfo {
  readonly coupon?: string;
  readonly paymentType: string;
  readonly value: number;
}

/* eslint-enable camelcase */
