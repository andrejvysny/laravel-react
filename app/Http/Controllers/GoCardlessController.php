<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoCardlessController extends Controller
{
    private $baseUrl = 'https://bankaccountdata.gocardless.com/api/v2';

    public function getInstitutions(Request $request)
    {

        $request->validate([
            'country' => 'required|string|size:2'
        ]);

        Log::info('Importing account', ['country' => $request->country]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.gocardless.access_token'),
                'accept' => 'application/json'
            ])->get("{$this->baseUrl}/institutions/", [
                'country' => $request->country
            ]);

            if (!$response->successful()) {
                Log::error('GoCardless API error', [
                    'status' => $response->status(),
                    'body' => json_encode($response->body())
                ]);
                return response()->json(['error' => 'Failed to fetch institutions'], 500);
            }

            Log::info('Institutions');
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('GoCardless API exception', [
                'message' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to fetch institutions'], 500);
        }
    }

    public function importAccount(Request $request)
    {
        $request->validate([
            'institution_id' => 'required|string'
        ]);

        try {
            // Step 1: Get access token
            $tokenResponse = Http::post("{$this->baseUrl}/token/new/", [
                'secret_id' => config('services.gocardless.secret_id'),
                'secret_key' => config('services.gocardless.secret_key')
            ]);

            if (!$tokenResponse->successful()) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $accessToken = $tokenResponse->json()['access'];

            // Step 2: Create end user agreement
            $agreementResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'accept' => 'application/json'
            ])->post("{$this->baseUrl}/agreements/enduser/", [
                'institution_id' => $request->institution_id,
                'max_historical_days' => 700,
                'access_valid_for_days' => 90,
                'access_scope' => ['balances', 'details', 'transactions']
            ]);

            if (!$agreementResponse->successful()) {
                return response()->json(['error' => 'Failed to create agreement'], 500);
            }

            $agreementId = $agreementResponse->json()['id'];

            // Step 3: Create requisition
            $requisitionResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'accept' => 'application/json'
            ])->post("{$this->baseUrl}/requisitions/", [
                'redirect' => config('app.url') . '/api/gocardless/callback',
                'institution_id' => $request->institution_id,
                'reference' => uniqid(),
                'agreement' => $agreementId,
                'user_language' => 'EN'
            ]);

            if (!$requisitionResponse->successful()) {
                return response()->json(['error' => 'Failed to create requisition'], 500);
            }

            $requisitionData = $requisitionResponse->json();

            // Store the requisition ID in the session for later use
            session(['gocardless_requisition_id' => $requisitionData['id']]);

            // Return the link for the user to authenticate
            return response()->json([
                'link' => $requisitionData['link']
            ]);

        } catch (\Exception $e) {
            Log::error('GoCardless import error', [
                'message' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to import account'], 500);
        }
    }

    public function handleCallback(Request $request)
    {
        Log::info('Handling callback');
        $requisitionId = session('gocardless_requisition_id');
        if (!$requisitionId) {
            return redirect()->route('accounts.index')->with('error', 'Invalid session');
        }

        Log::info('Requisition ID');
        try {
            // Get the accounts associated with the requisition
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.gocardless.access_token'),
                'accept' => 'application/json'
            ])->get("{$this->baseUrl}/requisitions/{$requisitionId}/");

            Log::info('Response');

            if (!$response->successful()) {
                return redirect()->route('accounts.index')->with('error', 'Failed to fetch accounts');
            }

            $requisitionData = $response->json();

            Log::info('Requisition Data');

            // For each account, fetch details and create in our system
            foreach ($requisitionData['accounts'] as $accountId) {
                $accountResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . config('services.gocardless.access_token'),
                    'accept' => 'application/json'
                ])->get("{$this->baseUrl}/accounts/{$accountId}/details/");
                Log::info("Status Response", ['success' => $accountResponse->successful()]);
                Log::info("Account Response", ['data' => $accountResponse->json()]);

                if ($accountResponse->successful()) {
                    $accountData = $accountResponse->json()['account'];
                    Log::info('Account Response');
                    // Create account in our system
                    Account::create([
                        'user_id' => auth()->id(),
                        'name' => 'Imported Account ' . ($accountData['ownerName'] ?? ''),
                        'account_id' => $accountId,
                        'bank_name' => null,
                        'iban' => $accountData['iban'] ?? '',
                        'currency' => $accountData['currency'] ?? 'EUR',
                        'balance' => 0,
                    ]);
                } else {
                    session()->flash('error', 'Failed to fetch account details');
                    Log::error('Account Response', ['data' => $accountResponse->json()]);
                }
            }

            return redirect()->route('accounts.index')->with('success', 'Accounts imported successfully');

        } catch (\Exception $e) {
            Log::error('GoCardless callback error', [
                'message' => $e->getMessage()
            ]);
            return redirect()->route('accounts.index')->with('error', 'Failed to import accounts');
        }
    }
}