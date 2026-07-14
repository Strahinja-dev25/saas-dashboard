import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center font-sans">
            <div className="max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
                    Sistem za upravljanje transportom
                </h1>

                <div className="w-16 h-1 bg-slate-900 mx-auto mb-6 rounded"></div>

                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                    Ovaj softver je namenjen isključivo dispečerima i firmama za upravljanje kamionima.
                    Pristup sistemu je strogo interni, a korisnička imena i šifre dodeljuje isključivo administracija.
                </p>
                <Link
                    href="/sign-in"
                    className="inline-block px-8 py-3 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                >
                    Uloguj se
                </Link>
            </div>
        </div>
    );
}
