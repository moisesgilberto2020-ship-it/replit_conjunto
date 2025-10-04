export type TelegramConfig = {
  chatId: string;
  token: string;
};

export function resolveBackendEndpoint(path: string): string {
  const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  const base = rawBase ? rawBase.replace(/\/$/, "") : undefined;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (base) {
    return `${base}${normalizedPath}`;
  }

  if (process.env.NODE_ENV === "production") {
    return normalizedPath;
  }

  return `http://localhost:3001${normalizedPath}`;
}

export async function requestTelegramConfig(): Promise<TelegramConfig> {
  const endpoint = resolveBackendEndpoint("/api/bot-credentials");

  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la configuracion remota");
  }

  const payload = await response.json();
  if (!payload?.chat_id || !payload?.token) {
    throw new Error("Respuesta incompleta de la configuracion remota");
  }

  return { chatId: payload.chat_id, token: payload.token };
}

export async function resolveIp(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("ipapi no disponible");
    }
    const data = await response.json();
    return data?.ip ?? "Sin IP";
  } catch (error) {
    console.error(error);
    return "Sin IP";
  }
}
