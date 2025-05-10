import { Transaction } from '@/types/index';
import { useState } from 'react';

interface CreateTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'account'>) => void;
}

export default function CreateTransactionModal({ isOpen, onClose, onSubmit }: CreateTransactionModalProps) {
    const [formData, setFormData] = useState({
        transaction_id: `TRX-${Date.now()}`,
        amount: '',
        currency: 'EUR',
        booked_date: new Date().toISOString(),
        processed_date: new Date().toISOString(),
        description: '',
        target_iban: null as string | null,
        source_iban: null as string | null,
        partner: '',
        type: 'PAYMENT',
        metadata: null,
        balance_after_transaction: 0,
        account_id: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount),
            balance_after_transaction: parseFloat(formData.amount),
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-md rounded-xl bg-gray-900 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">New Transaction</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">Partner</label>
                        <input
                            type="text"
                            value={formData.partner}
                            onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                            required
                        >
                            <option value="TRANSFER">Transfer</option>
                            <option value="DEPOSIT">Deposit</option>
                            <option value="WITHDRAWAL">Withdrawal</option>
                            <option value="PAYMENT">Payment</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">Target IBAN</label>
                        <input
                            type="text"
                            value={formData.target_iban || ''}
                            onChange={(e) => setFormData({ ...formData, target_iban: e.target.value || null })}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">Source IBAN</label>
                        <input
                            type="text"
                            value={formData.source_iban || ''}
                            onChange={(e) => setFormData({ ...formData, source_iban: e.target.value || null })}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-gray-600 focus:outline-none"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
                            Cancel
                        </button>
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            Create Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
