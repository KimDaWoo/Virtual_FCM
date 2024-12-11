import pkg from 'google-auth-library';
import fetch from 'node-fetch';

const { google } = pkg;

// 환경변수에서 JSON 데이터를 가져오기
const email = process.env.client_email;
const privateKey = process.env.private_key.replace(/\\n/g, '\n');
const projectId = process.env.project_id;

const FCM_URL = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    // 환경변수 확인 로그
    console.log('Environment Variables:');
    console.log('Email:', email);
    console.log('Private Key Exists:', !!privateKey);
    console.log('Project ID:', projectId);

    // Google JWT 초기화
    console.log('Initializing Google JWT...');
    const authClient = await google.auth.getClient({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    

    // 인증 토큰 생성
    console.log('Generating token...');
    const token = await authClient.authorize().then((res) => res.access_token);
    console.log('Generated Token:', token);

    // FCM 메시지 구성
    const message = {
      message: {
        token: fcmToken,
        notification: { title, body },
        data,
      },
    };
    console.log('FCM Message:', JSON.stringify(message, null, 2));

    // FCM API 호출
    console.log('Sending request to FCM...');
    const response = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });

    // FCM 응답 확인
    console.log('FCM Response Status:', response.status);
    const responseBody = await response.text();
    console.log('FCM Response Body:', responseBody);

    if (!response.ok) {
      throw new Error(`FCM API Error: ${response.status} - ${responseBody}`);
    }

    return JSON.parse(responseBody);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
