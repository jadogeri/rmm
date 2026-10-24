type ODataRecord = Record<string, unknown>;

export function readODataField<T = unknown>(
  record: ODataRecord | null | undefined,
  field: string,
): T | undefined {
  if (!record) return undefined;

  const pascalField = field.length ? field[0].toUpperCase() + field.slice(1) : field;
  const key = Object.prototype.hasOwnProperty.call(record, field)
    ? field
    : Object.prototype.hasOwnProperty.call(record, pascalField)
      ? pascalField
      : undefined;

  return key === undefined ? undefined : (record[key] as T | undefined);
}

export function readRequiredODataField<T>(
  record: ODataRecord | null | undefined,
  field: string,
): T {
  const value = readODataField<T | null>(record, field);
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    throw new Error('Missing required MSP OData field: ' + field);
  }
  return value;
}
