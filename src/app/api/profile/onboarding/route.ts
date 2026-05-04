import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { username, displayName } = await request.json();

    if (!username || !displayName) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { username },
    });

    if (existingProfile) {
      return NextResponse.json({ error: "Username já em uso" }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        username,
        displayName,
        theme: {
          create: {
            primaryColor: "#DCFF1E",
          },
        },
        stats: {
          create: {
            goals: 0,
            assists: 0,
          },
        },
        links: {
          create: [
            { title: "Meu Clube", url: "#", icon: "sports_soccer", order: 1 },
            { title: "Melhores Momentos", url: "#", icon: "video_library", order: 2 },
          ],
        },
      },
      include: {
        stats: true,
        theme: true,
        links: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro no onboarding:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
