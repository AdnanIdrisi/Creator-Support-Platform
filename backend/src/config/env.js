import "dotenv/config";

const REQUIRED = [ "MONGODB_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET" ];

const missing = REQUIRED.filter((key) => !process.env[ key ]);
if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const port = Number(process.env.PORT ?? 8000);
if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
}

/**
 * Validated, frozen application configuration.
 * @type {Readonly<{
 *   NODE_ENV: string,
 *   PORT: number,
 *   MONGODB_URI: string,
 *   ACCESS_TOKEN_SECRET: string,
 *   REFRESH_TOKEN_SECRET: string,
 *   isProduction: boolean
 * }>}
 */
export const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: port,
    MONGODB_URI: process.env.MONGODB_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    isProduction: process.env.NODE_ENV === "production",
});
