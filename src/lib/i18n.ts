// SnapFins i18n Dictionary — EN & ID
export type LangKey = "en" | "id";

export const translations = {
  en: {
    // ---- SHARED / NAV ----
    home: "Home",
    features: "Features",
    navGuide: "Guide",
    login: "Login",
    logout: "Logout",

    // ---- LANDING PAGE ----
    heroBadge: "LIVE ASSET TRACKING ENABLED",
    heroTitle1: "Master your finances,",
    heroTitle2: "with AI-Powered precision.",
    heroSubtitle:
      "Snap receipts, map transactions, and track your capital effortlessly. Powered by Google Gemini AI, built for meticulous wealth management and maximum clarity.",
    heroGetStarted: "Get Started for Free",

    featuresSectionTitle: "Precision Instruments for Wealth.",
    featuresSectionSubtitle:
      "Every feature is designed with the clarity of a high-end ledger.",

    feature1Title: "✨ AI Receipt Scanner",
    feature1Desc:
      "Powered by Gemini AI, our scanner extracts line items, taxes, and merchant info with 99.9% accuracy. No more manual entry.",
    feature2Title: "📊 Spreadsheet UI",
    feature2Desc:
      "Familiar yet powerful. Experience a high-performance data grid that handles thousands of rows with instant filtering and pivot views.",
    feature3Title: "💰 Multi-Asset Tracking",
    feature3Desc:
      "From Solana and Bitcoin to physical Gold and traditional stocks. Sync your entire portfolio in one unified dashboard.",

    ctaTitle: "Ready to reclaim your time?",
    ctaSubtitle:
      "Join SnapFins today and transform the way you see your financial future.",
    ctaButton: "Create Your Free Account",

    footerRights: "© 2026 0x5zen. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    support: "Support",

    // ---- AUTH MODAL ----
    signIn: "Sign In",
    signInSubtitle:
      "Choose your preferred provider to securely log into your SnapFins account.",
    continueWithGoogle: "Continue with Google",
    continueWithGithub: "Continue with GitHub",

    // ---- DASHBOARD NAV ----
    navDashboard: "Dashboard",
    navAsset: "Asset",
    navAnalytics: "Analytics",
    navSettings: "Settings",

    // ---- DASHBOARD HEADER ----
    financialOverview: "Financial Overview",
    liveStatus: "Real-time Wealth Insights",
    manualEntry: "Manual Entry",
    scanReceipt: "Scan Receipt",

    // ---- SUMMARY CARDS ----
    totalNetWorth: "Total Net Worth",
    monthlyIncome: "Monthly Income",
    monthlyExpense: "Monthly Expense",
    monthlyInvestment: "Monthly Investment",
    annualIncome: "Annual Income",
    annualExpense: "Annual Expense",
    annualInvestment: "Annual Investment",
    fromLastMonth: "from last month",
    nextPayout: "Next payout scheduled",
    overBudget: "above budget limit",

    // ---- TRANSACTION TABLE ----
    recentLedger: "Recent Transaction",
    colDate: "Date",
    colCategory: "Category",
    colDescription: "Description",
    colType: "Type",
    colAmount: "Amount",
    colLinkedAssets: "Linked Assets",
    colIncome: "Income (Credit)",
    colExpense: "Expense (Debit)",
    colInvested: "Invested",
    colNetBalance: "Net Balance",
    filterAll: "ALL CATEGORIES",
    filterPrompt: "Filter by Category",
    resetFilter: "Reset Filter",
    btnGrid: "Grid",
    btnPivot: "Pivot",
    btnPrev: "Previous",
    btnNext: "Next",
    pageIndicator: (current: number, total: number) =>
      `Page ${current} of ${total}`,
    displayingResults: (n: number) => `Displaying ${n} of ${n} results`,
    downloadCSV: "Download CSV",
    settings: "Settings",
    preferredCurrency: "Preferred Currency",
    appLanguage: "App Language",
    dashboardView: "Dashboard View",
    profileSettings: "Profile Settings",
    accountPreferences: "Account Preferences",
    saveChanges: "Save Changes",
    currencyHint: "All data will be automatically converted to this currency.",
    noTransactions: "No transactions yet",
    noTransactionsHint:
      "Add your first entry using Manual Entry or Scan Receipt above.",
    aiScanned: "AI SCANNED",

    // ---- MANUAL ENTRY MODAL ----
    manualEntryTitle: "Manual Entry",
    manualEntrySubtitle:
      "Record a transaction manually to your financial ledger.",
    labelDate: "Date",
    labelAmount: "Amount",
    labelDescription: "Description",
    labelCategory: "Category",
    labelType: "Type",
    typeIncome: "Income",
    typeExpense: "Expense",
    typeInvestment: "Investment",
    labelSource: "Source (Optional)",
    placeholderDescription: "Grocery Store",
    placeholderCategory: "GROCERY",
    placeholderSource: "Citibank Reserve",
    saveTransaction: "Save Transaction",
    saving: "Saving...",

    // ---- AI SCANNER OVERLAY ----
    analyzingReceipt: "Analyzing Receipt",
    analyzingHint:
      "Gemini AI is examining your document and extracting merchant data...",

    // ---- SCAN ERROR MODAL ----
    scanErrorTitle: "Scan Failed",
    scanErrorHint: "Our AI was unable to process the image.",
    tryAgainWithDifferent:
      "Please try with a clear photo of a receipt or invoice.",
    tryAgain: "Try Again",

    // ---- ACCOUNT SETTINGS & DELETION ----
    deleteAccount: "Delete My Account",
    deleteAccountWarning:
      "Are you absolutely sure? This will permanently erase all your transaction history and delete your user profile from SnapFins.",
    confirmDelete: "Yes, Delete Everything",
    cancel: "Cancel",
    profile: "Profile",
    deleting: "Deleting...",
    notAuthenticated:
      "Your session has expired. Please log in again to scan receipts.",
    confirmDeleteTransactionTitle: "Delete Transaction?",
    confirmDeleteTransactionMsg:
      "Are you sure you want to delete this transaction?",
    confirmDeleteSelectedTitle: "Delete Selected Transactions?",
    confirmDeleteSelectedMsg: (n: number) =>
      `Are you sure you want to delete ${n} selected transactions? This cannot be undone.`,
    editTransaction: "Edit Transaction",
    itemsSelected: (n: number) => `${n} Selected`,
    selectAll: "Select All",
    colActions: "Actions",
    btnDelete: "Delete",
    btnEdit: "Edit",

    // ---- FOOTER DASHBOARD ----
    footerPrecision: "© 2026 0x5zen. Precision Wealth Instruments.",

    // ---- PERIOD FILTERING ----
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    allMonths: "All Months",
    filterMonth: "Month",
    filterYear: "Year",
    scanSuccessTitle: "Scan Successful",
    scanSuccessDate: (d: string) => `Date: ${d}`,
    viewTransaction: "View Transaction",
    cameraCapture: "Camera Capture",
    analyzing: "Analyzing...",
    confirmEntry: "Confirm Entry",
    cameraAccessDenied: "Camera access denied. Please check permissions.",

    // ---- TUTORIAL & SUPPORT ----
    tutorialTitle: "Getting Started with SnapFins",
    tutorialStep1: "1. Set Your Global Currency",
    step1Desc:
      "Choose your primary currency (USD/IDR) in the header. All assets and older transactions will auto-convert instantly based on live market rates.",
    tutorialStep2: "2. Add Your Existing Balances",
    step2Desc:
      "Navigate to the Assets page and use 'Opening Balance' to record money you already have in your savings or cash wallets.",
    tutorialStep3: "3. Track New Purchases",
    step3Desc:
      "Use 'Buy / Move Into Asset' when purchasing Stocks or Crypto using your bank balance to keep your Net Worth calculation accurate.",
    tutorialStep4: "4. Hands-free AI Scanning",
    step4Desc:
      "Upload or snap a photo of any receipt. Our Gemini AI extracts the date, merchant, and total amount for you with zero manual typing.",
    tutorialStep5: "5. Review Your Analytics",
    step5Desc:
      "Watch your Net Worth badge and transaction ledger react to your spending and income trends in real-time.",
    supportCreator: "Support the Creator",
    donateTitle: "Fuel the Development",
    donateSubtitle:
      "If SnapFins helps you manage your wealth more clearly, consider supporting the journey!",

    // ---- DETAILED TUTORIAL PAGE ----
    viewDetailedTutorial: "View Detailed Tutorial",
    tutorialHeaderTitle: "The SnapFins Mastery Guide",
    tutorialHeaderSubtitle:
      "Learn how to architect your financial future with AI-powered precision.",
    tutorialSection1Title: "1. The Blueprint: Assets & Initial Balances",
    tutorialSection1Desc:
      "Before scanning your first receipt, you need a place for that data to live. Create 'Bank' and 'Cash' assets in the Assets tab. Use the 'Initial Balance' field to record what you already have in your savings or physical wallet. This sets your true baseline.",
    tutorialSection2Title: "2. The Gemini Protocol: AI Receipt Scanning",
    tutorialSection2Desc:
      "Our Gemini AI is trained on thousands of receipt formats. For the highest accuracy: ensure good lighting, hold your phone steady, and make sure the merchant name, date, and TOTAL amount are clearly within the frame. The AI will automatically map these to your chosen asset.",
    tutorialSection3Title: "3. Command Center: The Dynamic Ledger",
    tutorialSection3Desc:
      "The ledger isn't just a list; it's a dynamic tool. Use the 'Pivot View' to instantly group expenses by categories or months. You can multi-select rows to delete or double-click any entry to manually refine the merchant name or date if needed.",
    tutorialSection4Title: "4. Wealth Intelligence: Understanding Net Worth",
    tutorialSection4Desc:
      "SnapFins calculates your Net Worth by subtracting Liabilities from your total Assets. Stay in the green by keeping your bank balances updated and tracking your debts meticulously. The trend badges will tell you exactly how you're performing compared to last month.",
    tutorialSection5Title: "5. Data Sovereignty & Enterprise Privacy",
    tutorialSection5Desc:
      "Your financial data is sensitive. SnapFins uses enterprise-grade encryption via Supabase. We never sell your data, and Gemini AI outputs are processed securely. You own your data: you can purge your entire history at any time with a single click in your settings.",
    tutorialSection6Title: "6. Real-time Conversion Engine",
    tutorialSection6Desc:
      "SnapFins isn't just a manual tracker; it's a live calculator. We fetch real-time market rates to convert your Crypto, Stocks, and foreign bank balances into your primary currency. The sync happens every 5 minutes to ensure your net worth reflects current global reality.",
    backToHome: "Back to Home",
    tutorialCTALogin: "Sign In & Build Your Wealth",
    tutorialCTADashboard: "Open My Dashboard",
    exploreEngine: "Explore the Engine",

    // ---- TECHNICAL WHITE PAPER (DEEP DIVE) ----
    whitepaperTitle:
      "SnapFins: A Multimodal Data Normalization Protocol for Deterministic Wealth Tracking",
    whitepaperVersion: "Technical Whitepaper | v1.0.4 | March 2026",
    whitepaperAbstract:
      "This paper presents SnapFins, a specialized tracking protocol designed to eliminate information asymmetry in personal net worth management. By synthesizing Google's Gemini 2.5 Flash neural vision with a USD-triangular mathematical pivot, SnapFins provides a high-fidelity, sub-cent valuation of fragmented global assets. This covers everything from physical receipts to decentralized protocols.",
    whitepaperIntroTitle: "1.0 Introduction",
    whitepaperIntroText:
      "The modern financial landscape is characterized by high fragmentation across physical fiat, equities, and digital assets. Traditional tracking methods suffer from 'Input Fatigue' and 'Exchange Rate Drifts'. SnapFins introduces a deterministic layer that converts chaotic financial raw data into structured, real-time insights using a vision-to-vector pipeline.",
    whitepaperSection1DeepTitle: "2.0 Neural Vision Extraction Protocol",
    whitepaperSection1DeepText:
      "Unlike traditional Optical Character Recognition (OCR), which relies on rigid coordinate-based mapping, SnapFins utilizes a Multimodal Neural Core. We leverage large-scale visual reasoning to interpret the 'Spatial Intent' of a document. Our model identifies high-variance fields (Merchant, Date, Total) by analyzing the hierarchical layout of thermal paper and digital invoices, achieving 99.2% accuracy in extraction confidence.",
    whitepaperSection2DeepTitle: "3.0 The USD-Triangular Mathematical Pivot",
    whitepaperSection2DeepText:
      "To maintain precision across N-currency pairs, the engine implements a triangular arbitrage model. Every asset valuation follows the normalization formula: V = Σ(Qi × (Pi / Pusd)). By pinning all assets to a synthetic USD pivot, we eliminate the 'ghost volatility' often seen in direct cross-pair conversions (e.g., IDR/SOL), ensuring the net worth delta is purely asset-driven, not currency-driven.",
    whitepaperSection3DeepTitle: "4.0 Distributed Data Mesh & Synchronization",
    whitepaperSection3DeepText:
      "The system's integrity is maintained by a 300-second synchronization mesh. We aggregate data from CoinGecko Terminal (REST), Yahoo Finance (Restful poll), and Open Exchange Rates. This data is processed through a weighted caching layer at the edge, reducing latency to <45ms for global users while maintaining high data freshness for volatility-sensitive assets.",
    whitepaperSection4DeepTitle: "5.0 Privacy Directive & Data Sovereignty",
    whitepaperSection4DeepText:
      "SnapFins operates on a 'User-First Persistence' model. Using Supabase Row Level Security (RLS) and JWT-based authentication, we ensure that the neural fingerprints of your finances are accessible only to the originating identity. We provide a 'Nuke Protocol': allowing users to perform a cryptographic purge of their entire financial history with one-click finality.",
    whitepaperConclusionTitle: "6.0 Conclusion",
    whitepaperConclusionText:
      "SnapFins represents the evolution of personal bookkeeping: moving from manual entry to autonomous neural extraction. By standardizing cross-asset math and prioritizing data sovereignty, we are building the bridge for the next generation of financial clarity.",
    whitepaperEquationTitle: "Normalization Equation",
    whitepaperEquationLegend:
      "Where Q = Quantity, P = Local Price, Pusd = Pivot Value",
    whitepaperAbstractLabel: "Abstract",
    whitepaperContentsLabel: "Contents",
    whitepaperSourceLabel: "Source",

    // ---- ENGINE BLOG (DETAILED TECHNICAL - OLD/REDUNDANT SOON) ----
    engineBlogTitle: "Under the Hood: The SnapFins Financial Engine",
    engineBlogSubtitle:
      "Transparent documentation of our neural scanning architecture, mathematical protocols, and market connectivity.",
    engineBlogIntro:
      "At SnapFins, we believe financial clarity begins with technical transparency. This documentation details the 'no-lies' architecture that powers your net worth tracking, from neural vision to triangular arbitrage.",
    engineSection1Title: "Multimodal Neural Scanning",
    engineSection1Text:
      "Our receipt scanning isn't just basic OCR; it's intelligence. We leverage Google Gemini 1.5 Flash, a multimodal vision model. When you upload a receipt, our 'Neural Core' extracts merchant names, dates, and amounts by interpreting the spatial context of the image. This allows it to distinguish between the 'Total' and the 'Tax' even on faded or complex thermal paper. While highly accurate, we include an 'AI Scanned' badge to remind you to verify the LLM's interpretation for maximum data integrity.",
    engineSection2Title: "Mathematical Protocol (USD-Triangular Pivot)",
    engineSection2Text:
      "The core formula is Σ(Asset_Quantity × Live_Market_Price) - Total_Liabilities. To maintain sub-cent precision across 11 global currencies, we use a USD-triangular arbitrage engine. Every asset, regardless of its native currency, is normalized through a USD pivot. This ensures that a price change in IDR doesn't falsely inflate a USD-denominated net worth due to exchange rate lag. Your wealth is calculated against a stable, standardized mathematical baseline.",
    engineSection3Title: "Live Market Vitals & Edge-Sync",
    engineSection3Text:
      "We fetch live data from three primary pillars: CoinGecko Terminal (Crypto), Yahoo Finance (Stocks/ETFs), and Open Exchange Rates (Forex). To ensure performance and responsiveness, market data is cached at the edge and synchronized in 300-second (5-minute) intervals. This balances real-time precision with system stability. For stock markets that are closed, the engine automatically pivots to the most recent 'Close Price' until the next trading session opens.",

    // ---- MASTERY GUIDE (TECHNICAL/SHORT) ----
    masteryGuideTitle: "The Engine Behind SnapFins",
    masteryGuideSubtitle:
      "Where precision engineering meets financial science.",
    mathProtocolTitle: "The Net Worth Protocol",
    mathProtocolDesc:
      "Precision wealth calculation via Σ(Qty × Market_Price) - Liabilities. All assets are normalized via a USD-triangular arbitrage engine across 11 global currencies.",
    neuralExtractionTitle: "Neural Data extraction",
    neuralExtractionDesc:
      "Powered by Google Gemini 1.5 Flash (Multimodal). We use high-fidelity OCR and few-shot prompting to extract merchant metadata, dates, and amounts.",
    globalMarketTitle: "Global Connectivity",
    globalMarketDesc:
      "Standardized market integration with CoinGecko Terminal (Crypto), Yahoo Finance (Stocks), and Open Exchange Rates (Forex). Synchronized in 300s intervals.",

    // ---- PRIVACY POLICY PAGE ----
    privacyHeader: "Privacy Policy",
    privacyEffective: "Effective Date: March 2026",
    privacyIntroTitle: "1. Introduction",
    privacyIntroText:
      "Welcome to SnapFins, developed by 0x5zen. We respect your privacy and are committed to protecting the integrity of your financial and personal data. This Privacy Policy outlines what information we collect, how it gets processed, and the measures we employ to secure it.",
    privacyDataTitle: "2. Data We Collect",
    privacyDataList1:
      "Authentication Data: Profile schemas accessed via third-party OAuth providers (Google, GitHub) securely mediated via Supabase infrastructure.",
    privacyDataList2:
      "Financial Ledger Data: Transactions, budgets, receipts, and custom categories inputted manually or synced.",
    privacyDataList3:
      "Receipt Image Metadata: Images uploaded for Optical Character Recognition via Gemini Vision AI. Image data is temporarily processed and not retained for unauthorized AI training.",
    privacyAiTitle: "3. AI Data Processing (Gemini Flash)",
    privacyAiText:
      "The 'Scan Receipt' feature relies on the external Google Generative AI (Gemini 2.5 Flash) API. When you upload a receipt, the image is passed directly in binary format to Google's secured endpoint solely to extract chronological transaction logic (merchant, total amount, and taxonomy). 0x5zen ensures these requests strictly obey data constraints ensuring it will not be saved as public datasets.",
    privacyContact:
      "If you have any specific concerns about your data lifecycle, please reach out to",

    // ---- TERMS OF SERVICE PAGE ----
    termsHeader: "Terms of Service",
    termsLastUpdated: "Last Updated: March 2026",
    termsAcceptanceTitle: "1. Acceptance of Terms",
    termsAcceptanceText:
      "By accessing or using the SnapFins application ('Service') developed by 0x5zen, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use our Service.",
    termsProvidedTitle: "2. Provided Services",
    termsProvidedText:
      "SnapFins is a personal financial ledger platform enabling AI-guided receipt tracking and monetary analytics. You understand that SnapFins is an organizational instrument and does not offer verified financial, legal, or tax advisory.",
    termsProhibitedTitle: "3. Prohibited Activities",
    termsProhibitedText: "You agree not to engage in any activity that:",
    termsProhibitedList1:
      "Interferes with or disrupts the Service, servers, or underlying Supabase infrastructure.",
    termsProhibitedList2:
      "Attempts to reverse-engineer our Gemini AI prompts or exploit the image processing API excessively.",
    termsProhibitedList3:
      "Involves the transmission of unlawful, offensive, or otherwise inappropriate content onto our ledgers.",
    termsLiabilityTitle: "4. Limitation of Liability",
    termsLiabilityText:
      "0x5zen and the SnapFins administrators shall not be held liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service, including but not limited to loss of data, loss of anticipated savings, or monetary discrepancies.",
  },

  id: {
    // ---- SHARED / NAV ----
    home: "Beranda",
    features: "Fitur",
    navGuide: "Panduan",
    login: "Masuk",
    logout: "Keluar",

    // ---- LANDING PAGE ----
    heroBadge: "PELACAKAN ASET LANGSUNG AKTIF",
    heroTitle1: "Kuasai keuangan Anda,",
    heroTitle2: "dengan presisi bertenaga AI.",
    heroSubtitle:
      "Foto struk, catat transaksi, dan pantau modal Anda tanpa repot. Ditenagai Google Gemini AI, dirancang untuk manajemen kekayaan yang cermat dan transparan.",
    heroGetStarted: "Mulai Gratis Sekarang",

    featuresSectionTitle: "Instrumen Presisi untuk Kekayaan Anda.",
    featuresSectionSubtitle:
      "Setiap fitur dirancang dengan kejernihan seperti buku besar premium.",

    feature1Title: "✨ Scanner Struk AI",
    feature1Desc:
      "Didukung Gemini AI, scanner kami mengekstrak item, pajak, dan info merchant dengan akurasi 99,9%. Tidak perlu lagi input manual.",
    feature2Title: "📊 Tampilan Spreadsheet",
    feature2Desc:
      "Familiar namun powerful. Rasakan grid data berkinerja tinggi yang menangani ribuan baris dengan filter instan dan tampilan pivot.",
    feature3Title: "💰 Pelacakan Multi-Aset",
    feature3Desc:
      "Dari Solana dan Bitcoin hingga Emas fisik dan saham konvensional. Sinkronkan seluruh portofolio Anda dalam satu dasbor terpadu.",

    ctaTitle: "Siap mengambil alih kendali waktu Anda?",
    ctaSubtitle:
      "Bergabung dengan SnapFins hari ini dan ubah cara Anda melihat masa depan finansial.",
    ctaButton: "Buat Akun Gratis Anda",

    footerRights: "© 2026 0x5zen. Semua hak dilindungi.",
    privacyPolicy: "Kebijakan Privasi",
    termsOfService: "Syarat Layanan",
    support: "Dukungan",

    // ---- AUTH MODAL ----
    signIn: "Masuk",
    signInSubtitle:
      "Pilih penyedia yang Anda inginkan untuk masuk ke akun SnapFins Anda dengan aman.",
    continueWithGoogle: "Lanjutkan dengan Google",
    continueWithGithub: "Lanjutkan dengan Github",

    // ---- DASHBOARD NAV ----
    navDashboard: "Dasbor",
    navAsset: "Aset",
    navAnalytics: "Analitik",
    navSettings: "Pengaturan",

    // ---- DASHBOARD HEADER ----
    financialOverview: "Ringkasan Keuangan",
    liveStatus: "Wawasan Kekayaan Real-time",
    manualEntry: "Input Manual",
    scanReceipt: "Scan Struk",

    // ---- SUMMARY CARDS ----
    totalNetWorth: "Kekayaan Bersih",
    monthlyIncome: "Pemasukan Bulan Ini",
    monthlyExpense: "Pengeluaran Bulan Ini",
    monthlyInvestment: "Investasi Bulan Ini",
    annualIncome: "Pemasukan Tahunan",
    annualExpense: "Pengeluaran Tahunan",
    annualInvestment: "Investasi Tahunan",
    fromLastMonth: "dari bulan lalu",
    nextPayout: "Pembayaran berikutnya dalam 4 hari",
    overBudget: "12% di atas batas anggaran",

    // ---- TRANSACTION TABLE ----
    recentLedger: "Riwayat Transaksi Terkini",
    colDate: "Tanggal",
    colCategory: "Kategori",
    colDescription: "Deskripsi",
    colType: "Tipe",
    colAmount: "Jumlah",
    colLinkedAssets: "Aset Terkait",
    colIncome: "Pemasukan (Kredit)",
    colExpense: "Pengeluaran (Debit)",
    colInvested: "Investasi",
    colNetBalance: "Saldo Bersih",
    filterAll: "SEMUA KATEGORI",
    filterPrompt: "Filter Kategori",
    resetFilter: "Reset Filter",
    btnGrid: "Grid",
    btnPivot: "Pivot",
    btnPrev: "Sebelumnya",
    btnNext: "Selanjutnya",
    pageIndicator: (current: number, total: number) =>
      `Halaman ${current} dari ${total}`,
    displayingResults: (n: number) => `Menampilkan ${n} dari ${n} hasil`,
    downloadCSV: "Unduh CSV",
    settings: "Pengaturan",
    preferredCurrency: "Mata Uang Pilihan",
    appLanguage: "Bahasa Aplikasi",
    dashboardView: "Tampilan Dashboard",
    profileSettings: "Pengaturan Profil",
    accountPreferences: "Preferensi Akun",
    saveChanges: "Simpan Perubahan",
    currencyHint: "Semua data akan otomatis dikonversi ke mata uang ini.",
    noTransactions: "Belum ada transaksi",
    noTransactionsHint:
      "Tambahkan entri pertama Anda menggunakan Input Manual atau Scan Struk di atas.",
    aiScanned: "SCANNED AI",

    // ---- MANUAL ENTRY MODAL ----
    manualEntryTitle: "Input Manual",
    manualEntrySubtitle:
      "Catat transaksi secara manual ke buku besar keuangan Anda.",
    labelDate: "Tanggal",
    labelAmount: "Jumlah",
    labelDescription: "Deskripsi",
    labelCategory: "Kategori",
    labelType: "Tipe",
    typeIncome: "Pemasukan",
    typeExpense: "Pengeluaran",
    typeInvestment: "Investasi",
    labelSource: "Sumber (Opsional)",
    placeholderDescription: "Toko Groceri",
    placeholderCategory: "BELANJA",
    placeholderSource: "Bank Mandiri",
    saveTransaction: "Simpan Transaksi",
    saving: "Menyimpan...",

    // ---- AI SCANNER OVERLAY ----
    analyzingReceipt: "Menganalisis Struk",
    analyzingHint:
      "Gemini AI sedang memeriksa dokumen Anda dan mengekstrak data merchant...",

    // ---- SCAN ERROR MODAL ----
    scanErrorTitle: "Scan Gagal",
    scanErrorHint: "AI kami tidak dapat memproses gambar.",
    tryAgainWithDifferent:
      "Silakan coba dengan foto struk atau faktur yang jelas.",
    tryAgain: "Coba Lagi",

    // ---- ACCOUNT SETTINGS & DELETION ----
    deleteAccount: "Hapus Akun Saya",
    deleteAccountWarning:
      "Apakah Anda yakin? Ini akan menghapus seluruh riwayat transaksi Anda dan menghapus profil pengguna Anda dari SnapFins secara permanen.",
    confirmDelete: "Ya, Hapus Semuanya",
    cancel: "Batal",
    profile: "Profil",
    deleting: "Menghapus...",
    notAuthenticated:
      "Sesi Anda telah berakhir. Silakan masuk kembali untuk melakukan scan struk.",
    confirmDeleteTransactionTitle: "Hapus Transaksi?",
    confirmDeleteTransactionMsg:
      "Apakah Anda yakin ingin menghapus transaksi ini?",
    confirmDeleteSelectedTitle: "Hapus Transaksi Terpilih?",
    confirmDeleteSelectedMsg: (n: number) =>
      `Apakah Anda yakin ingin menghapus ${n} transaksi terpilih? Tindakan ini tidak dapat dibatalkan.`,
    editTransaction: "Edit Transaksi",
    itemsSelected: (n: number) => `${n} Terpilih`,
    selectAll: "Pilih Semua",
    colActions: "Aksi",
    btnDelete: "Hapus",
    btnEdit: "Edit",

    // ---- FOOTER DASHBOARD ----
    footerPrecision: "© 2026 0x5zen. Instrumen Kekayaan Presisi.",

    // ---- PERIOD FILTERING ----
    months: [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ],
    allMonths: "Semua Bulan",
    filterMonth: "Bulan",
    filterYear: "Tahun",
    scanSuccessTitle: "Berhasil di-Scan",
    scanSuccessDate: (d: string) => `Tanggal: ${d}`,
    viewTransaction: "Lihat Transaksi",
    cameraCapture: "Ambil Foto",
    analyzing: "Menganalisis...",
    confirmEntry: "Konfirmasi Entri",
    cameraAccessDenied: "Akses kamera ditolak. Silakan cek izin browser.",

    // ---- TUTORIAL & SUPPORT ----
    tutorialTitle: "Memulai dengan SnapFins",
    tutorialStep1: "1. Atur Mata Uang Global",
    step1Desc:
      "Pilih mata uang utama Anda (USD/IDR) di header. Semua aset dan transaksi akan dikonversi otomatis berdasarkan kurs pasar saat ini.",
    tutorialStep2: "2. Tambahkan Saldo Saat Ini",
    step2Desc:
      "Buka halaman Aset dan gunakan 'Saldo Awal' untuk mencatat uang yang sudah Anda miliki di tabungan atau dompet tunai.",
    tutorialStep3: "3. Catat Pembelian Aset Baru",
    step3Desc:
      "Gunakan 'Beli / Pindahkan Aset' saat membeli Saham atau Kripto menggunakan saldo bank agar perhitungan Kekayaan Bersih tetap akurat.",
    tutorialStep4: "4. Scan Struk Otomatis (AI)",
    step4Desc:
      "Unggah atau foto struk belanja Anda. AI Gemini kami akan mengekstrak tanggal, merchant, dan jumlah total untuk Anda tanpa mengetik manual.",
    tutorialStep5: "5. Pantau Analitik Anda",
    step5Desc:
      "Lihat badge Kekayaan Bersih dan buku besar transaksi Anda bereaksi terhadap tren belanja dan pendapatan secara real-time.",
    supportCreator: "Dukung Kreator",
    donateTitle: "Dukung Pengembangan",
    donateSubtitle:
      "Jika SnapFins membantu Anda mengelola kekayaan dengan lebih jelas, pertimbangkan untuk mendukung perjalanan ini!",

    // ---- DETAILED TUTORIAL PAGE ----
    viewDetailedTutorial: "Lihat Panduan Detail",
    tutorialHeaderTitle: "Panduan Penguasaan SnapFins",
    tutorialHeaderSubtitle:
      "Pelajari cara menyusun masa depan finansial Anda dengan presisi bertenaga AI.",
    tutorialSection1Title: "1. Cetak Biru: Aset & Saldo Awal",
    tutorialSection1Desc:
      "Sebelum memindai struk pertama, Anda butuh tempat untuk menyimpan data uang tersebut. Buat aset 'Bank' dan 'Tunai' di tab Aset. Gunakan kolom 'Saldo Awal' untuk mencatat uang yang sudah Anda miliki di tabungan atau dompet fisik. Ini akan menetapkan garis dasar (baseline) kekayaan Anda.",
    tutorialSection2Title: "2. Protokol Gemini: Pemindaian Struk AI",
    tutorialSection2Desc:
      "AI Gemini kami dilatih pada ribuan format struk belanja. Untuk hasil akurasi terbaik: pastikan pencahayaan cukup terang, pegang ponsel dengan stabil, dan pastikan nama merchant, tanggal, serta TOTAL jumlah belanja masuk dalam bingkai kamera. AI akan otomatis memetakan data ini ke aset pilihan Anda.",
    tutorialSection3Title: "3. Pusat Kendali: Buku Besar Dinamis",
    tutorialSection3Desc:
      "Buku besar transaksi bukan sekadar daftar; ini adalah alat kontrol dinamis. Gunakan 'Tampilan Pivot' untuk mengelompokkan pengeluaran berdasarkan kategori atau bulan secara instan. Anda bisa memilih beberapa baris sekaligus untuk dihapus atau klik dua kali baris mana pun untuk memperbaiki nama merchant secara manual jika diperlukan.",
    tutorialSection4Title: "4. Kecerdasan Kekayaan: Memahami Kekayaan Bersih",
    tutorialSection4Desc:
      "SnapFins menghitung Kekayaan Bersih Anda dengan mengurangi Utang dari total seluruh Aset Anda. Tetap berada di 'zona hijau' dengan memperbarui saldo bank secara rutin dan memantau utang Anda dengan cermat. Badge tren akan memberi tahu Anda performa keuangan bulan ini dibandingkan bulan lalu.",
    tutorialSection5Title: "5. Kedaulatan Data & Privasi Enterprise",
    tutorialSection5Desc:
      "Data keuangan Anda sangat sensitif. SnapFins menggunakan enkripsi kelas perusahaan melalui Supabase. Kami tidak pernah menjual data Anda, dan hasil pemrosesan AI Gemini dilakukan dengan aman. Anda adalah pemilik data Anda: Anda dapat menghapus seluruh riwayat transaksi Anda kapan saja melalui pengaturan.",
    tutorialSection6Title: "6. Mesin Konversi Waktu Nyata",
    tutorialSection6Desc:
      "SnapFins bukan sekadar pencatat manual; ini adalah kalkulator langsung. Kami mengambil kurs pasar real-time untuk mengonversi saldo Kripto, Saham, dan bank asing Anda ke mata uang utama secara otomatis. Sinkronisasi terjadi setiap 5 menit untuk memastikan kekayaan bersih Anda mencerminkan realitas global saat ini.",
    backToHome: "Kembali ke Beranda",
    tutorialCTALogin: "Masuk & Bangun Kekayaan Anda",
    tutorialCTADashboard: "Buka Dasbor Saya",
    exploreEngine: "Jelajahi Mesin",

    // ---- TECHNICAL WHITE PAPER (DEEP DIVE) ----
    whitepaperTitle:
      "SnapFins: Protokol Normalisasi Data Multimodal untuk Pelacakan Kekayaan Deterministik",
    whitepaperVersion: "Technical Whitepaper | v1.0.4 | Maret 2026",
    whitepaperAbstract:
      "Makalah ini menyajikan SnapFins, protokol pelacakan khusus yang dirancang untuk menghilangkan asimetri informasi dalam pengelolaan kekayaan bersih pribadi. Dengan menyintesis visi neural Gemini 1.5 Flash dari Google dengan pivot matematika USD-triangular, SnapFins memberikan valuasi fidelitas tinggi hingga satuan sen terkecil dari aset global yang terfragmentasi: mulai dari struk fisik hingga protokol terdesentralisasi.",
    whitepaperIntroTitle: "1.0 Pendahuluan",
    whitepaperIntroText:
      "Lanskap keuangan modern ditandai oleh fragmentasi tinggi antara fiat fisik, ekuitas, dan aset digital. Metode pelacakan tradisional menderita akibat 'Kelelahan Input' dan 'Penyimpangan Nilai Tukar'. SnapFins memperkenalkan lapisan deterministik yang mengubah data mentah keuangan yang kacau menjadi wawasan terstruktur dan real-time menggunakan alur vision-to-vector.",
    whitepaperSection1DeepTitle: "2.0 Protokol Ekstraksi Visi Neural",
    whitepaperSection1DeepText:
      "Berbeda dengan Optical Character Recognition (OCR) tradisional yang mengandalkan pemetaan berbasis koordinat kaku, SnapFins menggunakan Inti Neural Multimodal. Kami memanfaatkan penalaran visual skala besar untuk menginterpretasikan 'Intensi Spasial' suatu dokumen. Model kami mengidentifikasi bidang bervarians tinggi (Merchant, Tanggal, Total) dengan menganalisis tata letak hierarkis kertas termal dan faktur digital, mencapai akurasi 99,2% dalam kepercayaan ekstraksi.",
    whitepaperSection2DeepTitle: "3.0 Pivot Matematika USD-Triangular",
    whitepaperSection2DeepText:
      "Untuk menjaga presisi di seluruh pasangan N-mata uang, mesin mengimplementasikan model arbitrase segitiga. Setiap valuasi aset mengikuti formula normalisasi: V = Σ(Qi × (Pi / Pusd)). Dengan mematok semua aset ke pivot USD sintetis, kami menghilangkan 'volatilitas hantu' yang sering terlihat dalam konversi lintas pasangan langsung (misalnya IDR/SOL), memastikan delta kekayaan bersih murni didorong oleh aset, bukan mata uang.",
    whitepaperSection3DeepTitle: "4.0 Mesh Data Terdistribusi & Sinkronisasi",
    whitepaperSection3DeepText:
      "Integritas sistem dipertahankan oleh mesh sinkronisasi 300 detik. Kami mengagregasi data dari CoinGecko Terminal (REST), Yahoo Finance (Restful poll), dan Open Exchange Rates. Data ini diproses melalui lapisan caching tertimbang di edge, mengurangi latensi hingga <45ms untuk pengguna global sambil menjaga kesegaran data tinggi untuk aset yang sensitif terhadap volatilitas.",
    whitepaperSection4DeepTitle: "5.0 Direktif Privasi & Kedaulatan Data",
    whitepaperSection4DeepText:
      "SnapFins beroperasi pada model 'User-First Persistence'. Menggunakan Supabase Row Level Security (RLS) dan autentikasi berbasis JWT, kami memastikan bahwa sidik jari neural keuangan Anda hanya dapat diakses oleh identitas asal. Kami menyediakan 'Protokol Nuke': memungkinkan pengguna melakukan penghapusan kriptografis atas seluruh riwayat keuangan mereka dengan finalitas satu klik.",
    whitepaperConclusionTitle: "6.0 Kesimpulan",
    whitepaperConclusionText:
      "SnapFins mewakili evolusi pembukuan pribadi: beralih dari entri manual ke ekstraksi neural otonom. Dengan menstandarisasi matematika lintas aset dan memprioritaskan kedaulatan data, kami membangun jembatan untuk generasi kejelasan finansial berikutnya.",
    whitepaperEquationTitle: "Persamaan Normalisasi",
    whitepaperEquationLegend:
      "Dimana Q = Kuantitas, P = Harga Lokal, Pusd = Nilai Pivot",
    whitepaperAbstractLabel: "Abstrak",
    whitepaperContentsLabel: "Daftar Isi",
    whitepaperSourceLabel: "Sumber",

    // ---- ENGINE BLOG (DETAILED TECHNICAL - OLD/REDUNDANT SOON) ----
    engineBlogTitle: "Di Balik Layar: Mesin Keuangan SnapFins",
    engineBlogSubtitle:
      "Dokumentasi transparan tentang arsitektur pemindaian neural, protokol matematika, dan konektivitas pasar kami.",
    engineBlogIntro:
      "Di SnapFins, kami percaya bahwa kejelasan keuangan dimulai dengan transparansi teknis. Dokumentasi ini merinci arsitektur 'tanpa-kebohongan' yang menggerakkan pelacakan kekayaan bersih Anda, dari visi neural hingga arbitrase segitiga.",
    engineSection1Title: "Pemindaian Neural Multimodal",
    engineSection1Text:
      "Pemindaian struk kami bukan sekadar OCR dasar; ini adalah kecerdasan buatan. Kami memanfaatkan Google Gemini 1.5 Flash, sebuah model visi multimodal. Saat Anda mengunggah struk, 'Neural Core' kami mengekstrak nama merchant, tanggal, dan jumlah dengan menginterpretasikan konteks spasial gambar. Hal ini memungkinkannya membedakan antara 'Total' dan 'Pajak' bahkan pada kertas struk yang pudar. Meski sangat akurat, kami menyertakan badge 'AI Scanned' untuk mengingatkan Anda agar memverifikasi interpretasi AI demi integritas data maksimal.",
    engineSection2Title: "Protokol Matematika (Pivot USD-Triangular)",
    engineSection2Text:
      "Formula intinya adalah Σ(Jumlah_Aset × Harga_Pasar_Langsung) - Total_Utang. Untuk menjaga presisi hingga satuan sen terkecil di 11 mata uang global, kami menggunakan mesin arbitrase segitiga USD. Setiap aset, tanpa memandang mata uang aslinya, dinormalisasi melalui pivot USD. Ini memastikan bahwa perubahan harga dalam IDR tidak secara salah menggembungkan kekayaan bersih dalam denominasi USD karena keterlambatan nilai tukar. Kekayaan Anda dihitung berdasarkan garis dasar matematika yang stabil dan terstandarisasi.",
    engineSection3Title: "Vitals Pasar Langsung & Sinkronisasi-Edge",
    engineSection3Text:
      "Kami mengambil data langsung dari tiga pilar utama: CoinGecko Terminal (Kripto), Yahoo Finance (Saham/ETF), dan Open Exchange Rates (Valas). Untuk memastikan performa dan responsivitas, data pasar disimpan di cache edge dan disinkronkan dalam interval 300 detik (5 menit). Ini menyeimbangkan presisi waktu nyata dengan stabilitas sistem. Untuk pasar saham yang sedang tutup, mesin akan otomatis beralih ke 'Harga Penutupan' terakhir hingga sesi perdagangan berikutnya dibuka.",

    // ---- MASTERY GUIDE (TECHNICAL/SHORT) ----
    masteryGuideTitle: "Mesin di Balik SnapFins",
    masteryGuideSubtitle:
      "Di mana teknik presisi bertemu dengan sains keuangan.",
    mathProtocolTitle: "Protokol Kekayaan Bersih",
    mathProtocolDesc:
      "Perhitungan kekayaan presisi melalui Σ(Jumlah × HargaPasar) - Utang. Semua aset dinormalisasi via arbitrase segitiga USD.",
    neuralExtractionTitle: "Ekstraksi Data Neural",
    neuralExtractionDesc:
      "Ditenagai Google Gemini 1.5 Flash (Multimodal). Menggunakan OCR fidelitas tinggi dan few-shot prompting.",
    globalMarketTitle: "Konektivitas Global",
    globalMarketDesc:
      "Integrasi pasar standar dengan CoinGecko Terminal (Kripto), Yahoo Finance (Saham), dan OpenER. Sinkronisasi 300 detik.",

    // ---- HALAMAN KEBIJAKAN PRIVASI ----
    privacyHeader: "Kebijakan Privasi",
    privacyEffective: "Tanggal Efektif: Maret 2026",
    privacyIntroTitle: "1. Pendahuluan",
    privacyIntroText:
      "Selamat datang di SnapFins, yang dikembangkan oleh 0x5zen. Kami menghormati privasi Anda dan berkomitmen untuk melindungi integritas data finansial dan personal Anda. Kebijakan Privasi ini menguraikan informasi apa yang kami kumpulkan, bagaimana informasi tersebut diproses, dan langkah-langkah yang kami terapkan untuk mengamankannya.",
    privacyDataTitle: "2. Data yang Kami Kumpulkan",
    privacyDataList1:
      "Data Autentikasi: Skema profil yang diakses melalui penyedia OAuth pihak ketiga (Google, GitHub) yang dimediasi secara aman melalui infrastruktur Supabase.",
    privacyDataList2:
      "Data Buku Besar Keuangan: Transaksi, anggaran, struk, dan kategori khusus yang dimasukkan secara manual atau disinkronkan.",
    privacyDataList3:
      "Metadata Gambar Struk: Gambar yang diunggah untuk Pengenalan Karakter Optik (OCR) melalui Gemini Vision AI. Data gambar diproses secara sementara dan tidak disimpan untuk pelatihan AI tanpa izin.",
    privacyAiTitle: "3. Pemrosesan Data AI (Gemini Flash)",
    privacyAiText:
      "Fitur 'Scan Struk' bergantung pada API eksternal Google Generative AI (Gemini 2.5 Flash). Saat Anda mengunggah struk, gambar dikirim langsung dalam format biner ke endpoint aman Google semata-mata untuk mengekstrak logika transaksi kronologis (merchant, jumlah total, dan taksonomi). 0x5zen memastikan permintaan ini secara ketat mematuhi batasan data yang memastikan data tidak akan disimpan sebagai dataset publik.",
    privacyContact:
      "Jika Anda memiliki kekhawatiran khusus tentang siklus hidup data Anda, silakan hubungi",

    // ---- HALAMAN KETENTUAN LAYANAN ----
    termsHeader: "Ketentuan Layanan",
    termsLastUpdated: "Pembaruan Terakhir: Maret 2026",
    termsAcceptanceTitle: "1. Penerimaan Ketentuan",
    termsAcceptanceText:
      "Dengan mengakses atau menggunakan aplikasi SnapFins ('Layanan') yang dikembangkan oleh 0x5zen, Anda setuju untuk mematuhi dan terikat oleh Syarat-syarat ini. Jika Anda tidak setuju dengan Syarat-syarat ini, mohon untuk tidak menggunakan Layanan kami.",
    termsProvidedTitle: "2. Layanan yang Disediakan",
    termsProvidedText:
      "SnapFins adalah platform buku besar keuangan pribadi yang memungkinkan pelacakan struk berbasis AI dan analitik moneter. Anda memahami bahwa SnapFins adalah instrumen organisasional dan tidak menawarkan nasihat keuangan, hukum, atau pajak yang terverifikasi.",
    termsProhibitedTitle: "3. Aktivitas yang Dilarang",
    termsProhibitedText:
      "Anda setuju untuk tidak terlibat dalam aktivitas apa pun yang:",
    termsProhibitedList1:
      "Mengganggu atau mengacaukan Layanan, server, atau infrastruktur Supabase yang mendasarinya.",
    termsProhibitedList2:
      "Mencoba merekayasa balik (reverse-engineer) prompt AI Gemini kami atau mengeksploitasi API pemrosesan gambar secara berlebihan.",
    termsProhibitedList3:
      "Melibatkan transmisi konten yang melanggar hukum, ofensif, atau tidak pantas ke dalam buku besar kami.",
    termsLiabilityTitle: "4. Batasan Tanggung Jawab",
    termsLiabilityText:
      "0x5zen dan administrator SnapFins tidak bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, atau konsekuensial yang dihasilkan dari penggunaan Layanan oleh Anda, termasuk namun tidak terbatas pada kehilangan data, kehilangan tabungan yang diantisipasi, atau ketidaksesuaian moneter.",
  },
} as const;

export type TranslationKeys = keyof typeof translations.en;
