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
import ValueSplit from '@/components/ui/value-split';

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
            await router.delete(`/accounts/${account.id}`, {
                onSuccess: () => {
                    router.visit('/accounts');
                },
                onError: (error) => {
                    console.error('Failed to delete account:', error);
                }
            });
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
                            <div className="bg-card mb-6 w-full rounded-xl border-1 p-6 shadow-xs">
                                <h2 className="text-xl font-semibold">{account.name}</h2>
                                <div className="mb-4 font-bold text-muted-foreground">{account.bank_name}</div>

                                <ValueSplit
                                    className="mb-4"
                                    data={[
                                        { label: 'IBAN', value: account.iban },
                                        { label: 'Type', value: account.type },
                                        { label: 'Currency', value: account.currency },
                                        { label: 'Balance', value: Number(account.balance).toFixed(2) },
                                    ]}
                                />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your account and all associated
                                                transactions. This includes:
                                                <ul className="list-disc pl-5 text-sm">
                                                    <li>All transaction history</li>
                                                    <li>All transaction categories</li>
                                                    <li>All account settings</li>
                                                    <li>All synced data</li>
                                                </ul>
                                            </AlertDialogDescription>
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
                                <div className="bg-card mb-6 w-full rounded-xl border-1 p-6 shadow-xs">
                                    <h3 className="mb-4 text-lg font-semibold">GoCardless</h3>
                                    <ValueSplit
                                        className="mb-4"
                                        data={[
                                            { label: 'Bank', value: account.bank_name },
                                            { label: 'Account ID', value: account.gocardless_account_id },
                                            {
                                                label: 'Synced',
                                                value: account.gocardless_last_synced_at ? formatDate(account.gocardless_last_synced_at) : 'Never',
                                            },
                                        ]}
                                    />

                                    <Button onClick={handleSyncTransactions} disabled={syncing} className="w-full">
                                        {syncing ? 'Syncing...' : 'Sync Transactions'}
                                    </Button>
                                </div>
                            )}
                            {/* Analytics/Graphs Placeholder */}
                            <div className="bg-card shadow-xs border-1 mb-6 w-full rounded-xl p-6">
                                <h3 className="mb-4 text-lg font-semibold">Category spending</h3>
                                <div className="flex h-32 items-center justify-center text-muted-foreground">
                                    {/* Replace with real chart component */}
                                    <span>coming soon…</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right: Transactions List */}
                    <div className="flex-1">
                        <div className="mb-6 flex flex-col">
                            <div className="bg-card shadow-xs border-1 rounded-xl p-5">
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
