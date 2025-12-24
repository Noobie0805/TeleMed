import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        const connectionInstnace = await mongoose.connect(`${process.env.MONGO_URI_ATLAS}${process.env.DB_NAME ? process.env.DB_NAME : ''}`);
        console.log(`\n MongoDB connected !! DB_HOST: ${connectionInstnace.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error ", error);
        process.exit(1);
    }
}
export default connectDB;