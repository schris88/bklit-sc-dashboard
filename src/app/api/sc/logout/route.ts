import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const { stdout } = await execAsync('/usr/local/bin/sc logout --json', {
      env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
    });
    let parsed = {};
    try {
      parsed = JSON.parse(stdout);
    } catch (_) {}
    return NextResponse.json({ ok: true, data: parsed });
  } catch (error: any) {
    console.error('Error executing sc logout:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to logout' },
      { status: 500 }
    );
  }
}
