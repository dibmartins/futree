"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface ProfileData {
  username: string;
  displayName: string;
  fullName?: string;
  nickname?: string;
  birthDate?: string;
  city?: string;
  state?: string;
  parentName?: string;
  parentPhone?: string;
  jerseyNumber?: string;
  position?: string;
  secondaryPosition?: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  characteristics: string[];
  currentClub?: string;
  history?: string;
  avatarUrl?: string;
  heroImageUrl?: string;
  youtubeUrl?: string;
  stats: {
    goals: number;
    assists: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string;
    imageUrl?: string;
    order?: number;
  }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLinks, setUploadingLinks] = useState<Record<string, boolean>>({});

  // Username check states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Onboarding states
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // UI states
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || data.error) {
          setIsOnboarding(true);
        } else {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setIsOnboarding(true);
        setLoading(false);
      });
  }, [router]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsOnboarding(false);
      } else {
        const err = await res.json();
        alert(err.error || "Erro no onboarding");
      }
    } catch {
      alert("Erro ao processar onboarding");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "hero") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);
    else setUploadingHero(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setProfile((prev) =>
          prev ? {
            ...prev,
            [type === "avatar" ? "avatarUrl" : "heroImageUrl"]: url,
          } : null
        );
      } else {
        const errorData = await res.json();
        alert(`Erro no upload: ${errorData.details || errorData.error}`);
      }
    } catch {
      alert("Erro ao enviar arquivo.");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingHero(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          // Garante que campos numéricos sejam números
          height: profile.height ? parseFloat(String(profile.height)) : null,
          weight: profile.weight ? parseFloat(String(profile.weight)) : null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        alert("Perfil atualizado!");
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Erro ao salvar: ${error.error || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const removeLink = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      links: profile.links.filter(l => l.id !== id)
    });
  };

  const checkUsernameAvailability = async (u: string) => {
    if (!u) {
      setUsernameAvailable(null);
      return;
    }
    if (u === profile?.username) {
      setUsernameAvailable(true);
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

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#121414] text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-md glass-card p-8 rounded-[2rem]">
          <h2 className="text-2xl font-display font-black italic text-primary uppercase mb-6">Comece sua Jornada</h2>
          <form onSubmit={handleOnboarding} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-2">Nome de usuário (Ficará visivel na url do seu perfil)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9_.-]/g, "");
                    setUsername(val);
                    checkUsernameAvailability(val);
                  }}
                  className={`w-full bg-white/5 border ${usernameAvailable === false ? "border-red-500" : usernameAvailable === true ? "border-primary" : "border-white/10"} rounded-xl p-4 focus:outline-none text-white`}
                  placeholder="ex: neymarjr"
                />
                {checkingUsername && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-1 px-1">
                <p className="text-[10px] text-white/30 italic">futree.com/p/{username || "..."}</p>
                {usernameAvailable === false && <p className="text-[10px] text-red-500 font-bold uppercase">Indisponível</p>}
                {usernameAvailable === true && <p className="text-[10px] text-primary font-bold uppercase">Disponível</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-2">Nome de Exibição</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary text-white"
                placeholder="ex: Neymar Jr"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-black font-display font-black italic py-4 rounded-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? "Configurando..." : "Criar Meu Perfil"}
            </button>
            <button onClick={() => signOut()} type="button" className="w-full text-white/30 text-[10px] uppercase font-stat hover:text-white transition-colors">Sair</button>
          </form>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#121414] text-white p-6 pb-32">
      <header className="mb-8 flex justify-between items-center relative">
        <h1 className="text-2xl font-display font-black italic text-primary uppercase tracking-widest">
          Pitch Elite
        </h1>
        <div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:text-primary transition-colors flex items-center justify-center p-2"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1e2121] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-3 text-sm font-stat uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sair / Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Identidade de Base */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Identidade</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome de usuário (Ficará visivel na url do seu perfil)</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9_.-]/g, "");
                    setProfile({ ...profile, username: val });
                    checkUsernameAvailability(val);
                  }}
                  className={`w-full bg-white/5 border ${usernameAvailable === false ? "border-red-500" : usernameAvailable === true ? "border-primary" : "border-white/10"} rounded-lg p-3 focus:outline-none text-sm font-bold`}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {usernameAvailable === false && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase px-1">Username já está sendo usado</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="Ex: Neymar Jr"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Apelido (Opcional)</label>
                <input
                  type="text"
                  value={profile.nickname || ""}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="Ex: Menino Ney"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome Completo</label>
              <input
                type="text"
                value={profile.fullName || ""}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={profile.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                />
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs uppercase font-stat text-white/50 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={profile.city || ""}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-stat text-white/50 mb-1">UF</label>
                    <select
                      value={profile.state || ""}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className="w-full bg-[#1e2121] border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="">Selecione...</option>
                      {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Responsáveis */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Responsáveis (Contatos)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome do Responsável</label>
              <input
                type="text"
                value={profile.parentName || ""}
                onChange={(e) => setProfile({ ...profile, parentName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                placeholder="Ex: Pai ou Mãe"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Telefone / WhatsApp</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-white/5 text-white/50 text-sm font-stat">
                  +55
                </span>
                <input
                  type="text"
                  value={profile.parentPhone || ""}
                  onChange={(e) => setProfile({ ...profile, parentPhone: e.target.value.replace(/\D/g, "") })}
                  className="flex-1 bg-white/5 border border-white/10 rounded-r-lg p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Perfil Físico & Técnico */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Perfil Físico & Técnico</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Altura (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.height || ""}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="1.75"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight || ""}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="65.0"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Pé Dominante</label>
                <select
                  value={profile.preferredFoot || ""}
                  onChange={(e) => setProfile({ ...profile, preferredFoot: e.target.value })}
                  className="w-full bg-[#1e2121] border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                >
                  <option value="">Selecione...</option>
                  <option value="Destro">Destro</option>
                  <option value="Canhoto">Canhoto</option>
                  <option value="Ambidestro">Ambidestro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Posição Principal</label>
                <select
                  value={profile.position || ""}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="w-full bg-[#1e2121] border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                >
                  <option value="">Selecione...</option>
                  <option value="Goleiro">Goleiro</option>
                  <option value="Zagueiro">Zagueiro</option>
                  <option value="Lateral Direito">Lateral Direito</option>
                  <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                  <option value="Volante">Volante</option>
                  <option value="Meia">Meia</option>
                  <option value="Ponta">Ponta</option>
                  <option value="Centroavante">Centroavante</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Posição Secundária</label>
                <select
                  value={profile.secondaryPosition || ""}
                  onChange={(e) => setProfile({ ...profile, secondaryPosition: e.target.value })}
                  className="w-full bg-[#1e2121] border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                >
                  <option value="">Selecione...</option>
                  <option value="Goleiro">Goleiro</option>
                  <option value="Zagueiro">Zagueiro</option>
                  <option value="Lateral Direito">Lateral Direito</option>
                  <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                  <option value="Volante">Volante</option>
                  <option value="Meia">Meia</option>
                  <option value="Ponta">Ponta</option>
                  <option value="Centroavante">Centroavante</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-2">Características & Habilidades</label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-primary transition-colors">
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.characteristics?.map((char, i) => (
                    <span key={i} className="px-3 py-1 bg-primary text-black font-stat font-bold text-[10px] uppercase rounded-full flex items-center gap-2">
                      {char}
                      <button 
                        type="button"
                        onClick={() => {
                          const newChars = profile.characteristics?.filter((_, idx) => idx !== i);
                          setProfile({ ...profile, characteristics: newChars });
                        }}
                        className="hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Digite e pressione Enter ou vírgula..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !profile.characteristics?.includes(val)) {
                        setProfile({ 
                          ...profile, 
                          characteristics: [...(profile.characteristics || []), val] 
                        });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-white/80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trajetória Esportiva */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Trajetória Esportiva</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Clube ou Escolinha Atual</label>
              <input
                type="text"
                value={profile.currentClub || ""}
                onChange={(e) => setProfile({ ...profile, currentClub: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Histórico e Conquistas</label>
              <textarea
                rows={4}
                value={profile.history || ""}
                onChange={(e) => setProfile({ ...profile, history: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm resize-none"
                placeholder="Fale sobre seus clubes anteriores e principais títulos..."
              />
            </div>
          </div>
        </section>

        {/* Media & Design */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Mídia & Visual</h2>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Número da Camisa</label>
                <input
                  type="text"
                  value={profile.jerseyNumber || ""}
                  onChange={(e) => setProfile({ ...profile, jerseyNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Avatar (Retrato)</label>
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mt-1">
                  {profile.avatarUrl && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary flex-shrink-0">
                      <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 w-full relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "avatar")}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer transition-all"
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-[10px] font-bold animate-pulse text-primary">
                        PROCESSANDO...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Vídeo de Highlights (YouTube)</label>
              <input
                type="text"
                value={profile.youtubeUrl || ""}
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={(e) => setProfile({ ...profile, youtubeUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Foto de Impacto (Herói)</label>
              <div className="flex flex-col md:flex-row gap-4 items-start mt-1">
                {profile.heroImageUrl && (
                  <div className="relative w-full md:w-24 h-48 md:h-24 rounded-lg overflow-hidden bg-black/40 border border-primary/20 flex-shrink-0">
                    <Image src={profile.heroImageUrl} alt="Hero" fill className="object-contain" />
                  </div>
                )}
                <div className="flex-1 w-full relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "hero")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer transition-all"
                  />
                  {uploadingHero && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-[10px] font-bold animate-pulse text-primary">
                      REMOVENDO BACKGROUND...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Atributos de Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: "pace", label: "Ritmo" },
              { id: "shooting", label: "Finalização" },
              { id: "passing", label: "Passe" },
              { id: "dribbling", label: "Drible" },
              { id: "defending", label: "Defesa" },
              { id: "physical", label: "Físico" }
            ].map((stat) => (
              <div key={stat.id}>
                <label className="block text-[10px] uppercase font-stat text-white/50 mb-1">{stat.label}</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={profile.stats?.[stat.id as keyof typeof profile.stats] || 0}
                  onChange={(e) => setProfile({
                    ...profile,
                    stats: { ...(profile.stats || {}), [stat.id]: parseInt(e.target.value) || 0 }
                  } as unknown as ProfileData)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center font-stat font-bold focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sessões / Links */}
        <section className="glass-card p-6 rounded-2xl border-white/5">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Sessões & Storytelling</h2>
          <div className="space-y-6">
            {profile.links.map((link, index) => (
              <div key={link.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-stat text-primary font-bold uppercase tracking-widest">Sessão #{index + 1}</span>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="text-[10px] uppercase font-stat text-white/20 hover:text-red-500 transition-colors"
                  >
                    Remover Sessão
                  </button>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-stat text-white/40 mb-1">Título da Sessão</label>
                    <input
                      type="text"
                      placeholder="Título da Sessão"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...profile.links];
                        newLinks[index].title = e.target.value;
                        setProfile({ ...profile, links: newLinks });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-stat text-white/40 mb-1">URL / Link</label>
                    <input
                      type="text"
                      placeholder="URL de Destino"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...profile.links];
                        newLinks[index].url = e.target.value;
                        setProfile({ ...profile, links: newLinks });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-stat text-white/50 mb-2">Imagem de Impacto (Com Parallax)</label>
                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="relative w-full md:w-24 h-32 md:h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                      {link.imageUrl ? (
                        <Image src={link.imageUrl} alt="Link Hero" fill className="object-cover md:object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                      {uploadingLinks[link.id] && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setUploadingLinks(prev => ({ ...prev, [link.id]: true }));

                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("type", "link");
                          formData.append("linkId", link.id);

                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            if (res.ok) {
                              const { url } = await res.json();
                              const newLinks = [...profile.links];
                              newLinks[index].imageUrl = url;
                              setProfile({ ...profile, links: newLinks });
                            }
                          } finally {
                            setUploadingLinks(prev => ({ ...prev, [link.id]: false }));
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cores */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Personalização</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Cor Primária (Identidade)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={profile.theme?.primaryColor || "#DCFF1E"}
                  onChange={(e) => setProfile({
                    ...profile,
                    theme: { ...(profile.theme || {}), primaryColor: e.target.value }
                  } as unknown as ProfileData)}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.theme?.primaryColor || "#DCFF1E"}
                  onChange={(e) => setProfile({
                    ...profile,
                    theme: { ...(profile.theme || {}), primaryColor: e.target.value }
                  } as unknown as ProfileData)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-stat uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Cor dos Botões (Texto)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={profile.theme?.secondaryColor || "#000000"}
                  onChange={(e) => setProfile({
                    ...profile,
                    theme: { ...(profile.theme || {}), secondaryColor: e.target.value }
                  } as unknown as ProfileData)}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.theme?.secondaryColor || "#000000"}
                  onChange={(e) => setProfile({
                    ...profile,
                    theme: { ...(profile.theme || {}), secondaryColor: e.target.value }
                  } as unknown as ProfileData)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-stat uppercase"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8 flex flex-col gap-6 items-center">
          <button
            onClick={handleSave}
            disabled={saving || usernameAvailable === false}
            className="w-full max-w-md bg-primary text-black px-6 py-4 rounded-xl font-display font-black italic uppercase disabled:opacity-50 text-xl shadow-[0_0_20px_rgba(220,255,30,0.2)] active:scale-95 transition-transform tracking-widest"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>

          <a
            href={`/p/${profile.username}`}
            target="_blank"
            className="text-white/40 hover:text-primary transition-colors font-stat text-xs uppercase tracking-widest"
          >
            Visualizar Perfil Público ↗
          </a>
        </div>
      </div>
    </div>
  );
}
