"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicState = "idle" | "listening" | "error";

function getSR(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

function joinText(base: string, appended: string): string {
  const a = appended.trimStart();
  if (!a) return base;
  if (!base.trim()) return a;
  const needsSpace = !base.endsWith(" ") && !base.endsWith("\n");
  return base + (needsSpace ? " " : "") + a;
}

export function useMicrophoneInput(
  value: string,
  setValue: (v: string) => void,
) {
  const [micState, setMicState] = useState<MicState>("idle");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  // Capture latest value/setValue without recreating callbacks
  const valueRef = useRef(value);
  const setValueRef = useRef(setValue);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { setValueRef.current = setValue; }, [setValue]);

  const baseRef = useRef("");

  const isSupported = !!getSR();

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setMicState("idle");
  }, []);

  const start = useCallback(() => {
    const SR = getSR();
    if (!SR) return;

    setError(null);
    baseRef.current = valueRef.current;

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = navigator.language || "ro-RO";

    r.onstart = () => setMicState("listening");

    r.onresult = (e: any) => {
      let allFinal = "";
      let allInterim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          allFinal += e.results[i][0].transcript;
        } else {
          allInterim += e.results[i][0].transcript;
        }
      }
      setValueRef.current(joinText(baseRef.current, allFinal + allInterim));
    };

    r.onerror = (e: any) => {
      if (e.error === "aborted") return;
      setError(
        e.error === "not-allowed"
          ? "Accesul la microfon a fost refuzat."
          : e.error === "no-speech"
            ? "Nu s-a detectat niciun sunet. Încearcă din nou."
            : "Eroare microfon. Încearcă din nou.",
      );
      setMicState("error");
      recognitionRef.current = null;
    };

    r.onend = () => {
      setMicState((s) => (s === "listening" ? "idle" : s));
      recognitionRef.current = null;
    };

    r.start();
    recognitionRef.current = r;
  }, []);

  const toggle = useCallback(() => {
    if (recognitionRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  return { micState, error, isSupported, toggle };
}
