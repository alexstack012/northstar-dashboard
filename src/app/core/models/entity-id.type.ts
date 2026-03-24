export type EntityId = string | number;

export function toEntityKey(id: EntityId): string {
  return String(id);
}
