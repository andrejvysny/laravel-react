<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('account')
            ->orderBy('booked_date', 'desc')
            ->get();

        // Calculate monthly summaries
        $monthlySummaries = [];
        foreach ($transactions as $transaction) {
            $month = \Carbon\Carbon::parse($transaction->booked_date)->translatedFormat('F Y');
            if (! isset($monthlySummaries[$month])) {
                $monthlySummaries[$month] = [
                    'income' => 0,
                    'expense' => 0,
                    'balance' => 0,
                ];
            }
            if ($transaction->amount > 0) {
                $monthlySummaries[$month]['income'] += $transaction->amount;
            } else {
                $monthlySummaries[$month]['expense'] += abs($transaction->amount);
            }
            $monthlySummaries[$month]['balance'] += $transaction->amount;
        }

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'monthlySummaries' => $monthlySummaries,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'transaction_id' => 'required|string|max:255',
                'amount' => 'required|numeric',
                'currency' => 'required|string|max:3',
                'booked_date' => 'required|date',
                'processed_date' => 'required|date',
                'description' => 'required|string|max:255',
                'target_iban' => 'nullable|string|max:255',
                'source_iban' => 'nullable|string|max:255',
                'partner' => 'required|string|max:255',
                'type' => 'required|string|in:TRANSFER,DEPOSIT,WITHDRAWAL,PAYMENT',
                'metadata' => 'nullable|array',
                'balance_after_transaction' => 'required|numeric',
                'account_id' => 'required|exists:accounts,id',
            ]);

            $transaction = Transaction::create($validated);

            return redirect()->back()->with('success', 'Transaction created successfully');
        } catch (\Exception $e) {
            \Log::error('Transaction creation failed: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to create transaction: '.$e->getMessage());
        }
    }
}
