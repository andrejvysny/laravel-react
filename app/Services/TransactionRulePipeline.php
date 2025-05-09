<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionRule;
use Illuminate\Pipeline\Pipeline;

class TransactionRulePipeline
{
    private int $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public function process(Transaction $transaction): Transaction
    {
        $rules = TransactionRule::where('user_id', $this->userId)
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function (TransactionRule $rule) {
                return $this->createRuleInstance($rule);
            })
            ->toArray();

        return app(Pipeline::class)
            ->send($transaction)
            ->through($rules)
            ->then(function (Transaction $transaction) {
                return $transaction;
            });
    }

    private function createRuleInstance(TransactionRule $rule)
    {
        return new class($rule) {
            private TransactionRule $rule;

            public function __construct(TransactionRule $rule)
            {
                $this->rule = $rule;
            }

            public function __invoke(Transaction $transaction): Transaction
            {
                if ($this->matchesCondition($transaction)) {
                    $this->applyAction($transaction);
                }

                return $transaction;
            }

            private function matchesCondition(Transaction $transaction): bool
            {
                return match ($this->rule->condition_type) {
                    'amount' => $this->matchesAmount($transaction),
                    'iban' => $this->matchesIban($transaction),
                    'description' => $this->matchesDescription($transaction),
                    default => false,
                };
            }

            private function matchesAmount(Transaction $transaction): bool
            {
                $amount = (float) $transaction->amount;
                $value = (float) $this->rule->condition_value;

                return match ($this->rule->condition_operator) {
                    'greater_than' => $amount > $value,
                    'less_than' => $amount < $value,
                    'equals' => $amount === $value,
                    default => false,
                };
            }

            private function matchesIban(Transaction $transaction): bool
            {
                return match ($this->rule->condition_operator) {
                    'contains' => str_contains($transaction->iban, $this->rule->condition_value),
                    'equals' => $transaction->iban === $this->rule->condition_value,
                    default => false,
                };
            }

            private function matchesDescription(Transaction $transaction): bool
            {
                return match ($this->rule->condition_operator) {
                    'contains' => str_contains(strtolower($transaction->description), strtolower($this->rule->condition_value)),
                    'equals' => strtolower($transaction->description) === strtolower($this->rule->condition_value),
                    default => false,
                };
            }

            private function applyAction(Transaction $transaction): void
            {
                match ($this->rule->action_type) {
                    'add_tag' => $transaction->tags()->attach($this->rule->action_value),
                    'set_category' => $transaction->category = $this->rule->action_value,
                    'set_type' => $transaction->type = $this->rule->action_value,
                    default => null,
                };
            }
        };
    }
} 