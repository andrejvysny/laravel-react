import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Save, Trash2 } from 'lucide-react';
import { Transaction, ImportMapping } from '@/types/index';
import axios from 'axios';
import { useState, useCallback, useEffect } from 'react';

interface ConfigureStepProps {
    headers: string[];
    sampleRows: string[][];
    importId: number;
    onComplete: (data: {
        columnMapping: Record<string, number | null>;
        dateFormat: string;
        amountFormat: string;
        amountTypeStrategy: string;
        currency: string;
        previewData: Partial<Transaction>[];
    }) => void;
}

// All possible transaction fields that could be mapped
const transactionFields = [
    { key: 'transaction_id', label: 'Transaction ID', required: false },
    { key: 'booked_date', label: 'Date', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'partner', label: 'Partner', required: true },
    { key: 'type', label: 'Type', required: false },
    { key: 'target_iban', label: 'Target IBAN', required: false },
    { key: 'source_iban', label: 'Source IBAN', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'tags', label: 'Tags', required: false },
    { key: 'notes', label: 'Notes', required: false },
];

// Date formats
const dateFormats = [
    { value: 'd.m.Y', label: 'DD.MM.YYYY' },
    { value: 'Y-m-d', label: 'YYYY-MM-DD' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY' },
    { value: 'Y-m-d H:i:s', label: 'YYYY-MM-DD HH:MM:SS' },
    { value: 'd.m.Y H:i:s', label: 'DD.MM.YYYY HH:MM:SS' },
];

// Amount formats
const amountFormats = [
    { value: '1,234.56', label: '1,234.56' },
    { value: '1.234,56', label: '1.234,56' },
    { value: '1234.56', label: '1234.56' },
    { value: '1234,56', label: '1234,56' },
];

// Amount type strategies
const amountTypeStrategies = [
    { value: 'signed_amount', label: 'Signed amount (negative for expenses, positive for income)' },
    { value: 'income_positive', label: 'Incomes are positive' },
    { value: 'expense_positive', label: 'Expenses are positive' },
];

// Currencies
const currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CZK', label: 'Czech Koruna (Kč)' },
];

