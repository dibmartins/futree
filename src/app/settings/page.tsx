"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { removeBackground } from "@imgly/background-removal";

interface Club {
  id: string;
  name: string;
  socialUrl?: string;
  logoUrl?: string;
  isCurrent: boolean;
}

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
    matches: number;
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
  clubs: Club[];
}

const menuCategories = [
  {
    title: "Conta & Identidade",
    items: [
      { id: "identity", label: "Identidade", subtitle: "Username, nome, apelido, cidade e estado", icon: "badge" },
      { id: "contacts", label: "Responsáveis", subtitle: "Contatos de emergência e pais", icon: "contacts" },
      { id: "media", label: "Mídia & Visual", subtitle: "Camisa, avatar, fotos e destaques", icon: "photo_camera" },
    ]
  },
  {
    title: "Desempenho & Histórico",
    items: [
      { id: "physical", label: "Perfil Físico & Técnico", subtitle: "Altura, peso, perna, posições e habilidades", icon: "sports_soccer" },
      { id: "history", label: "Trajetória", subtitle: "Resumo da sua história no futebol", icon: "timeline" },
      { id: "clubs", label: "Clubes & Escolinhas", subtitle: "Seus clubes anteriores e atual", icon: "shield" },
      { id: "stats", label: "Estatísticas da Temporada", subtitle: "Número de jogos e gols", icon: "leaderboard" },
    ]
  },
  {
    title: "Conteúdo & Estilo",
    items: [
      { id: "storytelling", label: "Sessões & Storytelling", subtitle: "Abas e links adicionais no perfil", icon: "layers" },
      { id: "theme", label: "Personalização", subtitle: "Cores e visual do perfil", icon: "palette" },
    ]
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLinks, setUploadingLinks] = useState<Record<string, boolean>>({});
  const [uploadingClubs, setUploadingClubs] = useState<Record<string, boolean>>({});

  // Username check states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Onboarding states
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // UI states
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Reset toast after 3 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

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
        showToast(err.error || "Erro no onboarding", "error");
      }
    } catch {
      showToast("Erro ao processar onboarding", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "hero" | "link" | "club", targetId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);
    else if (type === "hero") setUploadingHero(true);
    else if (type === "link" && targetId) setUploadingLinks(prev => ({ ...prev, [targetId]: true }));
    else if (type === "club" && targetId) setUploadingClubs(prev => ({ ...prev, [targetId]: true }));

    try {
      let fileToUpload: File | Blob = file;

      // Processa remoção de fundo no cliente se for hero
      if (type === "hero") {
        console.log("Iniciando remoção de background no client-side...");
        const imageBlob = new Blob([await file.arrayBuffer()], { type: file.type });
        const resultBlob = await removeBackground(imageBlob, {
          model: "isnet_fp16",
          progress: (step, current, total) => {
             console.log(`Progresso BG: ${step} - ${current}/${total}`);
          }
        });
        fileToUpload = resultBlob;
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("type", type);
      if (targetId) formData.append("linkId", targetId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setProfile((prev) => {
          if (!prev) return null;
          if (type === "avatar") return { ...prev, avatarUrl: url };
          if (type === "hero") return { ...prev, heroImageUrl: url };
          if (type === "link" && targetId) {
             const newLinks = [...prev.links];
             const index = newLinks.findIndex(l => l.id === targetId);
             if (index !== -1) newLinks[index].imageUrl = url;
             return { ...prev, links: newLinks };
          }
          if (type === "club" && targetId) {
             const newClubs = [...(prev.clubs || [])];
             const index = newClubs.findIndex(c => c.id === targetId);
             if (index !== -1) newClubs[index].logoUrl = url;
             return { ...prev, clubs: newClubs };
          }
          return prev;
        });
      } else {
        const errorData = await res.json();
        showToast(`Erro no upload: ${errorData.details || errorData.error}`, "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao enviar arquivo. O processamento de imagem pode ser pesado.", "error");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else if (type === "hero") setUploadingHero(false);
      else if (type === "link" && targetId) setUploadingLinks(prev => ({ ...prev, [targetId]: false }));
      else if (type === "club" && targetId) setUploadingClubs(prev => ({ ...prev, [targetId]: false }));
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
        showToast("Perfil atualizado!", "success");
        router.refresh();
      } else {
        const error = await res.json();
        showToast(`Erro ao salvar: ${error.error || "Erro desconhecido"}`, "error");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      showToast("Erro ao salvar.", "error");
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

  const addClub = () => {
    if (!profile) return;
    const newClub: Club = {
      id: `temp-${Date.now()}`,
      name: "",
      socialUrl: "",
      logoUrl: "",
      isCurrent: (profile.clubs || []).length === 0,
    };
    setProfile({
      ...profile,
      clubs: [...(profile.clubs || []), newClub]
    });
  };

  const removeClub = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      clubs: (profile.clubs || []).filter(c => c.id !== id)
    });
  };

  const setClubCurrent = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      clubs: (profile.clubs || []).map(c => ({
        ...c,
        isCurrent: c.id === id
      }))
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

  const getSectionTitle = () => {
    switch (activeSection) {
      case "identity": return "Identidade";
      case "contacts": return "Responsáveis (Contatos)";
      case "media": return "Mídia & Visual";
      case "physical": return "Perfil Físico & Técnico";
      case "history": return "Trajetória";
      case "clubs": return "Clubes & Escolinhas";
      case "stats": return "Estatísticas da Temporada";
      case "storytelling": return "Sessões & Storytelling";
      case "theme": return "Personalização";
      default: return "";
    }
  };

  const renderSectionContent = () => {
    if (!profile) return null;
    switch (activeSection) {
      case "identity":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome de usuário (Ficará visível na url do seu perfil)</label>
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

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome de Exibição</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                placeholder="Ex: Neymar Jr"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Apelido (Opcional)</label>
              <input
                type="text"
                value={profile.nickname || ""}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                placeholder="Ex: Menino Ney"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome Completo</label>
              <input
                type="text"
                value={profile.fullName || ""}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={profile.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Cidade</label>
              <input
                type="text"
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">UF (Estado)</label>
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
        );

      case "contacts":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome do Responsável</label>
              <input
                type="text"
                value={profile.parentName || ""}
                onChange={(e) => setProfile({ ...profile, parentName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
                placeholder="Ex: Pai ou Mãe"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Telefone / WhatsApp</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-white/5 text-white/50 text-sm font-stat">
                  +55
                </span>
                <input
                  type="text"
                  value={profile.parentPhone || ""}
                  onChange={(e) => setProfile({ ...profile, parentPhone: e.target.value.replace(/\D/g, "") })}
                  className="flex-grow w-full bg-white/5 border border-white/10 rounded-r-lg p-3 focus:outline-none focus:border-primary text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        );

      case "media":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Número da Camisa</label>
              <input
                type="text"
                value={profile.jerseyNumber || ""}
                onChange={(e) => setProfile({ ...profile, jerseyNumber: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Avatar (Retrato)</label>
              <div className="mt-1">
                <label className="cursor-pointer group block relative w-32 h-32">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "avatar")}
                    className="hidden"
                  />
                  {profile.avatarUrl ? (
                    <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 hover:border-primary-fixed/50 transition-all">
                      <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-white text-2xl">edit</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full border border-dashed border-white/20 hover:border-primary-fixed/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-white/40 text-2xl group-hover:text-primary-fixed transition-colors">add_a_photo</span>
                      <span className="text-[10px] font-stat text-white/40 group-hover:text-primary-fixed font-bold uppercase tracking-wider">SUBIR FOTO</span>
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/80 rounded-full flex flex-col items-center justify-center text-[10px] font-bold text-primary-fixed gap-1.5">
                      <div className="w-4 h-4 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                      <span className="uppercase tracking-widest text-[8px]">Enviando...</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Vídeo de Highlights (YouTube)</label>
              <input
                type="text"
                value={profile.youtubeUrl || ""}
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={(e) => setProfile({ ...profile, youtubeUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Foto de Impacto (Herói)</label>
              <div className="mt-1">
                <label className="cursor-pointer group block relative w-full max-w-md h-48">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "hero")}
                    className="hidden"
                  />
                  {profile.heroImageUrl ? (
                    <div className="relative w-full h-full rounded-2xl border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center hover:border-primary-fixed/50 transition-all">
                      <Image src={profile.heroImageUrl} alt="Hero" fill className="object-contain p-2" />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all">
                        <span className="material-symbols-outlined text-white text-3xl">edit</span>
                        <span className="text-xs text-white/70 font-stat uppercase tracking-wider">Alterar Foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-2xl border border-dashed border-white/20 hover:border-primary-fixed/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-white/40 text-3xl group-hover:text-primary-fixed transition-colors">upload_file</span>
                      <span className="text-[10px] font-stat text-white/40 group-hover:text-primary-fixed font-bold uppercase tracking-widest">SUBIR FOTO DE IMPACTO</span>
                    </div>
                  )}
                  {uploadingHero && (
                    <div className="absolute inset-0 bg-black/85 rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold text-primary-fixed gap-2">
                      <div className="w-5 h-5 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                      <span className="uppercase tracking-widest text-[9px] font-display font-black italic">REMOVENDO BACKGROUND...</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        );

      case "physical":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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
        );

      case "history":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Histórico e Conquistas</label>
              <textarea
                rows={8}
                value={profile.history || ""}
                onChange={(e) => setProfile({ ...profile, history: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm resize-none"
                placeholder="Fale sobre seus clubes anteriores e principais títulos..."
              />
            </div>
          </div>
        );

      case "clubs":
        return (
          <div className="space-y-6">
            {(profile.clubs || []).map((club, index) => (
              <div key={club.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-stat text-primary font-bold uppercase tracking-widest">
                    Clube/Escolinha #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeClub(club.id)}
                    className="text-[10px] uppercase font-stat text-white/20 hover:text-red-500 transition-colors"
                  >
                    Remover
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs uppercase font-stat text-white/40 mb-1">Nome do Clube/Escolinha</label>
                    <input
                      type="text"
                      value={club.name}
                      onChange={(e) => {
                        const newClubs = [...profile.clubs];
                        newClubs[index].name = e.target.value;
                        setProfile({ ...profile, clubs: newClubs });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Ex: Pádua Academy"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs uppercase font-stat text-white/40 mb-1">Link Redes Sociais (Instagram, Facebook...)</label>
                    <input
                      type="text"
                      value={club.socialUrl || ""}
                      onChange={(e) => {
                        const newClubs = [...profile.clubs];
                        newClubs[index].socialUrl = e.target.value;
                        setProfile({ ...profile, clubs: newClubs });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Ex: https://instagram.com/paduaacademy"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] uppercase font-stat text-white/40 mb-1">Escudo / Logo do Clube</label>
                    <div className="mt-1">
                      <label className="cursor-pointer group block relative w-20 h-20">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "club", club.id)}
                          className="hidden"
                        />
                        {club.logoUrl ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-2 hover:border-primary-fixed/50 transition-all">
                            <Image src={club.logoUrl} alt="Club Logo" width={48} height={48} className="object-contain" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <span className="material-symbols-outlined text-white text-xl">edit</span>
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-lg">
                              <span className="material-symbols-outlined text-xs font-bold">edit</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full border border-dashed border-white/20 hover:border-primary-fixed/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-white/40 text-xl group-hover:text-primary-fixed transition-colors">add</span>
                            <span className="text-[8px] font-stat text-white/40 group-hover:text-primary-fixed font-bold uppercase tracking-wider">ESCUDO</span>
                          </div>
                        )}
                        {uploadingClubs[club.id] && (
                          <div className="absolute inset-0 bg-black/85 rounded-full flex flex-col items-center justify-center text-[10px] font-bold text-primary-fixed">
                            <div className="w-4 h-4 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${club.id}`}
                      checked={club.isCurrent}
                      onChange={() => setClubCurrent(club.id)}
                      className="w-4 h-4 rounded border-white/10 text-primary focus:ring-primary bg-white/5 accent-primary animate-none"
                    />
                    <label htmlFor={`current-${club.id}`} className="text-xs uppercase font-stat text-white/70 cursor-pointer select-none">
                      Clube Atual
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addClub}
              className="w-full border border-dashed border-white/20 hover:border-primary hover:text-primary transition-all p-4 rounded-xl flex items-center justify-center gap-2 text-sm font-stat uppercase tracking-widest text-white/50"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Adicionar Clube/Escolinha
            </button>
          </div>
        );

      case "stats":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Jogos</label>
              <input
                type="number"
                min="0"
                value={profile.stats?.matches || 0}
                onChange={(e) => setProfile({
                  ...profile,
                  stats: { ...(profile.stats || {}), matches: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center font-stat font-bold focus:border-primary focus:outline-none transition-colors text-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">
                {profile.position === "Goleiro" ? "Gols Sofridos" : "Gols"}
              </label>
              <input
                type="number"
                min="0"
                value={profile.stats?.goals || 0}
                onChange={(e) => setProfile({
                  ...profile,
                  stats: { ...(profile.stats || {}), goals: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center font-stat font-bold focus:border-primary focus:outline-none transition-colors text-lg"
              />
            </div>
          </div>
        );

      case "storytelling":
        return (
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
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
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
                  <div className="flex flex-col gap-1.5">
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

                <div className="space-y-3 border-t border-white/5 pt-4">
                  <label className="block text-[10px] uppercase font-stat text-white/50 mb-2">Imagem de Impacto (Com Parallax)</label>
                  <div>
                    <label className="cursor-pointer group block relative w-full h-32">
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
                        className="hidden"
                      />
                      {link.imageUrl ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-primary-fixed/50 transition-all">
                          <Image src={link.imageUrl} alt="Link Hero" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all">
                            <span className="material-symbols-outlined text-white text-2xl">edit</span>
                            <span className="text-[10px] text-white/70 font-stat uppercase tracking-wider">Alterar Imagem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-xl border border-dashed border-white/20 hover:border-primary-fixed/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-white/40 text-2xl group-hover:text-primary-fixed transition-colors">add</span>
                          <span className="text-[9px] font-stat text-white/40 group-hover:text-primary-fixed font-bold uppercase tracking-wider">Subir Imagem de Sessão</span>
                        </div>
                      )}
                      {uploadingLinks[link.id] && (
                        <div className="absolute inset-0 bg-black/85 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-primary-fixed gap-1.5">
                          <div className="w-4 h-4 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "theme":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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
        );

      default:
        return null;
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#121414] text-white p-6 pb-32 flex justify-center">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn pointer-events-none">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
            toast.type === "success" 
              ? "bg-[#1e2020]/90 border-primary-fixed/20 text-primary-fixed" 
              : "bg-[#1e2020]/90 border-red-500/20 text-red-400"
          }`}>
            <span className="material-symbols-outlined text-xl">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <span className="font-stat text-sm font-bold uppercase tracking-wider">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        <header className="mb-8 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            {activeSection === null ? (
              <a
                href={`/p/${profile.username}`}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-primary transition-all active:scale-95"
                title="Voltar ao Perfil"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </a>
            ) : (
              <button
                onClick={() => setActiveSection(null)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-primary transition-all active:scale-95 cursor-pointer"
                title="Voltar ao Menu"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <h1 className="text-xl font-display font-black italic text-primary uppercase tracking-widest">
              Configurações
            </h1>
          </div>
          <div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 font-stat text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5 text-white/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sair
            </button>
          </div>
        </header>

        {activeSection === null ? (
          <div className="space-y-8 animate-fadeIn">
            {menuCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <h3 className="text-xs font-stat font-bold text-white/30 uppercase tracking-[0.2em] px-2">
                  {cat.title}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 hover:border-primary/20 active:scale-[0.99] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                          <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors">
                            {item.label}
                          </h4>
                          <p className="text-xs text-white/40 mt-0.5 font-stat">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-8 border-t border-white/5 flex flex-col gap-4 items-center">
              <a
                href={`/p/${profile.username}`}
                target="_blank"
                className="text-white/40 hover:text-primary transition-colors font-stat text-xs uppercase tracking-widest flex items-center gap-1.5"
              >
                Visualizar Perfil Público
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
              <span className="text-[9px] font-stat text-white/20 uppercase tracking-widest">Futree v1.0.0</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="mb-4">
              <span className="text-[10px] font-stat font-bold uppercase tracking-widest text-white/40">Seção</span>
              <h2 className="text-lg font-display font-black italic uppercase tracking-wider text-primary">
                {getSectionTitle()}
              </h2>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
              {renderSectionContent()}

              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={saving || usernameAvailable === false}
                  className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed py-4 rounded-xl font-display font-black italic uppercase disabled:opacity-50 text-base shadow-[0_0_20px_rgba(207,241,0,0.2)] active:scale-95 transition-transform tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving && <span className="w-4 h-4 border-2 border-on-primary-fixed border-t-transparent rounded-full animate-spin"></span>}
                  {saving ? "SALVANDO..." : "SALVAR"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
