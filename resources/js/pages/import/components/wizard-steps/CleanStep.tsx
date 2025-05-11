import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/index';
import { useState, useCallback, useEffect } from 'react';

interface CleanStepProps {
    data: Partial<Transaction>[];
    onComplete: (cleanedData: Partial<Transaction>[]) => void;
}

export default function CleanStep({ data, onComplete }: CleanStepProps) {
    const [cleanedData, setCleanedData] = useState<Partial<Transaction>[]>(data);
    const [invalidRows, setInvalidRows] = useState<Set<number>>(new Set());
    
    // Check for invalid or problematic data
    useEffect(() => {
        const newInvalidRows = new Set<number>();
        
        data.forEach((item, index) => {
            // Check for missing required fields
            if (!item.amount || !item.booked_date) {
                newInvalidRows.add(index);
            }
            
            // Check for invalid amount format
            if (item.amount && isNaN(Number(item.amount))) {
                newInvalidRows.add(index);
            }
            
            // Check for invalid date format
            if (item.booked_date && isNaN(Date.parse(item.booked_date as string))) {
                newInvalidRows.add(index);
            }
        });
        
        setInvalidRows(newInvalidRows);
    }, [data]);
    
    // Handle editing a cell value
    const handleCellEdit = useCallback((rowIndex: number, field: keyof Transaction, value: any) => {
        setCleanedData(prev => {
            const newData = [...prev];
            newData[rowIndex] = {
                ...newData[rowIndex],
                [field]: value,
            };
            return newData;
        });
        
        // Revalidate the row
        setInvalidRows(prev => {
            const newInvalidRows = new Set(prev);
            
            // If the value is now valid, remove from invalid rows
            const row = cleanedData[rowIndex];
            const updatedRow = { ...row, [field]: value };
            
            let isValid = true;
            
            // Check required fields
            if (!updatedRow.amount || !updatedRow.booked_date) {
                isValid = false;
            }
            
            // Check amount format
            if (updatedRow.amount && isNaN(Number(updatedRow.amount))) {
                isValid = false;
            }
            
            // Check date format
            if (updatedRow.booked_date && isNaN(Date.parse(updatedRow.booked_date as string))) {
                isValid = false;
            }
            
            if (isValid) {
                newInvalidRows.delete(rowIndex);
            } else {
                newInvalidRows.add(rowIndex);
            }
            
            return newInvalidRows;
        });
    }, [cleanedData]);
    
    // Handle removing a row
    const handleRemoveRow = useCallback((rowIndex: number) => {
        setCleanedData(prev => {
            const newData = [...prev];
            newData.splice(rowIndex, 1);
            return newData;
        });
        
        setInvalidRows(prev => {
            const newInvalidRows = new Set<number>();
            
            // Rebuild the set with updated indexes
            for (const index of prev) {
                if (index < rowIndex) {
                    newInvalidRows.add(index);
                } else if (index > rowIndex) {
                    newInvalidRows.add(index - 1);
                }
            }
            
            return newInvalidRows;
        });
    }, []);
    
    // Handle continuing to the next step
    const handleContinue = useCallback(() => {
        // Remove any invalid rows before continuing
        const validData = cleanedData.filter((_, index) => !invalidRows.has(index));
        onComplete(validData);
    }, [cleanedData, invalidRows, onComplete]);

    // Safely get value from row for display
    const getDisplayValue = (row: Partial<Transaction>, key: keyof Transaction): string => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    // Visible columns
    const columns: Array<{
        key: keyof Transaction;
        label: string;
        editable?: boolean;
        format?: (value: any) => string;
    }> = [
        { key: 'booked_date', label: 'Date', editable: true },
        { key: 'amount', label: 'Amount', editable: true },
        { key: 'currency', label: 'Currency' },
        { key: 'description', label: 'Description', editable: true },
        { key: 'partner', label: 'Partner', editable: true },
    ];
    
    return (
        <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Clean your data</h3>
            <p className="mb-6 text-gray-300">
                Edit your data in the table below. Red cells are invalid.
            </p>
            
            {invalidRows.size > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-300 p-3 rounded-md mb-6">
                    <p>{invalidRows.size} row(s) contain invalid data. Please fix or remove them before continuing.</p>
                </div>
            )}
            
            {cleanedData.length === 0 ? (
                <div className="text-center text-gray-400 my-12">
                    <p>No data to clean. Please go back to the previous step.</p>
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-gray-700 overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800 border-b border-gray-700">
                                <tr>
                                    {columns.map(column => (
                                        <th key={column.key} className="px-4 py-2 text-left">
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cleanedData.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`border-b border-gray-700 ${
                                            invalidRows.has(rowIndex) ? 'bg-red-900/10' : ''
                                        }`}
                                    >
                                        {columns.map(column => (
                                            <td
                                                key={`${rowIndex}-${String(column.key)}`}
                                                className={`px-4 py-2 ${
                                                    invalidRows.has(rowIndex) &&
                                                    (column.key === 'amount' || column.key === 'booked_date')
                                                        ? 'text-red-300'
                                                        : ''
                                                }`}
                                            >
                                                {column.editable ? (
                                                    <input
                                                        type="text"
                                                        value={getDisplayValue(row, column.key)}
                                                        onChange={(e) =>
                                                            handleCellEdit(rowIndex, column.key, e.target.value)
                                                        }
                                                        className="w-full bg-transparent border-b border-gray-600 px-1 py-0.5 focus:border-blue-500 focus:outline-none"
                                                    />
                                                ) : column.format ? (
                                                    column.format(row[column.key])
                                                ) : (
                                                    getDisplayValue(row, column.key)
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-4 py-2">
                                            <Button
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-300 p-0"
                                                onClick={() => handleRemoveRow(rowIndex)}
                                            >
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-400">
                            {cleanedData.length} rows • {invalidRows.size} invalid
                        </div>
                        <Button
                            onClick={handleContinue}
                            disabled={invalidRows.size > 0}
                        >
                            Next step
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
} 