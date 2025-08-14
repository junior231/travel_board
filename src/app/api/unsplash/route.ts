import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || 'kyoto';
  const page = Number(req.nextUrl.searchParams.get('page') || 1);
  const perPage = 18;

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', q);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('orientation', 'landscape');

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    next: { revalidate: 60 },
  });

  if (!r.ok) {
    return NextResponse.json({ error: 'Unsplash error' }, { status: 500 });
  }

  const data = await r.json();
  const results = (data.results || []).map((x: any) => ({
    id: x.id,
    alt: x.alt_description || 'Photo',
    src: x.urls.regular,
    thumb: x.urls.small,
    author: x.user?.name,
    authorLink: x.user?.links?.html,
    location: x.location?.name || null,
  }));

  return NextResponse.json({ results, total: data.total, totalPages: data.total_pages });
}
