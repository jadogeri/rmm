import { readODataField, readRequiredODataField } from './read-odata-field';

describe('readODataField', () => {
  it('reads camelCase and PascalCase OData properties', () => {
    expect(readODataField<string>({ userId: 'camel-id' }, 'userId')).toBe('camel-id');
    expect(readODataField<string>({ UserId: 'pascal-id' }, 'userId')).toBe('pascal-id');
  });

  it('preserves explicit null and returns undefined when a property is absent', () => {
    expect(readODataField<string | null>({ lastLogin: null }, 'lastLogin')).toBeNull();
    expect(readODataField<string>({}, 'userId')).toBeUndefined();
  });
});

describe('readRequiredODataField', () => {
  it('returns a present required value', () => {
    expect(readRequiredODataField<string>({ UserId: 'user-id' }, 'userId')).toBe('user-id');
  });

  it.each([undefined, null, ''])('throws for a missing or blank required value', (value) => {
    expect(() => readRequiredODataField<string>({ userId: value }, 'userId')).toThrow(
      'Missing required MSP OData field: userId',
    );
  });
});
