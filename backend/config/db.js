import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );
  } catch (err) {
    console.error(
      "Database connection failed:",
      err.message
    );

    process.exit(1);
  }
};

export default connectDB;