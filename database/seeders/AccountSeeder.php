<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'demo@example.com')->first();

        $accounts = [
            [
                'name' => 'Main Checking',
                'bank_name' => 'Demo Bank',
                'iban' => 'DE89370400440532013000',
                'type' => 'checking',
                'currency' => 'USD',
                'balance' => 5000.00,
                'is_gocardless_synced' => false,
            ],
            [
                'name' => 'Savings',
                'bank_name' => 'Demo Bank',
                'iban' => 'DE89370400440532013001',
                'type' => 'savings',
                'currency' => 'USD',
                'balance' => 15000.00,
                'is_gocardless_synced' => false,
            ],
            [
                'name' => 'Credit Card',
                'bank_name' => 'Demo Bank',
                'iban' => 'DE89370400440532013002',
                'type' => 'credit',
                'currency' => 'USD',
                'balance' => -2500.00,
                'is_gocardless_synced' => false,
            ],
            [
                'name' => 'Investment',
                'bank_name' => 'Demo Bank',
                'iban' => 'DE89370400440532013003',
                'type' => 'investment',
                'currency' => 'USD',
                'balance' => 25000.00,
                'is_gocardless_synced' => false,
            ],
        ];

        foreach ($accounts as $account) {
            Account::create([
                'name' => $account['name'],
                'bank_name' => $account['bank_name'],
                'iban' => $account['iban'],
                'type' => $account['type'],
                'currency' => $account['currency'],
                'balance' => $account['balance'],
                'is_gocardless_synced' => $account['is_gocardless_synced'],
                'user_id' => $user->id,
            ]);
        }
    }
} 