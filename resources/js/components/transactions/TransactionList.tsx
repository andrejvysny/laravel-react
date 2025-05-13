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
                    <div key={month} className="mb-10 flex flex-col gap-2 pb-10">
                        {/* Summary at the top of the month */}
                        <div className="mb-1 flex items-center">
                            <span className="text-2xl font-semibold">{month}</span>
                        </div>
                        <div className="bg-card xs mb-4 flex rounded-xl border-1 border-current shadow">
                            <div className="flex w-full divide-x divide-gray-400 p-4">
                                <div className="flex flex-1 flex-col items-start pr-6">
                                    <span className="mb-1 text-xs text-gray-400">Income</span>
                                    <span className="text-xl font-medium">+{summary.income.toFixed(2)}€</span>
                                </div>
                                <div className="flex flex-1 flex-col items-start px-6">
                                    <span className="mb-1 text-xs text-gray-400">Expense</span>
                                    <span className="text-xl font-medium">-{summary.expense.toFixed(2)}€</span>
                                </div>
                                <div className="flex flex-1 flex-col items-start pl-6">
                                    <span className="mb-1 text-xs text-gray-400">Balance</span>
                                    <span className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-500' : 'text-destructive-foreground'}`}>
                                        {summary.balance.toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* All date groups for this month */}
                        {sortedDates.map((date) => (
                            <div key={date} className="flex flex-col gap-2">
                                <h3 className="text-muted-foreground px-2 text-sm">{date}</h3>
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
