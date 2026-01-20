import Redis from "ioredis";
import crypto from "crypto";
import { AsyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";

let redisClient;
if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on("error", err =>
        console.warn("Redis error (ignored):", err.message)
    );
}

const hashBody = (body) =>
    crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");

const cacheMiddleware = (duration = 300) =>
    AsyncHandler(async (req, res, next) => {
        if (!redisClient) return next();
        if (req.method !== "POST") return next();

        const cacheKey = `ai:${req.path}:${hashBody(req.body)}`;

        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return res
                    .status(200)
                    .json(new ApiResponse(200, JSON.parse(cached), "Cache hit"));
            }

            const originalJson = res.json;
            res.json = function (response) {
                if (response?.data) {
                    redisClient.setex(
                        cacheKey,
                        duration,
                        JSON.stringify(response.data)
                    );
                }
                return originalJson.call(this, response);
            };

            next();
        } catch {
            next();
        }
    });

export { cacheMiddleware };
