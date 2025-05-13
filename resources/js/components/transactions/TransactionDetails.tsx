import { Transaction } from '@/types/index';
import { formatDate } from '@/utils/date';

interface Props {
    transaction: Transaction;
}

export default function TransactionDetails({ transaction }: Props) {
    return (
        <div className="bg-background mt-2 rounded-lg p-4 text-base">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-muted-foreground text-sm">Amount</p>
                    <p className={`font-medium ${transaction.amount < 0 ? 'text-destructive-foreground' : 'text-green-500'}`}>
                        {Number(transaction.amount).toFixed(2)} {transaction.currency}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Type</p>
                    <p>{transaction.type}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Description</p>
                    <p>{transaction.description}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Transaction ID</p>
                    <p>{transaction.transaction_id}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Booked Date</p>
                    <p>{formatDate(transaction.booked_date)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Processed Date</p>
                    <p>{formatDate(transaction.processed_date)}</p>
                </div>
                {transaction.target_iban && (
                    <div>
                        <p className="text-muted-foreground text-sm">Target IBAN</p>
                        <p>{transaction.target_iban}</p>
                    </div>
                )}
                {transaction.source_iban && (
                    <div>
                        <p className="text-muted-foreground text-sm">Source IBAN</p>
                        <p>{transaction.source_iban}</p>
                    </div>
                )}
                <div>
                    <p className="text-muted-foreground text-sm">Balance After</p>
                    <p>
                        {Number(transaction.balance_after_transaction).toFixed(2)} {transaction.currency}
                    </p>
                </div>
            </div>

            {transaction.metadata && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <h4 className="text-muted-foreground mb-2 text-sm">Additional Information</h4>
                    <div className="rounded-lg bg-gray-900 p-3">
                        <pre className="text-sm whitespace-pre-wrap text-gray-300">{JSON.stringify(transaction.metadata, null, 2)}</pre>
                    </div>
                </div>
            )}
            {transaction.import_data && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <h4 className="text-muted-foreground mb-2 text-sm">Original Imported Data</h4>
                    <div className="rounded-lg bg-gray-900 p-3">
                        <pre className="text-sm whitespace-pre-wrap text-gray-300">
                            {(() => {
                                try {
                                    // Try to parse if it's a JSON string, otherwise just show as string
                                    const parsed =
                                        typeof transaction.import_data === 'string' ? JSON.parse(transaction.import_data) : transaction.import_data;
                                    return JSON.stringify(parsed, null, 2);
                                } catch {
                                    return String(transaction.import_data);
                                }
                            })()}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
