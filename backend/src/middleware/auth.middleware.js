import jwt from 'jsonwebtoken';
import { User } from '../models/users.js';
import { ApiError } from '../utils/apiError.js';
import { AsyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = AsyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token || typeof token !== "string") {
        throw new ApiError(401, "Access token required");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken.userId).select('-password');
    if (!user || !user.isActive) {
        throw new ApiError(401, "Invalid token or inactive user");
    }

    req.user = user;
    req.accessToken = token; // For logout/blacklisting
    next();
});

// Refresh token verification
export const verifyRefreshJWT = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken ||
        req.body.refreshToken ||
        req.header("x-refresh-token");

    if (!refreshToken || typeof refreshToken !== "string") {
        throw new ApiError(401, "Refresh token required");
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken.userId).select('+refreshToken refreshTokenExpiry');

    if (!user ||
        user.refreshToken !== refreshToken ||
        new Date() > user.refreshTokenExpiry) {
        throw new ApiError(403, "Invalid refresh token");
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
});

// Role-based authorization
export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, `Role ${req.user.role} not authorized for this action`);
        }
        next();
    });
};

// Doctor verification check
export const verifyDoctor = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'doctor' || req.user.verificationStatus !== 'verified') {
        throw new ApiError(403, "Only verified doctors can perform this action");
    }
    next();
});
