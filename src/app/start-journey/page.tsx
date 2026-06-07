"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import BouncingBallLoader from "@/components/BouncingBallLoader";

export default function StartJourneyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Onboarding states
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Username check states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    fetch("/api/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          // Profile already exists! Redirect to settings dashboard
          router.push("/settings");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [status, router]);

  const checkUsernameAvailability = async (u: string) => {
    if (u.length < 5) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/profile/check-username?username=${u}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9_-]/g, "");
    setUsername(cleaned);

    if (cleaned.length === 0) {
      setUsernameError("");
      setUsernameAvailable(null);
      return;
    }

    if (cleaned.length < 5) {
      setUsernameError("Mínimo de 5 caracteres");
      setUsernameAvailable(null);
      return;
    }

    setUsernameError("");
    checkUsernameAvailability(cleaned);
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 5 || !/^[a-z0-9_-]+$/.test(username)) {
      setError("Nome de usuário inválido. Deve ter pelo menos 5 caracteres e conter apenas letras, números, hífens e underlines.");
      return;
    }
    if (usernameAvailable === false) {
      setError("Username indisponível. Escolha outro.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName }),
      });
      if (res.ok) {
        router.push("/settings");
      } else {
        const err = await res.json();
        setError(err.error || "Erro no onboarding");
      }
    } catch {
      setError("Erro ao processar onboarding");
    } finally {
      setSaving(false);
    }
  };

  // Helper to extract clean domain for preview
  const getCleanDomain = () => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || "https://futree.com";
    try {
      const hasProtocol = /^https?:\/\//i.test(envUrl);
      const urlWithProtocol = hasProtocol ? envUrl : `http://${envUrl}`;
      const parsed = new URL(urlWithProtocol);
      let domain = parsed.host;
      if (domain.startsWith("www.")) {
        domain = domain.substring(4);
      }
      return domain;
    } catch {
      return "futree.com";
    }
  };

  const cleanDomain = getCleanDomain();

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#121414] text-white p-6 flex items-center justify-center">
        <BouncingBallLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121414] text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md glass-card p-8 rounded-[2rem] border-primary/20">
        <h2 className="text-2xl font-display font-black italic text-primary-fixed text-neon uppercase mb-6 tracking-wider text-center">
          Comece sua Jornada
        </h2>
        
        {error && (
          <p className="mb-4 text-red-500 text-xs font-stat uppercase border border-red-500/20 bg-red-500/5 p-3 rounded-xl">
            {error}
          </p>
        )}

        <form onSubmit={handleOnboarding} className="space-y-6">
          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">
              Nome de usuário
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`w-full bg-white/5 border ${
                  usernameError || usernameAvailable === false
                    ? "border-red-500"
                    : usernameAvailable === true
                    ? "border-primary-fixed"
                    : "border-white/10"
                } rounded-xl p-4 focus:outline-none text-white font-stat font-bold text-sm`}
                placeholder="ex: joaosilva"
              />
              {checkingUsername && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-1 px-1">
              <div className="flex justify-between items-center text-[10px]">
                <p className="text-white/30 italic">
                  {cleanDomain}/p/{username || "..."}
                </p>
                {usernameAvailable === false && (
                  <p className="text-red-500 font-bold uppercase">Indisponível</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-primary-fixed font-bold uppercase">Disponível</p>
                )}
              </div>
              {usernameError && (
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  {usernameError}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">
              Nome de Exibição
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-fixed text-white text-sm"
              placeholder="ex: João Silva"
            />
          </div>

          <button
            type="submit"
            disabled={saving || usernameAvailable !== true || username.length < 5}
            className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed py-4 rounded-xl font-display font-black italic uppercase disabled:opacity-50 text-base shadow-[0_0_20px_rgba(207,241,0,0.2)] active:scale-95 transition-transform tracking-widest flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? "Configurando..." : "Criar Meu Perfil"}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            type="button"
            className="w-full text-white/30 text-[10px] uppercase font-stat hover:text-white transition-colors cursor-pointer"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
