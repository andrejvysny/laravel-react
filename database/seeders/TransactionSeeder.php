<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Transaction;
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
            // Create some income transactions
            for ($i = 0; $i < 5; $i++) {
                Transaction::create([
                    'account_id' => $account->id,
                    'transaction_id' => 'TRX_' . strtoupper(substr(md5(rand()), 0, 8)),
                    'description' => 'Salary Payment ' . ($i + 1),
                    'amount' => rand(2000, 5000),
                    'currency' => $account->currency,
                    'booked_date' => now()->subDays(rand(1, 30)),
                    'processed_date' => now()->subDays(rand(1, 30)),
                    'type' => Transaction::TYPE_DEPOSIT,
                    'target_iban' => $account->iban,
                    'source_iban' => 'DE89370400440532013000',
                    'partner' => 'Employer Corp',
                    'metadata' => json_encode([
                        'source' => 'employer',
                        'reference' => 'SAL' . strtoupper(substr(md5(rand()), 0, 6))
                    ]),
                    'balance_after_transaction' => rand(5000, 10000)
                ]);
            }

            // Create some expense transactions
            $expenseTypes = [
                Transaction::TYPE_CARD_PAYMENT,
                Transaction::TYPE_TRANSFER,
                Transaction::TYPE_WITHDRAWAL
            ];
            
            for ($i = 0; $i < 15; $i++) {
                $type = $expenseTypes[array_rand($expenseTypes)];
                $amount = -rand(10, 200);
                
                Transaction::create([
                    'account_id' => $account->id,
                    'transaction_id' => 'TRX_' . strtoupper(substr(md5(rand()), 0, 8)),
                    'description' => 'Payment for ' . ucfirst($type),
                    'amount' => $amount,
                    'currency' => $account->currency,
                    'booked_date' => now()->subDays(rand(1, 30)),
                    'processed_date' => now()->subDays(rand(1, 30)),
                    'type' => $type,
                    'target_iban' => 'DE89370400440532013000',
                    'source_iban' => $account->iban,
                    'partner' => 'Test Merchant ' . rand(1, 100),
                    'metadata' => json_encode([
                        'merchant' => 'Test Merchant ' . rand(1, 100),
                        'location' => 'Test Location'
                    ]),
                    'balance_after_transaction' => rand(1000, 5000)
                ]);
            }
        }
    }
}
