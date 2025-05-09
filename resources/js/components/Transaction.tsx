import { useState } from 'react';
import { TransactionType } from '@/types';
import TransactionDetails from './TransactionDetails';

export default function Transaction(transaction: TransactionType) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getTransactionIcon = () => {
        switch (transaction.type) {
            case 'TRANSFER':
                return '↔️';
            case 'DEPOSIT':
                return '⬇️';
            case 'WITHDRAWAL':
                return '⬆️';
            case 'PAYMENT':
                return '💳';
            default:
                return '💰';
        }
    };

    const getTransactionColor = () => {
        switch (transaction.type) {
            case 'TRANSFER':
                return 'bg-blue-600';
            case 'DEPOSIT':
                return 'bg-green-600';
            case 'WITHDRAWAL':
                return 'bg-red-600';
            case 'PAYMENT':
                return 'bg-purple-600';
            default:
                return 'bg-gray-600';
        }
    };

    return (
        <div className="flex flex-col">
            <div 
                className="flex max-w-xl mx-auto w-full items-center gap-4 bg-gray-900 p-2 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`${getTransactionColor()} rounded-full p-3 w-12 h-12 flex items-center justify-center`}>
                    {getTransactionIcon()}
                </div>
                <div className="flex-1">
                    <div className="font-medium">{transaction.partner}</div>
                    <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{transaction.type}</span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{transaction.account?.name}</span>
                    </div>
                </div>
                {transaction.amount < 0 ? (
                    <div className="text-gray-300 text-red-500 text-lg">▼ {Number(transaction.amount).toFixed(2)} {transaction.currency}</div>
                ) : (
                    <div className="text-gray-300 text-green-500 text-lg">▲ {Number(transaction.amount).toFixed(2)} {transaction.currency}</div>
                )}
            </div>
            {isExpanded && <TransactionDetails transaction={transaction} />}
        </div>
    );
} 