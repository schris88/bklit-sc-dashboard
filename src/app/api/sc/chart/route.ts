import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isin = searchParams.get('isin');
  const timeframe = searchParams.get('timeframe') || '1y';

  if (!isin) {
    return NextResponse.json({ ok: false, error: 'ISIN parameter is required' }, { status: 400 });
  }

  try {
    const { stdout } = await execAsync(`/usr/local/bin/sc broker chart --isin ${isin} --timeframe ${timeframe} --json`, {
      env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
    });
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error executing sc broker chart for ISIN ${isin}:`, error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch chart' },
      { status: 500 }
    );
  }
}
