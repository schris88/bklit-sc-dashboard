import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('/usr/local/bin/sc broker price-alerts --json', {
      env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
    });
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching price alerts:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch price alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, isin, price, alert_id } = body;

    let command = '';
    if (action === 'add') {
      if (!isin || !price) {
        return NextResponse.json({ ok: false, error: 'isin and price are required' }, { status: 400 });
      }
      const formattedPrice = Number(price).toFixed(4);
      command = `/usr/local/bin/sc broker price-alerts add --isin ${isin} --price ${formattedPrice} --json`;
    } else if (action === 'remove') {
      if (!alert_id) {
        return NextResponse.json({ ok: false, error: 'alert_id is required' }, { status: 400 });
      }
      command = `/usr/local/bin/sc broker price-alerts remove --alert-id ${alert_id} --json`;
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid action. Use "add" or "remove"' }, { status: 400 });
    }

    try {
      const { stdout } = await execAsync(command, {
        env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
      });
      const data = JSON.parse(stdout);
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
    console.error('Error managing price alert:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update price alert' },
      { status: 500 }
    );
  }
}
