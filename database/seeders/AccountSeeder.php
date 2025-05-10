<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            // Create a checking account
            Account::create([
                'user_id' => $user->id,
                'name' => 'Main Checking Account',
                'bank_name' => 'Deutsche Bank',
                'iban' => 'DE89370400440532013000',
                'type' => 'checking',
                'currency' => 'EUR',
                'balance' => 5000.00,
                'is_gocardless_synced' => true,
                'gocardless_account_id' => 'ACC_'.strtoupper(substr(md5(rand()), 0, 8)),
                'gocardless_last_synced_at' => now(),
            ]);

            // Create a savings account
            Account::create([
                'user_id' => $user->id,
                'name' => 'Savings Account',
                'bank_name' => 'N26',
                'iban' => 'DE89370400440532013001',
                'type' => 'savings',
                'currency' => 'EUR',
                'balance' => 10000.00,
                'is_gocardless_synced' => false,
                'gocardless_account_id' => null,
                'gocardless_last_synced_at' => null,
            ]);

            // Create a credit card account
            Account::create([
                'user_id' => $user->id,
                'name' => 'Credit Card',
                'bank_name' => 'Barclays',
                'iban' => 'GB29NWBK60161331926819',
                'type' => 'credit',
                'currency' => 'GBP',
                'balance' => -500.00,
                'is_gocardless_synced' => true,
                'gocardless_account_id' => 'ACC_'.strtoupper(substr(md5(rand()), 0, 8)),
                'gocardless_last_synced_at' => now()->subDays(2),
            ]);
        }
    }
}
