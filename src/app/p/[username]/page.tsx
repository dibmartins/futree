import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const revalidate = 0; // Desabilita o cache para esta página

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      stats: true,
      links: {
        orderBy: { order: "asc" },
      },
      theme: true,
    },
  }) as any;

  if (!profile) {
    notFound();
  }

  const primaryColor = profile.theme?.primaryColor || "#DCFF1E";
  
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const primaryRgb = hexToRgb(primaryColor);

  return (
    <main
      className="pb-32 font-body overflow-x-hidden bg-[#121414] text-[#e2e2e2]"
      style={{ 
        "--primary": primaryColor,
        "--primary-rgb": primaryRgb,
        "--color-primary": primaryColor,      // Injeção para Tailwind v4
        "--color-primary-rgb": primaryRgb,  // Injeção para Tailwind v4
        color: "#e2e2e2" 
      } as React.CSSProperties}
    >
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-white/10 shadow-2xl shadow-primary/10">
        <div className="text-xl font-display font-black italic text-primary tracking-widest uppercase">
          {profile.displayName}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden relative">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-white/10"></div>
            )}
          </div>
          <button className="text-white/70 hover:text-primary transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <section className="relative h-[795px] overflow-hidden hero-clip bg-[#080808]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(${primaryColor} 0.5px, transparent 0.5px)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
        <div className="absolute inset-0 z-10 flex items-end justify-center">
          <div className="relative w-full h-full translate-y-10">
            {profile.heroImageUrl ? (
              <>
                <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/20 angled-accent blur-xl animate-pulse"></div>
                <div className="absolute top-1/3 right-10 w-24 h-48 bg-primary/10 angled-accent blur-2xl"></div>
                <Image
                  src={profile.heroImageUrl}
                  alt={profile.displayName}
                  fill
                  className="object-cover object-center brightness-110 contrast-125"
                  style={{ filter: "drop-shadow(0 0 30px rgba(var(--primary-rgb), 0.3))" }}
                  priority
                  unoptimized
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 font-display font-black italic text-8xl uppercase select-none opacity-20">
                PITCH ELITE
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-transparent to-transparent">
          <div className="space-y-0">
            <span className="inline-block px-3 py-1 bg-primary text-black font-display font-black italic text-xs mb-2 angled-accent uppercase">
              PROMESSA DE ELITE
            </span>
            <h1 className="font-display font-black italic text-6xl text-white leading-none tracking-tighter uppercase">
              {profile.displayName.split(" ")[0]} <br />{" "}
              <span className="text-primary">{profile.displayName.split(" ").slice(1).join(" ")}</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {profile.jerseyNumber && (
                <span className="font-display font-extrabold italic text-4xl text-white/40">
                  {profile.jerseyNumber}
                </span>
              )}
              <span className="h-6 w-[2px] bg-primary/30"></span>
              <span className="font-stat font-bold text-white text-xl tracking-widest uppercase">
                {profile.position}
              </span>
            </div>
          </div>
        </div>
      </section>

      {profile.stats && (
        <section className="px-6 -mt-16 relative z-30">
          <div className="glass-card rounded-[2rem] p-8 overflow-hidden relative border-white/10">
            <div className="absolute -right-10 -bottom-10 font-display font-black italic text-[200px] text-white/[0.03] leading-none select-none">
              {profile.jerseyNumber}
            </div>
            <h2 className="font-display font-black italic text-2xl mb-8 flex items-center gap-2 uppercase">
              <span className="w-2 h-8 bg-primary"></span>
              RESUMO DA TEMPORADA <span className="text-white/40 text-sm">24/25</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col">
                <span className="font-stat text-[40px] font-bold text-primary leading-none">
                  {profile.stats.goals}
                </span>
                <span className="font-stat text-[10px] font-semibold text-white/50 tracking-[0.2em] uppercase text-nowrap">
                  Gols Marcados
                </span>
                <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-white"
                    style={{ width: `${Math.min((profile.stats.goals / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-stat text-[40px] font-bold text-white leading-none">
                  {profile.stats.assists}
                </span>
                <span className="font-stat text-[10px] font-semibold text-white/50 tracking-[0.2em] uppercase text-nowrap">
                  Assistências Chave
                </span>
                <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40"
                    style={{ width: `${Math.min((profile.stats.assists / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Ritmo", value: profile.stats.pace },
                { label: "Finalização", value: profile.stats.shooting },
                { label: "Passe", value: profile.stats.passing },
                { label: "Drible", value: profile.stats.dribbling },
                { label: "Defesa", value: profile.stats.defending },
                { label: "Físico", value: profile.stats.physical },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 rounded-xl p-3 text-center border border-white/5"
                >
                  <span className="block font-stat text-xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="block text-[8px] font-bold text-white/40 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {profile.youtubeUrl && (
        <section className="mt-20 px-6">
          <h2 className="font-display font-black italic text-3xl mb-6 uppercase tracking-tighter">
            Skills & <span className="text-primary">Goals</span>
          </h2>
          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-primary/20">
            <iframe
              src={profile.youtubeUrl.replace("watch?v=", "embed/").split("&")[0]}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      <div className="mt-24">
        {profile.links.map((link) => (
          <section
            key={link.id}
            className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5"
          >
            {/* Parallax Background */}
            <div className="absolute inset-0 z-0">
              {link.imageUrl ? (
                <Image
                  src={link.imageUrl}
                  alt={link.title}
                  fill
                  className="object-cover brightness-50"
                  style={{ 
                    transform: "scale(1.1)",
                    objectPosition: "center 20%" 
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black">
                  <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                     <span className="material-symbols-outlined text-[300px] text-white/5">
                        {link.icon || "sports_soccer"}
                     </span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-2xl">
              <span className="material-symbols-outlined text-primary text-5xl mb-4">
                {link.icon || "link"}
              </span>
              <h3 className="font-display font-black italic text-5xl text-white uppercase mb-6 tracking-tighter leading-tight">
                {link.title}
              </h3>
              <a
                href={link.url}
                className="inline-flex items-center gap-3 bg-white text-black font-display font-black italic px-8 py-4 rounded-xl hover:bg-primary transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                Acessar Conteúdo
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-20 px-6 pb-20 text-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>
        <button className="w-full bg-primary text-black font-display font-black italic py-5 rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb), 0.3)] active:scale-95 transition-transform uppercase tracking-widest">
          Entrar em Contato
        </button>
        <p className="mt-8 text-[10px] font-stat text-white/30 tracking-widest uppercase">
          © 2024 {profile.displayName} | TODOS OS DIREITOS RESERVADOS
        </p>
      </footer>
    </main>
  );
}
