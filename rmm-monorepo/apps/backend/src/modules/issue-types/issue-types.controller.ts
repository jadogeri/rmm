import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IssueTypesService } from './issue-types.service';
import { IssueTypeResponseDto } from './dto/issue-types-response.dto';

@Controller('issue-types')
export class IssueTypesController {
  constructor(private readonly issueTypesService: IssueTypesService) {}

  /**
   * 🟢 HTTP GET: Returns your fully pre-structured tree hierarchy array instantly out of local storage cache
   * Route: GET /issue-types
   */
  @Get()
  async getIssueTypes(): Promise<IssueTypeResponseDto[]> {
    return await this.issueTypesService.getIssueTypes();
  }


  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    return await this.issueTypesService.syncAllIssueTypesFromMsp();
  }
}
