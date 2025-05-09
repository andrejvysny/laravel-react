<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = Account::all();

        foreach ($accounts as $account) {
            // Create transactions for current month (multiple transactions)
            Transaction::factory()->count(8)->create([
                'booked_date' => now()->startOfMonth()->addDays(rand(1, 15)),
                'processed_date' => now()->startOfMonth()->addDays(rand(1, 15)),
                'account_id' => $account->id,
            ]);

            // Create transactions for last month (fewer transactions)
            Transaction::factory()->count(3)->create([
                'booked_date' => now()->subMonth()->startOfMonth()->addDays(rand(1, 20)),
                'processed_date' => now()->subMonth()->startOfMonth()->addDays(rand(1, 20)),
                'account_id' => $account->id,
            ]);

            // Create transactions for two months ago (single transaction)
            Transaction::factory()->create([
                'booked_date' => now()->subMonths(2)->startOfMonth()->addDays(rand(1, 25)),
                'processed_date' => now()->subMonths(2)->startOfMonth()->addDays(rand(1, 25)),
                'account_id' => $account->id,
            ]);

            // Create some random transactions across the last 3 months
            Transaction::factory()->count(5)->create([
                'account_id' => $account->id,
            ]);
        }
    }
}
