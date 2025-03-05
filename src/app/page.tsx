import { fetchDolares } from './lib/fetchDolares';
import Converter from '../components/Converter';
import { Suspense } from 'react';

function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-950 to-emerald-900">
      <div className="w-full max-w-md p-8 rounded-3xl bg-emerald-900 shadow-xl">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const dolares = await fetchDolares();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-950 to-green-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 to-transparent opacity-50 pointer-events-none"></div>

      <Suspense fallback={<Loading />}>
        <Converter initialDolares={dolares} />
      </Suspense>

      <footer className="mt-8 text-center text-sm text-white">
        <p>Datos proporcionados por <a href="https://dolarapi.com/" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 transition-colors font-semibold">DolarAPI.com</a></p>
      </footer>
    </main>
  );
}
