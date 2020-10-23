import _ from 'lodash';

export function convertKeyToSnakeCase(obj: Record<any, any>): Record<any, any> {
  return _.mapKeys(obj, (v, k) => _.snakeCase(k));
}
