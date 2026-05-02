import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Em um app real, pegaríamos o ID do usuário da sessão/auth
  // Para este MVP, vamos usar o usuário do seed
  const profile = await prisma.profile.findFirst({
    where: { username: "thiagosantos" },
    include: {
      stats: true,
      links: {
        orderBy: { order: "asc" },
      },
      theme: true,
    },
  });

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { displayName, jerseyNumber, position, avatarUrl, heroImageUrl, stats, theme } = body;

    // Novamente, usando o perfil do seed para simplicidade
    const profile = await prisma.profile.update({
      where: { username: "thiagosantos" },
      data: {
        displayName,
        jerseyNumber,
        position,
        avatarUrl,
        heroImageUrl,
        stats: {
          update: {
            ...stats,
          },
        },
        theme: {
          update: {
            ...theme,
          },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
