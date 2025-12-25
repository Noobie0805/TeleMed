import { AsyncHandler } from '../../utils/AsyncHandler.js';
import User from '../../models/users.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        const { accessToken, refreshToken, refreshTokenExpiry } = user.generateTokens();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiry = refreshTokenExpiry;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Token generation failed');
    }
};

// REGISTER _______________________________________________________________________
const registerUser = AsyncHandler(async (req, res) => {
    const { name, email, password, phone, age, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'Email already registered');
    }

    const user = await User.create({
        email,
        password,
        role: 'patient',
        profile: { name, phone, age, gender }
    });

    const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Not always secure in dev
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };


    const responseData = new ApiResponse(201, {
        user: createdUser,
        tokens: { accessToken, refreshToken }
    }, "Patient registered successfully!");

    return res.status(201)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(responseData);
});

// LOGIN _______________________________________________________________________
const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)) || !user.isActive) { // Instance method
        throw new ApiError(401, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000 // 15min for access
    };

    const responseData = new ApiResponse(200, {
        user: loggedInUser,
        tokens: { accessToken, refreshToken }
    }, "User logged in successfully!");

    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json(responseData);
});

// REFRESH ACCESS TOKEN _________________________________________________________
const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, 'Refresh token required');
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, 'Refresh token malformed or expired');
    }

    const user = await User.findById(decodedToken.userId).select('+refreshToken +refreshTokenExpiry');
    if (!user) {
        throw new ApiError(404, 'User not found for refresh token');
    }
    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(403, 'Refresh token mismatch');
    }
    if (new Date() > user.refreshTokenExpiry) {
        throw new ApiError(403, 'Refresh token expired');
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    return res.status(200)
        .cookie('accessToken', accessToken, { ...options, maxAge: 15 * 60 * 1000 })
        .cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(200, { accessToken, refreshToken }, 'Access token refreshed'));
});

// LOGOUT _______________________________________________________________________
const logoutUser = AsyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        refreshToken: null,
        refreshTokenExpiry: null
    }, { validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    };

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);

    return res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
});



export { registerUser, loginUser, logoutUser, refreshAccessToken };
