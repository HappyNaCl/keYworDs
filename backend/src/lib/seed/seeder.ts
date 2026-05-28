import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const CHUNK_SIZE = 1000;

function buildClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT!, 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
  return new PrismaClient({ adapter });
}

function loadWords(): string[] {
  const path = join(__dirname, "words.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) {
    throw new Error("words.json must be an array of strings");
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const normalized = entry.trim().toLowerCase();
    if (!normalized || normalized.length > 16) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

async function main() {
  const words = loadWords();
  console.log(`Loaded ${words.length} unique words from words.json`);

  const prisma = buildClient();
  try {
    let inserted = 0;
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      const chunk = words.slice(i, i + CHUNK_SIZE).map((text) => ({ text }));
      const result = await prisma.word.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      inserted += result.count;
      console.log(`  ${i + chunk.length}/${words.length}  (+${result.count})`);
    }
    console.log(
      `Done. Inserted ${inserted} new words (existing rows were skipped).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
