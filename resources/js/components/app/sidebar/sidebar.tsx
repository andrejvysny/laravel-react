import { BanknotesIcon, Cog6ToothIcon, CreditCardIcon, HomeIcon, TagIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Accounts', href: '/accounts', icon: CreditCardIcon },
    { name: 'Rules', href: '/transaction-rules', icon: TagIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
    return (
        <div className="flex h-full flex-col bg-gray-900">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                    <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" alt="Workflow" />
                </div>
                <nav className="mt-5 flex-1 space-y-1 px-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300" aria-hidden="true" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
