// apps/backend/src/modules/helpdesk-client/helpdesk-client.service.ts
import { Injectable, Logger, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Autowired, Service } from '../../common/decorators';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Service()
export class HelpdeskClientService {

  private readonly logger = new Logger(HelpdeskClientService.name);

  constructor(
    @Autowired(HttpService) private readonly httpService: HttpService) {}

  // Centralized wrapper for GET requests
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await firstValueFrom(this.httpService.get<T>(url));
      return data;
    } catch (error) {
      this.handleError(`GET request failed for route: ${url}`, error);
    }
  }

  // Centralized wrapper for POST requests
  async post<T>(url: string, payload: unknown): Promise<T> {
    try {
      const { data } = await firstValueFrom(this.httpService.post<T>(url, payload));
      return data;
    } catch (error) {
      this.handleError(`POST request failed for route: ${url}`, error);
    }
  }

  // Centralized wrapper for PATCH requests
  async patch<T>(url: string, payload: unknown): Promise<T> {
    try {
      const { data } = await firstValueFrom(this.httpService.patch<T>(url, payload));
      return data;
    } catch (error) {
      this.handleError(`PATCH request failed for route: ${url}`, error);
    }
  }

  // Centralized wrapper for DELETE requests
  async delete(url: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.delete(url));
    } catch (error) {
      this.handleError(`DELETE request failed for route: ${url}`, error);
    }
  }

  // Enhanced Error Handler to extract raw remote API response payloads
  private handleError(contextMessage: string, error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data; 
      const message = error.message;

      // 🔴 CRITICAL DIAGNOSTIC LOG: This prints the real culprit to your terminal
      this.logger.error(
        `❌ API FAILURE: Status [${status}] | Msg: ${message} | Raw Remote Response: ${JSON.stringify(responseData)}`
      );

      if (status === 404) {
        throw new NotFoundException('Resource not found on remote MSP Manager server.');
      }
    } else {
      this.logger.error(`❌ NON-AXIOS CRASH: ${error}`);
    }
    
    throw new InternalServerErrorException(`${contextMessage}: External Helpdesk API Communication failure.`);
  }
}
