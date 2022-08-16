declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      RUNTIME_ENV?: 'local' | 'dev' | 'acc' | 'pro';
    }
  }
}

export {};
