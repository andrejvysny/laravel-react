<?php

namespace Database\Seeders;

use App\Models\TransactionRule;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionRuleSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            // Create some common transaction rules
            $rules = [
                [
                    'name' => 'Salary Rule',
                    'trigger_type' => 'on_create',
                    'condition_type' => 'description',
                    'condition_operator' => 'contains',
                    'condition_value' => 'Salary',
                    'action_type' => 'set_type',
                    'action_value' => 'DEPOSIT',
                    'is_active' => true,
                    'order' => 1,
                ],
                [
                    'name' => 'Groceries Rule',
                    'trigger_type' => 'on_create',
                    'condition_type' => 'description',
                    'condition_operator' => 'contains',
                    'condition_value' => 'GROCERIES',
                    'action_type' => 'set_type',
                    'action_value' => 'CARD_PAYMENT',
                    'is_active' => true,
                    'order' => 2,
                ],
                [
                    'name' => 'Large Transfer Rule',
                    'trigger_type' => 'on_create',
                    'condition_type' => 'amount',
                    'condition_operator' => 'greater_than',
                    'condition_value' => '1000',
                    'action_type' => 'set_type',
                    'action_value' => 'TRANSFER',
                    'is_active' => true,
                    'order' => 3,
                ],
                [
                    'name' => 'ATM Withdrawal Rule',
                    'trigger_type' => 'on_create',
                    'condition_type' => 'description',
                    'condition_operator' => 'contains',
                    'condition_value' => 'ATM',
                    'action_type' => 'set_type',
                    'action_value' => 'WITHDRAWAL',
                    'is_active' => true,
                    'order' => 4,
                ],
            ];

            foreach ($rules as $rule) {
                TransactionRule::create([
                    'user_id' => $user->id,
                    'name' => $rule['name'],
                    'trigger_type' => $rule['trigger_type'],
                    'condition_type' => $rule['condition_type'],
                    'condition_operator' => $rule['condition_operator'],
                    'condition_value' => $rule['condition_value'],
                    'action_type' => $rule['action_type'],
                    'action_value' => $rule['action_value'],
                    'is_active' => $rule['is_active'],
                    'order' => $rule['order'],
                ]);
            }
        }
    }
}
