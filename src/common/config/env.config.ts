import { Environment } from '../enums/environment.enum';

export const environment = process.env.NODE_ENV || Environment.DEVELOPMENT;
export const isProduction = environment === Environment.PRODUCTION;

type Env_Var_Type = {
    token: string | number;
    baseUrl: string | number;
    frontUrl: string | number;
    port: string | number;
    jwtSecret: string | number;
    emailHost: string | number;
    emailPort: string | number;
    email: string | number;
    emailPassword: string | number;
    databaseUrl: string | number;
};

const config: Record<Environment, Env_Var_Type> = {
    [Environment.DEVELOPMENT]: {
        token: process.env.TOKEN,
        databaseUrl: process.env.DATABASE_URL,
        baseUrl: process.env.BASE_URL_DEV,
        frontUrl: process.env.FRONT_URL_DEV,
        port: process.env.PORT,
        jwtSecret: process.env.JWT_SECRET,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        email: process.env.EMAIL,
        emailPassword: process.env.EMAIL_PASSWORD,
    },
    [Environment.TEST]: {
        token: process.env.TOKEN,
        baseUrl: process.env.BASE_URL_TEST,
        databaseUrl: process.env.DATABASE_URL,
        frontUrl: process.env.FRONT_URL_TEST,
        port: process.env.PORT,
        jwtSecret: process.env.JWT_SECRET,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        email: process.env.EMAIL,
        emailPassword: process.env.EMAIL_PASSWORD,
    },
    [Environment.PRODUCTION]: {
        token: process.env.TOKEN,
        baseUrl: process.env.BASE_URL_PROD,
        databaseUrl: process.env.DATABASE_URL,
        frontUrl: process.env.FRONT_URL_PROD,
        port: process.env.PORT,
        jwtSecret: process.env.JWT_SECRET,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        email: process.env.EMAIL,
        emailPassword: process.env.EMAIL_PASSWORD,
    },
};

export const ENV_VARIABLES: Env_Var_Type = config[environment];
