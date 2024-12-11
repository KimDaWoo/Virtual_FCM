import pkg from 'google-auth-library';
import fetch from 'node-fetch';

const { google } = pkg;

// 환경변수에서 JSON 데이터를 가져와 파싱
const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

const PROJECT_ID = serviceAccountKey.project_id;
const FCM_URL = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    // Google JWT 초기화
    console.log('Initializing Google JWT...');
    const authClient = new google.auth.JWT(
      serviceAccountKey.client_email, // JSON에서 파싱된 이메일
      null,
      serviceAccountKey.private_key.replace(/\\n/g, '\n'), // JSON에서 파싱된 비공개 키
      ['https://www.googleapis.com/auth/firebase.messaging'] // 인증 범위
    );

    // 환경변수 및 초기화 확인
    console.log('client_email:', serviceAccountKey.client_email);
    console.log('private_key:', serviceAccountKey.private_key.replace(/\\n/g, '\n'));

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
