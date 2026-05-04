"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Auto login after registration
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/settings",
        });
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao criar conta.");
      }
    } catch {
      setError("Erro ao processar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121414] p-6">
      <div className="w-full max-w-md glass-card p-8 rounded-[2rem] border-primary/20">
        <h1 className="text-3xl font-display font-black italic text-primary text-center mb-8 uppercase tracking-widest">
          Pitch Elite <br /> <span className="text-white text-sm opacity-40 font-stat not-italic tracking-[0.3em]">Cadastro</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
              placeholder="seu@email.com"
              required
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
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-stat uppercase">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Criando Conta..." : "Entrar no Time"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-stat text-white/30 uppercase tracking-widest">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}
