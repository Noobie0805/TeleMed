import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient'
        },
        profile: {
            name: { type: String, required: true },
            phone: { type: String },
            age: { type: Number },
            gender: { type: String, enum: ['male', 'female', 'other'] },
            avatar: { type: String },
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'verified'  //patients are verified by default
        },
        verificationDocs: {
            type: [String],  //array of document URLs for doctor verification
            default: undefined  // ✅ Changed from null
        },
        refreshToken: {
            type: String,
            default: null
        },
        refreshTokenExpiry: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: {
            type: Date,
        }
    }, { timestamps: true }
);

// Indexes bna rha.._________________________________________________________
// userSchema.index({ email: 1 });
userSchema.index({ role: 1, verificationStatus: 1 });
userSchema.index({ refreshToken: 1 });

//  Password hashing (use bcrypt.hash directly)______________________________________
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 12);;
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// JWT Token generation_________________________________________________________
userSchema.methods.generateTokens = function () {
    const accessToken = jwt.sign(
        { userId: this._id, role: this.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
    );

    const refreshTokenExpiry = new Date(Date.now() +
        parseDuration(process.env.REFRESH_TOKEN_EXPIRE || '7d'));

    return { accessToken, refreshToken, refreshTokenExpiry };
};

// Helper function to parse duration strings like '15m', '7d'________________________ 
const parseDuration = (duration) => {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = duration.match(/(\d+)([smhd])/);
    return match ? parseInt(match[1]) * units[match[2]] : 7 * 24 * 60 * 60 * 1000;
};

export default mongoose.model('User', userSchema);

