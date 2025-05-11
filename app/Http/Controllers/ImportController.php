<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Import;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ImportController extends Controller
{
    /**
     * Display a listing of imports
     */
    public function index()
    {
        Log::debug('Fetching imports for user', ['user_id' => Auth::id()]);

        $imports = Import::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get();

        Log::debug('Found imports', ['count' => $imports->count()]);

        return Inertia::render('import/index', [
            'imports' => $imports,
            'accounts' => Account::where('user_id', Auth::id()),
        ]);
    }

    /**
     * Upload a CSV file
     */
    public function upload(Request $request)
    {
        Log::debug('Starting file upload');

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'account_id' => 'required|exists:accounts,id',
            'delimiter' => 'required|string|size:1',
            'quote_char' => 'required|string|size:1',
        ]);

        Log::debug('File validation passed');

        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $filename = Str::random(40) . '.csv';

        Log::debug('Generated filename', [
            'original' => $originalFilename,
            'generated' => $filename
        ]);

        // Preprocess the CSV file to ensure proper UTF-8 encoding
        $preprocessedPath = $this->preprocessCSV($file, $request->delimiter, $request->quote_char);
        Log::debug('CSV file preprocessed', ['path' => $preprocessedPath]);

        // Store preprocessed file in storage
        $path = Storage::putFileAs('imports', $preprocessedPath, $filename);
        Log::debug('File stored', ['path' => $path]);

        // Read sample data from the file
        $sampleData = $this->getSampleData($path, $request->delimiter, $request->quote_char);
        Log::debug('Sample data read', [
            'headers_count' => count($sampleData['headers']),
            'rows_count' => count($sampleData['rows'])
        ]);

        // Create import record
        $import = Import::create([
            'user_id' => Auth::id(),
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'status' => Import::STATUS_PENDING,
            'total_rows' => count(file(Storage::path($path))) - 1, // Exclude header
            'metadata' => [
                'headers' => $sampleData['headers'],
                'sample_rows' => $sampleData['rows'],
                'account_id' => $request->account_id,
                'delimiter' => $request->delimiter,
                'quote_char' => $request->quote_char,
            ],
        ]);

        Log::debug('Import record created', ['import_id' => $import->id]);

        return response()->json([
            'import_id' => $import->id,
            'headers' => $sampleData['headers'],
            'sample_rows' => $sampleData['rows'],
        ]);
    }

    /**
     * Preprocess CSV file to ensure proper UTF-8 encoding
     */
    private function preprocessCSV($file, string $delimiter, string $quoteChar)
    {
        Log::debug('Starting CSV preprocessing', [
            'delimiter' => $delimiter,
            'quote_char' => $quoteChar
        ]);

        // Create a temporary file for the preprocessed content
        $tempFile = tempnam(sys_get_temp_dir(), 'csv_');
        $handle = fopen($tempFile, 'w');

        // Read the first few bytes to detect BOM
        $content = file_get_contents($file->getPathname(), false, null, 0, 10000);

        // Check for BOM and detect encoding
        $encoding = $this->detectEncoding($content);
        Log::debug('Detected file encoding', ['encoding' => $encoding]);

        // Convert file content to UTF-8 based on detected encoding
        $fullContent = file_get_contents($file->getPathname());

        if ($encoding != 'UTF-8') {
            $fullContent = mb_convert_encoding($fullContent, 'UTF-8', $encoding);
            Log::debug('Converted file from detected encoding to UTF-8');
        }

        // Remove NULL bytes
        $fullContent = str_replace("\0", '', $fullContent);
        Log::debug('Removed null bytes from content');

        // Remove BOM if present
        $fullContent = preg_replace('/^\xEF\xBB\xBF/', '', $fullContent);

        // Write the processed content to the temp file
        fwrite($handle, $fullContent);
        fclose($handle);

        Log::debug('CSV preprocessing completed', ['temp_file' => $tempFile]);
        return $tempFile;
    }

    /**
     * Detect file encoding with additional checks for UTF-16 variants
     */
    private function detectEncoding($content)
    {
        // Check for UTF-16LE BOM (FF FE)
        if (substr($content, 0, 2) === "\xFF\xFE") {
            return 'UTF-16LE';
        }

        // Check for UTF-16BE BOM (FE FF)
        if (substr($content, 0, 2) === "\xFE\xFF") {
            return 'UTF-16BE';
        }

        // Check for UTF-8 BOM (EF BB BF)
        if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
            return 'UTF-8';
        }

        // No BOM found, try to detect encoding based on content
        // Check for null bytes which might indicate UTF-16
        if (strpos($content, "\0") !== false) {
            // Detect if it's UTF-16LE or UTF-16BE based on pattern
            if (preg_match('/[\x20-\x7E]\x00[\x20-\x7E]\x00/', $content)) {
                return 'UTF-16LE';
            } elseif (preg_match('/\x00[\x20-\x7E]\x00[\x20-\x7E]/', $content)) {
                return 'UTF-16BE';
            }
        }

        // Try to detect encoding using mb_detect_encoding
        $detectedEncoding = mb_detect_encoding($content, [
            'UTF-8', 'UTF-16LE', 'UTF-16BE', 'ASCII', 'ISO-8859-1', 'ISO-8859-15', 'Windows-1252'
        ], true);

        return $detectedEncoding ?: 'UTF-8'; // Default to UTF-8 if detection fails
    }

    /**
     * Configure the column mapping for an import
     */
    public function configure(Request $request, Import $import)
    {
        Log::debug('Starting import configuration', ['import_id' => $import->id]);

        $request->validate([
            'column_mapping' => 'required|array',
            'date_format' => 'required|string',
            'amount_format' => 'required|string',
            'amount_type_strategy' => 'required|string',
            'currency' => 'required|string|size:3',
        ]);

        Log::debug('Configuration validation passed');

        // Update the import with configuration
        $import->update([
            'column_mapping' => $request->column_mapping,
            'date_format' => $request->date_format,
            'amount_format' => $request->amount_format,
            'amount_type_strategy' => $request->amount_type_strategy,
            'currency' => $request->currency,
        ]);

        Log::debug('Import configuration updated');

        // Process the data with the new configuration to show a preview
        $processedData = $this->processImportPreview($import);

        Log::debug('Preview data processed', ['rows_count' => count($processedData)]);

        return response()->json([
            'import' => $import,
            'preview_data' => $processedData,
        ]);
    }

    /**
     * Process the import and create transactions
     */
    public function process(Request $request, Import $import)
    {
        Log::debug('Starting import processing', ['import_id' => $import->id]);

        $request->validate([
            'account_id' => 'required|exists:accounts,id',
        ]);

        $accountId = $request->account_id;

        // Check if this import belongs to the authenticated user
        if ($import->user_id !== Auth::id()) {
            Log::warning('Unauthorized import access attempt', [
                'import_id' => $import->id,
                'user_id' => Auth::id()
            ]);
            abort(403);
        }

        // Check if the import is already processed
        if ($import->status === Import::STATUS_COMPLETED) {
            Log::info('Import already processed', ['import_id' => $import->id]);
            return response()->json([
                'message' => 'Import already processed',
                'import' => $import,
            ]);
        }

        // Update import status
        $import->status = Import::STATUS_PROCESSING;
        $import->save();
        Log::debug('Import status updated to processing');

        try {
            // Process the file
            $path = "imports/{$import->filename}";
            $file = fopen(Storage::path($path), 'r');

            Log::debug('Opened import file', ['path' => $path]);

            // Get delimiter and quote characters from metadata
            $delimiter = $import->metadata['delimiter'] ?? ';';
            $quoteChar = $import->metadata['quote_char'] ?? '"';

            // Skip header row
            $this->safelyGetCSVLine($file, $delimiter, $quoteChar);

            $processed = 0;
            $failed = 0;

            // Read each line and process
            while (($line = $this->safelyGetCSVLine($file, $delimiter, $quoteChar)) !== false) {
                try {
                    // Skip null lines or empty arrays
                    if ($line === null || (is_array($line) && count($line) === 0)) {
                        Log::warning('Skipping empty line', ['row_number' => $processed + $failed + 1]);
                        continue;
                    }

                    $this->processImportRow($line, $import, $accountId);
                    $processed++;

                    if ($processed % 100 === 0) {
                        Log::debug('Processing progress', [
                            'processed' => $processed,
                            'failed' => $failed
                        ]);
                    }
                } catch (\Exception $e) {
                    $failed++;
                    Log::error('Failed to process row', [
                        'error' => $e->getMessage(),
                        'row_number' => $processed + $failed,
                        'line' => $line ?? 'null'
                    ]);
                }
            }

            fclose($file);

            // Update import status
            $import->processed_rows = $processed;
            $import->failed_rows = $failed;
            $import->status = Import::STATUS_COMPLETED;
            $import->processed_at = now();
            $import->save();

            Log::info('Import completed successfully', [
                'import_id' => $import->id,
                'processed' => $processed,
                'failed' => $failed
            ]);

            return response()->json([
                'message' => 'Import processed successfully',
                'import' => $import,
            ]);
        } catch (\Exception $e) {
            Log::error('Import failed', [
                'import_id' => $import->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $import->status = Import::STATUS_FAILED;
            $import->save();

            return response()->json([
                'message' => 'Import failed: ' . $e->getMessage(),
                'import' => $import,
            ], 500);
        }
    }

    /**
     * Get categories for mapping
     */
    public function getCategories()
    {
        Log::debug('Fetching categories for user', ['user_id' => Auth::id()]);

        $categories = Category::where('user_id', Auth::id())->get();

        Log::debug('Found categories', ['count' => $categories->count()]);

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get sample data from a CSV file
     */
    private function getSampleData(string $path, string $delimiter, string $quoteChar, int $sampleSize = 5)
    {
        Log::debug('Reading sample data', [
            'path' => $path,
            'sample_size' => $sampleSize,
            'delimiter' => $delimiter,
            'quote_char' => $quoteChar
        ]);

        // Set the delimiter and enclosure character
        $file = fopen(Storage::path($path), 'r');

        // Try to get headers
        $headers = $this->safelyGetCSVLine($file, $delimiter, $quoteChar);
        Log::debug('Read headers', ['count' => count($headers)]);

        // Get sample rows
        $rows = [];
        for ($i = 0; $i < $sampleSize; $i++) {
            $row = $this->safelyGetCSVLine($file, $delimiter, $quoteChar);
            if ($row) {
                $rows[] = $row;
            } else {
                break;
            }
        }

        Log::debug('Read sample rows', ['count' => count($rows)]);
        fclose($file);

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    /**
     * Safely get a CSV line with error handling
     */
    private function safelyGetCSVLine($file, $delimiter, $quoteChar)
    {
        if (feof($file)) {
            return false;
        }

        try {
            // If quoteChar is empty, use a special character that won't appear in the data
            $effectiveQuoteChar = empty($quoteChar) ? chr(0) : $quoteChar;

            // Set the delimiter and quote character
            $line = fgetcsv($file, 0, $delimiter, $effectiveQuoteChar);

            // Handle end of file
            if ($line === false) {
                return false;
            }

            // Handle invalid line (sometimes appears as an array with one empty string)
            if (is_array($line) && count($line) === 1 && $line[0] === null) {
                return false;
            }

            // Clean the values
            if (is_array($line)) {
                return array_map(function($value) {
                    // Remove null bytes and control characters
                    $value = str_replace("\0", '', $value);
                    $value = preg_replace('/[\x00-\x1F\x7F]/', '', $value);
                    return trim($value);
                }, $line);
            }

            // If we get here with a non-array, something went wrong
            Log::warning('CSV line is not an array', ['line' => $line]);
            return false;
        } catch (\Exception $e) {
            Log::error('Error reading CSV line', [
                'error' => $e->getMessage(),
                'file_position' => ftell($file)
            ]);

            // Try to recover by reading the next line as a plain string
            $rawLine = fgets($file);
            Log::debug('Attempting to recover with raw line read', ['raw_line' => $rawLine]);

            if ($rawLine !== false) {
                // Try to manually split the line
                $manualValues = str_getcsv($rawLine, $delimiter, $quoteChar);
                if (is_array($manualValues) && count($manualValues) > 0) {
                    Log::debug('Recovered with manual parsing', ['values_count' => count($manualValues)]);
                    return array_map('trim', $manualValues);
                }
            }

            return false;
        }
    }

    /**
     * Process a CSV row into a transaction
     */
    private function processImportRow(array $row, Import $import, $accountId)
    {
        Log::debug('Processing import row', ['import_id' => $import->id, 'row' => $row]);

        // Get configuration values from import
        $mapping = $import->column_mapping;
        $dateFormat = $import->date_format ?? 'd.m.Y';
        $amountFormat = $import->amount_format ?? '1,234.56';
        $amountTypeStrategy = $import->amount_type_strategy ?? 'signed_amount';
        $currency = $import->currency ?? 'EUR';

        $data = [];
        $processedCount = 0;

        // Validate required fields are mapped
        $requiredFields = ['booked_date', 'amount', 'partner'];
        $missingRequiredFields = [];
        foreach ($requiredFields as $field) {
            if (!isset($mapping[$field]) || $mapping[$field] === null) {
                $missingRequiredFields[] = $field;
            }
        }

        if (!empty($missingRequiredFields)) {
            throw new \Exception('Missing required field mappings: ' . implode(', ', $missingRequiredFields));
        }

        // Map each column based on the configuration
        foreach ($mapping as $field => $columnIndex) {
            if ($columnIndex === null || !isset($row[$columnIndex])) {
                continue;
            }

            $value = $row[$columnIndex];

            // Skip empty values
            if (trim($value) === '') {
                continue;
            }

            $processedCount++;

            // Process date fields
            if ($field === 'booked_date' || $field === 'processed_date') {
                $value = $this->parseDate($value, $dateFormat);
                if ($value === null) {
                    if ($field === 'booked_date') {
                        throw new \Exception("Invalid date format for field {$field}");
                    }
                } else {
                    Log::debug('Parsed date field', ['field' => $field, 'value' => $value]);
                }
            }

            // Process amount field
            if ($field === 'amount') {
                $value = $this->parseAmount($value, $amountFormat, $amountTypeStrategy);
                if ($value === null) {
                    throw new \Exception("Invalid amount format for field {$field}");
                }
                Log::debug('Parsed amount field', ['value' => $value]);
            }

            $data[$field] = $value;
        }

        // If no valid fields were processed, skip this row
        if ($processedCount == 0) {
            Log::warning('Skipping row with no valid data');
            throw new \Exception('No valid data in row');
        }

        // Set required fields
        $data['transaction_id'] = 'IMP-' . Str::random(10);
        $data['currency'] = $currency;
        $data['account_id'] = $accountId;
        $data['type'] = "Imported";
        $data['metadata'] = [
            'import_id' => $import->id,
            'imported_at' => now()->format('Y-m-d H:i:s')
        ];
        $data['balance_after_transaction'] = 0; // Placeholder, to be calculated later

        // Set default values for required fields that might be missing
        if (!isset($data['processed_date'])) {
            $data['processed_date'] = $data['booked_date'] ?? now()->format('Y-m-d H:i:s');
            Log::debug('Setting default processed_date', ['value' => $data['processed_date']]);
        }

        // If partner is empty (but mapped), set a default
        if (!isset($data['partner']) || empty(trim($data['partner']))) {
            $data['partner'] = 'Unknown';
            Log::debug('Setting default partner', ['value' => $data['partner']]);
        }

        // If description is required but missing, set a default
        if (!isset($data['description'])) {
            $data['description'] = 'Imported transaction';
            Log::debug('Setting default description', ['value' => $data['description']]);
        }

        Log::debug('Creating transaction', ['data' => json_encode($data)]);

        // Create transaction
        try {
            Transaction::create($data);
            Log::debug('Transaction created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create transaction', [
                'error' => $e->getMessage(),
                'data' => json_encode($data)
            ]);
            throw $e;
        }
    }

    /**
     * Process import data for preview
     */
    private function processImportPreview(Import $import, int $previewSize = 10)
    {
        Log::debug('Processing import preview', [
            'import_id' => $import->id,
            'preview_size' => $previewSize
        ]);

        $path = "imports/{$import->filename}";
        $file = fopen(Storage::path($path), 'r');

        // Get delimiter and quote characters from metadata if available
        $delimiter = $import->metadata['delimiter'] ?? ';';
        $quoteChar = $import->metadata['quote_char'] ?? '"';

        // Skip header row
        $headers = $this->safelyGetCSVLine($file, $delimiter, $quoteChar);
        Log::debug('Headers', ['headers' => $headers]);

        $previewData = [];
        $validRows = 0;
        $processedRows = 0;

        // Read rows until we have enough valid ones or reach maximum attempts
        while ($validRows < $previewSize && $processedRows < $previewSize * 2) {
            $line = $this->safelyGetCSVLine($file, $delimiter, $quoteChar);
            if (!$line) break;

            $processedRows++;
            Log::debug('Processing preview row', ['row_number' => $processedRows, 'line' => $line]);

            try {
                $mapping = $import->column_mapping;
                $data = [];
                $hasValidData = false;

                // Map each column based on the configuration
                foreach ($mapping as $field => $columnIndex) {
                    if ($columnIndex === null || !isset($line[$columnIndex])) {
                        continue;
                    }

                    $value = $line[$columnIndex];

                    // Skip completely empty values
                    if (trim($value) === '') {
                        continue;
                    }

                    $hasValidData = true;

                    // Process date fields
                    if ($field === 'booked_date' || $field === 'processed_date') {
                        $value = $this->parseDate($value, $import->date_format);
                        Log::debug('Parsed preview date', ['field' => $field, 'value' => $value]);
                    }

                    // Process amount field
                    if ($field === 'amount') {
                        $value = $this->parseAmount($value, $import->amount_format, $import->amount_type_strategy);
                        Log::debug('Parsed preview amount', ['value' => $value]);
                    }

                    $data[$field] = $value;
                }

                if ($hasValidData) {
                    $data['_row_number'] = $processedRows;
                    $data['_raw_data'] = $line; // Store raw data for debugging
                    $previewData[] = $data;
                    $validRows++;
                } else {
                    Log::warning('Row has no valid data', ['row_number' => $processedRows]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to process preview row', [
                    'row_number' => $processedRows,
                    'error' => $e->getMessage(),
                    'line' => $line
                ]);
            }
        }

        fclose($file);

        Log::debug('Preview processing complete', ['rows_processed' => $processedRows, 'valid_rows' => $validRows]);

        return $previewData;
    }

    /**
     * Parse date from string based on format
     */
    private function parseDate(string $dateString, string $format)
    {
        Log::debug('Parsing date', ['date_string' => $dateString, 'format' => $format]);

        // Clean the input string
        $dateString = str_replace("\0", '', $dateString);
        $dateString = trim($dateString);

        // Remove any control characters
        $dateString = preg_replace('/[\x00-\x1F\x7F]/', '', $dateString);

        // If the string is empty after cleaning, return null
        if (empty($dateString)) {
            return null;
        }

        try {
            $date = \DateTime::createFromFormat($format, $dateString);
            if ($date === false) {
                // Try alternative formats
                $alternativeFormats = [
                    'd.m.Y', 'Y-m-d', 'd/m/Y', 'm/d/Y', 'Y.m.d',
                    'd.m.Y H:i:s', 'Y-m-d H:i:s'
                ];

                foreach ($alternativeFormats as $altFormat) {
                    if ($altFormat !== $format) {
                        $date = \DateTime::createFromFormat($altFormat, $dateString);
                        if ($date !== false) {
                            break;
                        }
                    }
                }

                if ($date === false) {
                    Log::warning('Failed to parse date', [
                        'date_string' => $dateString,
                        'format' => $format,
                        'errors' => \DateTime::getLastErrors()
                    ]);
                    return null;
                }
            }

            return $date->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            Log::error('Error parsing date', [
                'date_string' => $dateString,
                'format' => $format,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Parse amount from string based on format
     */
    private function parseAmount(string $amountString, string $format, string $strategy)
    {
        Log::debug('Parsing amount', [
            'amount_string' => $amountString,
            'format' => $format,
            'strategy' => $strategy
        ]);

        // Clean the input string
        $amountString = str_replace("\0", '', $amountString);
        $amountString = trim($amountString);

        // Remove any control characters
        $amountString = preg_replace('/[\x00-\x1F\x7F]/', '', $amountString);

        // Remove any currency symbols and spaces
        $amountString = preg_replace('/[^0-9.,\-]/', '', $amountString);

        // Convert to standard decimal format
        if ($format === '1,234.56') {
            // US format: commas as thousand separators, period as decimal
            $amountString = str_replace(',', '', $amountString);
        } elseif ($format === '1.234,56') {
            // EU format: periods as thousand separators, comma as decimal
            $amountString = str_replace('.', '', $amountString);
            $amountString = str_replace(',', '.', $amountString);
        } elseif ($format === '1234,56') {
            // Format with no thousand separator and comma as decimal
            $amountString = str_replace(',', '.', $amountString);
        }

        // If the string is empty after cleaning, return null
        if (empty($amountString)) {
            return null;
        }

        try {
            $amount = floatval($amountString);

            // Apply amount type strategy
            if ($strategy === 'signed_amount') {
                return $amount;
            } elseif ($strategy === 'income_positive') {
                return $amount;
            } elseif ($strategy === 'expense_positive') {
                return -$amount;
            }

            return $amount;
        } catch (\Exception $e) {
            Log::error('Error parsing amount', [
                'amount_string' => $amountString,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
