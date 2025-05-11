import { Button } from '@/components/ui/button';
import { Category, Transaction } from '@/types/index';
import { useMemo } from 'react';

interface ConfirmStepProps {
    data: Partial<Transaction>[];
    categoryMappings: Record<string, string>;
    categories: Category[];
    onConfirm: () => void;
    isLoading: boolean;
    error: string | null;
}

// Extended transaction data that includes the category field not in the original Transaction type
interface ExtendedTransactionData extends Partial<Transaction> {
    category?: string;
}

export default function ConfirmStep({
    data,
    categoryMappings,
    categories,
    onConfirm,
    isLoading,
    error,
}: ConfirmStepProps) {
    // Calculate statistics for the import summary
    const stats = useMemo(() => {
        // Count total rows
        const totalRows = data.length;
        
        // Count unique categories
        const uniqueCategories = new Set<string>();
        data.forEach(item => {
            const extendedItem = item as ExtendedTransactionData;
            if (extendedItem.category) {
                uniqueCategories.add(extendedItem.category);
            }
        });
        
        // Count new vs existing categories
        const newCategories = Array.from(uniqueCategories).filter(
            cat => categoryMappings[cat] === 'new'
        );
        const existingCategories = Array.from(uniqueCategories).filter(
            cat => categoryMappings[cat] !== 'new' && categoryMappings[cat] !== ''
        );
        const uncategorized = Array.from(uniqueCategories).filter(
            cat => categoryMappings[cat] === ''
        );

        // Count expenses vs income
        const expenses = data.filter(item => (item.amount || 0) < 0).length;
        const income = data.filter(item => (item.amount || 0) >= 0).length;
        
        return {
            totalRows,
            uniqueCategoriesCount: uniqueCategories.size,
            newCategoriesCount: newCategories.length,
            existingCategoriesCount: existingCategories.length,
            uncategorizedCount: uncategorized.length,
            expenses,
            income,
        };
    }, [data, categoryMappings]);
    
    return (
        <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Confirm Import</h3>
            <p className="mb-6 text-gray-300">
                Please review the summary below and confirm to process the import.
            </p>
            
            {/* Error message */}
            {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-300 p-3 rounded-md mb-6">
                    {error}
                </div>
            )}
            
            {/* Import Summary */}
            <div className="rounded-lg border border-gray-700 p-6 mb-8">
                <h4 className="text-lg font-medium mb-4">Import Summary</h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Rows:</span>
                            <span className="font-medium">{stats.totalRows}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Expense Transactions:</span>
                            <span className="font-medium">{stats.expenses}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Income Transactions:</span>
                            <span className="font-medium">{stats.income}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Unique Categories:</span>
                            <span className="font-medium">{stats.uniqueCategoriesCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">New Categories:</span>
                            <span className="font-medium">{stats.newCategoriesCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Mapped to Existing:</span>
                            <span className="font-medium">{stats.existingCategoriesCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Uncategorized:</span>
                            <span className="font-medium">{stats.uncategorizedCount}</span>
                        </div>
                    </div>
                </div>
                
                {/* Category Mapping Summary */}
                {stats.uniqueCategoriesCount > 0 && (
                    <div className="mt-6">
                        <h5 className="font-medium mb-2">Category Mappings</h5>
                        <table className="w-full">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="py-2 text-left text-gray-400">From</th>
                                    <th className="py-2 text-left text-gray-400">To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(categoryMappings).map(([from, to]) => (
                                    <tr key={from} className="border-b border-gray-800">
                                        <td className="py-2">{from}</td>
                                        <td className="py-2">
                                            {to === 'new' ? (
                                                <span className="text-green-400">+ Create "{from}"</span>
                                            ) : to === '' ? (
                                                <span className="text-gray-400">Uncategorized</span>
                                            ) : (
                                                to
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Sample Records */}
            <div className="rounded-lg border border-gray-700 p-6 mb-8">
                <h4 className="text-lg font-medium mb-4">Sample Records</h4>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-gray-400">Date</th>
                                <th className="px-4 py-2 text-left text-gray-400">Amount</th>
                                <th className="px-4 py-2 text-left text-gray-400">Description</th>
                                <th className="px-4 py-2 text-left text-gray-400">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((item, index) => {
                                const extendedItem = item as ExtendedTransactionData;
                                return (
                                    <tr key={index} className="border-b border-gray-800">
                                        <td className="px-4 py-2">{item.booked_date}</td>
                                        <td className="px-4 py-2">{item.amount}</td>
                                        <td className="px-4 py-2">{item.description}</td>
                                        <td className="px-4 py-2">{extendedItem.category}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end">
                <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Confirm and Import'}
                </Button>
            </div>
        </div>
    );
} 