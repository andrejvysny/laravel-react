//WIP

import CreateTransactionModal from '@/components/transactions/CreateTransactionModal';
import TransactionList from '@/components/transactions/TransactionList';
import { SelectInput, TextInput } from '@/components/ui/form-inputs';
import { InferFormValues, SmartForm } from '@/components/ui/smart-form';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/layouts/page-header';
import { BreadcrumbItem, Transaction } from '@/types/index';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

interface Props {
    transactions: Transaction[];
    monthlySummaries: Record<string, { income: number; expense: number; balance: number }>;
}

const filterSchema = z.object({
    search: z.string().optional(),
    account: z.string().optional(),
    amountMin: z.string().optional(),
    amountMax: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
});

type FilterValues = InferFormValues<typeof filterSchema>;

export default function Index({ transactions, monthlySummaries }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Get unique accounts for dropdown
    const accounts = useMemo(() => {
        const set = new Set(transactions.map((t) => t.account?.name).filter(Boolean));
        return Array.from(set).map((name) => ({ value: name, label: name }));
    }, [transactions]);

    const defaultFilterValues: FilterValues = {
        search: '',
        account: 'all',
        amountMin: '',
        amountMax: '',
        dateFrom: '',
        dateTo: '',
    };

    // Filter transactions based on form values
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const searchLower = defaultFilterValues.search?.toLowerCase() || '';
            if (
                defaultFilterValues.search &&
                !(
                    t.account?.name?.toLowerCase().includes(searchLower) ||
                    t.amount?.toString().includes(defaultFilterValues.search) ||
                    t.booked_date?.toString().includes(defaultFilterValues.search)
                )
            )
                return false;
            if (defaultFilterValues.account && defaultFilterValues.account !== 'all' && t.account?.name !== defaultFilterValues.account) return false;
            if (defaultFilterValues.amountMin && t.amount < Number(defaultFilterValues.amountMin)) return false;
            if (defaultFilterValues.amountMax && t.amount > Number(defaultFilterValues.amountMax)) return false;
            if (defaultFilterValues.dateFrom && t.booked_date < defaultFilterValues.dateFrom) return false;
            if (defaultFilterValues.dateTo && t.booked_date > defaultFilterValues.dateTo) return false;
            return true;
        });
    }, [transactions, defaultFilterValues]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Transactions',
            href: '/transactions',
        },
    ];

    const handleCreateTransaction = (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'account'>) => {
        const payload = {
            ...transaction,
            category_id: transaction.category?.id,
            category: undefined,
        };
        router.post('/transactions', payload, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto w-full max-w-7xl">
                    <PageHeader
                        title="Transactions"
                        buttons={[
                            {
                                onClick: () => setIsCreateModalOpen(true),
                                label: '+ New Transaction',
                            },
                        ]}
                    />
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl p-4 pt-0">
                <div className="mx-auto flex w-full max-w-5xl gap-6">
                    {/* Left: Sticky Account Details, Settings, Analytics */}
                    <div className="w-full max-w-xs flex-shrink-0">
                        <div className="sticky top-8">
                            <div className="bg-card mb-6 w-full rounded-xl border-1 p-6 shadow-xs">
                                <h3 className="mb-4 text-lg font-semibold">Filters</h3>
                                <SmartForm
                                    schema={filterSchema}
                                    defaultValues={defaultFilterValues}
                                    onSubmit={(values) => {
                                        // Update the filter values
                                        Object.assign(defaultFilterValues, values);
                                    }}
                                    formProps={{ className: 'space-y-4' }}
                                >
                                    {() => (
                                        <>
                                            <TextInput<FilterValues> name="search" placeholder="Search..." />

                                            <SelectInput<FilterValues>
                                                name="account"
                                                label="Account"
                                                options={[
                                                    { value: 'all', label: 'All Accounts' },
                                                    //                                                    ...accounts
                                                ]}
                                            />

                                            <div className="flex gap-2">
                                                <TextInput<FilterValues> name="amountMin" label="Min Amount" type="number" placeholder="Min €" />
                                                <TextInput<FilterValues> name="amountMax" label="Max Amount" type="number" placeholder="Max €" />
                                            </div>

                                            <div className="flex gap-2">
                                                <TextInput<FilterValues> name="dateFrom" label="From Date" type="date" />
                                                <TextInput<FilterValues> name="dateTo" label="To Date" type="date" />
                                            </div>
                                        </>
                                    )}
                                </SmartForm>
                            </div>

                            {/* Analytics/Graphs Placeholder */}
                            <div className="bg-card mb-6 w-full rounded-xl border-1 p-6 shadow-xs">
                                <h3 className="mb-4 text-lg font-semibold">Category spending</h3>
                                <div className="flex h-32 items-center justify-center text-current">
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
