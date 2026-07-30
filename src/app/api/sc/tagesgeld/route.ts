import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('/usr/local/bin/sc overnight --json', {
      env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
    });
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error executing sc overnight:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch Tagesgeld data' },
      { status: 500 }
    );
  }
}
