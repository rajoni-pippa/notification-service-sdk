const SAAS_URL = "http://127.0.0.1:8000/api";

export async function fetchConfig(apiKey, userId) {
  const res = await fetch(
    `${SAAS_URL}/sdk/auth?api_key=${apiKey}&user_id=${userId}`,
  );

  if (res.status === 401) {
    throw new Error(
      "[NotificationService] Invalid API key. Check your apiKey.",
    );
  }

  if (res.status === 404) {
    throw new Error("[NotificationService] User not found. Check your userId.");
  }

  if (!res.ok) {
    throw new Error(
      `[NotificationService] Auth failed with status ${res.status}`,
    );
  }

  const config = await res.json();

  return {
    channel: config.channel,
    socketToken: config.socket_token,
    authEndpoint: config.auth_endpoint,
    reverb: config.reverb,
    apiKey: apiKey,
  };
}
