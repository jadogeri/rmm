import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IUser } from '@repo/types';
import { UsersEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersMapper } from './users.mapper';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';

@Injectable()
export class UsersService implements IMspSyncer {
  private readonly logger = new Logger(UsersService.name);
  private readonly mapper = new UsersMapper();

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: EntityRepository<UsersEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  
  /**
   * Reads user cache records strictly out of Docker (Fast UI dropdown bindings)
   */
  async getUsers(): Promise<UserResponseDto[]> {
    const entities = await this.userRepository.findAll();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

    /**
   * Looks up a single synchronized user profile using their electronic mailing address
   */
  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    // MikroORM automatically wraps column constraints safely against SQL injection vectors
    const entity = await this.userRepository.findOne({ EmailAddress: email });
    
    if (!entity) {
      return null;
    }

    // Convert the database entity cleanly into your standard documented DTO contract
    return this.mapper.toDomain(entity);
  }


  /**
   * The Ingestion Engine - Fetches live data from the Helpdesk OData Client, 
   * normalizes fields, and executes atomic transaction upserts.
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Triggering full User cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: any[] }>('Users');
      if (!response || !response.value) {
        this.logger.warn('⚠️ Received empty or malformed user metadata payload batch from external API.');
        return;
      }

      const fork = this.userRepository.getEntityManager().fork();
      
      // Map OData PascalCase keys down to your direct shared types IUser contract format
      const externalUsers: IUser[] = response.value.map((item) => ({
        UserId: item.UserId,
        EmailAddress: item.EmailAddress || '',
        FirstName: item.FirstName || '',
        LastName: item.LastName || '',
        Status: item.Status || 'Active',
        Enabled: item.Enabled ?? true,
        LastLogin: item.LastLogin || null,
        PhoneMobile: item.PhoneMobile || null,
        CompanyId: item.CompanyId,
      }));

      // Ingest the mapped records directly using high-speed native database transactions
      const payloadRecords = externalUsers.map((user) => ({
        UserId: user.UserId,
        EmailAddress: user.EmailAddress,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Status: user.Status,
        Enabled: user.Enabled,
        LastLogin: user.LastLogin,
        PhoneMobile: user.PhoneMobile,
        // Relational Fix: Map to object key 'company' so MikroORM resolves column metadata constraints
        company: user.CompanyId || null, 
      }));

      // 🟢 FIXED: Cast to any[] to bypass the strict entity vs relation container type check
      await fork.upsertMany(UsersEntity, payloadRecords as any[]);
      await fork.flush();

      this.logger.log(`🎉 Ingestion complete! Successfully cached [${externalUsers.length}] user application profiles.`);
    } catch (error) {
      this.logger.error('❌ Critical execution crash caught within the target Users data stream.', error);
      throw error;
    }
  }
}
