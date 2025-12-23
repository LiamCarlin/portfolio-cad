import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Save site data to disk (public/data/siteData.json) and emit image files under public/uploads.
// This runs only in the dev server; the static site consumes the generated files.

interface UploadedImageLike {
  id: string;
  name: string;
  data?: string;
  caption?: string;
  url?: string;
}

const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
};

const dataUrlToBuffer = (dataUrl: string) => {
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  let ext = 'png';
  if (mime === 'image/jpeg') ext = 'jpg';
  else if (mime === 'image/webp') ext = 'webp';
  else if (mime === 'image/svg+xml') ext = 'svg';
  return { buffer, ext };
};

const writeImageFromDataUrl = async (uploadsDir: string, dataUrl: string, filenameBase: string) => {
  const parsed = dataUrlToBuffer(dataUrl);
  if (!parsed) return null;
  const filename = `${filenameBase}.${parsed.ext}`;
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, parsed.buffer);
  // Return relative path so the client can resolve with basePath
  return `uploads/${filename}`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projects, welcomePageData, bannerImageData, profileImageData } = body ?? {};

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json({ error: 'projects must be an array' }, { status: 400 });
    }
    if (!welcomePageData) {
      return NextResponse.json({ error: 'welcomePageData is required' }, { status: 400 });
    }

    const uploadsDir = await ensureUploadsDir();

    // Process projects: move inline images to files
    const processedProjects = await Promise.all(projects.map(async (proj: any, pIndex: number) => {
      const clone = { ...proj };

      // Thumbnail
      if (clone.thumbnailFile && typeof clone.thumbnailFile === 'string' && clone.thumbnailFile.startsWith('data:')) {
        const url = await writeImageFromDataUrl(uploadsDir, clone.thumbnailFile, `project-${proj.id}-thumb`);
        if (url) {
          clone.thumbnail = url;
          clone.thumbnailFile = undefined;
        }
      }

      // Images array
      if (Array.isArray(clone.images)) {
        clone.images = await Promise.all((clone.images as UploadedImageLike[]).map(async (img, i) => {
          if (img?.data && img.data.startsWith('data:')) {
            const url = await writeImageFromDataUrl(uploadsDir, img.data, `project-${proj.id}-img-${i}`);
            return { ...img, url, data: undefined };
          }
          return img;
        }));
      }

      // Content blocks gallery/images could be handled here if needed
      return clone;
    }));

    // Process banner image if provided
    const processedWelcome = { ...welcomePageData };
    if (bannerImageData && typeof bannerImageData === 'string' && bannerImageData.startsWith('data:')) {
      const url = await writeImageFromDataUrl(uploadsDir, bannerImageData, 'welcome-banner');
      if (url) {
        processedWelcome.bannerImageUrl = url;
      }
    }

    // Process profile image if provided
    if (profileImageData && typeof profileImageData === 'string' && profileImageData.startsWith('data:')) {
      const url = await writeImageFromDataUrl(uploadsDir, profileImageData, 'profile');
      if (url) {
        processedWelcome.profileImageUrl = url;
      }
    }

    const payload = {
      projects: processedProjects,
      welcomePageData: processedWelcome,
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

