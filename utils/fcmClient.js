import pkg from 'google-auth-library';
import fetch from 'node-fetch';

const { google } = pkg;

// 환경변수에서 JSON 데이터를 가져오기
const email = "firebase-adminsdk-f8h7f@zazero-56b47.iam.gserviceaccount.com";
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD1d7fhAUvgfH5A
k+tvkmU9GrzpoQo7MPvnd9wM/nibYGS7u9dgceUrYxt9g6LvjXKcjdBXt9JTb015
BNDD2MTcvZhvsdcpgEWqYLP5k7S1LlmMEIwRk/3FE1Exy3teH0TgZ401je9Tq4aZ
CD5Y+uzE9ji9Ik10bP1jNnzQRJrFnOAFvNVuJAJCoO93Mp6+Fcd8I8/ffExAT//5
dk4wI2UIOYntkacZWT8DRhyA7NGC3+ZCUxC0HHxDljhMqkqyiixmD4Z2L2aykNuE
gaxEx1kaE3z6s6eKmby/d1tPC2KxVb9ZFsiKaAa2FiwKI9hzhdG8mDPr34v5P/xV
D3yoia+LAgMBAAECggEAWS0aF1tCNpbjwxA6CzmTIATTtsizj9d23JuVzP6x0DjP
v8g5MaePCxkhRpMJIaAwkCGRHB0DAx6/dYTDVzMsKcmTVJi2QzR/mqsxFy2LC/t/
urvUNxqdqfgfmkiDVCll+2SDT352AN6isnvlMqxOUivlZwjMPMzPrTiBVaRm2f0y
3ZIwcdgq5iOWyHMUu9F1y+EGNDfbaHvBw1iwoxrVEKA/vsR3GlhLD4s+r3f6lLIU
z5L5jgEeyFoy6v7AV6GT6ykRXZAHLq6aotkTw4oFzCg76K7heun3DrC/89DjFg0A
fFPGsFGIuUkfPXvA8uSVI0dcEGo+1DRj1u/HKR/u+QKBgQD68z/uO9bfHpPiTKJF
CEORwhN0Ef0Ocjbi2+HL5UlpOccc47vTF4eQcub9lYqDO9hEQAw6VufEB3iM1Iew
hTkkspyeChFQdnqyJC0FDgPy1GfFtu6gqidVrx7NUBxfzY5iA2JPB1pyqqq+H2ou
2rNfAj2iD97k/sVW6fNR6jjg5QKBgQD6aDnEFw8vhiuvdcm47uGUNrzuXSVxWP5k
S1N1Rg0LTmUs2O6Mhz1DsD+oQsgjwYBdQIYR44E+4Uf82dKiXblU5ONGHEyoVBZ9
1Is/F+gaoNPwdO5eEZ9xq1SqjDWBBmDmmCPmYJb4TOcFSocZz6RaXWf2nvrzcYlH
jECl9E/3rwKBgQDMmywS16M3w7yblBPx6Oz+mJg32LrU3na1vMV68vVJ4BviCCQJ
1nNnaOfA9f47Rb3s17OglV7eS6EUYexIFjcjHqXnjRnU2uTq/efe6TB6+oepgp9J
S7JKgD/C8oBP9E8UxuGOwdYTC+eun/p5PUNmQXNzATGgz8CiPpluvmOlqQKBgHFY
djVlfrEzWVjdx0aXkrJFKLX4obcx4kzBr/BYmhTxEmj/dNNVcAzQna/rMq7EqvcK
+uTkBx/QV4aDjo2CQR7FUH7u1mAnV9rzN2iCyMQs4mJoe3FHJtYMCJH+T0Ws/nXC
jhV8yTlxjezeNFMhozJoL2P5yHwje1FQkf7MnNnvAoGBAO8x+ZlH1xdCAQJCbEi3
AnsPO5e3CKB1KW6rKbjsdA6pKcRcKvNxNvDDBFsbnldAINbqVDjQlv48eEKnYCNr
I5wRNyHrrODD68X5pwnTrYGenEIEFPhS21Qg0vNRcaVr/0ytYRj/hHJlw849tyn4
GI/i9jw5kcNYQk8/Pxd78MsF
-----END PRIVATE KEY-----
`.replace(/\\n/g, '\n');
const projectId = "zazero-56b47";

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
