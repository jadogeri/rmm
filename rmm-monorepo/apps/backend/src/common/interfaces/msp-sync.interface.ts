// packages/types/src/index.ts

export interface IMspSyncer {
  /**
   * Universal method execution hook to pull live records from the 
   * external MSP Manager OData API and upsert them safely into Docker.
   */
  syncFromMsp(): Promise<void>;
}
