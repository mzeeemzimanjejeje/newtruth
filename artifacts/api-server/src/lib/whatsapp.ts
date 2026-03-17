import makeWASocket, {
  DisconnectReason,
  initAuthCreds,
  BufferJSON,
  makeCacheableSignalKeyStore,
  proto,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";

const logger = pino({ level: "silent" });

export type SessionStatus = "pending" | "ready" | "failed";

export interface SessionRecord {
  sessionId: string;
  status: SessionStatus;
  pairCode?: string;
  qr?: string;
  qrExpiresAt?: number;
  sessionData?: string;
  createdAt: number;
}

const sessions = new Map<string, SessionRecord & { sock?: ReturnType<typeof makeWASocket>; timer?: NodeJS.Timeout }>();

function makeInMemoryAuthState() {
  const creds = initAuthCreds();
  const store: Record<string, Record<string, unknown>> = {};

  const keys = makeCacheableSignalKeyStore(
    {
      get: async (type, ids) => {
        const result: Record<string, unknown> = {};
        for (const id of ids) {
          let val = store[type]?.[id];
          if (val) {
            if (type === "app-state-sync-key" && val) {
              val = proto.Message.AppStateSyncKeyData.fromObject(val);
            }
            result[id] = val;
          }
        }
        return result as never;
      },
      set: async (data) => {
        for (const category in data) {
          store[category] = store[category] || {};
          const cat = data[category as keyof typeof data];
          for (const id in cat) {
            const val = (cat as Record<string, unknown>)[id];
            if (val) {
              store[category][id] = val;
            } else {
              delete store[category][id];
            }
          }
        }
      },
    },
    logger
  );

  return {
    state: { creds, keys },
    saveCreds: () => { /* in-memory, no-op */ },
    getCreds: () => creds,
  };
}

function serializeSession(creds: unknown): string {
  const json = JSON.stringify(creds, BufferJSON.replacer);
  return `TRUTH-MD:~${Buffer.from(json).toString("base64")}`;
}

function cleanupSession(sessionId: string) {
  const s = sessions.get(sessionId);
  if (!s) return;
  if (s.timer) clearTimeout(s.timer);
  try { s.sock?.end(undefined); } catch { /* ignore */ }
  sessions.delete(sessionId);
}

export function getSession(sessionId: string): SessionRecord | undefined {
  const s = sessions.get(sessionId);
  if (!s) return undefined;
  return {
    sessionId: s.sessionId,
    status: s.status,
    pairCode: s.pairCode,
    qr: s.qr,
    qrExpiresAt: s.qrExpiresAt,
    sessionData: s.sessionData,
    createdAt: s.createdAt,
  };
}

export async function startPairing(sessionId: string, rawPhone: string): Promise<string> {
  const phone = rawPhone.replace(/\D/g, "");

  const { state, saveCreds, getCreds } = makeInMemoryAuthState();

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger,
    browser: ["TRUTH-MD", "Chrome", "1.0.0"],
    mobile: false,
  });

  const record: SessionRecord & { sock: ReturnType<typeof makeWASocket>; timer?: NodeJS.Timeout } = {
    sessionId,
    status: "pending",
    createdAt: Date.now(),
    sock,
  };

  // Auto-cleanup after 5 minutes
  record.timer = setTimeout(() => {
    if (sessions.get(sessionId)?.status === "pending") {
      const s = sessions.get(sessionId);
      if (s) s.status = "failed";
      cleanupSession(sessionId);
    }
  }, 5 * 60 * 1000);

  sessions.set(sessionId, record);

  sock.ev.on("creds.update", saveCreds);

  // Wait for socket to be ready, then request pair code
  const pairCode = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Pair code timeout")), 30000);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // If QR appears before pair code, request pair code
        try {
          const code = await sock.requestPairingCode(phone);
          clearTimeout(timeout);
          const formatted = code.match(/.{1,4}/g)?.join("-") ?? code;
          record.pairCode = formatted;
          resolve(formatted);
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      }

      if (connection === "open") {
        // Session is live — capture credentials
        const creds = getCreds();
        const s = sessions.get(sessionId);
        if (s) {
          s.status = "ready";
          s.sessionData = serializeSession(creds);
          if (s.timer) clearTimeout(s.timer);
          // Schedule cleanup after 10 minutes
          s.timer = setTimeout(() => cleanupSession(sessionId), 10 * 60 * 1000);
        }
        sock.end(undefined);
      }

      if (connection === "close") {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const s = sessions.get(sessionId);
        if (s && s.status === "pending") {
          if (reason === DisconnectReason.loggedOut || reason === DisconnectReason.badSession) {
            s.status = "failed";
          }
        }
      }
    });

    // Some versions emit QR immediately — also try requesting code after a short delay
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phone);
        clearTimeout(timeout);
        const formatted = code.match(/.{1,4}/g)?.join("-") ?? code;
        record.pairCode = formatted;
        resolve(formatted);
      } catch {
        // Will be handled by connection.update listener
      }
    }, 3000);
  });

  return pairCode;
}

export async function startQRSession(sessionId: string): Promise<string> {
  const { state, saveCreds, getCreds } = makeInMemoryAuthState();

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger,
    browser: ["TRUTH-MD", "Chrome", "1.0.0"],
  });

  const record: SessionRecord & { sock: ReturnType<typeof makeWASocket>; timer?: NodeJS.Timeout } = {
    sessionId,
    status: "pending",
    createdAt: Date.now(),
    sock,
  };

  record.timer = setTimeout(() => {
    if (sessions.get(sessionId)?.status === "pending") {
      const s = sessions.get(sessionId);
      if (s) s.status = "failed";
      cleanupSession(sessionId);
    }
  }, 5 * 60 * 1000);

  sessions.set(sessionId, record);

  sock.ev.on("creds.update", saveCreds);

  const firstQr = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("QR timeout")), 30000);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const s = sessions.get(sessionId);
        if (s) {
          s.qr = qr;
          s.qrExpiresAt = Date.now() + 30000;
        }
        clearTimeout(timeout);
        resolve(qr);
      }

      if (connection === "open") {
        const creds = getCreds();
        const s = sessions.get(sessionId);
        if (s) {
          s.status = "ready";
          s.sessionData = serializeSession(creds);
          if (s.timer) clearTimeout(s.timer);
          s.timer = setTimeout(() => cleanupSession(sessionId), 10 * 60 * 1000);
        }
        sock.end(undefined);
      }

      if (connection === "close") {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const s = sessions.get(sessionId);
        if (s && s.status === "pending") {
          if (reason === DisconnectReason.loggedOut || reason === DisconnectReason.badSession) {
            s.status = "failed";
          }
        }
      }
    });
  });

  return firstQr;
}

export function getQRForSession(sessionId: string): { qr: string; expiresAt: number } | null {
  const s = sessions.get(sessionId);
  if (!s || !s.qr) return null;
  return { qr: s.qr, expiresAt: s.qrExpiresAt ?? Date.now() + 30000 };
}
