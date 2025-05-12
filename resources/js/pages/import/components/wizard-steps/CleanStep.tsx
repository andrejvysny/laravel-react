import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/index';

interface CleanStepProps {
    data: Partial<Transaction>[];
    onComplete: (cleanedData: Partial<Transaction>[]) => void;
}

export default function CleanStep({ data, onComplete }: CleanStepProps) {
    const [cleanedData, setCleanedData] = useState<Partial<Transaction>[]>(data);

    const handleClean = () => {
        // In a real implementation, we would have functionality to clean the data here
        // For now, we'll just pass the data through unchanged
        onComplete(cleanedData);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Clean your data</h3>
            <p className="mb-6 text-gray-300">
                Review your data before proceeding. You can remove any rows that you don't want to import.
            </p>

            <div className="rounded-lg border border-gray-700 overflow-x-auto mb-6">
                <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                            {Object.keys(cleanedData[0] || {}).filter(key => !key.startsWith('_')).map((key) => (
                                <th key={key} className="px-4 py-2 text-left">
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cleanedData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-700">
                                {Object.entries(row).filter(([key]) => !key.startsWith('_')).map(([key, value]) => (
                                    <td key={key} className="px-4 py-2 whitespace-nowrap truncate">
                                        {typeof value === 'object' ? JSON.stringify(value) : value?.toString()}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleClean}>
                    Continue to Category Mapping
                </Button>
            </div>
        </div>
    );
} 