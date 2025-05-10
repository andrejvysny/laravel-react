import TransactionComponent from '@/components/transactions/Transaction';
import { Transaction } from '@/types/index';

interface Props {
    transactions: Transaction[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}
function TransactionList({ transactions, monthlySummaries }: Props) {
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

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-0">
            {sortedMonths.map((month) => {
                const summary =
                    monthlySummaries[month] &&
                    typeof monthlySummaries[month].income === 'number' &&
                    typeof monthlySummaries[month].expense === 'number' &&
                    typeof monthlySummaries[month].balance === 'number'
                        ? monthlySummaries[month]
                        : { income: 0, expense: 0, balance: 0 };
                const dateGroups = groupedByMonth[month];
                const sortedDates = Object.keys(dateGroups).sort((a, b) => {
                    return new Date(b).getTime() - new Date(a).getTime();
                });
                return (
                    <div key={month} className="border-accent mb-10 flex flex-col gap-2 border-b-1 pb-10">
                        {/* Summary at the top of the month */}
                        <div className="mb-4 flex items-center gap-4 rounded-xl bg-gray-900 p-4">
                            <div className="flex-1">
                                <div className="font-medium">{month}</div>
                                <div className="mt-1 flex gap-4">
                                    <span className="text-sm text-gray-400">
                                        Income: <span className="text-green-500">+{summary.income.toFixed(2)}€</span>
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        Expense: <span className="text-red-500">-{summary.expense.toFixed(2)}€</span>
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        Balance:{' '}
                                        <span className={summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {summary.balance.toFixed(2)}€
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* All date groups for this month */}
                        {sortedDates.map((date) => (
                            <div key={date} className="flex flex-col gap-2">
                                <h3 className="px-2 text-sm text-gray-500">{date}</h3>
                                <div className="flex flex-col gap-3">
                                    {dateGroups[date].map((transaction) => (
                                        <TransactionComponent key={transaction.id} {...transaction} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

export default TransactionList;
