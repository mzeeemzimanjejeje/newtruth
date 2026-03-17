import { Router, type IRouter } from "express";
import { RequestPairCodeBody, RequestPairCodeResponse, GetSessionParams, GetSessionResponse } from "@workspace/api-zod";
import { startPairing, startQRSession, getSession, getQRForSession } from "../lib/whatsapp.js";

const router: IRouter = Router();

const serverStats = {
  visitors: 0,
  requests: 0,
  success: 0,
  failed: 0,
  startedAt: Date.now(),
};

let globalQrSessionId: string | null = null;

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 18) +
    Math.random().toString(36).substring(2, 18);
}

router.get("/stats", (_req, res) => {
  res.json({
    visitors: serverStats.visitors,
    requests: serverStats.requests,
    success: serverStats.success,
    failed: serverStats.failed,
    uptimeSecs: Math.floor((Date.now() - serverStats.startedAt) / 1000),
  });
});

// QR endpoint — spins up a real Baileys QR session
router.get("/qr", async (_req, res) => {
  try {
    // Reuse existing QR session if it's still pending
    if (globalQrSessionId) {
      const existing = getSession(globalQrSessionId);
      if (existing && existing.status === "pending" && existing.qr) {
        res.json({ qr: existing.qr, expiresAt: existing.qrExpiresAt, sessionId: globalQrSessionId });
        return;
      }
      if (existing?.status === "ready") {
        res.json({ qr: existing.qr, expiresAt: existing.qrExpiresAt, sessionId: globalQrSessionId, status: "ready", sessionData: existing.sessionData });
        return;
      }
    }

    // Start a fresh QR session
    const sessionId = generateSessionId();
    globalQrSessionId = sessionId;
    const qr = await startQRSession(sessionId);
    res.json({ qr, expiresAt: Date.now() + 30000, sessionId });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Pair code endpoint
router.post("/pair", async (req, res) => {
  serverStats.requests++;
  serverStats.visitors++;

  const parseResult = RequestPairCodeBody.safeParse(req.body);
  if (!parseResult.success) {
    serverStats.failed++;
    res.status(400).json({ error: "Invalid phone number format" });
    return;
  }

  const { phone } = parseResult.data;
  const cleaned = phone.replace(/\D/g, "");

  if (!cleaned || cleaned.length < 7) {
    serverStats.failed++;
    res.status(400).json({ error: "Please enter a valid phone number with country code" });
    return;
  }

  const sessionId = generateSessionId();

  try {
    const code = await startPairing(sessionId, cleaned);

    const response = RequestPairCodeResponse.parse({
      code,
      sessionId,
      status: "pending",
    });

    res.json(response);
  } catch (err) {
    serverStats.failed++;
    res.status(500).json({ error: "Failed to generate pairing code. Please try again." });
  }
});

// Session status polling
router.get("/session/:sessionId", (req, res) => {
  const parseResult = GetSessionParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid session ID" });
    return;
  }

  const { sessionId } = parseResult.data;
  const session = getSession(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (session.status === "ready") {
    serverStats.success++;
  } else if (session.status === "failed") {
    serverStats.failed++;
  }

  const response = GetSessionResponse.parse({
    sessionId: session.sessionId,
    status: session.status,
    sessionData: session.sessionData,
  });

  res.json(response);
});

export default router;
