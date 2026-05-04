import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { removeBackground } from "@imgly/background-removal-node";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const type = formData.get("type") as string; // 'avatar', 'hero', or 'link'
    const linkId = formData.get("linkId") as string;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let processedBuffer = buffer;
    // Se for hero ou link (sessão), removemos o background para manter o estilo
    if (type === "hero" || type === "link") {
      console.log(`Iniciando remoção de background para ${type}...`);
      try {
        // Criamos um Blob nativo para forçar a biblioteca a usar o decodificador correto
        const imageBlob = new Blob([buffer], { type: file.type });
        
        const resultBlob = await removeBackground(imageBlob, {
          model: "medium",
          progress: (step, current, total) => {
            console.log(`Progresso: ${step} - ${current}/${total}`);
          }
        });
        processedBuffer = Buffer.from(await resultBlob.arrayBuffer());
        console.log("Remoção de background concluída com sucesso.");
      } catch (err) {
        console.error("Erro detalhado no removeBackground:", err);
        throw err;
      }
    }

    // Upload para o Vercel Blob
    const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const { url } = await put(filename, processedBuffer, {
      access: "public",
      contentType: type === "hero" ? "image/png" : file.type,
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
