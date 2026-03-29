import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body font-medium selection:bg-primary/20">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-headline font-extrabold text-2xl tracking-tight text-primary">SnapFins</Link>
          <Link href="/" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">Back to Home</Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto text-on-surface-variant leading-relaxed space-y-10">
        <div className="space-y-4 mb-16 border-b border-outline-variant/30 pb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight">Terms of Service</h1>
          <p className="text-lg">Last Updated: October 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">1. Acceptance of Terms</h2>
          <p>By accessing or using the SnapFins application ("Service") developed by <strong className="text-on-surface">0x5zen</strong>, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use our Service.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">2. Provided Services</h2>
          <p>SnapFins is a personal financial ledger platform enabling AI-guided receipt tracking and monetary analytics. You understand that SnapFins is an organizational instrument and does not offer verified financial, legal, or tax advisory.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">3. Prohibited Activities</h2>
          <p>You agree not to engage in any activity that:</p>
          <ul className="list-disc leading-loose ml-6 space-y-2">
            <li>Interferes with or disrupts the Service, servers, or underlying Supabase infrastructure.</li>
            <li>Attempts to reverse-engineer our Gemini AI prompts or exploit the image processing API excessively.</li>
            <li>Involves the transmission of unlawful, offensive, or otherwise inappropriate content onto our ledgers.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">4. Limitation of Liability</h2>
          <p>0x5zen and the SnapFins administrators shall not be held liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service, including but not limited to loss of data, loss of anticipated savings, or monetary discrepancies.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
