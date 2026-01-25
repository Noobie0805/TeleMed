import { AsyncHandler } from '../../utils/asyncHandler.js';
import User from '../../models/users.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';
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

    // Cookie options for cross-origin support
    // sameSite: "none" requires secure: true
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS required in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin in production
    };


    const responseData = new ApiResponse(201, {
        user: createdUser,
        tokens: { accessToken }
    }, "Patient registered successfully!");

    return res.status(201)
        .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
        .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 minutes
        .json(responseData);
});

// LOGIN _______________________________________________________________________
const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (user) {
        console.log("User found:", user.email);
    }
    if (!user || !(await user.comparePassword(password)) || !user.isActive) { // Instance method
        throw new ApiError(401, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options for cross-origin support
    // sameSite: "none" requires secure: true
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS required in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin in production
    };

    const responseData = new ApiResponse(200, {
        user: loggedInUser,
        tokens: { accessToken }
    }, "User logged in successfully!");

    return res.status(200)
        .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 minutes
        .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
        .json(responseData);
});

// REFRESH ACCESS TOKEN _________________________________________________________
const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }
  
    let decodedToken;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch {
      throw new ApiError(401, "Refresh token invalid or expired");
    }
  
    const user = await User.findById(decodedToken.userId)
      .select("+refreshToken +refreshTokenExpiry");
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(403, "Refresh token mismatch");
    }
  
    if (new Date() > user.refreshTokenExpiry) {
      throw new ApiError(403, "Refresh token expired");
    }
  
    const { accessToken, refreshToken } =
      await generateAccessRefreshToken(user._id);
  
    // Cookie options for cross-origin support
    // sameSite: "none" requires secure: true
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS required in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin in production
    };
  
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          200,
          { accessToken },  // frontend stores this
          "Access token refreshed"
        )
      );
  });
  

// LOGOUT _______________________________________________________________________
const logoutUser = AsyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        refreshToken: null,
        refreshTokenExpiry: null
    }, { validateBeforeSave: false });

    // Cookie options must match the ones used when setting cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
});

// GET DOCTORS LIST _____________________________________________________________
const getDoctors = AsyncHandler(async (req, res) => {
    const { specialty } = req.query;

    const filter = {
        role: 'doctor',
        verificationStatus: 'verified',
        isActive: true
    };

    if (specialty) {
        filter['profile.specialty'] = specialty;
    }

    const doctors = await User.find(filter)
        .select('-password -refreshToken -refreshTokenExpiry -verificationDocs')
        .sort({ rating: -1 });

    return res.status(200).json(new ApiResponse(200, {
        data: doctors,
        count: doctors.length
    }, 'Doctors fetched successfully'));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, getDoctors };