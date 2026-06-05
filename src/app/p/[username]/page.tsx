import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import UserMenu from "@/components/UserMenu";
import SilhouetteBorderBeam from "@/components/SilhouetteBorderBeam";

export const revalidate = 0; // Desabilita o cache para esta página

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateViewport({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: { theme: true },
  });
  return {
    themeColor: profile?.theme?.primaryColor || "#DCFF1E",
  };
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await prisma.profile.findUnique({
    where: { username },
  });
  if (!profile) return { title: "Atleta não encontrado" };

  return {
    title: `${profile.displayName} | Scouting Profile`,
    description: `Veja os scouts, vídeos e trajetória de ${profile.displayName} no Futree.`,
  };
}

interface Club {
  id: string;
  name: string;
  socialUrl?: string | null;
  logoUrl?: string | null;
  isCurrent: boolean;
}

interface ProfileWithStats {
  displayName: string;
  clubs: Club[];
  fullName?: string | null;
  nickname?: string | null;
  birthDate?: Date | null;
  city?: string | null;
  state?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  avatarUrl?: string | null;
  heroImageUrl?: string | null;
  jerseyNumber?: string | null;
  position?: string | null;
  secondaryPosition?: string | null;
  height?: number | null;
  weight?: number | null;
  preferredFoot?: string | null;
  characteristics?: string[];
  currentClub?: string | null;
  history?: string | null;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  } | null;
  stats?: {
    goals: number;
    assists: number;
    matches: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  } | null;
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string | null;
    imageUrl?: string | null;
  }>;
  youtubeUrl?: string | null;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      stats: true,
      links: {
        orderBy: { order: "asc" },
      },
      theme: true,
      clubs: true,
    },
  }) as unknown as ProfileWithStats;

  if (!profile) {
    notFound();
  }

  const primaryColor = profile.theme?.primaryColor || "#DCFF1E";
  const secondaryColor = profile.theme?.secondaryColor || "#000000";

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);

  const calculateCategory = (birthDate: Date | null | undefined) => {
    if (!birthDate) return "BASE";
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return `SUB-${age}`;
  };

  const category = calculateCategory(profile.birthDate);
  const birthYear = profile.birthDate ? new Date(profile.birthDate).getFullYear() : null;
  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - birthYear : null;
  const showCategory = age === null || age <= 23;
  const location = profile.city && profile.state ? `${profile.city}, ${profile.state}` : profile.city || profile.state || "";

  const getSeasonLabel = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const startYear = month < 6 ? year - 1 : year;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}/${String(endYear).slice(-2)}`;
  };
  const currentSeason = getSeasonLabel();
  const isGoalkeeper = profile.position === "Goleiro";

  const currentClub = (profile.clubs || []).find(c => c.isCurrent);

  const extractHandle = (url: string | null | undefined) => {
    if (!url) return "";
    let trimmed = url.trim();
    if (!trimmed) return "";
    trimmed = trimmed.replace(/\/?(\?.*)?$/, "");
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes(".com")) {
        const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
        const pathSegments = parsed.pathname.split("/").filter(Boolean);
        if (pathSegments.length > 0) {
          return `@${pathSegments[pathSegments.length - 1]}`;
        }
      }
    } catch (e) {
      console.warn("Failed to parse URL for handle extraction:", e);
    }
    return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  };

  const getYoutubeEmbedUrl = (url: string | null | undefined) => {
    if (!url) return null;
    let videoId = "";

    try {
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split(/[?#]/)[0];
      } else {
        const urlParams = new URL(url).searchParams;
        videoId = urlParams.get("v") || "";
      }
    } catch (e) {
      console.error("Erro ao processar URL do YouTube:", e);
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYoutubeEmbedUrl(profile.youtubeUrl);

  return (
    <main
      className="pb-32 font-body overflow-x-hidden bg-[#121414] text-[#e2e2e2]"
      style={{
        "--primary": primaryColor,
        "--primary-rgb": primaryRgb,
        "--secondary": secondaryColor,
        "--secondary-rgb": secondaryRgb,
        "--color-primary": primaryColor,      // Injeção para Tailwind v4
        "--color-primary-rgb": primaryRgb,  // Injeção para Tailwind v4
        "--color-secondary": secondaryColor,
        "--color-secondary-rgb": secondaryRgb,
        color: "#e2e2e2"
      } as React.CSSProperties}
    >
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-white/10 shadow-2xl shadow-primary/10">
        <div className="text-xl font-display font-black italic text-primary tracking-widest uppercase">
          {profile.displayName}
        </div>
        <UserMenu
          isLoggedIn={!!session}
          userImage={session?.user?.image}
          userName={session?.user?.name}
        />
      </header>

      <section className="relative h-[85dvh] min-h-[640px] md:h-[795px] overflow-hidden hero-clip bg-[#080808]">
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
              <SilhouetteBorderBeam
                src={profile.heroImageUrl}
                alt={profile.displayName}
                primaryColor={primaryColor}
                primaryRgb={primaryRgb}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 font-display font-black italic text-8xl uppercase select-none opacity-20">
                PITCH ELITE
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 pb-20 md:pb-24 bg-gradient-to-t from-black via-transparent to-transparent">
          <div className="space-y-0">
            <span className="inline-block px-3 py-1 bg-primary text-black font-display font-black italic text-xs mb-2 angled-accent uppercase">
              {showCategory ? `${category} • ` : ""}{profile.nickname || "PROMESSA"}
            </span>
            <h1 className="font-display font-black italic text-5xl sm:text-6xl md:text-7xl text-white leading-none tracking-tighter uppercase">
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
              <div className="flex flex-col">
                <span className="font-stat font-bold text-white text-xl tracking-widest uppercase leading-none">
                  {profile.position}
                </span>
                {profile.secondaryPosition && (
                  <span className="text-[10px] text-white/40 font-stat uppercase tracking-widest mt-1">
                    Alt: {profile.secondaryPosition}
                  </span>
                )}
              </div>
            </div>
            {location && (
              <div className="flex items-center gap-2 mt-4 text-white/60 font-stat text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                {location}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Perfil Físico & Técnico */}
      <section className="px-6 mt-8 relative z-30">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4 border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-white/40 font-stat uppercase mb-1">Altura</span>
            <span className="text-xl font-stat font-bold text-white">{profile.height || "--"}</span>
            <span className="text-[8px] text-primary font-bold uppercase mt-1">Metros</span>
          </div>
          <div className="glass-card rounded-2xl p-4 border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-white/40 font-stat uppercase mb-1">Peso</span>
            <span className="text-xl font-stat font-bold text-white">{profile.weight || "--"}</span>
            <span className="text-[8px] text-primary font-bold uppercase mt-1">Kg</span>
          </div>
          <div className="glass-card rounded-2xl p-4 border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-white/40 font-stat uppercase mb-1">Pé</span>
            <span className="text-sm font-stat font-bold text-white uppercase">{profile.preferredFoot || "--"}</span>
          </div>
        </div>

        {profile.characteristics && profile.characteristics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {profile.characteristics.map(char => (
              <span key={char} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-stat uppercase tracking-widest text-white/70">
                {char}
              </span>
            ))}
          </div>
        )}

        {profile.stats && (
          <div className="glass-card rounded-[2rem] p-8 overflow-hidden relative border-white/10">
            <div className="absolute -right-10 -bottom-10 font-display font-black italic text-[200px] text-white/[0.03] leading-none select-none">
              {profile.jerseyNumber}
            </div>
            <h2 className="font-display font-black italic text-2xl mb-8 flex items-center gap-2 uppercase">
              <span className="w-2 h-8 bg-primary"></span>
              TEMPORADA {currentSeason}
            </h2>
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="flex flex-col">
                <span className="font-stat text-[56px] font-bold text-white leading-none">
                  {profile.stats.matches || 0}
                </span>
                <span className="font-stat text-xs font-semibold text-white/50 tracking-[0.2em] uppercase mt-2">
                  Jogos
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-stat text-[56px] font-bold text-primary leading-none">
                  {profile.stats.goals || 0}
                </span>
                <span className="font-stat text-xs font-semibold text-white/50 tracking-[0.2em] uppercase mt-2">
                  {isGoalkeeper ? "Gols Sofridos" : "Gols Marcados"}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trajetória */}
      {(currentClub || profile.history) && (
        <section className="mt-20 px-6">
          <h2 className="font-display font-black italic text-3xl mb-6 uppercase tracking-tighter text-white">
            TRAJETÓRIA
          </h2>
          <div className="glass-card rounded-[2rem] p-8 border-white/10 relative overflow-hidden">
            {currentClub && (
              <div className="mb-6 flex items-center gap-4">
                {currentClub.logoUrl && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black/20 border border-white/10 flex-shrink-0 flex items-center justify-center p-2">
                    <Image
                      src={currentClub.logoUrl}
                      alt={currentClub.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-stat text-primary font-bold uppercase tracking-widest block mb-1">Clube Atual</span>
                  <p className="text-2xl font-display font-black italic text-white uppercase">{currentClub.name}</p>
                  {currentClub.socialUrl && (
                    <a
                      href={currentClub.socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-stat text-white/50 hover:text-primary transition-colors flex items-center gap-1 mt-1"
                    >
                      <span className="material-symbols-outlined text-sm">link</span>
                      {extractHandle(currentClub.socialUrl)}
                    </a>
                  )}
                </div>
              </div>
            )}
            {profile.history && (
              <div className="prose prose-invert max-w-none">
                <span className="text-[10px] font-stat text-white/30 font-bold uppercase tracking-widest block mb-4 border-t border-white/5 pt-4">Histórico & Conquistas</span>
                <p className="text-white/70 font-body text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.history}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {embedUrl && (
        <section className="mt-20 px-6">
          <h2 className="font-display font-black italic text-3xl mb-6 uppercase tracking-tighter">
            Skills & <span className="text-primary">Goals</span>
          </h2>
          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-primary/20">
            <iframe
              src={embedUrl}
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
                  unoptimized
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
                className="inline-flex items-center gap-3 bg-primary text-[var(--secondary)] font-display font-black italic px-8 py-4 rounded-xl hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                Acessar Conteúdo
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </section>
        ))}
      </div>

      {/* Growth Hacking CTA */}
      <section className="mt-20 px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-10 text-center">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]">verified_user</span>
          </div>

          <h2 className="font-display font-black italic text-3xl md:text-4xl text-white uppercase mb-4 tracking-tighter leading-tight">
            Quer ter um perfil <span className="text-primary underline decoration-2 underline-offset-8">Elite</span> como este?
          </h2>
          <p className="text-white/60 font-body text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
            Mostre seu talento para o mundo. Crie seu perfil de atleta em menos de 2 minutos e entre no radar dos principais captadores.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-black font-display font-black italic px-8 py-4 rounded-xl hover:bg-primary transition-all active:scale-95 uppercase tracking-widest text-sm"
            >
              Criar Meu Perfil Grátis
              <span className="material-symbols-outlined">bolt</span>
            </a>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-xs text-primary/50">person</span>
                </div>
              ))}
              <span className="ml-3 text-[10px] font-stat text-white/40 uppercase self-center tracking-widest">+500 Atletas Inscritos</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 px-6 pb-20 text-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>
        <a
          href={`https://wa.me/55${profile.parentPhone?.replace(/\D/g, "")}?text=Olá! Gostaria de saber mais sobre o atleta ${profile.displayName} que vi no Futree.`}
          target="_blank"
          className="inline-flex items-center justify-center gap-3 w-full bg-primary text-[var(--secondary)] font-display font-black italic py-5 rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb), 0.3)] active:scale-95 transition-transform uppercase tracking-widest text-center"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.385 1.44 5.216 1.441h.005c5.676 0 10.294-4.618 10.297-10.296.002-2.751-1.071-5.337-3.023-7.291-1.953-1.953-4.54-3.027-7.292-3.028-5.678 0-10.296 4.617-10.299 10.294-.001 1.815.474 3.589 1.378 5.147l-1.05 3.832 3.931-1.031zm11.034-7.462c-.302-.15-.1.45-.4.45-.3 0-1.43-.54-2.31-1.32-.88-.78-1.52-1.88-1.52-1.88s-.18-.32.06-.52c.24-.2.3-.34.46-.54.16-.2.12-.32.06-.46-.06-.14-.52-1.26-.72-1.74-.2-.48-.44-.4-.6-.4h-.5c-.18 0-.48.06-.72.32-.24.26-.94.92-.94 2.24s.96 2.6 1.1 2.78c.14.18 1.9 2.9 4.6 4.06.64.28 1.14.44 1.54.56.64.2 1.22.18 1.68.12.52-.08 1.6-.66 1.82-1.28.22-.62.22-1.16.16-1.28-.06-.12-.22-.18-.52-.33z" />
          </svg>
          Falar com o Atleta
        </a>
        <p className="mt-8 text-[10px] font-stat text-white/30 tracking-widest uppercase">
          © 2024 {profile.displayName} | TODOS OS DIREITOS RESERVADOS
        </p>
      </footer>
    </main>
  );
}
