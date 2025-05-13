<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with([
            'account',
            'merchant',
            'category',
            'tags',
        ])
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

        // Get categories, merchants, and tags for the filter dropdowns
        $categories = Auth::user()->categories;
        $merchants = Auth::user()->merchants;
        $tags = Auth::user()->tags;

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'monthlySummaries' => $monthlySummaries,
            'categories' => $categories,
            'merchants' => $merchants,
            'tags' => $tags,
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
                'merchant_id' => 'nullable|exists:merchants,id',
                'category_id' => 'nullable|exists:categories,id',
                'tags' => 'nullable|array',
                'tags.*' => 'exists:tags,id',
            ]);

            $tagIds = $validated['tags'] ?? [];
            unset($validated['tags']);

            $transaction = Transaction::create($validated);

            if (! empty($tagIds)) {
                $transaction->tags()->attach($tagIds);
            }

            return redirect()->back()->with('success', 'Transaction created successfully');
        } catch (\Exception $e) {
            \Log::error('Transaction creation failed: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to create transaction: '.$e->getMessage());
        }
    }

    public function update(Request $request, Transaction $transaction)
    {
        try {
            $validated = $request->validate([
                'merchant_id' => 'nullable|exists:merchants,id',
                'category_id' => 'nullable|exists:categories,id',
                'tags' => 'nullable|array',
                'tags.*' => 'exists:tags,id',
            ]);

            $tagIds = $validated['tags'] ?? [];
            unset($validated['tags']);

            $transaction->update($validated);

            if (isset($request->tags)) {
                $transaction->tags()->sync($tagIds);
            }

            return redirect()->back()->with('success', 'Transaction updated successfully');
        } catch (\Exception $e) {
            \Log::error('Transaction update failed: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to update transaction: '.$e->getMessage());
        }
    }
}
