export enum Currency {
    EUR = 'EUR',
    USD = 'USD',
    GBP = 'GBP',
    CZK = 'CZK',
}

export interface Account {
    id: number;
    user_id: number;
    name: string;
    bank_name: string | null;
    iban: string | null;
    type: string;
    currency: string;
    balance: number;
    gocardless_account_id: string | null;
    is_gocardless_synced: boolean;
    gocardless_last_synced_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
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
    import_data: Record<string, any> | null;
    balance_after_transaction: number;
    account_id: number;
    account?: Account;
    category?: Category;
    created_at: string;
    updated_at: string;
}

export interface TransactionRule {
    id: number;
    user_id: number;
    name: string;
    condition_type: 'amount' | 'iban' | 'description';
    condition_operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    condition_value: string;
    action_type: 'add_tag' | 'set_category' | 'set_type';
    action_value: string;
    is_active: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbItem {
    href: string;
    title: string;
}

export interface Import {
    id: number;
    user_id: number;
    filename: string;
    original_filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_rows: number;
    processed_rows: number;
    failed_rows: number;
    column_mapping: Record<string, number | null>;
    date_format: string;
    amount_format: string;
    amount_type_strategy: string;
    currency: string;
    metadata: {
        headers?: string[];
        sample_rows?: string[][];
    };
    processed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    user_id: number;
    color?: string;
    icon?: string;
    created_at: string;
    updated_at: string;
}

export interface ImportMapping {
    id: number;
    user_id: number;
    name: string;
    bank_name: string | null;
    column_mapping: Record<string, number | null>;
    date_format: string;
    amount_format: string;
    amount_type_strategy: string;
    currency: string;
    last_used_at: string | null;
    created_at: string;
    updated_at: string;
}
