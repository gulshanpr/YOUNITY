import mongoose from "mongoose";

export async function connectToDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to database", connection.connection.name);
  } catch (error) {
    console.error("Error connection with database", error);
  }
}
