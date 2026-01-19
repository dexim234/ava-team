
import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { TokenSignal } from '../../types';

interface TokenAnalysisTableProps {
    apiBaseUrl?: string; // Optional, defaults to /api
}

export const TokenAnalysisTable: React.FC<TokenAnalysisTableProps> = ({ apiBaseUrl = '/api' }) => {
    const [signals, setSignals] = useState<TokenSignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSignals = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/signals`);
            if (!res.ok) throw new Error('Failed to fetch signals');
            const data = await res.json();
            setSignals(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();
        const interval = setInterval(fetchSignals, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const formatPnL = (val: number) => {
        const isPositive = val >= 0;
        return (
            <span className={`font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{val.toFixed(2)}%
            </span>
        );
    };

    const formatPrice = (val: number) => {
        if (!val) return '-';
        return val < 0.01 ? val.toExponential(4) : val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const formatMCap = (val: number) => {
        if (!val) return '-';
        return '$' + (val / 1000000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M';
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleString('en-US', {
            timeZone: 'UTC',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' UTC';
    };

    if (loading && signals.length === 0) return <div className="p-8 text-center text-gray-400 animate-pulse">Loading analysis data...</div>;
    if (error && signals.length === 0) return <div className="p-8 text-center text-red-400">{error}</div>;

    return (
        <div className="w-full overflow-hidden rounded-xl bg-gray-900/50 border border-white/5 backdrop-blur-sm shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-medium">Signal Time</th>
                            <th className="px-6 py-4 font-medium">Token</th>
                            <th className="px-6 py-4 font-medium text-right">Entry</th>
                            <th className="px-6 py-4 font-medium text-right">Current PnL</th>
                            <th className="px-6 py-4 font-medium text-right">Max Profit</th>
                            <th className="px-6 py-4 font-medium text-right">Max DD</th>
                            <th className="px-6 py-4 font-medium text-right">M. Cap</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {signals.map((signal) => (
                            <tr key={signal.id} className="hover:bg-white/5 transition-colors duration-150 group">
                                <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                                    {formatTime(signal.signalTime)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-blue-400 truncate max-w-[100px]" title={signal.tokenMint}>
                                            {signal.tokenMint.slice(0, 4)}...{signal.tokenMint.slice(-4)}
                                        </span>
                                        <a
                                            href={`https://birdeye.so/token/${signal.tokenMint}?chain=solana`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-gray-300">
                                    {formatPrice(signal.entryPrice)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatPnL(signal.currentPnLPct)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-emerald-400">+{signal.maxProfitPct.toFixed(2)}%</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-red-400">{signal.maxDrawdownPct.toFixed(2)}%</span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-gray-300">
                                    {formatMCap(signal.currentMarketCap)}
                                </td>
                            </tr>
                        ))}
                        {signals.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No active signals found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
