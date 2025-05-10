//WIP

import CreateTransactionModal from '@/components/transactions/CreateTransactionModal';
import TransactionList from '@/components/transactions/TransactionList';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Transaction } from '@/types/index';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

interface Props {
    transactions: Transaction[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}

export default function Index({ transactions, monthlySummaries }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [account, setAccount] = useState('');
    const [amountMin, setAmountMin] = useState('');
    const [amountMax, setAmountMax] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Get unique accounts for dropdown
    const accounts = useMemo(() => {
        const set = new Set(transactions.map(t => t.account?.name).filter(Boolean));
        return Array.from(set) as string[];
    }, [transactions]);


    // TODO: Filter transaction on backend -> this is just a placeholder
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // General search (case-insensitive, checks account, amount, date)
            const searchLower = search.toLowerCase();
            if (search && !(
                (t.account?.name?.toLowerCase().includes(searchLower)) ||
                (t.amount?.toString().includes(search)) ||
                (t.booked_date?.toString().includes(search))
            )) return false;
            // Account filter
            if (account && t.account?.name !== account) return false;
            // Amount min
            if (amountMin && t.amount < Number(amountMin)) return false;
            // Amount max
            if (amountMax && t.amount > Number(amountMax)) return false;
            // Date from
            if (dateFrom && t.booked_date < dateFrom) return false;
            // Date to
            if (dateTo && t.booked_date > dateTo) return false;
            return true;
        });
    }, [transactions, search, account, amountMin, amountMax, dateFrom, dateTo]);

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
                    <div className="flex items-center justify-between">
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

            <div className="mx-auto w-full max-w-7xl p-4 pt-0">
                <div className="mx-auto flex w-full max-w-5xl gap-6">
                    {/* Left: Sticky Account Details, Settings, Analytics */}
                    <div className="w-full max-w-xs flex-shrink-0">
                        <div className="sticky top-8">
                            <div className="mb-6 w-full rounded-xl bg-gray-900 p-6">
                                <h3 className="mb-4 text-lg font-semibold">Filters</h3>
                                <div className="flex flex-col gap-4">
                                    {/* General search */}
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="rounded-xl bg-gray-800 text-white px-3 py-2"
                                    />
                                    {/* Account filter */}
                                    <select
                                        value={account}
                                        onChange={e => setAccount(e.target.value)}
                                        className="rounded-xl bg-gray-800 text-white px-3 py-2"
                                    >
                                        <option value="">All Accounts</option>
                                        {accounts.map(acc => (
                                            <option key={acc} value={acc}>{acc}</option>
                                        ))}
                                    </select>
                                    {/* Amount min/max */}
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min €"
                                            value={amountMin}
                                            onChange={e => setAmountMin(e.target.value)}
                                            className="rounded-xl bg-gray-800 text-white px-3 py-2 w-1/2"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max €"
                                            value={amountMax}
                                            onChange={e => setAmountMax(e.target.value)}
                                            className="rounded-xl bg-gray-800 text-white px-3 py-2 w-1/2"
                                        />
                                    </div>
                                    {/* Date range */}
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={e => setDateFrom(e.target.value)}
                                            className="rounded-xl bg-gray-800 text-white px-3 py-2 w-1/2"
                                        />
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={e => setDateTo(e.target.value)}
                                            className="rounded-xl bg-gray-800 text-white px-3 py-2 w-1/2"
                                        />
                                    </div>
                                </div>
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
                            <TransactionList transactions={filteredTransactions} monthlySummaries={monthlySummaries} />

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
