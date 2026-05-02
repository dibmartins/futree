"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
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
          stats: profile.stats,
          theme: profile.theme,
        }),
      });

      if (res.ok) {
        alert("Perfil atualizado!");
        router.refresh();
      }
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

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
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">URL Avatar (Portrait)</label>
              <input
                type="text"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-stat text-white/50 mb-1">URL Foto Hero (Ação)</label>
              <input
                type="text"
                value={profile.heroImageUrl}
                onChange={(e) => setProfile({ ...profile, heroImageUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary"
              />
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
                  value={profile.stats[stat]}
                  onChange={(e) => setProfile({
                    ...profile,
                    stats: { ...profile.stats, [stat]: parseInt(e.target.value) }
                  })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center font-stat font-bold"
                />
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
