import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username não fornecido" }, { status: 400 });
  }

  // Sanitização básica
  const cleanUsername = username.toLowerCase().trim();

  const profile = await prisma.profile.findUnique({
    where: { username: cleanUsername },
    select: { id: true }
  });

  return NextResponse.json({ 
    available: !profile,
    username: cleanUsername 
  });
}
