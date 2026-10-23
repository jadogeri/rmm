// packages/types/src/index.ts
/// <reference path="./global.d.ts" />

// Define your core shared types here
export type NodeEnvironment = 'development' | 'production' | 'test';

export * from './ticket';
export * from './customer';
export * from './location';
export * from './issue-type';
export * from './company';
export * from './ticket-custom-status';



