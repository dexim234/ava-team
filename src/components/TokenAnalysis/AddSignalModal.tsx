
import React, { useState } from 'react';
import { X, Calendar, Hash, Loader2 } from 'lucide-react';

interface AddSignalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    apiBaseUrl?: string;
}

export const AddSignalModal: React.FC<AddSignalModalProps> = ({ isOpen, onClose, onSuccess, apiBaseUrl = '/api' }) => {
    const [tokenMint, setTokenMint] = useState('');
    const [signalTime, setSignalTime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${apiBaseUrl}/signals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenMint, signalTime }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create signal');
            }

            setTokenMint('');
            setSignalTime('');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-semibold text-white">Add New Signal</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Token Mint Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <Hash size={16} />
                            </div>
                            <input
                                type="text"
                                value={tokenMint}
                                onChange={(e) => setTokenMint(e.target.value)}
                                placeholder="Enter Solana Mint Address"
                                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600 transition-all font-mono text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Signal Time (Local)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <Calendar size={16} />
                            </div>
                            <input
                                type="datetime-local"
                                value={signalTime}
                                onChange={(e) => setSignalTime(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm [color-scheme:dark]"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500">Enter time in your local zone. It will be converted to UTC.</p>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all flex-[2] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Signal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
