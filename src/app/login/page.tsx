"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("thiago@pitch.elite");
  const [password, setPassword] = useState("password123");
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
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121414] p-6">
      <div className="w-full max-w-md glass-card p-8 rounded-[2rem] border-primary/20">
        <h1 className="text-3xl font-display font-black italic text-primary text-center mb-8 uppercase tracking-widest">
          Pitch Elite <br /> <span className="text-white text-sm opacity-40 font-stat not-italic tracking-[0.3em]">Login</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
              placeholder="atleta@pitch.elite"
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
      </div>
    </div>
  );
}
