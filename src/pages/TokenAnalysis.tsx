
import React, { useState } from 'react';
import { Plus, LineChart } from 'lucide-react';
import { TokenAnalysisTable } from '../components/TokenAnalysis/TokenAnalysisTable';
import { AddSignalModal } from '../components/TokenAnalysis/AddSignalModal';

export const TokenAnalysis: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        // Force table refresh by incrementing key
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                        <LineChart className="text-blue-400" />
                        Token Analysis
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Automated tracking of token signals on Solana network
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all text-sm font-medium"
                >
                    <Plus size={18} />
                    Add Signal
                </button>
            </div>

            <div className="mt-6" key={refreshKey}>
                <TokenAnalysisTable />
            </div>

            <AddSignalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};
