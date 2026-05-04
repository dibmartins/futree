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
    },
  });

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, jerseyNumber, position, avatarUrl, heroImageUrl, youtubeUrl, stats, theme, links } = body;

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        displayName,
        jerseyNumber,
        position,
        avatarUrl,
        heroImageUrl,
        youtubeUrl,
        stats: {
          upsert: {
            create: {
              goals: stats.goals || 0,
              assists: stats.assists || 0,
              pace: stats.pace || 0,
              shooting: stats.shooting || 0,
              passing: stats.passing || 0,
              dribbling: stats.dribbling || 0,
              defending: stats.defending || 0,
              physical: stats.physical || 0,
            },
            update: {
              goals: stats.goals,
              assists: stats.assists,
              pace: stats.pace,
              shooting: stats.shooting,
              passing: stats.passing,
              dribbling: stats.dribbling,
              defending: stats.defending,
              physical: stats.physical,
            },
          },
        },
        theme: {
          upsert: {
            create: {
              primaryColor: theme.primaryColor || "#DCFF1E",
              secondaryColor: theme.secondaryColor || "#ffffff",
              backgroundColor: theme.backgroundColor || "#121414",
            },
            update: {
              primaryColor: theme.primaryColor,
              secondaryColor: theme.secondaryColor,
              backgroundColor: theme.backgroundColor,
            },
          },
        },
        links: {
          upsert: links?.map((link: any) => ({
            where: { id: link.id },
            create: {
              title: link.title || "",
              url: link.url || "",
              icon: link.icon,
              imageUrl: link.imageUrl,
              order: link.order || 0,
            },
            update: {
              title: link.title,
              url: link.url,
              icon: link.icon,
              imageUrl: link.imageUrl,
              order: link.order || 0,
            },
          })) || [],
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
