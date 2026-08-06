import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('/usr/local/bin/sc whoami', {
      timeout: 8000,
      env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
    });
    // Parse key: value lines
    const lines = stdout.split('\n');
    const info: Record<string, string> = {};
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        info[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
    return NextResponse.json({ ok: true, data: info });
  } catch (error: any) {
    console.error('Error executing sc whoami:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}
