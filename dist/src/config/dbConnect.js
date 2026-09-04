import mongoose from "mongoose";
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in .env");
    }
    mongoose.connection.on("connected", () => {
        console.log("MongoDB connected successfully!");
    });
    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });
    const conn = await mongoose.connect(mongoUri);
    console.log(`Database: ${conn.connection.name} on ${conn.connection.host}`);
    return conn;
};
export default connectDB;
