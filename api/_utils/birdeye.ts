
interface TokenPriceData {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
}

interface TokenHistoryData {
    items: {
        address: string;
        unixTime: number;
        value: number;
    }[];
}

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || '';
const BASE_URL = 'https://public-api.birdeye.so';

export async function getCurrentPrice(tokenMint: string): Promise<{ price: number; marketCap: number; supply: number } | null> {
    if (!BIRDEYE_API_KEY) {
        console.error('Migration Error: BIRDEYE_API_KEY is missing');
        return null;
    }

    try {
        const response = await fetch(`${BASE_URL}/defi/price?address=${tokenMint}`, {
            headers: {
                'X-API-KEY': BIRDEYE_API_KEY,
                'x-chain': 'solana',
            },
        });

        if (!response.ok) {
            console.error(`Error fetching price for ${tokenMint}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        if (!data.success) return null;

        // Also fetch detailed token info for MCap if possible, or just price
        // Ideally we want MCap. Let's try to fetch token_overview/token_info
        // But for MVP price is critical.

        // Fetch token overview for MCap
        const overviewRes = await fetch(`${BASE_URL}/defi/token_overview?address=${tokenMint}`, {
            headers: {
                'X-API-KEY': BIRDEYE_API_KEY,
                'x-chain': 'solana',
            }
        });

        let marketCap = 0;
        let supply = 0;

        if (overviewRes.ok) {
            const overviewData = await overviewRes.json();
            if (overviewData.success && overviewData.data) {
                marketCap = overviewData.data.mc || 0;
                supply = overviewData.data.circulatingSupply || 0;
            }
        }

        return {
            price: data.data.value,
            marketCap,
            supply
        };

    } catch (error) {
        console.error('Birdeye API Error:', error);
        return null;
    }
}

export async function getHistoricalPrice(tokenMint: string, timestamp: number): Promise<number | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        // Birdeye history API usually requires 'type' (1m, 1h, etc) and 'time_from', 'time_to'
        // /defi/history_price?address=...&address_type=token&type=1m&time_from=...&time_to=...
        // We want the price AT or mostly near the specific timestamp.
        // We can request a small window around the timestamp.

        const timeFrom = Math.floor(timestamp / 1000); // seconds
        const timeTo = timeFrom + 3600; // +1 hour window just incase

        // Note: Public API support for history might be limited or different endpoints. 
        // Using `/defi/history_price` is standard for them.

        const response = await fetch(
            `${BASE_URL}/defi/history_price?address=${tokenMint}&address_type=token&type=1m&time_from=${timeFrom}&time_to=${timeTo}`,
            {
                headers: { 'X-API-KEY': BIRDEYE_API_KEY, 'x-chain': 'solana' }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.success || !data.data || !data.data.items || data.data.items.length === 0) {
            return null;
        }

        // Return the first item (closest to timeFrom)
        return data.data.items[0].value;

    } catch (error) {
        console.error('Birdeye History Error:', error);
        return null;
    }
}
