import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('/usr/local/bin/sc broker watchlist --json', {
      env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
    });
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error executing sc broker watchlist:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, isin } = body;

    let command = '';
    if (action === 'add') {
      if (!isin) {
        return NextResponse.json({ ok: false, error: 'isin is required' }, { status: 400 });
      }
      command = `/usr/local/bin/sc broker watchlist add --isin ${isin} --json`;
    } else if (action === 'remove') {
      if (!isin) {
        return NextResponse.json({ ok: false, error: 'isin is required' }, { status: 400 });
      }
      command = `/usr/local/bin/sc broker watchlist remove --isin ${isin} --json`;
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid action. Use "add" or "remove"' }, { status: 400 });
    }

    try {
      const { stdout } = await execAsync(command, {
        env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
      });
      let data = {};
      try {
        data = JSON.parse(stdout);
      } catch (e) {
        // Output might not be JSON if the CLI doesn't format add/remove properly, wrap in success anyway
        data = { ok: true, output: stdout };
      }
      return NextResponse.json(data);
    } catch (cmdError: any) {
      if (cmdError.stdout) {
        try {
          const parsed = JSON.parse(cmdError.stdout);
          if (parsed.error?.message) {
            return NextResponse.json({
              ok: false,
              error: parsed.error.message,
              hints: parsed.hints
            }, { status: 400 });
          }
        } catch (_) {}
      }
      return NextResponse.json({
        ok: false,
        error: cmdError.message || 'CLI command execution failed'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error managing watchlist:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update watchlist' },
      { status: 500 }
    );
  }
}
