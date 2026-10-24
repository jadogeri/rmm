export function readODataField<T = any>(record: Record<string, unknown> | null | undefined, field: string): T | undefined {
  if (!record) return undefined;
  const pascalField = field.length ? field[0].toUpperCase() + field.slice(1) : field;
  const key = Object.prototype.hasOwnProperty.call(record, field)
    ? field
    : Object.prototype.hasOwnProperty.call(record, pascalField)
      ? pascalField
      : undefined;
  return key === undefined ? undefined : record[key] as T | undefined;
}
