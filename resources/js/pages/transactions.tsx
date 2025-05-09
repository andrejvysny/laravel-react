//WIP

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, TransactionType } from '@/types';
import { Head, router } from '@inertiajs/react';
import TransactionComponent from '@/components/Transaction';
import CreateTransactionModal from '@/components/CreateTransactionModal';
import { useState } from 'react';

interface Props {
    transactions: TransactionType[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}

export default function Transactions({ transactions, monthlySummaries }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Transactions',
            href: '/transactions',
        },
    ];

    // Group transactions by month and then by date
    const groupedByMonth: Record<string, Record<string, TransactionType[]>> = {};
    transactions.forEach(transaction => {
        const monthKey = new Date(transaction.booked_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const dateKey = new Date(transaction.booked_date).toLocaleDateString('sk-SK', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = {};
        if (!groupedByMonth[monthKey][dateKey]) groupedByMonth[monthKey][dateKey] = [];
        groupedByMonth[monthKey][dateKey].push(transaction);
    });
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
        // Sort by year and month descending
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(`${yearA}-${monthA}-01`);
        const dateB = new Date(`${yearB}-${monthB}-01`);
        return dateB.getTime() - dateA.getTime();
    });

    const handleCreateTransaction = (transaction: Omit<TransactionType, 'id' | 'created_at' | 'updated_at' | 'account'>) => {
        router.post('/transactions', transaction, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
            preserveScroll: true,
        });
    };
    return <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Transactions" />
        
        <div className="flex h-full flex-1 flex-col rounded-xl text-white">
            <div className="sticky top-0 bg-gray-900 z-10 p-4">
                <div className="mb-6 mx-auto w-full">
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
                        />
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            + New Transaction
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Date Filter */}
                        <select className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white">
                            <option value="">Date</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last7days">Last 7 days</option>
                            <option value="last30days">Last 30 days</option>
                            <option value="custom">Custom range</option>
                        </select>

                        {/* Amount Filter */}
                        <select className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white">
                            <option value="">Amount</option>
                            <option value="under10">Under 10€</option>
                            <option value="10to50">10€ - 50€</option>
                            <option value="50to100">50€ - 100€</option>
                            <option value="over100">Over 100€</option>
                        </select>

                        {/* Account Filter */}
                        <select className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white">
                            <option value="">Account</option>
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                            <option value="credit">Credit Card</option>
                        </select>

                        {/* Category Filter */}
                        <select className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white">
                            <option value="">Category</option>
                            <option value="food">Food & Dining</option>
                            <option value="shopping">Shopping</option>
                            <option value="transport">Transport</option>
                            <option value="utilities">Utilities</option>
                            <option value="entertainment">Entertainment</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="flex flex-col gap-6 mt-4 max-w-xl mx-auto w-full">
                {sortedMonths.map(month => {
                    const summary = monthlySummaries[month] && typeof monthlySummaries[month].income === 'number' && typeof monthlySummaries[month].expense === 'number' && typeof monthlySummaries[month].balance === 'number'
                        ? monthlySummaries[month]
                        : { income: 0, expense: 0, balance: 0 };
                    const dateGroups = groupedByMonth[month];
                    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
                        return new Date(b).getTime() - new Date(a).getTime();
                    });
                    return (
                        <div key={month} className="flex flex-col gap-2">
                            {/* Summary at the top of the month */}
                            <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl mt-4">
                                <div className="flex-1">
                                    <div className="font-medium">{month}</div>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-sm text-gray-400">Income: <span className="text-green-500">+{summary.income.toFixed(2)}€</span></span>
                                        <span className="text-sm text-gray-400">Expense: <span className="text-red-500">-{summary.expense.toFixed(2)}€</span></span>
                                        <span className="text-sm text-gray-400">Balance: <span className={summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {summary.balance.toFixed(2)}€
                                        </span></span>
                                    </div>
                                </div>
                            </div>
                            {/* All date groups for this month */}
                            {sortedDates.map(date => (
                                <div key={date} className="flex flex-col gap-2">
                                    <h3 className="text-gray-500 text-sm px-2">{date}</h3>
                                    <div className="flex flex-col gap-3">
                                        {dateGroups[date].map(transaction => (
                                            <TransactionComponent key={transaction.id} {...transaction} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <CreateTransactionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTransaction}
            />
        </div>
    </AppLayout>
}
