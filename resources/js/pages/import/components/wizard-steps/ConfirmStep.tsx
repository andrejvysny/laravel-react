import { Button } from '@/components/ui/button';
import { Category, Transaction } from '@/types/index';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConfirmStepProps {
    data: Partial<Transaction>[];
    mappings: Record<string, Record<string, string>>;
    categories: Category[];
    tags?: { id: number; name: string }[];
    merchants?: { id: number; name: string }[];
    onConfirm: () => void;
    isLoading: boolean;
    error: string | null;
}

// Extended transaction data that includes additional fields
interface ExtendedTransactionData extends Partial<Transaction> {
    category?: string;
    tag?: string;
    merchant?: string;
}

type MappingType = 'category' | 'tag' | 'merchant';

export default function ConfirmStep({
    data,
    mappings = { category: {}, tag: {}, merchant: {} },
    categories,
    tags = [],
    merchants = [],
    onConfirm,
    isLoading,
    error,
}: ConfirmStepProps) {
    // Calculate statistics for the import summary
    const stats = useMemo(() => {
        // Count total rows
        const totalRows = data.length;
        
        // Count unique values for each mapping type
        const uniqueValues: Record<MappingType, Set<string>> = {
            category: new Set<string>(),
            tag: new Set<string>(),
            merchant: new Set<string>()
        };

        data.forEach(item => {
            const extendedItem = item as ExtendedTransactionData;
            if (extendedItem.category) uniqueValues.category.add(extendedItem.category);
            if (extendedItem.tag) uniqueValues.tag.add(extendedItem.tag);
            if (extendedItem.merchant) uniqueValues.merchant.add(extendedItem.merchant);
        });

        // Count new vs existing for each mapping type
        const mappingStats = Object.entries(mappings || {}).reduce((acc, [type, typeMappings]) => {
            if (!typeMappings) return acc;
            
            const values = Array.from(uniqueValues[type as MappingType] || new Set());
            acc[type] = {
                total: values.length,
                new: values.filter(v => typeMappings[v] === 'new').length,
                existing: values.filter(v => typeMappings[v] !== 'new' && typeMappings[v] !== 'unmapped').length,
                unmapped: values.filter(v => typeMappings[v] === 'unmapped').length
            };
            return acc;
        }, {} as Record<string, { total: number; new: number; existing: number; unmapped: number }>);

        // Count expenses vs income
        const expenses = data.filter(item => (item.amount || 0) < 0).length;
        const income = data.filter(item => (item.amount || 0) >= 0).length;
        
        return {
            totalRows,
            expenses,
            income,
            mappings: mappingStats
        };
    }, [data, mappings]);

    // Function to render mapping table for a specific type
    const renderMappingTable = (type: MappingType, typeMappings: Record<string, string> = {}, options: { id: number; name: string }[] = []) => {
        const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
        const mappingEntries = Object.entries(typeMappings || {});

        if (mappingEntries.length === 0) return null;

        return (
            <div className="mt-6">
                <h5 className="font-medium mb-2">{typeTitle} Mappings</h5>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappingEntries.map(([from, to]) => (
                            <TableRow key={`${type}-${from}`}>
                                <TableCell>{from}</TableCell>
                                <TableCell>
                                    {to === 'new' ? (
                                        <span className="text-green-400">+ Create "{from}"</span>
                                    ) : to === 'unmapped' ? (
                                        <span className="text-gray-400">Unmapped</span>
                                    ) : (
                                        options.find(opt => opt.id.toString() === to)?.name || to
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };
    
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
                    
                    {Object.entries(stats.mappings).map(([type, typeStats]) => (
                        <div key={type} className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Unique {type.charAt(0).toUpperCase() + type.slice(1)}s:</span>
                                <span className="font-medium">{typeStats.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">New {type}s:</span>
                                <span className="font-medium">{typeStats.new}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Mapped to Existing:</span>
                                <span className="font-medium">{typeStats.existing}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Unmapped:</span>
                                <span className="font-medium">{typeStats.unmapped}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Mapping Tables */}
                {renderMappingTable('category', mappings?.category, categories)}
                {renderMappingTable('tag', mappings?.tag, tags)}
                {renderMappingTable('merchant', mappings?.merchant, merchants)}
            </div>
            
            {/* Sample Records */}
            <div className="rounded-lg border border-gray-700 p-6 mb-8">
                <h4 className="text-lg font-medium mb-4">Sample Records</h4>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Tag</TableHead>
                                <TableHead>Merchant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.slice(0, 5).map((item, index) => {
                                const extendedItem = item as ExtendedTransactionData;
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{item.booked_date}</TableCell>
                                        <TableCell>{item.amount}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{extendedItem.category}</TableCell>
                                        <TableCell>{extendedItem.tag}</TableCell>
                                        <TableCell>{extendedItem.merchant}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
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