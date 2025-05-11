import { Button } from '@/components/ui/button';
import { Category, Transaction } from '@/types/index';
import { useState, useCallback, useMemo } from 'react';

interface MapStepProps {
    data: Partial<Transaction>[];
    categories: Category[];
    onComplete: (categoryMappings: Record<string, string>) => void;
}

// Extended transaction data that includes the category field not in the original Transaction type
interface ExtendedTransactionData extends Partial<Transaction> {
    category?: string;
}

export default function MapStep({ data, categories, onComplete }: MapStepProps) {
    // Extract unique categories from imported data
    const uniqueImportedCategories = useMemo(() => {
        const categorySet = new Set<string>();
        data.forEach(item => {
            const extendedItem = item as ExtendedTransactionData;
            if (extendedItem.category && typeof extendedItem.category === 'string') {
                categorySet.add(extendedItem.category);
            }
        });
        return Array.from(categorySet);
    }, [data]);
    
    // Initialize mappings - default to "Add as new category"
    const [categoryMappings, setCategoryMappings] = useState<Record<string, string>>(() => {
        const initialMappings: Record<string, string> = {};
        uniqueImportedCategories.forEach(category => {
            // Try to find exact match in existing categories
            const existingCategory = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
            if (existingCategory) {
                initialMappings[category] = existingCategory.name;
            } else {
                initialMappings[category] = 'new';
            }
        });
        return initialMappings;
    });
    
    // Calculate how many rows will be affected by each mapping
    const categoryRowCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        uniqueImportedCategories.forEach(category => {
            counts[category] = data.filter(item => {
                const extendedItem = item as ExtendedTransactionData;
                return extendedItem.category === category;
            }).length;
        });
        return counts;
    }, [data, uniqueImportedCategories]);
    
    // Handle mapping change
    const handleMappingChange = useCallback((importedCategory: string, targetCategory: string) => {
        setCategoryMappings(prev => ({
            ...prev,
            [importedCategory]: targetCategory,
        }));
    }, []);
    
    // Handle submission
    const handleSubmit = useCallback(() => {
        onComplete(categoryMappings);
    }, [categoryMappings, onComplete]);
    
    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Assign your categories</h3>
            <p className="mb-6 text-gray-300">
                Assign all of your imported file's categories to existing categories.
                You can also add new categories or leave them uncategorized.
            </p>
            
            {uniqueImportedCategories.length === 0 ? (
                <div className="text-center text-gray-400 my-12">
                    <p>No categories found in the import data. Click "Next step" to continue.</p>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-700 overflow-hidden mb-8">
                    <table className="w-full">
                        <thead className="bg-gray-800 border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Category in CSV</th>
                                <th className="px-4 py-3 text-left font-medium">Category in App</th>
                                <th className="px-4 py-3 text-left font-medium">Rows</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueImportedCategories.map(importedCategory => (
                                <tr key={importedCategory} className="border-b border-gray-700">
                                    <td className="px-4 py-3">{importedCategory}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={categoryMappings[importedCategory]}
                                            onChange={(e) => handleMappingChange(importedCategory, e.target.value)}
                                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                                        >
                                            <option value="">Leave uncategorized</option>
                                            <option value="new">Add as new category</option>
                                            <optgroup label="Existing Categories">
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.name}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {categoryRowCounts[importedCategory]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="flex justify-end">
                <Button onClick={handleSubmit}>
                    Next step
                </Button>
            </div>
        </div>
    );
} 