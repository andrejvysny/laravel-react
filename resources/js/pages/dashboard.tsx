import AppLayout from '@/layouts/app-layout';
import { Account, Transaction } from '@/types';
import { Head } from '@inertiajs/react';
import { CategoryScale, Chart as ChartJS, ChartOptions, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];

interface DashboardProps {
    accounts: Account[];
    recentTransactions: Transaction[];
    monthlyBalances: Record<number, Record<string, number>>;
}

export default function Dashboard({ accounts, recentTransactions, monthlyBalances }: DashboardProps) {
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Get all months from the first account's data
    const months = Object.keys(monthlyBalances[accounts[0]?.id] || {});

    // Prepare data for balance chart
    const chartData = {
        labels: months,
        datasets: accounts.map((account) => ({
            label: account.name,
            data: months.map((month) => monthlyBalances[account.id][month] || 0),
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0,
            fill: false,
        })),
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#9CA3AF',
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                type: 'linear',
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                    color: '#9CA3AF',
                    callback: function (value) {
                        return `${Number(value).toFixed(2)} €`;
                    },
                },
            },
            x: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                    color: '#9CA3AF',
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
                {/* Top widgets row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Accounts List Widget */}
                    <div className="rounded-xl bg-card shadow-xs border-1 p-6">
                        <div className="mb-2 text-sm text-gray-400">Accounts</div>
                        <ul>
                            {accounts.slice(0, 5).map((acc) => (
                                <li key={acc.id} className="flex justify-between py-1">
                                    <a href={`/accounts/${acc.id}`} className="flex w-full justify-between transition-colors hover:text-blue-400">
                                        <span className="text-white">{acc.name}</span>
                                        <span className="font-semibold text-green-400">
                                            {Number(acc.balance).toFixed(2)} {acc.currency}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        {accounts.length > 5 && <div className="mt-2 text-xs text-gray-500">+{accounts.length - 5} more accounts</div>}
                    </div>
                    {/* Total Balance Widget */}
                    <div className="flex flex-col items-center justify-center rounded-xl bg-card shadow-xs border-1 p-6">
                        <span className="mb-2 text-sm text-gray-400">Total Balance</span>
                        <span className="text-3xl font-bold text-green-400">{totalBalance.toFixed(2)} €</span>
                    </div>
                    {/* Recent Transactions Count Widget */}
                    <div className="flex flex-col items-center justify-center rounded-xl bg-card shadow-xs border-1 p-6">
                        <span className="mb-2 text-sm text-gray-400">Recent Transactions</span>
                        <span className="text-3xl font-bold text-blue-400">{recentTransactions.length}</span>
                    </div>
                </div>

                {/* Balance Chart */}
                <div className="rounded-xl bg-card shadow-xs border-1 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Balance Over Time</h3>
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="mt-4 rounded-xl bg-card shadow-xs border-1 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Latest Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-gray-400">
                                    <th className="px-2 py-1 text-left">Date</th>
                                    <th className="px-2 py-1 text-left">Description</th>
                                    <th className="px-2 py-1 text-left">Account</th>
                                    <th className="px-2 py-1 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-t border-gray-800">
                                        <td className="px-2 py-1">{new Date(tx.booked_date).toLocaleDateString()}</td>
                                        <td className="px-2 py-1">{tx.description}</td>
                                        <td className="px-2 py-1">{tx.account_id ?? '-'}</td>
                                        <td className={`px-2 py-1 text-right font-medium ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {Number(tx.amount).toFixed(2)} {tx.currency}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
