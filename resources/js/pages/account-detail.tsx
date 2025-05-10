import AppLayout from '@/layouts/app-layout';
import { TransactionType, Account } from '@/types';
import { Head } from '@inertiajs/react';
import TransactionComponent from '@/components/Transaction';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface Props {
    account: Account;
    transactions: TransactionType[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}

export default function AccountDetail({ account, transactions, monthlySummaries }: Props) {
    const [syncing, setSyncing] = useState(false);
    const breadcrumbs = [
        { title: 'Accounts', href: '/accounts' },
        { title: account.name, href: `/accounts/${account.id}` },
    ];

    const handleSyncTransactions = async () => {
        setSyncing(true);
        try {
            await axios.post(`/api/accounts/${account.id}/sync-transactions`);
            // Refresh the page to show new transactions
            window.location.reload();
        } catch (error) {
            // Handle error silently
        } finally {
            setSyncing(false);
        }
    };

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
        const { key, ...rest } = transaction as any;
        groupedByMonth[monthKey][dateKey].push({ ...rest, account: transaction.account ?? { id: 0, name: '', account_id: '', bank_name: '', iban: '', currency: '', balance: 0, created_at: '', updated_at: '' } } as TransactionType);
    });
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(`${yearA}-${monthA}-01`);
        const dateB = new Date(`${yearB}-${monthB}-01`);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Account: ${account.name}`} />
            <div className="flex max-w-5xl mx-auto w-full mt-8 gap-6">
                {/* Left: Sticky Account Details, Settings, Analytics */}
                <div className="w-full max-w-xs flex-shrink-0">
                    <div className="sticky top-8">
                        <div className="bg-gray-900 rounded-xl p-6 mb-6">
                            <h2 className="text-2xl font-semibold mb-2">{account.name}</h2>
                            <div className="text-gray-400 mb-2">{account.bank_name}</div>
                            <div className="flex flex-col gap-1 text-sm">
                                <span><strong>IBAN:</strong> {account.iban}</span>
                                <span><strong>Type:</strong> {account.type}</span>
                                <span><strong>Currency:</strong> {account.currency}</span>
                                <span><strong>Balance:</strong> {Number(account.balance).toFixed(2)} {account.currency}</span>
                                {account.is_gocardless_synced && (
                                    <>
                                        <span><strong>GoCardless Account ID:</strong> {account.gocardless_account_id}</span>
                                        <span><strong>Last Synced:</strong> {account.gocardless_last_synced_at ? new Date(account.gocardless_last_synced_at).toLocaleString() : 'Never'}</span>
                                        <div className="mt-4">
                                            <Button 
                                                onClick={handleSyncTransactions}
                                                disabled={syncing}
                                                className="w-full"
                                            >
                                                {syncing ? "Syncing..." : "Sync Transactions"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mt-4">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Account Settings</button>
                            </div>
                        </div>
                        {/* Analytics/Graphs Placeholder */}
                        <div className="bg-gray-900 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Analytics & Graphs</h3>
                            <div className="h-32 flex items-center justify-center text-gray-500">
                                {/* Replace with real chart component */}
                                <span>Charts coming soon…</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right: Transactions List */}
                <div className="flex-1">
                    <div className="flex flex-col gap-6">
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
                </div>
            </div>
        </AppLayout>
    );
} 