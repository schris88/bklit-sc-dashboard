import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SC_OPTIONS = {
  env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` },
  timeout: 20000
};

export async function POST(request: Request) {
  try {
    // 1. Fetch current alarms
    let alerts: any[] = [];
    try {
      const { stdout: alarmsOut } = await execAsync('/usr/local/bin/sc broker price-alerts --json', SC_OPTIONS);
      const alarmsJson = JSON.parse(alarmsOut);
      alerts = alarmsJson.result?.items || alarmsJson.items || (Array.isArray(alarmsJson.result) ? alarmsJson.result : []);
    } catch (err) {
      console.warn('Failed to fetch existing alerts or none exist:', err);
    }

    // 2. Delete all existing alarms
    for (const alert of alerts) {
      const alertId = alert.alert_id || alert.id;
      if (alertId) {
        try {
          await execAsync(`/usr/local/bin/sc broker price-alerts remove --alert-id ${alertId}`, SC_OPTIONS);
        } catch (err) {
          console.error(`Failed to remove alert ${alertId}:`, err);
        }
      }
    }

    // 3. Fetch holdings
    const { stdout: holdingsOut } = await execAsync('/usr/local/bin/sc broker holdings --json', SC_OPTIONS);
    const holdingsJson = JSON.parse(holdingsOut);
    const holdings = holdingsJson.result?.items || holdingsJson.items || (Array.isArray(holdingsJson.result) ? holdingsJson.result : []);

    // 4. Fetch watchlist
    let watchlist: any[] = [];
    try {
      const { stdout: watchlistOut } = await execAsync('/usr/local/bin/sc broker watchlist --json', SC_OPTIONS);
      const watchlistJson = JSON.parse(watchlistOut);
      watchlist = watchlistJson.result?.items || watchlistJson.items || (Array.isArray(watchlistJson.result) ? watchlistJson.result : []);
    } catch (err) {
      console.warn('Failed to fetch watchlist or it is empty:', err);
    }

    // 5. Aggregate unique ISINs and their current price
    const uniqueSecurities = new Map<string, number>();

    const processItem = (item: any) => {
      const price = item.quote_mid_price ?? item.price ?? item.current_price ?? item.last_price;
      if (item.isin && typeof price === 'number' && price > 0) {
        uniqueSecurities.set(item.isin, price);
      }
    };

    holdings.forEach(processItem);
    watchlist.forEach(processItem);

    if (uniqueSecurities.size === 0) {
      return NextResponse.json({ ok: false, error: 'No securities found in holdings or watchlist to set alarms for.' }, { status: 400 });
    }

    // 6. Set +5% and -5% alarms for each ISIN
    let addedCount = 0;
    for (const [isin, price] of uniqueSecurities.entries()) {
      const highPrice = (price * 1.05).toFixed(2);
      const lowPrice = (price * 0.95).toFixed(2);

      try {
        await execAsync(`/usr/local/bin/sc broker price-alerts add --isin ${isin} --price ${highPrice}`, SC_OPTIONS);
        await execAsync(`/usr/local/bin/sc broker price-alerts add --isin ${isin} --price ${lowPrice}`, SC_OPTIONS);
        addedCount += 2;
      } catch (err) {
        console.error(`Failed to set alarms for ${isin}:`, err);
      }
    }

    return NextResponse.json({ ok: true, message: `Successfully reset alarms. Created ${addedCount} new alerts (+5% / -5%).` });
  } catch (error: any) {
    console.error('Error resetting alarms:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to reset alarms' },
      { status: 500 }
    );
  }
}
