<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::where('user_id', auth()->id())->get();

        return Inertia::render('accounts', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request)
    {
        try {
            if (!auth()->id()) {
                throw new \Exception('User not authenticated');
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'bank_name' => 'nullable|string|max:255',
                'iban' => 'nullable|string|max:255',
                'type' => 'required|string|max:255',
                'currency' => 'required|string|max:3',
                'balance' => 'required|numeric',
                'is_gocardless_synced' => 'boolean',
                'gocardless_account_id' => 'nullable|string|max:255',
            ]);

            $account = Account::create([
                'name' => $validated['name'],
                'bank_name' => $validated['bank_name'] ?? null,
                'iban' => $validated['iban'] ?? null,
                'type' => $validated['type'],
                'currency' => $validated['currency'],
                'balance' => $validated['balance'],
                'is_gocardless_synced' => $validated['is_gocardless_synced'] ?? false,
                'gocardless_account_id' => $validated['gocardless_account_id'] ?? null,
                'user_id' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'Account created successfully');

        } catch (\Exception $e) {
            \Log::error('Account creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create account: ' . $e->getMessage());
        }
    }

    public function show($id)
    {

        $account = Account::all()->find($id);

        if (!$account) {
            return redirect()->route('accounts.index')->with('error', 'Account not found');
        }

        // Get the transactions for this account
        $transactions = $account->transactions()->get();


        // Calculate monthly summaries for this account
        $monthlySummaries = [];


        return Inertia::render('account-detail', [
            'account' => $account,
            'transactions' => $transactions,
            'monthlySummaries' => $monthlySummaries,
        ]);
    }

}
