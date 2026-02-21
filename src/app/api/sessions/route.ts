import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allSessions = await db.query.sessions.findMany({
    orderBy: [desc(sessions.createdAt)],
    with: {
      generations: {
        limit: 1,
        orderBy: (generations, { asc }) => [asc(generations.createdAt)],
      },
    },
  });

  return NextResponse.json({ sessions: allSessions });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, brandConfig } = body;

  const [session] = await db
    .insert(sessions)
    .values({
      name: name || `Session ${new Date().toLocaleDateString()}`,
      brandConfig: brandConfig ?? null,
    })
    .returning();

  return NextResponse.json({ session });
}
