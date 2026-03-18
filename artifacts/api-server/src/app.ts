import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  // Works in both ESM (import.meta.url) and CJS (__filename via process.env)
  const frontendDist =
    process.env.FRONTEND_DIST ||
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../truth-md/dist/public");

  app.use(express.static(frontendDist));

  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
