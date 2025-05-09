import { Link } from '@inertiajs/react';
import { HomeIcon, BanknotesIcon, CreditCardIcon, Cog6ToothIcon, TagIcon } from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Accounts', href: '/accounts', icon: CreditCardIcon },
    { name: 'Rules', href: '/transaction-rules', icon: TagIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
    return (
        <div className="flex flex-col h-full bg-gray-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                    <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                        alt="Workflow"
                    />
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            <item.icon
                                className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300"
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
} 