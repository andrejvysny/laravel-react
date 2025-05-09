import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ accounts, recentTransactions }) {
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Prepare data for balance chart
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Balance',
            data: [totalBalance * 0.8, totalBalance * 0.85, totalBalance * 0.9, totalBalance * 0.95, totalBalance],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)'
                },
                ticks: {
                    color: '#9CA3AF'
                }
            },
            x: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)'
                },
                ticks: {
                    color: '#9CA3AF'
                }
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full">
                {/* Top widgets row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Accounts List Widget */}
                    <div className="bg-gray-900 rounded-xl p-6">
                        <div className="text-gray-400 text-sm mb-2">Accounts</div>
                        <ul>
                            {accounts.slice(0, 5).map(acc => (
                                <li key={acc.id} className="flex justify-between py-1">
                                    <a href={`/accounts/${acc.id}`} className="flex justify-between w-full hover:text-blue-400 transition-colors">
                                        <span className="text-white">{acc.name}</span>
                                        <span className="text-green-400 font-semibold">{Number(acc.balance).toFixed(2)} {acc.currency}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        {accounts.length > 5 && (
                            <div className="text-xs text-gray-500 mt-2">+{accounts.length - 5} more accounts</div>
                        )}
                    </div>
                    {/* Total Balance Widget */}
                    <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-sm mb-2">Total Balance</span>
                        <span className="text-3xl font-bold text-green-400">
                            {totalBalance.toFixed(2)} €
                        </span>
                    </div>
                    {/* Recent Transactions Count Widget */}
                    <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-sm mb-2">Recent Transactions</span>
                        <span className="text-3xl font-bold text-blue-400">{recentTransactions.length}</span>
                    </div>
                </div>

                {/* Balance Chart */}
                <div className="bg-gray-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Balance Over Time</h3>
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-gray-900 rounded-xl p-6 mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-white">Latest Transactions</h3>
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
                                {recentTransactions.map(tx => (
                                    <tr key={tx.id} className="border-t border-gray-800">
                                        <td className="px-2 py-1">{new Date(tx.booked_date).toLocaleDateString()}</td>
                                        <td className="px-2 py-1">{tx.description}</td>
                                        <td className="px-2 py-1">{tx.account?.name ?? '-'}</td>
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
