import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import UserMenu from "@/components/UserMenu";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Noise Overlay */}
      <div className="fixed inset-0 bg-noise z-0"></div>

      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10">
        <div className="flex justify-between items-center px-5 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl font-bold text-primary-fixed">sports_soccer</span>
            <span className="font-display text-2xl italic font-black text-primary-fixed tracking-tighter uppercase">PITCH ELITE</span>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <a className="text-on-surface font-medium hover:text-primary-fixed transition-colors duration-300" href="#features">Vantagens</a>
            <a className="text-on-surface font-medium hover:text-primary-fixed transition-colors duration-300" href="#how-it-works">Como Funciona</a>
            <a className="text-on-surface font-medium hover:text-primary-fixed transition-colors duration-300" href="#plans">Planos</a>
          </nav>
          <div className="flex items-center gap-4">
            {session ? (
              <UserMenu userImage={session.user?.image} userName={session.user?.name} />
            ) : (
              <Link
                href="/login"
                className="bg-primary-fixed text-on-primary-fixed font-display text-xs italic px-6 py-2 rounded uppercase hover:bg-primary-fixed-dim transition-all active:scale-95"
              >
                CRIAR PERFIL
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[795px] flex flex-col md:flex-row items-center px-5 max-w-7xl mx-auto gap-8 mt-8 pb-10">
          <div className="flex-1 flex flex-col gap-6 z-20 relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-fixed/20 blur-[100px] rounded-full pointer-events-none"></div>
            <h1 className="font-display text-5xl md:text-7xl text-white italic uppercase drop-shadow-lg max-w-2xl leading-[0.9]">
              O SEU PERFIL DE CRAQUE <span className="text-primary-fixed block mt-2">COMEÇA AQUI</span>
            </h1>
            <p className="font-body text-lg text-on-surface-variant max-w-lg">
              Crie sua carta personalizada estilo EA FC e seja visto por olheiros do mundo todo. Eleve seu jogo para o próximo nível digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/login"
                className="bg-primary-fixed text-on-primary-fixed font-display text-xl italic uppercase px-8 py-4 rounded hover:bg-primary-fixed-dim transition-all active:scale-95 shadow-[0_0_30px_rgba(207,241,0,0.3)] text-center"
              >
                CRIAR MEU PERFIL AGORA
              </Link>
              <button className="glass-panel text-white font-display text-lg italic uppercase px-8 py-4 rounded hover:bg-white/10 transition-all active:scale-95 border border-white/20">
                VER EXEMPLOS
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 glass-panel px-4 py-2 w-fit rounded-full border border-white/5">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-surface-variant border-2 border-background overflow-hidden relative">
                    <Image
                      src={`https://lh3.googleusercontent.com/aida-public/AB6AXuCcBhXHv_zKr2weqqVOiEBX3XyjlDha2-YGk7AiufczOMu-p4JdgE8iUiY6tPw0kQMmyKF6-__qCTylAm5ytx5Y3TCGe8hggAIdjBIL0B1U10l_WjD9GU97K20qBmGeUgTeXDmvtwe3De9DeGMce7yWqP7fGbs0grh8wMtbYlYw-0zAPzBtdAU_zDDHbfSiVTdTJn9ggFYLvy98B34Ci93JTgbummo83X68s4JSaqEaCces7a8Nn6LfYoiQyqVej9vpTL2IA3RSlqs`}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <span className="font-stat text-[10px] text-on-surface-variant tracking-widest uppercase">Mais de 10.000 talentos já cadastrados</span>
            </div>
          </div>

          {/* Right: Visual Motif */}
          <div className="flex-1 relative w-full flex justify-center items-center mt-12 md:mt-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-fixed/10 to-transparent rounded-full blur-3xl transform -skew-x-12 scale-150"></div>
            <div className="relative w-[320px] md:w-[380px] h-[500px] glass-panel rounded-xl p-4 flex flex-col justify-end overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border-t-primary-fixed/30 border-l-primary-fixed/30">
              <div className="absolute -right-8 top-10 font-display text-[200px] leading-none italic font-black text-white/5 pointer-events-none">10</div>
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKSIP_592XOYhiew3NqVnS31TDsHOLTQk8XBX9rYxA3rS3EhBrDVODV2ZtjSKBauTN5qAGlhHF2xERfvPLPysszSd_nmCXfB3yYBI3pWF8yangZtRJ8FqjS0z5-5St8WJ5nd7iSk8s7aWvTwCMx9JD-Bf1kNpZ-4Fo0rSVV0TlDo9oWMAw3QB2defO2xxpG7aRVr6NmTiaWKG18ENC-QtYSl3kNRnSpKymYpvNgZHiPtQN-Q0fVlPq0erro9gW9iVwZF_HQoihvTA"
                  alt="Player Card"
                  fill
                  className="object-cover object-top opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent h-full w-full"></div>
              <div className="relative z-20 flex flex-col gap-2">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="font-display text-2xl text-white italic uppercase">SILVA</h3>
                    <p className="font-stat text-[10px] text-primary-fixed tracking-widest uppercase">ATA • BRASIL</p>
                  </div>
                  <div className="font-stat text-4xl text-primary-fixed">88</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "PAC", value: 92 },
                    { label: "SHO", value: 85 },
                    { label: "DRI", value: 89 },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-panel p-2 rounded flex flex-col items-center">
                      <span className="font-stat text-lg font-bold text-white">{stat.value}</span>
                      <span className="font-stat text-[8px] text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                      <div className="w-full h-1 bg-surface mt-1 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-fixed" style={{ width: `${stat.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-4 -left-2 bg-primary-fixed text-background font-display text-[10px] italic px-3 py-1 uppercase transform -rotate-6 shadow-lg border border-primary-fixed-dim">
                ELITE PROSPECT
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-surface-container-high py-20 clip-slant-reverse mt-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(#cff100 1px, transparent 1px)`, backgroundSize: "20px 20px" }}></div>
          <div className="max-w-7xl mx-auto px-5 relative z-10 pt-10">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-6xl text-white italic uppercase mb-4">POR QUE O <span className="text-primary-fixed">PITCH ELITE?</span></h2>
              <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">Sua identidade digital no mundo do futebol. Desenhada para atrair a atenção de quem importa.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "visibility", title: "Visibilidade Total", description: "Seu perfil desenhado para impacto imediato. Compartilhe seu link único com scouts e treinadores." },
                { icon: "query_stats", title: "Stats em Tempo Real", description: "Atualize suas métricas físicas e técnicas e veja sua carta evoluir com o seu desempenho em campo." },
                { icon: "link", title: "Link na Bio Profissional", description: "Reúna seus highlights do YouTube, TikTok e stats em um único hub digital profissional." },
              ].map((feature) => (
                <div key={feature.title} className="glass-panel p-8 rounded-xl border border-white/5 hover:border-primary-fixed/50 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/10 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:bg-primary-fixed/20 transition-all"></div>
                  <span className="material-symbols-outlined text-4xl text-primary-fixed mb-6 block">{feature.icon}</span>
                  <h3 className="font-display text-xl text-white italic uppercase mb-3">{feature.title}</h3>
                  <p className="font-body text-on-surface-variant">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl text-white italic uppercase mb-4">COMO FUNCIONA</h2>
            <div className="w-24 h-1 bg-primary-fixed mx-auto -skew-x-12"></div>
          </div>

          <div className="flex flex-col gap-24 relative">
            {/* Central line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-fixed via-surface-variant to-transparent transform -translate-x-1/2"></div>

            {[
              {
                step: "01",
                title: "CRIE SUA CONTA",
                description: "Comece fazendo o upload da sua melhor foto e preenchendo suas informações básicas. Defina sua posição, altura, pé dominante e clube atual.",
                badge: "PERFIL BASE",
                icon: "person_add",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfgrceqdiFnCuXBJS0XjLNbS3rzukPXsic50uHMDA-qzqqhZQFEZnqA2FQZXWN2NsMayeySq59nzZYnwKY-si68qvvMowOpBcTwza__PBa-kpKm_YvWW9hwPAgWvaHYjMS41thxGw4W7hsU1ELaDTqhC2gK6PSupo8iP4xe57HTQ-ZhTR5_K6UbUDQb0BtfRwQUtBJvca3KyWR-DCBMMVJukfWOIjI8gPoFvr1yOtJmUr3Fc4eB-jAOrFQuIMmjNCha2d11g7AiGg",
                reverse: false
              },
              {
                step: "02",
                title: "REGISTRE SEUS GOLS",
                description: "Adicione suas estatísticas detalhadas de performance. Conecte links do YouTube para criar uma galeria de highlights impossível de ignorar.",
                badge: "SCOUTING TECH",
                icon: "monitoring",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHc12jWVDXdqckePUibwE1ytmWJsz3F3W-7KUbvcaj_ZxodqSEVxXUiIcqr8x7VHBY9zkwVn9KvOie3zkmWv6cQjj8bsHjgJT8BXVE_gl7VjRcwzK09tdL73Nv7PRo_m_ynFJhgvbAaPAuD7J3PrF2Y9DSf3v4n6ZEzgfPj48OpZZ0n7fGtcEpIvuSGPO9r_sD1pxHqkZRcYrSfEQFVgLQIvDwvqfGdVPlqXY3X4sHH4wLZ0nd8yX8dIWT4-eSYFNRc2ahVhIwPR4",
                reverse: true
              },
              {
                step: "03",
                title: "COMPARTILHE SEU LINK",
                description: "Coloque seu link exclusivo na bio do Instagram. Use-o como seu cartão de visitas digital para atrair olheiros e clubes.",
                badge: "VIRAL GROWTH",
                icon: "share",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNA8_JuQznrjsVdvZdyNYcD_MgXO13aMxOkDbeQz30AdyPU2ewlnmBZh92XkD4ixzO71zRs3VS2UNwkEOZ55I9onGjzIEw4UUgStZmZsw7kqCcxozCzXO882TNbQAcxex1o74v8XI2ZW5xjv7kQVEes6MnH17zLaD2m2AU1eLYfYpDh53IGfg4EQ4OOqT9yWYLOIkKQYiMcT5UltFiAnxz_MklKO_swKQoull2XLkLJLE3URilGE4GtgIMp41jiUeUnQjBUOiuPgs",
                reverse: false
              }
            ].map((step, idx) => (
              <div key={step.step} className={`relative flex flex-col ${step.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between gap-12`}>
                <div className={`w-full md:w-1/2 flex ${step.reverse ? 'justify-start md:pl-12' : 'justify-end md:pr-12'} relative`}>
                  <div className={`absolute ${step.reverse ? 'left-0 md:left-12' : 'right-0 md:right-12'} top-0 text-[120px] font-display italic font-black text-surface-variant/30 leading-none -z-10 -translate-y-8 translate-x-4`}>{step.step}</div>
                  <div className="bg-surface-container/60 backdrop-blur-2xl border border-white/5 p-8 rounded-xl w-full max-w-md relative overflow-hidden group">
                    <div className={`absolute top-0 ${step.reverse ? 'right-0' : 'left-0'} w-1 h-full bg-primary-fixed transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500`}></div>
                    <h2 className="font-display text-2xl italic uppercase text-white mb-4">{step.title}</h2>
                    <p className="font-body text-on-surface-variant mb-6">{step.description}</p>
                    <div className="inline-flex items-center gap-2 font-stat text-[10px] text-primary-fixed bg-primary-fixed/10 px-4 py-2 rounded-full uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">{step.icon}</span>
                      {step.badge}
                    </div>
                  </div>
                </div>
                {/* Timeline Node */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface border-2 border-primary-fixed items-center justify-center shadow-[0_0_15px_rgba(207,241,0,0.5)] z-20">
                  <div className="w-3 h-3 bg-primary-fixed rounded-full"></div>
                </div>
                <div className={`w-full md:w-1/2 ${step.reverse ? 'flex justify-end md:pr-12' : 'md:pl-12'}`}>
                  <div className={`relative w-full max-w-md aspect-[4/5] mx-auto md:mx-0 rounded-2xl overflow-hidden transform ${step.reverse ? 'rotate-2' : '-rotate-2'} hover:rotate-0 transition-transform duration-500 border border-white/10`}>
                    <div className="absolute inset-0">
                      <Image src={step.image} alt={step.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Talent Feed Preview Section */}
        <section id="feed" className="py-24 px-5 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-6xl text-white italic uppercase tracking-tighter">
                FEED DE <span className="text-primary-fixed">TALENTOS</span>
              </h2>
              <p className="font-body text-on-surface-variant mt-2 max-w-2xl">
                Descubra a próxima geração de craques. Perfis otimizados para recrutadores de elite.
              </p>
            </div>
            <Link href="/login" className="bg-surface-variant text-white font-stat text-[10px] px-6 py-3 rounded uppercase tracking-widest hover:bg-surface-bright transition-colors border border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">search</span> VER TODOS
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "D. SILVA", pos: "ST", group: "U17 | BRASIL", pac: 88, sho: 85, dri: 90, num: "09", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwqOZo1hc_YaE9oHp08UtiVCyjXd1qftj0GZdJv4h_OHeQJtxe1Cc0BVLJcDXg_CQVTYZr5j7uezBDMdhrpO_d6c5gs82ZzXwecz508YKKDCqpiPyk9UdELA4a8PGDmZRK1hFmKwT7LwZ8InABhkFha5vzBe13687Hl16r5PHJUmeIZ6SdLLrBjqg9P4J4ktbvDTSY2FJoUuOLmRR_tq4AbQQSL54JMkCzRTK0oomn-AjVKZom35zhAkmCG5zlJM1UpzgOTkCU3ZM", badge: "TOP PROSPECT" },
              { name: "M. ODRIA", pos: "CAM", group: "U19 | SPAIN", pac: 82, sho: 78, dri: 89, num: "10", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNsVUsha9h2BwiN81yw6wzlJaHXgg2OUn74kK1O8MeGIQf667zy9j92Pt-pAIv9bWeGm2ddX4oRLec1FXpyr2dcbVLuIhqrjUqYM2P9E9klVELvbTN6jg1iQLB5oGr3e-s0Ag_PrZvChpvBSc0Es0eKZjSz2stIPaMy79wbwu_sk5E1Dep57T7vVJZIcjqCrLPn_niXQmsPcWyUdttV1nDfgOz9n9gSYnU7JkqHg1Hwi55REoxc0hiQp3TFytGRtUfIGhCLNhnlzc", badge: "PLAYMAKER" },
              { name: "J. TERRY", pos: "CB", group: "U17 | ENGLAND", pac: 75, sho: 60, dri: 68, num: "04", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_b9oHP7hPuq3D3gFtkWWrk1U0_fy6KPHRVLqdwffAvWbZsxLf6fsAPq_bH1ZBIyGVFEgr0t6aYMhXaeaLpRhgrfCELLGGHagqyj1XYWU1gp9j8n7yR40BiB5iqm3ZwZZmHRBan_ALbO_wjACxIwRVzQT0hl3vDmoj-N-C55bN9jk0mGpIkvpwVWY12piTrh_2lwKhoEzzXdWynZtIqWO9hqtJ9aLE1tJjaxyyUIZF8dssMdKPRM6mJ4QU2mMNFbeKuVw-nBdl0oI", badge: "DEFENSIVE WALL" }
            ].map((player) => (
              <div key={player.name} className="relative bg-surface-container border border-surface-variant rounded-xl overflow-hidden group cursor-pointer hover:border-primary-fixed transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest via-surface-container to-surface-container-lowest opacity-90 z-0"></div>
                <div className="absolute top-4 right-4 font-display text-[120px] leading-none text-white/5 italic font-black select-none pointer-events-none z-0 tracking-tighter">{player.num}</div>
                <div className="absolute top-4 left-4 bg-primary-fixed text-on-primary-fixed font-stat text-[8px] font-bold px-3 py-1 -rotate-6 transform shadow-lg z-20 border border-white/20 uppercase tracking-widest">
                  {player.badge}
                </div>
                <div className="relative h-64 w-full mt-8 flex justify-center items-end z-10">
                  <Image src={player.img} alt={player.name} fill className="object-contain object-bottom filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105" unoptimized />
                </div>
                <div className="relative z-20 p-5 bg-gradient-to-t from-surface via-surface/95 to-surface/40 backdrop-blur-sm border-t border-white/5 flex-grow flex flex-col justify-end">
                  <div className="text-center mb-4 border-b border-surface-variant pb-3 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-primary-fixed shadow-[0_0_10px_rgba(207,241,0,0.8)]"></div>
                    <h3 className="font-display text-2xl italic text-white uppercase tracking-tight group-hover:text-primary-fixed transition-colors mt-2">{player.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="font-stat text-[10px] text-on-primary-fixed bg-primary-fixed px-2 py-[2px] rounded-sm uppercase tracking-widest">{player.pos}</span>
                      <span className="font-stat text-[10px] text-on-surface-variant uppercase tracking-widest">{player.group}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { label: "PAC", value: player.pac },
                      { label: "SHO", value: player.sho },
                    ].map(stat => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="font-stat text-[10px] text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
                        <div className="flex flex-col items-end">
                          <span className="font-stat text-lg font-bold leading-none text-white">{stat.value}</span>
                          <div className="w-12 h-1 bg-surface-variant mt-1 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-fixed" style={{ width: `${stat.value}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="relative z-10 py-24 px-5 max-w-7xl mx-auto w-full">
          <header className="text-center mb-16 relative">
            <h2 className="font-display text-4xl md:text-6xl italic uppercase text-white">ESCOLHA SEU PLANO</h2>
            <p className="font-body text-on-surface-variant mt-4 max-w-2xl mx-auto text-lg">Eleve seu jogo. Mostre seu talento. Seja notado por olheiros em todo o mundo.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto items-center">
            {/* Basic Plan */}
            <div className="bg-surface-container-low/50 backdrop-blur-2xl border border-surface-variant rounded-xl p-8 flex flex-col h-full relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-surface-variant/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="font-display text-2xl italic uppercase text-white mb-2">BÁSICO</h3>
                <div className="mb-8">
                  <span className="font-stat text-4xl font-bold text-white">Gratuito</span>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-4 font-body text-on-surface-variant">
                    {["Stats limitadas", "1 vídeo de highlight", "Link de perfil padrão"].map(item => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                        {item}
                      </li>
                    ))}
                    {["Sem selo de verificado", "Sem destaque no feed"].map(item => (
                      <li key={item} className="flex items-center gap-3 opacity-50">
                        <span className="material-symbols-outlined text-sm">close</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="mt-8 w-full border-2 border-surface-variant text-white font-display text-sm italic py-4 rounded uppercase hover:bg-surface-variant transition-colors text-center"
                >
                  COMEÇAR AGORA
                </Link>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="bg-surface-container/80 backdrop-blur-3xl border border-primary-fixed/50 rounded-xl p-8 flex flex-col h-full relative overflow-hidden shadow-[0_0_30px_rgba(207,241,0,0.15)] md:scale-105 z-10">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed/10 blur-3xl rounded-full"></div>
              <div className="absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed font-stat text-[10px] font-bold px-4 py-1 rounded-bl-lg uppercase tracking-widest">RECOMENDADO</div>
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="font-display text-2xl italic uppercase text-primary-fixed mb-2 flex items-center gap-2">
                  ELITE
                  <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </h3>
                <div className="mb-8 flex items-end gap-1">
                  <span className="font-stat text-4xl font-bold text-white">R$ 19,90</span>
                  <span className="font-body text-on-surface-variant pb-1">/mês</span>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-4 font-body text-white">
                    {[
                      "Stats ilimitadas",
                      "Todos os vídeos de highlight",
                      "Link de perfil personalizado",
                      "Selo de verificado exclusivo",
                      "Destaque prioritário no feed"
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary-fixed text-sm">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="mt-8 w-full bg-primary-fixed text-on-primary-fixed font-display text-xl italic py-4 rounded uppercase hover:bg-surface-tint transition-colors shadow-[0_0_20px_rgba(207,241,0,0.3)] active:scale-95 text-center"
                >
                  SER UM ATLETA ELITE
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 mt-32 px-5 flex justify-center pb-32">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-fixed to-white blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 -skew-x-12"></div>
            <Link
              href="/login"
              className="relative bg-primary-fixed text-on-primary-fixed font-display text-2xl italic uppercase px-12 py-6 -skew-x-12 hover:bg-white transition-colors duration-300 flex items-center gap-4"
            >
              <span className="skew-x-12">COMEÇAR AGORA</span>
              <span className="material-symbols-outlined skew-x-12">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full py-16 border-t border-surface-variant relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-5 gap-8 max-w-7xl mx-auto">
          <div className="font-display text-2xl italic font-black text-primary-fixed uppercase tracking-tighter">PITCH ELITE</div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a className="font-body text-on-surface-variant hover:text-primary-fixed underline transition-all" href="#">Scouting Network</a>
            <a className="font-body text-on-surface-variant hover:text-primary-fixed underline transition-all" href="#">Leaderboards</a>
            <a className="font-body text-on-surface-variant hover:text-primary-fixed underline transition-all" href="#">Privacy Policy</a>
            <a className="font-body text-on-surface-variant hover:text-primary-fixed underline transition-all" href="#">Terms of Service</a>
          </nav>
          <div className="font-body text-on-surface-variant text-sm">© 2024 PITCH ELITE. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
}
