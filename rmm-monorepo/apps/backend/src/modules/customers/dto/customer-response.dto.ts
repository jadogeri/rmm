import { Expose, Transform } from 'class-transformer';
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CustomerResponseDto {
  @Expose({ name: 'customerId' }) 
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @Expose({ name: 'customerName' }) 
  @IsNotEmpty()
  name!: string;

  @Expose({ name: 'referenceId' }) 
  @IsString()
  @IsOptional()
  referenceCode!: string | null;

  @Expose()
  @IsUUID()
  @IsNotEmpty()
  programLevelId!: string;


  @Expose({ name: 'statusId' }) 
  @IsInt()
  @IsNotEmpty()
  status!: number;

  @Expose()
  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => value ?? null) 
  companyId?: string | null;
}
