import mongoose from "mongoose";
import User from "../src/models/users.model.js";

const MONGO_URI = "mongodb+srv://iambatmanbalak_db_user:Jl38PbRr2PWbjbUF@cluster0.emo2ayx.mongodb.net/?appName=Cluster0";

const run = async () => {
    await mongoose.connect(MONGO_URI);

    const email = "admin@test.com";
    const plainPassword = "admin123";

    // Delete existing admin with same email if any
    await User.deleteOne({ email });

    // Create via model so pre('save') bcrypt hook runs
    const admin = await User.create({
        email,
        password: plainPassword,        // will be hashed by pre-save
        role: "admin",
        profile: {
            name: "Super Admin",
            phone: "+911234567890",
            age: 35,
            gender: "other",
            avatar: null,
            notes: "Bootstrap admin",
        },
        verificationStatus: "verified",
        verificationDocs: [],
        isActive: true,
    });

    console.log("Admin created:", {
        id: admin._id.toString(),
        email,
        password: plainPassword,
    });

    await mongoose.disconnect();
};

run().catch(console.error);
