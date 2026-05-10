import mongoose from "mongoose";

export const connectDatabase = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/construction-rental-store";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    if (mongoUri.includes("mongodb+srv://")) {
      console.error("MongoDB Atlas connection failed.");
      console.error("Check internet/DNS, Atlas Network Access IP whitelist, username/password, and cluster status.");
    }
    throw error;
  }
};
