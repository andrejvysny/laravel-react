<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Enums\Currency;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        $accounts = [
            [
                'name' => 'Main Account',
                'iban' => 'SK0987654321',
                'currency' => 'EUR',
                'balance' => 5000.00,
                'user_id' => $user->id,
                'account_id' => 'ACC001',
                'bank_name' => 'Bank A',
            ],
            [
                'name' => 'Savings Account',
                'iban' => 'SK1234567890',
                'currency' => 'EUR',
                'balance' => 10000.00,
                'user_id' => $user->id,
                'account_id' => 'ACC002',
                'bank_name' => 'Bank B',
            ],
        ];

        foreach ($accounts as $data) {
            Account::create($data);
        }
    }
} 