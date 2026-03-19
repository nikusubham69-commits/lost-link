const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Optional: Promote a specific user to admin based on environment variable
    if (process.env.ADMIN_EMAIL) {
      const User = require('../models/User');
      await User.updateOne(
        { email: process.env.ADMIN_EMAIL },
        { $set: { role: 'admin' } }
      );
      console.log(`👑 Admin check completed for: ${process.env.ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // In production, we might want to retry instead of exiting immediately
    // but for now, exiting is safer to let Render restart the service
    process.exit(1);
  }
};

module.exports = connectDB;