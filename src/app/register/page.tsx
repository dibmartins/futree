"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Dados do Responsável Legal
  const [guardianName, setGuardianName] = useState("");
  const [guardianCpf, setGuardianCpf] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");

  // Consentimentos LGPD Art. 14
  const [consentAuth, setConsentAuth] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [consentPhotos, setConsentPhotos] = useState(false);
  const [consentStats, setConsentStats] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Calcular idade no cliente
  const getAge = (dateString: string) => {
    if (!dateString) return 0;
    const birth = new Date(dateString);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge(birthDate);
  const isAthleteMinor = age < 16;

  // Máscara básica de CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!birthDate) {
        setError("Por favor, informe sua data de nascimento.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2 && isAthleteMinor) {
      if (!guardianName || !guardianCpf || !guardianEmail) {
        setError("Preencha todos os dados do responsável.");
        return;
      }
      if (guardianCpf.replace(/\D/g, "").length !== 11) {
        setError("Insira um CPF válido.");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isAthleteMinor) {
      if (!consentAuth || !consentName) {
        setError("É necessário aceitar os consentimentos obrigatórios do responsável legal.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      email,
      password,
      birthDate,
      isMinor: isAthleteMinor,
      guardian: isAthleteMinor
        ? {
            fullName: guardianName,
            cpf: guardianCpf,
            email: guardianEmail,
          }
        : null,
      consent: isAthleteMinor
        ? {
            auth_account: consentAuth,
            display_name: consentName,
            display_photos: consentPhotos,
            public_stats: consentStats,
          }
        : null,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Login automático após cadastro bem-sucedido
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
        <h1 className="text-3xl font-display font-black italic text-primary text-center mb-6 uppercase tracking-widest">
          Pitch Elite <br />
          <span className="text-white text-sm opacity-40 font-stat not-italic tracking-[0.3em]">
            {isAthleteMinor && step > 1 ? "Cadastro Menor" : "Cadastro"}
          </span>
        </h1>

        {/* Barra de progresso visual */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-stat ${step >= 1 ? "bg-primary text-black" : "bg-white/10 text-white/50"}`}>1</div>
          <div className={`flex-1 h-[2px] mx-2 ${step >= 2 ? "bg-primary" : "bg-white/10"}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-stat ${step >= 2 ? "bg-primary text-black" : "bg-white/10 text-white/50"}`}>2</div>
          {isAthleteMinor && (
            <>
              <div className={`flex-1 h-[2px] mx-2 ${step >= 3 ? "bg-primary" : "bg-white/10"}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-stat ${step >= 3 ? "bg-primary text-black" : "bg-white/10 text-white/50"}`}>3</div>
            </>
          )}
        </div>

        {error && <p className="mb-4 text-red-500 text-xs font-stat uppercase border border-red-500/20 bg-red-500/5 p-3 rounded-xl">{error}</p>}

        {/* ETAPA 1: Data de Nascimento */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-white text-sm font-stat uppercase tracking-wider font-bold">Verificação de Idade</h2>
              <p className="text-xs text-white/40 leading-relaxed font-stat">
                Em conformidade com a LGPD e Lei Felca (ECA Digital), precisamos da sua data de nascimento para iniciar.
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-2">Sua Data de Nascimento</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white font-stat font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest cursor-pointer"
            >
              Continuar
            </button>
          </form>
        )}

        {/* ETAPA 2 (MENOR): Dados do Responsável Legal */}
        {step === 2 && isAthleteMinor && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl space-y-2 mb-2">
              <h3 className="text-yellow-400 text-xs font-stat uppercase tracking-wider font-bold">
                ⚠️ Atleta Menor de 16 Anos
              </h3>
              <p className="text-[11px] text-white/70 leading-relaxed font-stat">
                O cadastro deve ser realizado pelo pai, mãe ou responsável legal. Forneça os dados civis do adulto abaixo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">Nome Completo do Responsável</label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Nome do Adulto Responsável"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">CPF do Responsável</label>
                <input
                  type="text"
                  required
                  value={guardianCpf}
                  onChange={(e) => setGuardianCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white font-stat font-bold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">E-mail do Responsável</label>
                <input
                  type="email"
                  required
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="email.responsavel@exemplo.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-stat py-4 rounded-xl active:scale-95 transition-transform uppercase text-xs tracking-wider cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 3 (MENOR): Consentimento & Credenciais */}
        {step === 3 && isAthleteMinor && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-white text-xs font-stat uppercase tracking-wider font-bold mb-2">
                Consentimento do Responsável Legal (LGPD)
              </h3>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-auth"
                  checked={consentAuth}
                  onChange={(e) => setConsentAuth(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/10 text-primary focus:ring-primary bg-white/5 accent-primary cursor-pointer"
                />
                <label htmlFor="consent-auth" className="text-[10px] uppercase font-stat text-white/70 cursor-pointer select-none leading-tight font-bold">
                  Autorizo a criação da conta do atleta menor sob minha supervisão direta. (Obrigatório)
                </label>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <input
                  type="checkbox"
                  id="consent-name"
                  checked={consentName}
                  onChange={(e) => setConsentName(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/10 text-primary focus:ring-primary bg-white/5 accent-primary cursor-pointer"
                />
                <label htmlFor="consent-name" className="text-[10px] uppercase font-stat text-white/70 cursor-pointer select-none leading-tight font-bold">
                  Autorizo a publicação do nome e apelido do atleta no Pitch Elite. (Obrigatório)
                </label>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <input
                  type="checkbox"
                  id="consent-photos"
                  checked={consentPhotos}
                  onChange={(e) => setConsentPhotos(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/10 text-primary focus:ring-primary bg-white/5 accent-primary cursor-pointer"
                />
                <label htmlFor="consent-photos" className="text-[10px] uppercase font-stat text-white/50 cursor-pointer select-none leading-tight">
                  Autorizo a publicação de fotos de perfil e vídeos de melhores momentos do atleta. (Opcional)
                </label>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <input
                  type="checkbox"
                  id="consent-stats"
                  checked={consentStats}
                  onChange={(e) => setConsentStats(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/10 text-primary focus:ring-primary bg-white/5 accent-primary cursor-pointer"
                />
                <label htmlFor="consent-stats" className="text-[10px] uppercase font-stat text-white/50 cursor-pointer select-none leading-tight">
                  Autorizo a exibição pública de estatísticas de performance esportiva. (Opcional)
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">E-mail do Atleta (Login)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="atleta@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">Senha do Atleta</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-stat py-4 rounded-xl active:scale-95 transition-transform uppercase text-xs tracking-wider cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || !consentAuth || !consentName}
                className="flex-1 bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Cadastrando..." : "Cadastrar Atleta"}
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 2 (MAIOR): Credenciais Padrão do Atleta */}
        {step === 2 && !isAthleteMinor && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-2">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-stat py-4 rounded-xl active:scale-95 transition-transform uppercase text-xs tracking-wider cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Criando Conta..." : "Entrar no Time"}
              </button>
            </div>
          </form>
        )}

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

