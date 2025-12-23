import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple server-side writer to persist site data locally during dev.
// This is used only when running the dev server; static export will not rely on it.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projects, welcomePageData } = body ?? {};

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json({ error: 'projects must be an array' }, { status: 400 });
    }

    // Basic structure check; not exhaustive
    if (!welcomePageData) {
      return NextResponse.json({ error: 'welcomePageData is required' }, { status: 400 });
    }

    const payload = {
      projects,
      welcomePageData,
      savedAt: new Date().toISOString(),
    };

    const filePath = path.join(process.cwd(), 'public', 'data', 'siteData.json');
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');

    return NextResponse.json({ ok: true, file: '/public/data/siteData.json' });
  } catch (err) {
    console.error('Failed to save site data', err);
    return NextResponse.json({ error: 'Failed to save site data' }, { status: 500 });
  }
}
