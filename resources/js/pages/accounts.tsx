import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import CreateAccountModal from '@/components/CreateAccountModal';
import { Account } from '@/types';
import { router, Link } from '@inertiajs/react';

interface Props {
    accounts: Account[];
}

export default function Accounts({ accounts }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateAccount = (data: any) => {
        router.post('/accounts', data, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounts', href: '/accounts' },
            ]}
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-white">Accounts</h1>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            + New Account
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map((account) => (
                            <Link
                                key={account.id}
                                href={`/accounts/${account.id}`}
                                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer block"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-white">{account.name}</h3>
                                        <p className="text-sm text-gray-400">{account.bank_name}</p>
                                    </div>
                                    <span className="text-sm text-gray-400">{account.currency}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Account ID</span>
                                        <span className="text-white">{account.account_id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">IBAN</span>
                                        <span className="text-white">{account.iban}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Balance</span>
                                        <span className="text-white">{Number(account.balance).toFixed(2)} {account.currency}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <CreateAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateAccount}
            />
        </AppLayout>
    );
} 