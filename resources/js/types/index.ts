export enum Currency {
    EUR = 'EUR',
    USD = 'USD',
    GBP = 'GBP',
    CZK = 'CZK',
}

export interface Account {
    id: number;
    name: string;
    account_id: string;
    bank_name: string;
    iban: string;
    currency: Currency;
    balance: number;
    created_at: string;
    updated_at: string;
}

export interface TransactionType {
    id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    booked_date: string;
    processed_date: string;
    description: string;
    target_iban: string | null;
    source_iban: string | null;
    partner: string;
    type: string;
    metadata: Record<string, any> | null;
    balance_after_transaction: number;
    account_id: number;
    account?: Account;
    created_at: string;
    updated_at: string;
} 