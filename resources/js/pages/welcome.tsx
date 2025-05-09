import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <main className="flex flex-col items-center text-center">
                    <div className="max-w-4xl">
                        <div className="mb-10">
                            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white lg:text-6xl">
                                Track Your Finances <span className="text-emerald-500">Effortlessly</span>
                            </h1>
                            <p className="mb-8 text-lg text-gray-400">
                                The all-in-one solution to manage your money, track expenses, and reach your financial goals.
                            </p>
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                <Link
                                    href={route('register')}
                                    className="w-full rounded-md bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black sm:w-auto"
                                >
                                    Get Started - It's Free
                                </Link>
                                <a
                                    href="#features"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-800 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-auto"
                                >
                                    <span>Learn More</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="mt-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 p-1">
                            <div className="rounded-lg bg-gray-900 p-4 shadow-lg">
                                <img 
                                    src="/img/finance-dashboard-preview.png" 
                                    alt="Finance Dashboard Preview" 
                                    className="rounded-md shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://serversideup.net/open-source/financial-freedom/images/ui/full-screen-mockup.png';
                                    }} 
                                />
                            </div>
                        </div>

                        <section id="features" className="mt-20 grid gap-10 md:grid-cols-3">
                            <div className="flex flex-col items-center p-4">
                                <div className="mb-4 rounded-full bg-emerald-900 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-emerald-500" viewBox="0 0 16 16">
                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-medium text-white">Real-time Tracking</h3>
                                <p className="text-gray-400">Monitor your finances as they happen with instant updates and alerts.</p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <div className="mb-4 rounded-full bg-emerald-900 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-emerald-500" viewBox="0 0 16 16">
                                        <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.793V1.018zm1 0v6.775l4.79 4.79A7 7 0 0 0 8.5 1.018zm4.084 12.273L8.5 9.207v5.775a6.97 6.97 0 0 0 4.084-1.691zM7.5 14.982V9.207l-4.084 4.084A6.97 6.97 0 0 0 7.5 14.982zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-medium text-white">Smart Budgeting</h3>
                                <p className="text-gray-400">Create personalized budgets and get insights on your spending habits.</p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <div className="mb-4 rounded-full bg-emerald-900 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-emerald-500" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-medium text-white">Goal Setting</h3>
                                <p className="text-gray-400">Set financial goals and track your progress with visual analytics.</p>
                            </div>
                        </section>
                        
                        <section className="mt-20 mb-10">
                            <h2 className="mb-6 text-3xl font-semibold text-white">Ready to take control of your finances?</h2>
                            <Link
                                href={route('register')}
                                className="rounded-md bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                            >
                                Start Your Free Trial
                            </Link>
                        </section>
                    </div>
                </main>
                
            </div>
        </>
    );
}
