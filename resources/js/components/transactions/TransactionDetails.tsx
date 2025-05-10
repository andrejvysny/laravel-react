import { Transaction } from '@/types/index';
import {formatDate} from '@/utils/date';

interface Props {
    transaction: Transaction;
}

export default function TransactionDetails({ transaction }: Props) {


    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {Number(transaction.amount).toFixed(2)} {transaction.currency}
                    </p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Type</p>
                    <p className="text-gray-300">{transaction.type}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-gray-300">{transaction.description}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Transaction ID</p>
                    <p className="text-gray-300">{transaction.transaction_id}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Booked Date</p>
                    <p className="text-gray-300">{formatDate(transaction.booked_date)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Processed Date</p>
                    <p className="text-gray-300">{formatDate(transaction.processed_date)}</p>
                </div>
                {transaction.target_iban && (
                    <div>
                        <p className="text-gray-400 text-sm">Target IBAN</p>
                        <p className="text-gray-300">{transaction.target_iban}</p>
                    </div>
                )}
                {transaction.source_iban && (
                    <div>
                        <p className="text-gray-400 text-sm">Source IBAN</p>
                        <p className="text-gray-300">{transaction.source_iban}</p>
                    </div>
                )}
                <div>
                    <p className="text-gray-400 text-sm">Balance After</p>
                    <p className="text-gray-300">{Number(transaction.balance_after_transaction).toFixed(2)} {transaction.currency}</p>
                </div>
            </div>

            {transaction.metadata && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-gray-400 text-sm mb-2">Additional Information</h4>
                    <div className="bg-gray-900 rounded-lg p-3">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(transaction.metadata, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
