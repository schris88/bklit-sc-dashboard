import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const isReadOnly = body.readOnly !== false; // Default read-only mode

    const args = ['login'];
    if (isReadOnly) {
      args.push('--local-read-only');
    }

    return new Promise<NextResponse>((resolve) => {
      const child = spawn('/usr/local/bin/sc', args, {
        env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
      });

      let outputBuffer = '';
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill();
          resolve(NextResponse.json({ ok: false, error: 'Login process timed out waiting for auth URL' }, { status: 504 }));
        }
      }, 8000);

      child.stdout.on('data', (data) => {
        outputBuffer += data.toString();
        const urlMatch = outputBuffer.match(/(https:\/\/secure\.scalable\.capital\/activate\?user_code=([A-Z0-9-]+))/i);

        if (urlMatch && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(NextResponse.json({
            ok: true,
            authUrl: urlMatch[1],
            userCode: urlMatch[2],
            isReadOnly
          }));
        }
      });

      child.stderr.on('data', (data) => {
        outputBuffer += data.toString();
      });

      child.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(NextResponse.json({ ok: false, error: err.message }, { status: 500 }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || 'Failed to initiate login' }, { status: 500 });
  }
}
