import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/types/index';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadStepProps {
    onComplete: (data: { importId: number; headers: string[]; sampleRows: string[][]; accountId: number }) => void;
}

export default function UploadStep({ onComplete }: UploadStepProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [delimiter, setDelimiter] = useState(',');
    const [quoteChar, setQuoteChar] = useState('"');

    // Load accounts on component mount
    useState(() => {
        axios.get('/accounts')
            .then(response => {
                setAccounts(response.data.accounts);
            })
            .catch(error => {
                console.error('Failed to load accounts', error);
                setError('Failed to load accounts');
            });
    });

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!selectedAccount) {
            setError('Please select an account first');
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('account_id', selectedAccount.toString());
        formData.append('delimiter', delimiter);
        formData.append('quote_char', quoteChar === 'none' ? '' : quoteChar);

        try {
            const response = await axios.post('/imports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onComplete({
                importId: response.data.import_id,
                headers: response.data.headers,
                sampleRows: response.data.sample_rows,
                accountId: selectedAccount,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    }, [selectedAccount, delimiter, quoteChar, onComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
        disabled: isUploading || !selectedAccount,
    });

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Upload CSV File</h2>

            {/* Account Selection */}
            <div className="mb-6">
                <Label htmlFor="account">Select Account</Label>
                <Select
                    value={selectedAccount?.toString()}
                    onValueChange={(value) => setSelectedAccount(parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                                {account.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* CSV Format Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <Label htmlFor="delimiter">Delimiter</Label>
                    <Select
                        value={delimiter}
                        onValueChange={setDelimiter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select delimiter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=",">, (comma)</SelectItem>
                            <SelectItem value=";">; (semicolon)</SelectItem>
                            <SelectItem value="\t">Tab</SelectItem>
                            <SelectItem value="|">| (pipe)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="quoteChar">Quote Character</Label>
                    <Select
                        value={quoteChar}
                        onValueChange={setQuoteChar}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select quote character" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No quotes</SelectItem>
                            <SelectItem value='"'>" (double quote)</SelectItem>
                            <SelectItem value="'">' (single quote)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* File Upload Area */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${(!selectedAccount || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <p>Uploading...</p>
                ) : isDragActive ? (
                    <p>Drop the file here...</p>
                ) : (
                    <div>
                        <p className="mb-2">Drag and drop a CSV file here, or click to select a file</p>
                        <p className="text-sm text-gray-500">Supported formats: CSV, TXT</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
} 