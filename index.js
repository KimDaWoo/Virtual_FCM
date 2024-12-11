import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // cors 패키지 임포트
import notificationRoutes from './routes/notification.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors()); // 모든 출처에서의 요청 허용

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
