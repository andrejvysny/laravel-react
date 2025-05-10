import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import CreateAccountModal from '@/components/accounts/CreateAccountModal';
import { Account } from '@/types/index';
import { router, Link, Head } from '@inertiajs/react';
import GoCardlessImportWizard from '@/components/accounts/GoCardlessImportWizard';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Props {
    accounts: Account[];
}

export default function Index({ accounts }: Props) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

    const handleCreateAccount = (data: any) => {
        router.post('/accounts', data, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Accounts', href: '/accounts' }]}>
            <Head title="Your accounts" />
            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-white">Your accounts</h1>

                        <div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="rounded-md mr-3 bg-white px-3 py-1 text-black cursor-pointer"
                            >
                                + New Account
                            </button>
                            <button
                                onClick={() => setIsImportWizardOpen(true)}
                                className="rounded-md mr-3 bg-white px-3 py-1 text-black cursor-pointer"
                            >
                                Import Account
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <Link
                                key={account.id}
                                href={`/accounts/${account.id}`}
                                className="block cursor-pointer rounded-lg bg-gray-900 p-6 transition-colors hover:bg-gray-700"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-white">{account.name}</h3>
                                        <p className="text-sm text-gray-400">{account.bank_name}</p>
                                    </div>
                                    <span className="text-sm text-gray-400">{account.currency}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">IBAN</span>
                                        <span className="text-white">{account.iban}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Balance</span>
                                        <span className="text-white">
                                            {Number(account.balance).toFixed(2)} {account.currency}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <CreateAccountModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateAccount} />

            <GoCardlessImportWizard
                isOpen={isImportWizardOpen}
                onClose={() => setIsImportWizardOpen(false)}
                onSuccess={() => {
                    setIsImportWizardOpen(false);
                    window.location.reload();
                }}
            />
        </AppLayout>
    );
}
