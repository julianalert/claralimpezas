/** Service ids, in display order. Names/descriptions live in the dictionaries. */
export const serviceIds = [
  "domestica",
  "escritorios",
  "posobra",
  "vidros",
  "estofos",
  "alojamento",
] as const;

export type ServiceId = (typeof serviceIds)[number];

export function isServiceId(value: string): value is ServiceId {
  return (serviceIds as readonly string[]).includes(value);
}
