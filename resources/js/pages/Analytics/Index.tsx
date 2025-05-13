import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/layouts/page-header';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function Index({ auth }: PageProps) {
    return (
        <AppLayout>
            <Head title="Analytics" />

            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="mx-auto w-full max-w-7xl">
                    <PageHeader
                        title="Analytics"
                        buttons={[
                            {
                                onClick: () => {},
                                label: 'Export',
                            },
                        ]}
                    />
                </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-center">
                <p className="text-muted-foreground mt-2 text-xl font-bold">Coming soon...</p>
            </div>
        </AppLayout>
    );
}
