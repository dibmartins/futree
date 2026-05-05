import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const type = formData.get("type") as string; // 'avatar', 'hero', or 'link'

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload para o Vercel Blob
    const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const { url } = await put(filename, buffer, {
      access: "public",
      contentType: file.type || "image/png",
      token: process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
