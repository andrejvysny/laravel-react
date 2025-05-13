import { Button } from '@/components/ui/button';
import { Category, Transaction } from '@/types/index';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface ConfirmStepProps {
    data: Partial<Transaction>[];
    mappings: Record<string, Record<string, string>>;
    categories: Category[];
    tags?: { id: number; name: string }[];
    merchants?: { id: number; name: string }[];
    onConfirm: () => void;
    isLoading: boolean;
    error: string | null;
    totalRows: number;
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
    totalRows,
}: ConfirmStepProps) {
    // Calculate statistics for the import summary
    const stats = useMemo(() => {
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
    }, [data, mappings, totalRows]);

    // Function to render mapping table for a specific type
    const renderMappingTable = (type: MappingType, typeMappings: Record<string, string> = {}, options: { id: number; name: string }[] = []) => {
        const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
        const mappingEntries = Object.entries(typeMappings || {});

        if (mappingEntries.length === 0) return null;

        return (
            <div className="mt-6">
                <h5 className="font-medium mb-2 text-foreground">{typeTitle} Mappings</h5>
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
                                        <span className="text-foreground">Unmapped</span>
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
            <h3 className="text-xl font-semibold mb-4 text-foreground">Confirm Import</h3>
            <p className="mb-6 text-muted-foreground">
                Please review the summary below and confirm to process the import.
            </p>

            {/* Error message */}
            {error && (
                <div className="bg-red-900/20 border border-red-800 text-destructive-foreground p-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-8 rounded-lg shadow-md flex flex-col items-center gap-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <h3 className="text-xl font-semibold text-foreground">Processing Import</h3>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-3 text-foreground">
                                <FileText className="h-5 w-5" />
                                <span>Importing {totalRows} transactions...</span>
                            </div>

                            <div className="flex items-center gap-3 text-foreground">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span>Creating new categories, tags, and merchants...</span>
                            </div>

                            <div className="flex items-center gap-3 text-foreground">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span>Mapping relationships...</span>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2">
                            Please wait while we process your import. This may take a few moments.
                        </p>
                    </div>
                </div>
            )}

            {/* Import Summary */}
            <div className={`rounded-lg border border-foreground p-6 mb-8 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <h4 className="text-lg font-medium mb-4 text-foreground">Import Summary</h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Rows:</span>
                            <span className="font-medium text-foreground">{stats.totalRows}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expense Transactions:</span>
                            <span className="font-medium text-foreground">{stats.expenses}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Income Transactions:</span>
                            <span className="font-medium text-foreground">{stats.income}</span>
                        </div>
                    </div>

                    {Object.entries(stats.mappings).map(([type, typeStats]) => (
                        <div key={type} className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unique {type.charAt(0).toUpperCase() + type.slice(1)}s:</span>
                                <span className="font-medium text-foreground">{typeStats.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">New {type}s:</span>
                                <span className="font-medium text-foreground">{typeStats.new}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mapped to Existing:</span>
                                <span className="font-medium text-foreground">{typeStats.existing}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unmapped:</span>
                                <span className="font-medium text-foreground">{typeStats.unmapped}</span>
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
            <div className={`rounded-lg border border-1 p-6 mb-8 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <h4 className="text-lg font-medium mb-4 text-foreground">Sample Records</h4>
                <div className="overflow-x-auto">
                    <Table className="text-foreground">
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
                    className="min-w-[150px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Confirm and Import'
                    )}
                </Button>
            </div>
        </div>
    );
}
