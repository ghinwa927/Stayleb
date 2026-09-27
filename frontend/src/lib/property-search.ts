import type { PropertySearchParams } from '@/services/properties';

export const searchSorts = ['recommended', 'price_low', 'price_high', 'newest'] as const;

export function propertySearchQuery(params: PropertySearchParams): string {
  const query = new URLSearchParams();
  const fields = ['location', 'check_in', 'check_out', 'guests', 'min_price', 'max_price', 'property_type', 'bedrooms', 'bathrooms', 'beds', 'sort', 'page', 'page_size'] as const;
  for (const field of fields) {
    const value = params[field];
    if (value !== undefined && value !== '') query.set(field, String(value));
  }
  for (const id of params.amenity_ids ?? []) query.append('amenity_ids', String(id));
  return query.toString();
}

export function readPropertySearch(query: URLSearchParams): PropertySearchParams {
  const params: PropertySearchParams = {};
  const location = query.get('location')?.trim();
  if (location) params.location = location;
  for (const field of ['check_in', 'check_out'] as const) {
    const value = query.get(field);
    if (value) params[field] = value;
  }
  for (const field of ['guests', 'min_price', 'max_price', 'bedrooms', 'bathrooms', 'beds', 'page', 'page_size'] as const) {
    const value = query.get(field);
    if (!value?.trim()) continue;
    const number = Number(value);
    const price = field === 'min_price' || field === 'max_price';
    const min = price || field === 'bedrooms' ? 0 : 1;
    if (Number.isFinite(number) && number >= min && (price || Number.isInteger(number))) {
      params[field] = field === 'page_size' ? Math.min(50, number) : number;
    }
  }
  const type = query.get('property_type');
  if (type === 'chalet' || type === 'furnished_house') params.property_type = type;
  const sort = query.get('sort');
  params.sort = searchSorts.find(value => value === sort) ?? 'recommended';
  params.page ??= 1;
  params.page_size ??= 12;
  params.amenity_ids = [...new Set(query.getAll('amenity_ids').map(Number).filter(id => Number.isInteger(id) && id > 0))];
  return params;
}

export function searchValidation(params: PropertySearchParams): string | null {
  if (Boolean(params.check_in) !== Boolean(params.check_out)) return 'Choose both check-in and check-out dates, or clear both.';
  if (params.check_in && params.check_out) {
    for (const value of [params.check_in, params.check_out]) {
      const parsed = new Date(`${value}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return 'Choose valid stay dates.';
    }
    if (params.check_out <= params.check_in) return 'Check-out must be after check-in.';
  }
  if (params.min_price !== undefined && params.max_price !== undefined && params.min_price > params.max_price) return 'Maximum price must be at least the minimum price.';
  return null;
}

export function propertyDetailsHref(id: number, params: PropertySearchParams = {}): string {
  const query = propertySearchQuery({ check_in: params.check_in, check_out: params.check_out, guests: params.guests });
  return `/properties/${id}${query ? `?${query}` : ''}`;
}
