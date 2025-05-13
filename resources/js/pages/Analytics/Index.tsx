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
                        buttons={[{
                            onClick: () => {},
                            label: 'Export',
                        }]}
                    />
                
                </div>
            </div>

                            <div className="h-1/2 flex w-full justify-center items-center">
                            <p className="mt-2 font-bold text-muted-foreground text-xl">Coming soon...</p>

                            </div>
        </AppLayout>
    );
} 