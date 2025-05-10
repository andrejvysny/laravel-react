import { Transaction } from '@/types/index';
import { formatDate } from '@/utils/date';

interface Props {
    transaction: Transaction;
}

export default function TransactionDetails({ transaction }: Props) {
    return (
        <div className="rounded-xl bg-gray-800 p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {Number(transaction.amount).toFixed(2)} {transaction.currency}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="text-gray-300">{transaction.type}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-gray-300">{transaction.description}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Transaction ID</p>
                    <p className="text-gray-300">{transaction.transaction_id}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Booked Date</p>
                    <p className="text-gray-300">{formatDate(transaction.booked_date)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Processed Date</p>
                    <p className="text-gray-300">{formatDate(transaction.processed_date)}</p>
                </div>
                {transaction.target_iban && (
                    <div>
                        <p className="text-sm text-gray-400">Target IBAN</p>
                        <p className="text-gray-300">{transaction.target_iban}</p>
                    </div>
                )}
                {transaction.source_iban && (
                    <div>
                        <p className="text-sm text-gray-400">Source IBAN</p>
                        <p className="text-gray-300">{transaction.source_iban}</p>
                    </div>
                )}
                <div>
                    <p className="text-sm text-gray-400">Balance After</p>
                    <p className="text-gray-300">
                        {Number(transaction.balance_after_transaction).toFixed(2)} {transaction.currency}
                    </p>
                </div>
            </div>

            {transaction.metadata && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <h4 className="mb-2 text-sm text-gray-400">Additional Information</h4>
                    <div className="rounded-lg bg-gray-900 p-3">
                        <pre className="text-sm whitespace-pre-wrap text-gray-300">{JSON.stringify(transaction.metadata, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
