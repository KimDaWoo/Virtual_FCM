import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

// 환경변수에서 JSON 데이터를 가져오기
const email = process.env.client_email;
const privateKey = process.env.private_key.replace(/\\n/g, '\n');
const projectId = process.env.project_id;

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FCM_URL = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

// Google OAuth 2.0 Bearer Token 생성 함수
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600, // 1시간 유효
  };

  try {
    // JWT 생성
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // Google OAuth 토큰 요청
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error fetching access token: ${data.error}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
}

// FCM 메시지 전송 함수
export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    console.log('Generating Access Token...');
    const accessToken = await getAccessToken();
    console.log('Access Token Generated:', accessToken);

    const message = {
      message: {
        token: fcmToken,
        notification: { title, body },
        data,
      },
    };
    console.log('FCM Message:', JSON.stringify(message, null, 2));

    const response = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(message),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      console.error('FCM API Error Response:', responseBody);
      throw new Error(`FCM API Error: ${response.status} - ${responseBody.error.message}`);
    }

    console.log('FCM Response:', responseBody);
    return responseBody;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
