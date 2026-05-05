"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciais inválidas.");
      } else {
        router.push("/settings");
      }
    } catch {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121414] p-6">
      <div className="w-full max-w-md glass-card p-8 rounded-[2rem] border-primary/20">
        <h1 className="text-3xl font-display font-black italic text-primary text-center mb-8 uppercase tracking-widest">
          Futree <br /> <span className="text-white text-sm opacity-40 font-stat not-italic tracking-[0.3em]">Login</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
              placeholder="atleta@futree.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-stat uppercase">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar no Campo"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-stat">
              <span className="bg-[#121414] px-4 text-white/30">Ou use</span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/settings" })}
            className="w-full bg-white/5 border border-white/10 text-white font-stat text-xs py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors uppercase tracking-widest"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
        </div>

        <p className="mt-8 text-center text-xs font-stat text-white/30 uppercase tracking-widest">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Crie seu perfil
          </Link>
        </p>
      </div>
    </div>
  );
}
