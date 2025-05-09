import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { TransactionRule } from '@/types';

const breadcrumbs = [
    { title: 'Transaction Rules', href: '/transaction-rules' },
];

const conditionTypes = [
    { value: 'amount', label: 'Amount' },
    { value: 'iban', label: 'IBAN' },
    { value: 'description', label: 'Description' },
];

const conditionOperators = {
    amount: [
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'equals', label: 'Equals' },
    ],
    iban: [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Equals' },
    ],
    description: [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Equals' },
    ],
};

const actionTypes = [
    { value: 'add_tag', label: 'Add Tag' },
    { value: 'set_category', label: 'Set Category' },
    { value: 'set_type', label: 'Set Type' },
];

export default function Index({ rules }: { rules: TransactionRule[] }) {
    const [editingRule, setEditingRule] = useState<TransactionRule | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        condition_type: 'amount',
        condition_operator: 'greater_than',
        condition_value: '',
        action_type: 'add_tag',
        action_value: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRule) {
            put(`/transaction-rules/${editingRule.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingRule(null);
                },
            });
        } else {
            post('/transaction-rules', {
                onSuccess: () => reset(),
            });
        }
    };

    const startEdit = (rule: TransactionRule) => {
        setEditingRule(rule);
        setData({
            name: rule.name,
            condition_type: rule.condition_type,
            condition_operator: rule.condition_operator,
            condition_value: rule.condition_value,
            action_type: rule.action_type,
            action_value: rule.action_value,
            is_active: rule.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingRule(null);
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Rules" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Create/Edit Form */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingRule ? 'Edit Rule' : 'Create New Rule'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Condition Type</label>
                                <select
                                    value={data.condition_type}
                                    onChange={e => {
                                        setData('condition_type', e.target.value);
                                        setData('condition_operator', conditionOperators[e.target.value as keyof typeof conditionOperators][0].value);
                                    }}
                                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                                >
                                    {conditionTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Operator</label>
                                <select
                                    value={data.condition_operator}
                                    onChange={e => setData('condition_operator', e.target.value)}
                                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                                >
                                    {conditionOperators[data.condition_type as keyof typeof conditionOperators].map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Value</label>
                                <input
                                    type="text"
                                    value={data.condition_value}
                                    onChange={e => setData('condition_value', e.target.value)}
                                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Action Type</label>
                                <select
                                    value={data.action_type}
                                    onChange={e => setData('action_type', e.target.value)}
                                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                                >
                                    {actionTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Action Value</label>
                                <input
                                    type="text"
                                    value={data.action_value}
                                    onChange={e => setData('action_value', e.target.value)}
                                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded bg-gray-800 border-gray-700 text-green-500"
                            />
                            <label className="ml-2 text-sm text-gray-400">Active</label>
                        </div>

                        <div className="flex justify-end space-x-4">
                            {editingRule && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
                            >
                                {editingRule ? 'Update Rule' : 'Create Rule'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Rules List */}
                <div className="bg-gray-900 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Your Rules</h2>
                    <div className="space-y-4">
                        {rules.map(rule => (
                            <div key={rule.id} className="bg-gray-800 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium">{rule.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            If {rule.condition_type} {rule.condition_operator} {rule.condition_value}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Then {rule.action_type} {rule.action_value}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => startEdit(rule)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this rule?')) {
                                                    // Add delete functionality
                                                }
                                            }}
                                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${rule.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                        {rule.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 