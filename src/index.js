import Echo from "laravel-echo";
import Pusher from "pusher-js";

import { fetchConfig } from "./auth.js";
import { subscribeChannel } from "./channel.js";

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

export default NotificationService;
