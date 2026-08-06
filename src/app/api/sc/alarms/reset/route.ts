import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    // 1. Fetch current alarms
    const { stdout: alarmsOut } = await execAsync('sc broker price-alerts --json');
    const alarmsJson = JSON.parse(alarmsOut);
    const alerts = alarmsJson.result?.items || alarmsJson.items || (Array.isArray(alarmsJson.result) ? alarmsJson.result : []);

    // 2. Delete all existing alarms
    for (const alert of alerts) {
      if (alert.alert_id) {
        try {
          await execAsync(`sc broker price-alerts remove --alert-id ${alert.alert_id}`);
        } catch (err) {
          console.error(`Failed to remove alert ${alert.alert_id}:`, err);
        }
      }
    }

    // 3. Fetch holdings
    const { stdout: holdingsOut } = await execAsync('sc broker holdings --json');
    const holdingsJson = JSON.parse(holdingsOut);
    const holdings = holdingsJson.result?.items || holdingsJson.items || (Array.isArray(holdingsJson.result) ? holdingsJson.result : []);

    // 4. Fetch watchlist
    let watchlist = [];
    try {
      const { stdout: watchlistOut } = await execAsync('sc broker watchlist --json');
      const watchlistJson = JSON.parse(watchlistOut);
      watchlist = watchlistJson.result?.items || watchlistJson.items || (Array.isArray(watchlistJson.result) ? watchlistJson.result : []);
    } catch (err) {
      console.warn('Failed to fetch watchlist or it is empty:', err);
    }

    // 5. Aggregate unique ISINs and their current price
    const uniqueSecurities = new Map<string, number>();

    const processItem = (item: any) => {
      if (item.isin && item.quote_mid_price !== undefined) {
        uniqueSecurities.set(item.isin, item.quote_mid_price);
      } else if (item.isin && item.price !== undefined) { // Fallback if name differs
        uniqueSecurities.set(item.isin, item.price);
      }
    };

    holdings.forEach(processItem);
    watchlist.forEach(processItem);

    // 6. Set +5% and -5% alarms for each ISIN
    for (const [isin, price] of uniqueSecurities.entries()) {
      if (price <= 0) continue;

      const highPrice = (price * 1.05).toFixed(4);
      const lowPrice = (price * 0.95).toFixed(4);

      try {
        await execAsync(`sc broker price-alerts add --isin ${isin} --price ${highPrice}`);
        await execAsync(`sc broker price-alerts add --isin ${isin} --price ${lowPrice}`);
      } catch (err) {
        console.error(`Failed to set alarms for ${isin}:`, err);
      }
    }

    return NextResponse.json({ ok: true, message: 'Alarms reset successfully' });
  } catch (error: any) {
    console.error('Error resetting alarms:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to reset alarms' },
      { status: 500 }
    );
  }
}
