import AccountDetailMonthlyComparisonChart from '@/components/accounts/AccountDetailMonthlyComparisonChart';
import TransactionList from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Account, Transaction } from '@/types/index';
import { formatDate } from '@/utils/date';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
    account: Account;
    transactions: Transaction[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}

export default function Detail({ account, transactions, monthlySummaries }: Props) {
    const [syncing, setSyncing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(`/accounts/${account.id}`);
            if (response.status === 200) {
                window.location.href = '/accounts';
            }
        } catch (error) {
            console.error('Failed to delete account:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Group transactions by month and then by date
    const groupedByMonth: Record<string, Record<string, Transaction[]>> = {};
    transactions.forEach((transaction) => {
        const monthKey = new Date(transaction.booked_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const dateKey = new Date(transaction.booked_date).toLocaleDateString('sk-SK', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = {};
        if (!groupedByMonth[monthKey][dateKey]) groupedByMonth[monthKey][dateKey] = [];
        const { key, ...rest } = transaction as any;
        groupedByMonth[monthKey][dateKey].push({
            ...rest,
            account: transaction.account ?? {
                id: 0,
                name: '',
                account_id: '',
                bank_name: '',
                iban: '',
                currency: '',
                balance: 0,
                created_at: '',
                updated_at: '',
            },
        } as Transaction);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Account: ${account.name}`} />
            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto flex w-full max-w-5xl gap-6">
                    {/* Left: Sticky Account Details, Settings, Analytics */}
                    <div className="w-full max-w-xs flex-shrink-0">
                        <div className="sticky top-8">
                            <div className="mb-6 w-full rounded-xl bg-gray-900 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-2xl font-semibold">{account.name}</h2>
                                </div>
                                <div className="mb-2 text-gray-400">{account.bank_name}</div>
                                <div className="flex flex-col gap-1 text-sm">
                                    <span>
                                        <span className="text-gray-400">IBAN:</span> {account.iban}
                                    </span>
                                    <span>
                                        <span className="text-gray-400">Type:</span> {account.type}
                                    </span>
                                    <span>
                                        <span className="text-gray-400">Currency:</span> {account.currency}
                                    </span>
                                    <span>
                                        <span className="text-gray-400">Balance:</span>{' '}
                                        <span className="font-bold text-white">
                                            {Number(account.balance).toFixed(2)} {account.currency}
                                        </span>
                                    </span>
                                </div>

                                <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                Delete Account
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your account
                                                    and all associated transactions. This includes:
                                                </AlertDialogDescription>
                                                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                                                    <li>All transaction history</li>
                                                    <li>All transaction categories</li>
                                                    <li>All account settings</li>
                                                    <li>All synced data</li>
                                                </ul>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDeleteAccount}
                                                    disabled={isDeleting}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                            </div>

                            {account.is_gocardless_synced && (
                                <div className="mb-6 w-full rounded-xl bg-gray-900 p-6">
                                    <h3 className="mb-4 text-lg font-semibold">GoCardless</h3>
                                    <div>
                                        <span className="text-gray-400">Bank: </span> {account.bank_name}
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Account ID: </span> {account.gocardless_account_id}
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Synced: </span>
                                        {account.gocardless_last_synced_at ? formatDate(account.gocardless_last_synced_at) : 'Never'}
                                    </div>
                                    <div className="mt-4">
                                        <Button onClick={handleSyncTransactions} disabled={syncing} className="w-full">
                                            {syncing ? 'Syncing...' : 'Sync Transactions'}
                                        </Button>
                                    </div>
                                </div>
                            )}
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
                        <div className="mb-6 flex flex-col">
                            <div className="rounded-xl bg-gray-900 p-6">
                                <h3 className="mb-4 text-lg font-semibold">Monthly comparison</h3>

                                <AccountDetailMonthlyComparisonChart
                                    currentMonthData={[
                                        { date: '2024-03-01', balance: 923 },
                                        { date: '2024-03-02', balance: 900 },
                                        { date: '2024-03-03', balance: 913 },
                                        { date: '2024-03-04', balance: 918 },
                                        { date: '2024-03-05', balance: 893 },
                                        { date: '2024-03-06', balance: 828 },
                                        { date: '2024-03-07', balance: 733 },
                                        { date: '2024-03-08', balance: 838 },
                                        { date: '2024-03-09', balance: 843 },
                                        { date: '2024-03-10', balance: 918 },
                                    ]}
                                    previousMonthData={[
                                        { date: '2024-02-01', balance: 850 },
                                        { date: '2024-02-02', balance: 720 },
                                        { date: '2024-02-03', balance: 695 },
                                        { date: '2024-02-04', balance: 810 },
                                        { date: '2024-02-05', balance: 790 },
                                        { date: '2024-02-06', balance: 860 },
                                        { date: '2024-02-07', balance: 840 },
                                        { date: '2024-02-08', balance: 795 },
                                        { date: '2024-02-09', balance: 920 },
                                        { date: '2024-02-10', balance: 890 },
                                        { date: '2024-02-11', balance: 850 },
                                        { date: '2024-02-12', balance: 780 },
                                        { date: '2024-02-13', balance: 910 },
                                        { date: '2024-02-14', balance: 875 },
                                        { date: '2024-02-15', balance: 950 },
                                        { date: '2024-02-16', balance: 920 },
                                        { date: '2024-02-17', balance: 890 },
                                        { date: '2024-02-18', balance: 860 },
                                        { date: '2024-02-19', balance: 930 },
                                        { date: '2024-02-20', balance: 895 },
                                        { date: '2024-02-21', balance: 870 },
                                        { date: '2024-02-22', balance: 940 },
                                        { date: '2024-02-23', balance: 910 },
                                        { date: '2024-02-24', balance: 880 },
                                        { date: '2024-02-25', balance: 850 },
                                        { date: '2024-02-26', balance: 920 },
                                        { date: '2024-02-27', balance: 890 },
                                        { date: '2024-02-28', balance: 960 },
                                        { date: '2024-02-29', balance: 930 },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <TransactionList transactions={transactions} monthlySummaries={monthlySummaries} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
