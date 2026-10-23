import { IIssueType } from '@repo/types';
import { Expose, Type } from 'class-transformer';

export class IssueTypeResponseDto implements IIssueType {
  @Expose()
  issueTypeId!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  rmReferenceId!: string | null;

  @Expose()
  companyId!: string | null;

  @Expose()
  parentIssueTypeId?: string | null;

  // 🌲 Recursive branch collection array (extends your contract layout format)
  @Expose()
  @Type(() => IssueTypeResponseDto)
  children: IssueTypeResponseDto[] = [];
}
