//WIP

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Transaction } from '@/types/index';
import { Head, router } from '@inertiajs/react';
import CreateTransactionModal from '@/components/transactions/CreateTransactionModal';
import { useState } from 'react';
import TransactionList from '@/components/transactions/TransactionList';

interface Props {
    transactions: Transaction[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}

export default function Index({ transactions, monthlySummaries }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Transactions',
            href: '/transactions',
        },
    ];

    const handleCreateTransaction = (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'account'>) => {
        router.post('/transactions', transaction, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
            preserveScroll: true,
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Index" />
            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-white">Your accounts</h1>
                        <div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mr-3 cursor-pointer rounded-md bg-white px-3 py-1 text-black"
                            >
                                + New Transaction
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto flex w-full max-w-5xl gap-6">
                    {/* Left: Sticky Account Details, Settings, Analytics */}
                    <div className="w-full max-w-xs flex-shrink-0">
                        <div className="sticky top-8">
                            <div className="mb-6 w-full rounded-xl bg-gray-900 p-6">
                                <h3 className="mb-4 text-lg font-semibold">Filters</h3>


                            </div>

                            {/* Analytics/Graphs Placeholder */}
                            <div className="mb-6 w-full rounded-xl bg-gray-900 p-6">
                                <h3 className="mb-4 text-lg font-semibold">Category spending</h3>
                                <div className="flex h-32 items-center justify-center text-gray-500">
                                    {/* Replace with real chart component */}
                                    <span>coming soon…</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right: Transactions List */}
                    <div className="flex-1">
                        <div className="flex flex-col gap-6">
                            <TransactionList transactions={transactions} monthlySummaries={monthlySummaries} />

                            <CreateTransactionModal
                                isOpen={isCreateModalOpen}
                                onClose={() => setIsCreateModalOpen(false)}
                                onSubmit={handleCreateTransaction}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
