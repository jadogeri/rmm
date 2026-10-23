// 1. Import using the direct file paths inside the same package

import { NodeEnvironment } from ".";

declare global {

    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: NodeEnvironment;
            NEST_API_PORT: string | number;
            HELP_DESK_URL: string;
            HELP_DESK_API_KEY: string;
            
            // Optional: Next.js Client-Side Environment Variables
            NEXT_PUBLIC_APP_URL?: string;

            DB_USERNAME: string;
            DB_PASSWORD: string;
            DB_NAME: string;
            DB_PORT: string;
        }
    }
}

export {};
