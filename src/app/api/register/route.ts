import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, birthDate, isMinor, guardian, consent } = body;

    if (!email || !password || !birthDate) {
      return NextResponse.json({ error: "Dados de cadastro incompletos" }, { status: 400 });
    }

    // Calcular idade
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return NextResponse.json({ error: "Data de nascimento inválida" }, { status: 400 });
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const verifiedIsMinor = age < 16;

    // Verificar se o email já está cadastrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Se for menor de 16 anos, valida e processa o responsável e consentimento
    if (verifiedIsMinor) {
      if (!guardian || !guardian.fullName || !guardian.cpf || !guardian.email) {
        return NextResponse.json(
          { error: "Dados do responsável legal são obrigatórios para atletas menores de 16 anos." },
          { status: 400 }
        );
      }

      const cpfClean = guardian.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) {
        return NextResponse.json({ error: "CPF do responsável inválido" }, { status: 400 });
      }

      // Hash do CPF do responsável (SHA-256)
      const documentHash = createHash("sha256").update(cpfClean).digest("hex");

      // Buscar ou criar o responsável no banco de dados
      let guardianRecord = await prisma.guardian.findFirst({
        where: {
          OR: [
            { email: guardian.email },
            { documentHash }
          ]
        }
      });

      if (!guardianRecord) {
        guardianRecord = await prisma.guardian.create({
          data: {
            fullName: guardian.fullName,
            email: guardian.email,
            documentHash,
            verifiedAt: new Date(), // Confirmado implicitamente pelo fluxo de cadastro do menor
          }
        });
      }

      // Criar o usuário atrelado ao responsável legal
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          birthDate: birth,
          guardianId: guardianRecord.id,
        }
      });

      // Registrar o log de consentimento (Append-Only)
      const clientIp = (request.headers.get("x-forwarded-for") || "127.0.0.1").split(",")[0].trim();
      const userAgent = request.headers.get("user-agent") || "unknown";

      await prisma.consentLog.create({
        data: {
          guardianId: guardianRecord.id,
          userId: user.id,
          action: "GRANTED",
          policyVersion: "v1.0.0",
          ipAddress: clientIp,
          userAgent,
          permissions: JSON.stringify(consent || {}),
        }
      });

      return NextResponse.json({ user: { id: user.id, email: user.email } });
    } else {
      // Se for maior ou igual a 16 anos, cadastra normalmente
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          birthDate: birth,
        }
      });

      return NextResponse.json({ user: { id: user.id, email: user.email } });
    }
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

