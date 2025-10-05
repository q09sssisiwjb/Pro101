import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

if (process.env.NODE_ENV === 'development' && process.env.REPL_ID) {
  class CustomWebSocket extends ws {
    constructor(url: string, protocols?: string | string[], options?: ws.ClientOptions) {
      const customOptions = {
        ...options,
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      };
      super(url, protocols, customOptions);
    }
  }
  neonConfig.webSocketConstructor = CustomWebSocket;
}

let pool: Pool | null = null;
let db: any = null;

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Using internal storage only.');
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
