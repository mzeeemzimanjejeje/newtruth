import { Router, type IRouter } from "express";
import { RequestPairCodeBody, RequestPairCodeResponse, GetSessionParams, GetSessionResponse } from "@workspace/api-zod";

const router: IRouter = Router();

interface SessionRecord {
  sessionId: string;
  phone: string;
  code: string;
  status: "pending" | "ready" | "failed";
  sessionData?: string;
  createdAt: number;
}

const sessions = new Map<string, SessionRecord>();

function generatePairCode(): string {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, "0");
  return `${seg()}-${seg()}-${seg()}`;
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 18) +
    Math.random().toString(36).substring(2, 18);
}

function generateTruthMdSessionData(phone: string): string {
  const base64Part = Buffer.from(
    JSON.stringify({
      phone,
      timestamp: Date.now(),
      server: "truth-md",
    })
  ).toString("base64");
  return `TRUTH_MD_CREDS;${base64Part}`;
}

router.post("/pair", (req, res) => {
  const parseResult = RequestPairCodeBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid phone number format" });
    return;
  }

  const { phone } = parseResult.data;

  if (!phone || phone.trim().length < 7) {
    res.status(400).json({ error: "Please enter a valid phone number with country code" });
    return;
  }

  const sessionId = generateSessionId();
  const code = generatePairCode();

  const session: SessionRecord = {
    sessionId,
    phone: phone.trim(),
    code,
    status: "pending",
    createdAt: Date.now(),
  };

  sessions.set(sessionId, session);

  setTimeout(() => {
    const s = sessions.get(sessionId);
    if (s && s.status === "pending") {
      s.status = "ready";
      s.sessionData = generateTruthMdSessionData(s.phone);
    }
  }, 15000);

  const response = RequestPairCodeResponse.parse({
    code,
    sessionId,
    status: "pending",
  });

  res.json(response);
});

router.get("/session/:sessionId", (req, res) => {
  const parseResult = GetSessionParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid session ID" });
    return;
  }

  const { sessionId } = parseResult.data;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const response = GetSessionResponse.parse({
    sessionId: session.sessionId,
    status: session.status,
    sessionData: session.sessionData,
  });

  res.json(response);
});

export default router;
