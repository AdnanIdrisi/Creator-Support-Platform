import Redis from "ioredis";
import { env } from "./env.js";

const redis = new Redis({
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
    password: env.REDIS_PASSWORD,
    tls: {}
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err) => {
    console.log("Redis error:", err.message);
});

export default redis;