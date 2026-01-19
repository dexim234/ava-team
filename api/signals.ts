
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_utils/firebaseAdmin.js';
import { getCurrentPrice, getHistoricalPrice } from './_utils/birdeye.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method === 'GET') {
        try {
            // Return all signals, sorted by signalTime desc
            const snapshot = await db.collection('signals').orderBy('signalTime', 'desc').get();
            const signals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(signals);
        } catch (error) {
            console.error('Error fetching signals:', error);
            return res.status(500).json({ error: 'Failed to fetch signals' });
        }
    }

    if (req.method === 'POST') {
        const { tokenMint, signalTime } = req.body;

        if (!tokenMint || !signalTime) {
            return res.status(400).json({ error: 'Missing tokenMint or signalTime' });
        }

        try {
            const timestamp = new Date(signalTime).getTime();

            // 1. Fetch entry price (historical)
            // If signalTime is very close to now (e.g. within 1 hour), maybe use current price?
            // But logic says "entryPrice defined as price closest to signalTime".
            // Use getHistoricalPrice.
            let entryPrice = await getHistoricalPrice(tokenMint, timestamp);

            // Fallback: If history not found (e.g. extremely recent), try current price if time is close enough
            if (!entryPrice && Date.now() - timestamp < 3600000) {
                const currentData = await getCurrentPrice(tokenMint);
                entryPrice = currentData?.price || null;
            }

            if (!entryPrice) {
                return res.status(422).json({ error: 'Could not determine entry price for this time' });
            }

            // 2. Fetch current data for initial population
            const currentData = await getCurrentPrice(tokenMint);
            const currentPrice = currentData?.price || entryPrice;
            const marketCap = currentData?.marketCap || 0;

            // 3. Calculate initial metrics
            const currentPnLPct = ((currentPrice - entryPrice) / entryPrice) * 100;

            const newSignal = {
                tokenMint,
                signalTime: timestamp, // Store as number or ISO string? user said "Signal Time (UTC)". Timestamp is easier for sorting.
                entryPrice,
                currentPrice,
                currentPnLPct,
                maxProfitPct: Math.max(0, currentPnLPct), // Initial max profit
                maxDrawdownPct: Math.min(0, currentPnLPct), // Initial max drawdown
                currentMarketCap: marketCap,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const docRef = await db.collection('signals').add(newSignal);

            return res.status(201).json({ id: docRef.id, ...newSignal });

        } catch (error) {
            console.error('Error creating signal:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
