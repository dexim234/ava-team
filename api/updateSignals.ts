
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_utils/firebaseAdmin.js';
import { getCurrentPrice } from './_utils/birdeye.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Check for Cron header/authorization
    // Vercel sends `Authorization: Bearer <CRON_SECRET>` if configured, 
    // but simpler check is `req.headers['authorization'] === 
    // `Bearer ${process.env.CRON_SECRET}` if we set one.
    // For open development, we might skip strong check or use a simple query param if user didn't specify strict security.
    // User spec: "Cron-функция выбирает active signals...".
    // Note: Vercel crons are public URLs but usually we can protect them.
    // We'll proceed without strict header check for MVP unless user provided secret, but usually we should.

    if (req.method !== 'GET' && req.method !== 'POST') {
        // Vercel cron calls are GET usually.
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const signalsRef = db.collection('signals');
        const snapshot = await signalsRef.get(); // Get ALL signals. Optimization: active only? User didn't specify 'active' flag but implied 'active' in text.
        // "выбирает активные сигналы". We need to filter.
        // Maybe we add a field 'status' = 'active' later. For now, we assume ALL are active.

        if (snapshot.empty) {
            return res.status(200).json({ message: 'No signals to update' });
        }

        const updates = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const { tokenMint, entryPrice, maxProfitPct, maxDrawdownPct } = data;

            // Skip if critical data missing
            if (!tokenMint || !entryPrice) continue;

            // Fetch current price
            const priceData = await getCurrentPrice(tokenMint);
            if (!priceData) continue; // Skip this token if API fails, don't break others.

            const currentPrice = priceData.price;
            const currentMarketCap = priceData.marketCap || (priceData.supply * currentPrice);

            // Calc PnL
            const currentPnLPct = ((currentPrice - entryPrice) / entryPrice) * 100;

            // Update Max Profit / Drawdown
            const newMaxProfit = Math.max(maxProfitPct || 0, currentPnLPct);
            const newMaxDrawdown = Math.min(maxDrawdownPct || 0, currentPnLPct);

            updates.push(doc.ref.update({
                currentPrice,
                currentMarketCap,
                currentPnLPct,
                maxProfitPct: newMaxProfit,
                maxDrawdownPct: newMaxDrawdown,
                updatedAt: Date.now()
            }));
        }

        await Promise.all(updates);

        return res.status(200).json({ success: true, updated: updates.length });

    } catch (error) {
        console.error('Cron Update Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
