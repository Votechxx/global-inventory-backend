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
    s3BucketName: string;
    s3SecretAccessKey: string;
    s3AccessKeyId: string;
    s3Region: string;
};

const config: Record<Environment, Env_Var_Type> = {
    [Environment.DEVELOPMENT]: {
        token: process.env.TOKEN,
        databaseUrl: process.env.DATABASE_URL,
        baseUrl: process.env.BASE_URL_DEV,
        frontUrl: process.env.FRONT_URL_DEV,
        port: process.env.APP_PORT,
        jwtSecret: process.env.JWT_SECRET,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        email: process.env.EMAIL,
        emailPassword: process.env.EMAIL_PASSWORD,
        s3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        s3BucketName: process.env.AWS_S3_BUCKET_NAME,
        s3Region: process.env.AWS_S3_REGION,
    },
    [Environment.TEST]: {
        token: process.env.TOKEN,
        baseUrl: process.env.BASE_URL_TEST,
        databaseUrl: process.env.DATABASE_URL,
        frontUrl: process.env.FRONT_URL_TEST,
        port: process.env.APP_PORT,
        jwtSecret: process.env.JWT_SECRET,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        email: process.env.EMAIL,
        emailPassword: process.env.EMAIL_PASSWORD,
        s3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        s3BucketName: process.env.AWS_S3_BUCKET_NAME,
        s3Region: process.env.AWS_S3_REGION,
    },
    [Environment.PRODUCTION]: {
        token: process.env.TOKEN,
        baseUrl: process.env.BASE_URL_PROD,
        databaseUrl: process.env.DATABASE_URL,
        frontUrl: process.env.FRONT_URL_PROD,
        port: process.env.APP_PORT,
        jwtSecret: process.env.JWT_SECRET,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        email: process.env.EMAIL,
        emailPassword: process.env.EMAIL_PASSWORD,
        s3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        s3BucketName: process.env.AWS_S3_BUCKET_NAME,
        s3Region: process.env.AWS_S3_REGION,
    },
};

export const ENV_VARIABLES: Env_Var_Type = config[environment];
