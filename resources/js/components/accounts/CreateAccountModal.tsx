import { Currency } from '@/types/index';
import { useState } from 'react';

interface CreateAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; account_id: string; bank_name: string; iban: string; currency: Currency; balance: number }) => void;
}

export default function CreateAccountModal({ isOpen, onClose, onSubmit }: CreateAccountModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        account_id: '',
        bank_name: '',
        iban: '',
        type: 'Default',
        currency: Currency.EUR,
        balance: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-md rounded-lg bg-gray-800 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Create New Account</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Account Name</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Account ID</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.account_id}
                            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                        />
                    </div>

                    <div>   
                        <label className="mb-1 block text-sm font-medium text-gray-300">Account Type</label>
                        <select
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Default">Default</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Bank Name</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.bank_name}
                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">IBAN</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.iban}
                            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Currency</label>
                        <select
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                        >
                            {Object.values(Currency).map((currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Initial Balance</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.balance}
                            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
