import { HttpModuleOptions } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

interface EnvironmentVariables {
  HELP_DESK_URL: string;
  HELP_DESK_API_KEY: string;
  API_TIMEOUT: string | number;
}

export const axiosConfigFactory = (
  configService: ConfigService<EnvironmentVariables, true>,
): HttpModuleOptions => {
  const baseUrl = configService.get('HELP_DESK_URL', 'https://api.mspmanager.com/odata/', {
    infer: true,
  });

  const apiKey = configService.get('HELP_DESK_API_KEY', '', {
    infer: true,
  });

  const timeoutVal = configService.get('API_TIMEOUT', 10000, {
    infer: true,
  });

  console.log('Axios config:', { baseUrl, apiKey, timeoutVal });

  return {
    baseURL: baseUrl,
    timeout: typeof timeoutVal === 'number' ? timeoutVal : parseInt(timeoutVal, 10) || 10000,
    headers: {
      'Content-Type': 'application/json',
      // 👇 Mirror the exact Accept string payload required by MSP Manager's Swagger layout
      Accept: 'application/json;odata.metadata=minimal;odata.streaming=true',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    },
    // Fixes the "self-signed certificate in certificate chain" crash locally
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };
};
