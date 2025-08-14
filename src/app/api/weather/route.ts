import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city');
  if (!city) return NextResponse.json({ error: 'Missing city' }, { status: 400 });

  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('q', city);
  url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY || '');
  url.searchParams.set('units', 'metric');

  const r = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!r.ok) return NextResponse.json({ error: 'Weather error' }, { status: 500 });

  const w = await r.json();
  const data = {
    name: w.name,
    temp: Math.round(w.main?.temp),
    desc: w.weather?.[0]?.description,
    icon: w.weather?.[0]?.icon,
  };
  return NextResponse.json({ data });
}
