import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = "postgresql://neondb_owner:npg_sEtvcB5uK8xL@ep-morning-term-acdtrpbr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "thiago@pitch.elite" },
    update: {
      password: hashedPassword
    },
    create: {
      email: "thiago@pitch.elite",
      password: hashedPassword,
      profile: {
        create: {
          username: "thiagosantos",
          displayName: "THIAGO SANTOS",
          jerseyNumber: "10",
          position: "ST / WINGER",
          avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV7wtOlP-vtAiWnyLR56rbNFhqDVj-PSrXmVuLGOhu7GTlcs22TI7b-EpbcjI7GDplETyl1_5ZkgkiC4l9_tQB7Go1054WFpR8oEljegTjK50-uCXqsvbv7fHkgas3VCgKzsKXCBbTk3JjKidFMhQ3jDaPTqfpaddnREAd_O-53vvQ3qTRzbnZqLJgK_pp3WZ9FbitCKDruyod8ZRLks6QG3YRH9UaW8SjMMiJG-eIN-6XWR8qQlufrGP_JX7s0y9RyprCU9Ws99s",
          heroImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNSoN7g16hLhj_j7gHF9j1QDMfaL-Ysmc7uPcc4kEPbmh0GeHGfUrFicPksTjvGxWlI5QIyj6q26opaT3v7EbUZ98XoX8DHYDl5QxhjEQm8m21HlWWAFGXj6e_wipQ2JyiOpsgCDpmKURkQ4N4tXBbDWBGT3T7qxyq0y1nxVZQchLcZK5pBugx_j0DqeECZf6CrVGzW2Jo5ADzYhtaCk4QJd5UPJJyy1OntuK05I2G5YlhT_WFT-RLUuCcsRAqnpd7ro-u2CapbMw",
          theme: {
            create: {
              primaryColor: "#DCFF1E",
            }
          },
          stats: {
            create: {
              goals: 24,
              assists: 12,
              pace: 92,
              shooting: 88,
              passing: 85,
              dribbling: 90,
              defending: 45,
              physical: 78,
            }
          },
          links: {
            create: [
              { title: "Match Schedule", url: "#", icon: "event", order: 1 },
              { title: "Press Kit", url: "#", icon: "description", order: 2 },
              { title: "Scouting Report", url: "#", icon: "visibility", order: 3 },
            ]
          }
        }
      }
    }
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
