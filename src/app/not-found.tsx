import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8 text-slate-500">Stranica koju tražite ne postoji.</p>
            <Link 
                href="/" 
                className="px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
            >
                Vratite se nazad
            </Link>
        </div>
    );
}
