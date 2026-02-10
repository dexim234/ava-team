
import React from 'react';
import { Code } from 'lucide-react';

const MemcoinsDevingPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-md text-purple-600">
          <Code size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Мемкоины (девинг)</h1>
      </div>
      
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-100 rounded-lg mt-6"></div>
      </div>
      
      <p className="mt-4 text-gray-500">Раздел в разработке...</p>
    </div>
  );
};

export default MemcoinsDevingPage;
