import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      stats: true,
      links: {
        orderBy: { order: "asc" },
      },
      theme: true,
      clubs: true,
    },
  });

  return NextResponse.json(profile);
}

interface LinkInput {
  id: string;
  title: string;
  url: string;
  icon?: string;
  imageUrl?: string;
  order?: number;
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log("DEBUG: Recebendo atualização de perfil (v2) para:", session.user.id);
    // Timestamp: 1777914000

    const { 
      username, displayName, fullName, nickname, birthDate, city, state, 
      parentName, parentPhone, 
      jerseyNumber, position, secondaryPosition, 
      height, weight, preferredFoot, characteristics,
      currentClub, history,
      avatarUrl, heroImageUrl, youtubeUrl, stats, theme, links, clubs 
    } = body;

    // Fazemos o update ignorando campos que possam dar erro de validação temporariamente
    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      include: {
        stats: true,
        theme: true,
        links: {
          orderBy: { order: "asc" },
        },
        clubs: true,
      },
      data: {
        username,
        displayName,
        fullName,
        nickname,
        birthDate: birthDate ? new Date(birthDate) : null,
        city,
        state,
        parentName,
        parentPhone,
        jerseyNumber,
        position,
        secondaryPosition,
        height: height ? parseFloat(String(height)) : null,
        weight: weight ? parseFloat(String(weight)) : null,
        preferredFoot,
        characteristics: characteristics || [],
        currentClub,
        history,
        avatarUrl,
        heroImageUrl,
        youtubeUrl,
        stats: stats ? {
          upsert: {
            create: {
              goals: Number(stats.goals) || 0,
              assists: Number(stats.assists) || 0,
              matches: Number(stats.matches) || 0,
              pace: Number(stats.pace) || 0,
              shooting: Number(stats.shooting) || 0,
              passing: Number(stats.passing) || 0,
              dribbling: Number(stats.dribbling) || 0,
              defending: Number(stats.defending) || 0,
              physical: Number(stats.physical) || 0,
            },
            update: {
              goals: Number(stats.goals) || 0,
              assists: Number(stats.assists) || 0,
              matches: Number(stats.matches) || 0,
              pace: Number(stats.pace) || 0,
              shooting: Number(stats.shooting) || 0,
              passing: Number(stats.passing) || 0,
              dribbling: Number(stats.dribbling) || 0,
              defending: Number(stats.defending) || 0,
              physical: Number(stats.physical) || 0,
            },
          },
        } : undefined,
        theme: theme ? {
          upsert: {
            create: {
              primaryColor: theme.primaryColor || "#DCFF1E",
              secondaryColor: theme.secondaryColor || "#ffffff",
              backgroundColor: theme.backgroundColor || "#121414",
            },
            update: {
              primaryColor: theme.primaryColor || "#DCFF1E",
              secondaryColor: theme.secondaryColor || "#ffffff",
              backgroundColor: theme.backgroundColor || "#121414",
            },
          },
        } : undefined,
        links: {
          deleteMany: {},
          create: links?.map((link: LinkInput) => ({
            title: link.title || "",
            url: link.url || "",
            icon: link.icon,
            imageUrl: link.imageUrl,
            order: link.order || 0,
          })) || [],
        },
        clubs: {
          deleteMany: {},
          create: clubs?.map((club: any) => ({
            name: club.name || "",
            socialUrl: club.socialUrl || "",
            logoUrl: club.logoUrl || "",
            isCurrent: !!club.isCurrent,
          })) || [],
        },
      },
    });

    if (avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: avatarUrl },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("ERRO CRITICO AO ATUALIZAR PERFIL:", error);
    return NextResponse.json({ 
      error: "Erro ao atualizar perfil", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
