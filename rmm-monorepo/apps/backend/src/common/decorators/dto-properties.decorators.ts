import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsEmail } from 'class-validator';

/**
 * 📧 Reusable Email Property Decorator Stack
 */
export function IsEmailProperty(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      example: 'john.smith@company.com',
      description: 'Primary electronic mailing address',
      ...options, // Allows overriding name, example, or description dynamically per DTO
    }),
    IsEmail(),
    IsNotEmpty()
  );
}

/**
 * 🔑 Reusable UUID Foreign Key Property Decorator Stack
 */
export function IsUUIDProperty(defaultDescription: string, fallbackExample: string, options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      example: fallbackExample,
      description: defaultDescription,
      ...options, // Dynamically overrides name, example, or description explicitly per field invocation
    }),
    IsUUID(),
    IsNotEmpty()
  );
}

/**
 * 🧑‍💼 Reusable First Name Property Decorator Stack
 */
export function IsFirstNameProperty(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      example: 'John',
      description: 'First name',
      ...options, // Allows overriding name, example, or description dynamically per DTO
    }),
    IsString(),
    IsNotEmpty()
  );
}

/**
 * 🧑‍💼 Reusable Last Name Property Decorator Stack
 */
export function IsLastNameProperty(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      example: 'Smith',
      description: 'Last name',
      ...options, // Allows overriding name, example, or description dynamically per DTO
    }),
    IsString(),
    IsNotEmpty()
  );
}