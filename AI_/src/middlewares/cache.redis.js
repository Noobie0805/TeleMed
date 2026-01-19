import Redis from 'ioredis';
import { AsyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const cacheMiddleware = (duration = 300) => AsyncHandler(async (req, res, next) => {  // Fix: Arrow function syntax
    const cacheKey = `ai:${req.path}:${JSON.stringify(req.body)}`;

    try {
        const cachedResponse = await redisClient.get(cacheKey);
        if (cachedResponse) {
            return res.status(200).json(new ApiResponse(200, JSON.parse(cachedResponse), "Cache hit"));
        }

        // Cache successful responses
        const originalJson = res.json;
        res.json = function (data) {
            redisClient.setex(cacheKey, duration, JSON.stringify(data));  // function() scope
            originalJson.call(this, data);
        };

        next();
    } catch (error) {
        console.error('Redis cache error:', error.message);  // Log but don't fail
        next();  // Graceful degradation
    }
});

export { cacheMiddleware };
