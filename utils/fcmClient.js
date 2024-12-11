import pkg from 'google-auth-library';
import fetch from 'node-fetch';

const { google } = pkg;

// 환경변수에서 JSON 데이터를 가져와 파싱
const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

const PROJECT_ID = serviceAccountKey.project_id;
const FCM_URL = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  const authClient = new google.auth.JWT(
    process.env.FIREBASE_CLIENT_EMAIL,
    null,
    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 줄바꿈 처리
    ['https://www.googleapis.com/auth/firebase.messaging']
  );

  // 인증 토큰 생성
  const token = await authClient.authorize().then((res) => res.access_token);
  
  const message = {
    message: {
      token: fcmToken,
      notification: { title, body },
      data,
    },
  };

  const response = await fetch(FCM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`FCM API Error: ${response.status} - ${error.error.message}`);
  }

  return response.json();
}