export default function ConfigureStep({ headers, sampleRows, importId, onComplete }: ConfigureStepProps) {
    const [columnMapping, setColumnMapping] = useState<Record<string, number | null>>({});
    const [dateFormat, setDateFormat] = useState('d.m.Y');
    const [amountFormat, setAmountFormat] = useState('1,234.56');
    const [amountTypeStrategy, setAmountTypeStrategy] = useState('signed_amount');
    const [currency, setCurrency] = useState('EUR');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<Partial<Transaction>[]>([]);


    const [savedMappings, setSavedMappings] = useState<ImportMapping[]>([]);
    const [selectedMapping, setSelectedMapping] = useState<string>('none');
    const [saveMapping, setSaveMapping] = useState(false);
    const [mappingName, setMappingName] = useState('');
    const [bankName, setBankName] = useState('');
    const [activeTab, setActiveTab] = useState('saved');

    // Load saved mappings on component mount
    useEffect(() => {
        const fetchSavedMappings = async () => {
            try {
                const response = await axios.get('/imports/mappings');
                setSavedMappings(response.data.mappings || []);
            } catch (err) {
                console.error('Failed to load saved mappings', err);
            }
        };

        fetchSavedMappings();
    }, []);

    // Auto-detect column mappings on initial render
    useEffect(() => {
        const initialMapping: Record<string, number | null> = {};

        // Initialize all fields as null (not mapped)
        transactionFields.forEach(field => {
            initialMapping[field.key] = null;
        });

        // Try to automatically map columns based on headers
        headers.forEach((header, index) => {
            const headerLower = header.toLowerCase();

            // Match date fields
            if (headerLower.includes('date') || headerLower.includes('time')) {
                initialMapping['booked_date'] = index;
            }
            // Match amount fields
            else if (headerLower.includes('amount') || headerLower.includes('sum') || headerLower === 'value' || headerLower.includes('suma')) {
                initialMapping['amount'] = index;
            }
            // Match description fields
            else if (headerLower.includes('description') || headerLower.includes('details') || headerLower.includes('note') || headerLower.includes('text') || headerLower.includes('popis')) {
                initialMapping['description'] = index;
            }
            // Match category fields
            else if (headerLower.includes('category') || headerLower.includes('type')) {
                initialMapping['category'] = index;
            }
            // Match partner/payee fields
            else if (headerLower.includes('partner') || headerLower.includes('payee') || headerLower.includes('recipient') || headerLower.includes('merchant')) {
                initialMapping['partner'] = index;
            }
            // Match IBAN fields
            else if (headerLower.includes('iban') || headerLower.includes('account')) {
                if (headerLower.includes('source') || headerLower.includes('from')) {
                    initialMapping['source_iban'] = index;
                } else if (headerLower.includes('target') || headerLower.includes('to') || headerLower.includes('destination')) {
                    initialMapping['target_iban'] = index;
                }
            }
            // Match transaction ID fields
            else if (headerLower.includes('id') || headerLower.includes('reference')) {
                initialMapping['transaction_id'] = index;
            }
            // Match tag fields
            else if (headerLower.includes('tag') || headerLower.includes('label')) {
                initialMapping['tags'] = index;
            }
        });

        setColumnMapping(initialMapping);
    }, [headers]);

    // Handle column selection change
    const handleColumnMappingChange = useCallback((field: string, value: string) => {
        setColumnMapping(prev => ({
            ...prev,
            [field]: value ? parseInt(value) : null
        }));
    }, []);

    // Handle saved mapping selection
    const handleMappingSelect = useCallback((mappingId: string) => {
        setSelectedMapping(mappingId);

        if (mappingId !== 'none') {
            const mapping = savedMappings.find(m => m.id.toString() === mappingId);
            if (mapping) {
                setColumnMapping(mapping.column_mapping);
                setDateFormat(mapping.date_format);
                setAmountFormat(mapping.amount_format);
                setAmountTypeStrategy(mapping.amount_type_strategy);
                setCurrency(mapping.currency);

                // Update the usage timestamp
                axios.put(`/imports/mappings/${mapping.id}`).catch(err => {
                    console.error('Failed to update mapping usage', err);
                });
            }
        }
    }, [savedMappings]);

    // Handle mapping deletion
    const handleDeleteMapping = useCallback(async (mappingId: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (confirm('Are you sure you want to delete this mapping?')) {
            try {
                await axios.delete(`/imports/mappings/${mappingId}`);
                setSavedMappings(prev => prev.filter(m => m.id !== mappingId));
                if (selectedMapping === mappingId.toString()) {
                    setSelectedMapping('none');
                }
            } catch (err) {
                console.error('Failed to delete mapping', err);
            }
        }
    }, [selectedMapping]);

    // Submit configuration
    const handleSubmit = useCallback(async () => {
        // Validate required fields
        const requiredFields = transactionFields.filter(field => field.required);
        const missingFields = requiredFields.filter(field => columnMapping[field.key] === null);

        if (missingFields.length > 0) {
            setError(`Missing required field mappings: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`/imports/${importId}/configure`, {
                column_mapping: columnMapping,
                date_format: dateFormat,
                amount_format: amountFormat,
                amount_type_strategy: amountTypeStrategy,
                currency: currency,
            });

            setPreviewData(response.data.preview_data || []);

            // Save mapping if requested
            if (saveMapping && mappingName) {
                try {
                    await axios.post('/imports/mappings', {
                        name: mappingName,
                        bank_name: bankName,
                        column_mapping: columnMapping,
                        date_format: dateFormat,
                        amount_format: amountFormat,
                        amount_type_strategy: amountTypeStrategy,
                        currency: currency,
                    });
                } catch (err: any) {
                    console.error('Failed to save mapping', err);
                }
            }

            onComplete({
                columnMapping,
                dateFormat,
                amountFormat,
                amountTypeStrategy,
                currency,
                previewData: response.data.preview_data || [],
            });
        } catch (err: any) {
            console.error('Configuration error:', err);
            setError(err.response?.data?.message || 'Failed to configure import');
        } finally {
            setIsLoading(false);
        }
    }, [columnMapping, dateFormat, amountFormat, amountTypeStrategy, currency, importId, onComplete, saveMapping, mappingName, bankName]);

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Configure your import</h3>


            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="saved">Use Saved Mapping</TabsTrigger>
                    <TabsTrigger value="manual">Manual Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="saved">
                    {savedMappings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedMappings.map(mapping => (
                                <Card
                                    key={mapping.id}
                                    className={`cursor-pointer bg-card border-foreground text-foreground ${selectedMapping === mapping.id.toString() ? 'outline-foreground outline-3' : ''}`}
                                    onClick={() => handleMappingSelect(mapping.id.toString())}
                                >
                                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{mapping.name}</CardTitle>
                                            {mapping.bank_name && (
                                                <CardDescription className="text-muted-foreground">{mapping.bank_name}</CardDescription>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteMapping(mapping.id, e)}
                                            className="text-muted-foreground hover:text-destructive-foreground transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </CardHeader>
                                    <CardContent className="px-4 py-2 text-xs text-muted-foreground">
                                        <div>Format: {mapping.date_format}, {mapping.amount_format}</div>
                                        <div>Currency: {mapping.currency}</div>
                                        <div>Last used: {new Date(mapping.last_used_at || '').toLocaleDateString()}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 border border-dashed border-gray-700 rounded-md">
                            <p className="text-muted-foreground">No saved mappings yet.</p>
                            <p className="text-muted-foreground mt-2">Configure manually and save for future use.</p>
                        </div>
                    )}

                    {selectedMapping !== 'none' && (
                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setActiveTab('manual')}>
                                Review Selected Mapping
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="manual">
                    <p className="mb-6 text-foreground">
                        Select the columns that correspond to each field in your CSV.
                    </p>

                    {/* Column Mapping */}
                    <div className="grid grid-cols-3 gap-6 mb-8 text-foreground">
                        {transactionFields.map(field => (
                            <div key={field.key} className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    {field.label}
                                    {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                <Select
                                    value={columnMapping[field.key]?.toString() ?? 'none'}
                                    onValueChange={(value) => handleColumnMappingChange(field.key, value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Select column</SelectItem>
                                        {headers.map((header, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                                {header}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    {/* Date and Amount Format */}
                    <div className="grid grid-cols-2 gap-6 mb-8 text-foreground">
                        <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select value={dateFormat} onValueChange={setDateFormat}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dateFormats.map(format => (
                                        <SelectItem key={format.value} value={format.value}>
                                            {format.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Amount Format</Label>
                            <Select value={amountFormat} onValueChange={setAmountFormat}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select amount format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {amountFormats.map(format => (
                                        <SelectItem key={format.value} value={format.value}>
                                            {format.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Amount Type Strategy and Currency */}
                    <div className="grid grid-cols-2 gap-6 mb-8 text-foreground">
                        <div className="space-y-2">
                            <Label>Amount Type Strategy</Label>
                            <Select value={amountTypeStrategy} onValueChange={setAmountTypeStrategy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select amount type strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                    {amountTypeStrategies.map(strategy => (
                                        <SelectItem key={strategy.value} value={strategy.value}>
                                            {strategy.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map(curr => (
                                        <SelectItem key={curr.value} value={curr.value}>
                                            {curr.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Save Mapping Option */}
                    <div className="border border-muted-foreground bg-card p-4 rounded-md mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="save-mapping"
                                    checked={saveMapping}
                                    onCheckedChange={setSaveMapping}
                                />
                                <Label htmlFor="save-mapping" className="text-foreground cursor-pointer">
                                    Save this configuration for future imports
                                </Label>
                            </div>
                            <Save size={16} className="text-foreground" />
                        </div>

                        {saveMapping && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mapping-name">Mapping Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="mapping-name"
                                        value={mappingName}
                                        onChange={(e) => setMappingName(e.target.value)}
                                        placeholder="e.g. My Bank Export"
                                        className="border-foreground shadow-xs border-1 text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank-name">Bank Name (optional)</Label>
                                    <Input
                                        id="bank-name"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="e.g. Chase Bank"
                                        className="border-foreground text-foreground border-1 shadow-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>


{/* Sample Data */}
<div className="mb-8">
                <h6 className="mb-4 text-foreground">Sample data from your uploaded CSV</h6>
                <div className="rounded-lg border border-foreground overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted-foreground border-b border-foreground">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="px-4 py-2 text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sampleRows.slice(0, 5).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-muted-foreground">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 text-foreground whitespace-nowrap truncate">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-300 p-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || (activeTab === 'saved' && selectedMapping === 'none')}
                >
                    {isLoading ? 'Processing...' : 'Apply configuration'}
                </Button>
            </div>
        </div>
    );
}
