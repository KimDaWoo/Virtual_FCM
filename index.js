import express from 'express';
import bodyParser from 'body-parser';
import notificationRoutes from './routes/notification.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', notificationRoutes);

// 루트 경로 처리
app.get('/', (req, res) => {
  res.send('FCM Notification Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
