"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface ProfileData {
  username: string;
  displayName: string;
  jerseyNumber?: string;
  position?: string;
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
  }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLinks, setUploadingLinks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

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
          displayName: profile.displayName,
          jerseyNumber: profile.jerseyNumber,
          position: profile.position,
          avatarUrl: profile.avatarUrl,
          heroImageUrl: profile.heroImageUrl,
          youtubeUrl: profile.youtubeUrl,
          stats: profile.stats,
          links: profile.links,
          theme: profile.theme,
        }),
      });

      if (res.ok) {
        alert("Perfil atualizado!");
        router.refresh();
      }
    } catch {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#121414] text-white p-6 pb-32">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-display font-black italic text-primary uppercase">
          Elite Dashboard
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => signOut()}
            className="text-white/50 hover:text-white font-stat text-xs uppercase tracking-widest px-4"
          >
            Sair
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-black px-6 py-2 rounded-lg font-display font-bold italic uppercase disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Info Básica */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Info Básica</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Nome de Exibição</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Número</label>
                <input
                  type="text"
                  value={profile.jerseyNumber}
                  onChange={(e) => setProfile({ ...profile, jerseyNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-stat text-white/50 mb-1">Posição</label>
                <input
                  type="text"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Avatar (Portrait)</label>
              <div className="flex gap-4 items-center">
                {profile.avatarUrl && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary">
                    <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "avatar")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-xs font-bold animate-pulse">
                      UPLOADING...
                    </div>
                  )}
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
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">Foto Hero (Ação - Sem Fundo)</label>
              <div className="flex gap-4 items-start">
                {profile.heroImageUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/40 border border-primary/20">
                    <Image src={profile.heroImageUrl} alt="Hero" fill className="object-contain" />
                  </div>
                )}
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "hero")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer"
                  />
                  {uploadingHero && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-xs font-bold animate-pulse text-primary">
                      REMOVENDO BACKGROUND...
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-[10px] text-white/30 uppercase tracking-tighter">
                Dica: O background será removido automaticamente para o efeito de transparência.
              </p>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">Atributos (0-99)</h2>
          <div className="grid grid-cols-3 gap-4">
            {["pace", "shooting", "passing", "dribbling", "defending", "physical"].map((stat) => (
              <div key={stat}>
                <label className="block text-[10px] uppercase font-stat text-white/50 mb-1">{stat}</label>
                <input
                  type="number"
                  value={profile.stats[stat as keyof typeof profile.stats]}
                  onChange={(e) => setProfile({
                    ...profile,
                    stats: { ...profile.stats, [stat]: parseInt(e.target.value) || 0 }
                  })}
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
                   <div className="flex gap-4 items-center">
                     <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                       {link.imageUrl ? (
                         <Image src={link.imageUrl} alt="Link Hero" fill className="object-contain" />
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
          <div>
            <label className="block text-xs uppercase font-stat text-white/50 mb-2">Cor Primária (Neon)</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={profile.theme.primaryColor}
                onChange={(e) => setProfile({
                  ...profile,
                  theme: { ...profile.theme, primaryColor: e.target.value }
                })}
                className="h-10 w-20 bg-transparent border-none cursor-pointer"
              />
              <span className="font-stat text-sm">{profile.theme.primaryColor}</span>
            </div>
          </div>
        </section>

        <div className="text-center">
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
