import mongoose from "mongoose";

export const connectDatabase = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/construction-rental-store";

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};
