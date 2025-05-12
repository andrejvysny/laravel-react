import { Transaction as TransactionType } from '@/types/index';
import { formatDate } from '@/utils/date';
import { useState } from 'react';
import TransactionDetails from './TransactionDetails';

export default function Transaction(transaction: TransactionType) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col">
            <div
                className="mx-auto w-full max-w-xl  rounded-xl bg-card border-1 shadow-xs hover:border-black p-2 transition-colors"
            >

                <div className="flex items-center gap-4  w-full cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>

                    <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-orange-700 p-3`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-8 w-8 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">{transaction.partner} </div>
                        <small className="text-gray-500">{formatDate(transaction.processed_date)}</small>
                        <div className="mt-1 flex gap-2">
                            {transaction.account && (
                                <span className="rounded-full bg-background border-1 border-black px-2 py-1 text-xs text-base">{transaction.account?.name}</span>
                            )}

                            <span className="rounded-full bg-background border-1 border-black px-2 py-1 text-xs text-base">{transaction.type}</span>
                        </div>
                    </div>
                    {transaction.amount < 0 ? (
                        <div className="text-lg text-destructive font-semibold">
                            ▼ {Number(transaction.amount).toFixed(2)} {transaction.currency}
                        </div>
                    ) : (
                        <div className="text-lg text-green-500 font-semibold">
                            ▲ {Number(transaction.amount).toFixed(2)} {transaction.currency}
                        </div>
                    )}
                </div>




                {isExpanded && <TransactionDetails transaction={transaction} />}
            </div>

        </div>
    );
}
