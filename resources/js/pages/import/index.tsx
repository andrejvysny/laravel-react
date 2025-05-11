import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Account, BreadcrumbItem, Import } from '@/types/index';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import ImportWizard from './components/ImportWizard';

interface Props {
    imports: Import[];
}

export default function Index({ imports }: Props) {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [importsList, setImportsList] = useState<Import[]>(imports);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Imports',
            href: '/imports',
        },
    ];

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleImportComplete = (newImport: Import) => {
        setImportsList([newImport, ...importsList]);
        setIsWizardOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Imports" />
            
            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-white">Imports</h1>
                        <div>
                            <Button onClick={() => setIsWizardOpen(true)}>
                                Import Transactions
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="rounded-lg bg-gray-900 p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="py-3 text-left font-medium text-gray-300">File</th>
                                    <th className="py-3 text-left font-medium text-gray-300">Date</th>
                                    <th className="py-3 text-left font-medium text-gray-300">Status</th>
                                    <th className="py-3 text-left font-medium text-gray-300">Rows</th>
                                    <th className="py-3 text-left font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-400">
                                            No imports yet. Click "Import Transactions" to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    importsList.map((importItem) => (
                                        <tr key={importItem.id} className="border-b border-gray-700">
                                            <td className="py-3 text-gray-300">
                                                {importItem.original_filename}
                                            </td>
                                            <td className="py-3 text-gray-300">
                                                {format(new Date(importItem.created_at), 'dd MMM yyyy, HH:mm')}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(importItem.status)}`}>
                                                    {importItem.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-300">
                                                {importItem.processed_rows} / {importItem.total_rows}
                                            </td>
                                            <td className="py-3 text-gray-300">
                                                {importItem.status === 'completed' && (
                                                    <button
                                                        className="text-blue-400 hover:text-blue-300 underline"
                                                        onClick={() => window.location.href = '/transactions'}
                                                    >
                                                        View Transactions
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isWizardOpen && (
                <div className="fixed inset-0 z-50">
                        <ImportWizard onComplete={handleImportComplete} onCancel={() => setIsWizardOpen(false)} />
                </div>
            )}
        </AppLayout>
    );
}
