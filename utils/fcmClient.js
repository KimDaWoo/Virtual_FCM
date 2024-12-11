import pkg from 'google-auth-library';
import fetch from 'node-fetch';
import serviceAccountKey from '../config/serviceAccountKey.json' assert { type: 'json' };

const { google } = pkg;

const PROJECT_ID = serviceAccountKey.project_id;
const FCM_URL = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  const authClient = new google.auth.JWT(
    serviceAccountKey.client_email,
    null,
    serviceAccountKey.private_key,
    ['https://www.googleapis.com/auth/firebase.messaging']
  );

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
