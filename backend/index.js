import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './src/db/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

