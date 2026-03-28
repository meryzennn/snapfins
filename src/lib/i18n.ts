// SnapFins i18n Dictionary — EN & ID
export type LangKey = 'en' | 'id';

export const translations = {
  en: {
    // ---- SHARED / NAV ----
    home: 'Home',
    features: 'Features',
    login: 'Login',
    logout: 'Logout',

    // ---- LANDING PAGE ----
    heroBadge: 'LIVE ASSET TRACKING ENABLED',
    heroTitle1: 'Master your finances,',
    heroTitle2: 'with AI-Powered precision.',
    heroSubtitle: 'Snap receipts, map transactions, and track your capital effortlessly. Powered by Google Gemini AI, built for meticulous wealth management and maximum clarity.',
    heroGetStarted: 'Get Started for Free',

    featuresSectionTitle: 'Precision Instruments for Wealth.',
    featuresSectionSubtitle: 'Every feature is designed with the clarity of a high-end ledger.',

    feature1Title: '✨ AI Receipt Scanner',
    feature1Desc: 'Powered by Gemini AI, our scanner extracts line items, taxes, and merchant info with 99.9% accuracy. No more manual entry.',
    feature2Title: '📊 Spreadsheet UI',
    feature2Desc: 'Familiar yet powerful. Experience a high-performance data grid that handles thousands of rows with instant filtering and pivot views.',
    feature3Title: '💰 Multi-Asset Tracking',
    feature3Desc: 'From Solana and Bitcoin to physical Gold and traditional stocks. Sync your entire portfolio in one unified dashboard.',

    ctaTitle: 'Ready to reclaim your time?',
    ctaSubtitle: 'Join SnapFins today and transform the way you see your financial future.',
    ctaButton: 'Create Your Free Account',

    footerRights: '© 2026 0x5zen. All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    support: 'Support',

    // ---- AUTH MODAL ----
    signIn: 'Sign In',
    signInSubtitle: 'Choose your preferred provider to securely log into your SnapFins account.',
    continueWithGoogle: 'Continue with Google',
    continueWithGithub: 'Continue with GitHub',

    // ---- DASHBOARD NAV ----
    navDashboard: 'Dashboard',
    navAsset: 'Asset',
    navAnalytics: 'Analytics',
    navSettings: 'Settings',

    // ---- DASHBOARD HEADER ----
    financialOverview: 'Financial Overview',
    liveStatus: 'Financial Intelligence (LIVE)',
    manualEntry: 'Manual Entry',
    scanReceipt: 'Scan Receipt',

    // ---- SUMMARY CARDS ----
    totalNetWorth: 'Total Net Worth',
    monthlyIncome: 'Monthly Income',
    monthlyExpense: 'Monthly Expense',
    fromLastMonth: '+4.2% from last month',
    nextPayout: 'Next payout in 4 days',
    overBudget: '12% above budget limit',

    // ---- TRANSACTION TABLE ----
    recentLedger: 'Recent Transaction Ledger',
    colDate: 'Date',
    colCategory: 'Category',
    colDescription: 'Description',
    colType: 'Type',
    colAmount: 'Amount',
    colLinkedAssets: 'Linked Assets',
    displayingResults: (n: number) => `Displaying ${n} of ${n} results`,
    downloadCSV: 'Download CSV',
    noTransactions: 'No transactions yet',
    noTransactionsHint: 'Add your first entry using Manual Entry or Scan Receipt above.',
    aiScanned: 'AI SCANNED',

    // ---- MANUAL ENTRY MODAL ----
    manualEntryTitle: 'Manual Entry',
    manualEntrySubtitle: 'Record a transaction manually to your financial ledger.',
    labelDate: 'Date',
    labelAmount: 'Amount',
    labelDescription: 'Description',
    labelCategory: 'Category',
    labelType: 'Type',
    labelSource: 'Source (Optional)',
    placeholderDescription: 'Grocery Store',
    placeholderCategory: 'GROCERY',
    placeholderSource: 'Citibank Reserve',
    saveTransaction: 'Save Transaction',
    saving: 'Saving...',

    // ---- AI SCANNER OVERLAY ----
    analyzingReceipt: 'Analyzing Receipt',
    analyzingHint: 'Gemini AI is examining your document and extracting merchant data...',

    // ---- SCAN ERROR MODAL ----
    scanErrorTitle: 'Scan Failed',
    scanErrorHint: 'Our AI was unable to process the image.',
    tryAgainWithDifferent: 'Please try with a clear photo of a receipt or invoice.',
    tryAgain: 'Try Again',

    // ---- FOOTER DASHBOARD ----
    footerPrecision: '© 2026 0x5zen. Precision Wealth Instruments.',
  },

  id: {
    // ---- SHARED / NAV ----
    home: 'Beranda',
    features: 'Fitur',
    login: 'Masuk',
    logout: 'Keluar',

    // ---- LANDING PAGE ----
    heroBadge: 'PELACAKAN ASET LANGSUNG AKTIF',
    heroTitle1: 'Kuasai keuangan Anda,',
    heroTitle2: 'dengan presisi bertenaga AI.',
    heroSubtitle: 'Foto struk, catat transaksi, dan pantau modal Anda tanpa repot. Ditenagai Google Gemini AI, dirancang untuk manajemen kekayaan yang cermat dan transparan.',
    heroGetStarted: 'Mulai Gratis Sekarang',

    featuresSectionTitle: 'Instrumen Presisi untuk Kekayaan Anda.',
    featuresSectionSubtitle: 'Setiap fitur dirancang dengan kejernihan seperti buku besar premium.',

    feature1Title: '✨ Scanner Struk AI',
    feature1Desc: 'Didukung Gemini AI, scanner kami mengekstrak item, pajak, dan info merchant dengan akurasi 99,9%. Tidak perlu lagi input manual.',
    feature2Title: '📊 Tampilan Spreadsheet',
    feature2Desc: 'Familiar namun powerful. Rasakan grid data berkinerja tinggi yang menangani ribuan baris dengan filter instan dan tampilan pivot.',
    feature3Title: '💰 Pelacakan Multi-Aset',
    feature3Desc: 'Dari Solana dan Bitcoin hingga Emas fisik dan saham konvensional. Sinkronkan seluruh portofolio Anda dalam satu dasbor terpadu.',

    ctaTitle: 'Siap mengambil alih kendali waktu Anda?',
    ctaSubtitle: 'Bergabung dengan SnapFins hari ini dan ubah cara Anda melihat masa depan finansial.',
    ctaButton: 'Buat Akun Gratis Anda',

    footerRights: '© 2026 0x5zen. Semua hak dilindungi.',
    privacyPolicy: 'Kebijakan Privasi',
    termsOfService: 'Syarat Layanan',
    support: 'Dukungan',

    // ---- AUTH MODAL ----
    signIn: 'Masuk',
    signInSubtitle: 'Pilih penyedia yang Anda inginkan untuk masuk ke akun SnapFins Anda dengan aman.',
    continueWithGoogle: 'Lanjutkan dengan Google',
    continueWithGithub: 'Lanjutkan dengan GitHub',

    // ---- DASHBOARD NAV ----
    navDashboard: 'Dasbor',
    navAsset: 'Aset',
    navAnalytics: 'Analitik',
    navSettings: 'Pengaturan',

    // ---- DASHBOARD HEADER ----
    financialOverview: 'Ringkasan Keuangan',
    liveStatus: 'Intelijen Keuangan (LANGSUNG)',
    manualEntry: 'Input Manual',
    scanReceipt: 'Scan Struk',

    // ---- SUMMARY CARDS ----
    totalNetWorth: 'Kekayaan Bersih',
    monthlyIncome: 'Pemasukan Bulan Ini',
    monthlyExpense: 'Pengeluaran Bulan Ini',
    fromLastMonth: '+4.2% dari bulan lalu',
    nextPayout: 'Pembayaran berikutnya dalam 4 hari',
    overBudget: '12% di atas batas anggaran',

    // ---- TRANSACTION TABLE ----
    recentLedger: 'Riwayat Transaksi Terkini',
    colDate: 'Tanggal',
    colCategory: 'Kategori',
    colDescription: 'Deskripsi',
    colType: 'Tipe',
    colAmount: 'Jumlah',
    colLinkedAssets: 'Aset Terkait',
    displayingResults: (n: number) => `Menampilkan ${n} dari ${n} hasil`,
    downloadCSV: 'Unduh CSV',
    noTransactions: 'Belum ada transaksi',
    noTransactionsHint: 'Tambahkan entri pertama Anda menggunakan Input Manual atau Scan Struk di atas.',
    aiScanned: 'SCANNED AI',

    // ---- MANUAL ENTRY MODAL ----
    manualEntryTitle: 'Input Manual',
    manualEntrySubtitle: 'Catat transaksi secara manual ke buku besar keuangan Anda.',
    labelDate: 'Tanggal',
    labelAmount: 'Jumlah',
    labelDescription: 'Deskripsi',
    labelCategory: 'Kategori',
    labelType: 'Tipe',
    labelSource: 'Sumber (Opsional)',
    placeholderDescription: 'Toko Groceri',
    placeholderCategory: 'BELANJA',
    placeholderSource: 'Bank Mandiri',
    saveTransaction: 'Simpan Transaksi',
    saving: 'Menyimpan...',

    // ---- AI SCANNER OVERLAY ----
    analyzingReceipt: 'Menganalisis Struk',
    analyzingHint: 'Gemini AI sedang memeriksa dokumen Anda dan mengekstrak data merchant...',

    // ---- SCAN ERROR MODAL ----
    scanErrorTitle: 'Scan Gagal',
    scanErrorHint: 'AI kami tidak dapat memproses gambar.',
    tryAgainWithDifferent: 'Silakan coba dengan foto struk atau faktur yang jelas.',
    tryAgain: 'Coba Lagi',

    // ---- FOOTER DASHBOARD ----
    footerPrecision: '© 2026 0x5zen. Instrumen Kekayaan Presisi.',
  }
} as const;

export type TranslationKeys = keyof typeof translations.en;
