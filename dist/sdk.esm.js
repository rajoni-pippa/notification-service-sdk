import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// const SAAS_URL = import.meta.env.VITE_SAAS_BASE_URL;
const SAAS_URL = "https://naas.api.pippasync.com/api";

async function fetchConfig(apiKey, userId) {
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

function subscribeChannel(echo, channel, onNotify) {

  echo

    .private(channel)

    .listenToAll((event, data) => {

      if (event === '.notification.sent') {

        onNotify({
          short_message: data.data?.short_message ?? '',
          type: data.data?.type ?? 'general',
          id: data.id,
          raw: data,
        });
      }
    })


    .error((error) => {
      console.error('[NotificationService] Channel subscription error:', error);

      if (error?.status === 403) {
        console.warn(
          '[NotificationService] Token expired or invalid. ' +
          'Call NotificationService.init() again to reconnect.'
        );
      }
    });
}

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

class NotificationService {
  static async init({ apiKey, userId, onNotify }) {
    if (window.__qbitsEcho) {
      window.__qbitsEcho.disconnect();
      window.__qbitsEcho = null;
    }

    try {
      console.log("[NotificationService] Fetching config...");
      const config = await fetchConfig(apiKey, userId);
      console.log(
        "[NotificationService] Config received. Channel:",
        config.channel,
      );

      console.log("[NotificationService] Connecting to Reverb...");

      const echo = new Echo({
        broadcaster: "reverb",
        key: config.reverb.key,
        wsHost: config.reverb.host,
        wsPort: config.reverb.port,
        wssPort: config.reverb.port,
        forceTLS: config.reverb.scheme === "https",
        enabledTransports: config.reverb.scheme === "https" ? ["wss"] : ["ws"],

        authEndpoint: config.authEndpoint,
        auth: {
          headers: {
            "X-Socket-Token": config.socketToken,
            "X-Api-Key": apiKey,
          },
        },
      });
      window.__qbitsEcho = echo;

      await waitForConnection(echo);
      console.log("[NotificationService] Connected to Reverb!");

      subscribeChannel(echo, config.channel, onNotify);
      console.log(
        "[NotificationService] Subscribed to channel:",
        config.channel,
      );
    } catch (err) {
      console.error(
        "[NotificationService] Initialization failed:",
        err.message,
      );
      throw err;
    }
  }

  static disconnect() {
    if (window.__qbitsEcho) {
      window.__qbitsEcho.disconnect();
      window.__qbitsEcho = null;
      console.log("[NotificationService] Disconnected.");
    }
  }
}

function waitForConnection(echo) {
  return new Promise((resolve, reject) => {
    const pusher = echo.connector.pusher;

    if (pusher.connection.state === "connected") {
      return resolve();
    }

    pusher.connection.bind("connected", () => resolve());

    pusher.connection.bind("failed", () =>
      reject(new Error("[NotificationService] WebSocket connection failed.")),
    );

    setTimeout(
      () =>
        reject(
          new Error("[NotificationService] Connection timeout after 10s."),
        ),
      10000,
    );
  });
}

export { NotificationService as default };
//# sourceMappingURL=sdk.esm.js.map
