import Link from 'next/link';

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight">Privacy Policy</h1>
          <p className="text-lg">Effective Date: October 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">1. Introduction</h2>
          <p>Welcome to SnapFins, developed by 0x5zen. We respect your privacy and are committed to protecting the integrity of your financial and personal data. This Privacy Policy outlines what information we collect, how it gets processed, and the measures we employ to secure it.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">2. Data We Collect</h2>
          <ul className="list-disc leading-loose ml-6 space-y-2">
            <li><strong className="text-on-surface">Authentication Data:</strong> Profile schemas accessed via third-party OAuth providers (Google, GitHub) securely mediated via Supabase infrastructure.</li>
            <li><strong className="text-on-surface">Financial Ledger Data:</strong> Transactions, budgets, receipts, and custom categories inputted manually or synced.</li>
            <li><strong className="text-on-surface">Receipt Image Metadata:</strong> Images uploaded for Optical Character Recognition via Gemini Vision AI. Image data is temporarily processed and not retained for unauthorized AI training.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">3. AI Data Processing (Gemini Flash)</h2>
          <p>The "Scan Receipt" feature relies on the external <strong className="text-on-surface">Google Generative AI (Gemini 2.5 Flash)</strong> API. When you upload a receipt, the image is passed directly in binary format to Google's secured endpoint solely to extract chronological transaction logic (merchant, total amount, and taxonomy). 0x5zen ensures these requests strictly obey data constraints ensuring it will not be saved as public datasets.</p>
        </section>
        
        <section className="space-y-4 mt-10">
          <p>If you have any specific concerns about your data lifecycle, please reach out to <a href="#" className="text-primary font-bold hover:underline">privacy@snapfins.0x5zen.dev</a>.</p>
        </section>
      </main>

      <footer className="w-full py-8 bg-surface-container-low border-t border-outline-variant/30 text-center">
        <p className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">© 2026 0x5zen. All rights reserved.</p>
      </footer>
    </div>
  );
}
