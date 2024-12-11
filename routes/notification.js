import express from 'express';
import { sendPushNotification } from '../utils/fcmClient.js';

const router = express.Router();

router.post('/send-notification', async (req, res) => {
  const { fcmToken, title, body, data } = req.body;

  if (!fcmToken || !title || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await sendPushNotification(fcmToken, title, body, data);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router;