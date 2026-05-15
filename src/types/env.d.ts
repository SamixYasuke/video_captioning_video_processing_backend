declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    REDIS_URL: string;
    NODE_ENV: "development" | "production" | (string & {});
    MONGODB_DEV_URI: string;
    MONGODB_PROD_URI: string;
    API_BASE_URL: string;
  }
}
