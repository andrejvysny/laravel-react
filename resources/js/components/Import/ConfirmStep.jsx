import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ConfirmStep({ importData, onBack, onComplete }) {
    const { data, setData, post, processing, errors } = useForm({
        import_id: importData.id,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('imports.process'), {
            onSuccess: () => {
                onComplete();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Confirm Import</CardTitle>
                    <CardDescription>
                        Review the import details and confirm to start processing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium">File Details</h3>
                                <p className="text-sm text-muted-foreground">
                                    {importData.original_filename}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium">Total Records</h3>
                                <p className="text-sm text-muted-foreground">
                                    {importData.total_rows.toLocaleString()} records
                                </p>
                            </div>
                        </div>

                        {errors.import_id && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.import_id}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                disabled={processing}
                            >
                                Back
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Processing...' : 'Start Import'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
} 