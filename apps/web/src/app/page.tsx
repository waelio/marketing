import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold text-brand-700">Waelio Marketing</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-brand-600">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold text-slate-900 max-w-3xl">
          The ad network built for independent publishers
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-xl">
          Run CPC and CPM campaigns, manage creatives, and monetize your sites with geo, device,
          and frequency targeting.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/register?role=ADVERTISER"
            className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700"
          >
            Start advertising
          </Link>
          <Link
            href="/register?role=PUBLISHER"
            className="border border-brand-600 text-brand-700 px-8 py-3 rounded-lg font-medium hover:bg-brand-50"
          >
            Monetize your site
          </Link>
        </div>
      </section>
    </main>
  );
}
