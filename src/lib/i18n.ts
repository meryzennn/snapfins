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
    tutorialSection1Title: "1. The Blueprint: Assets & Balances",
    tutorialSection1Desc:
      "Before you scan your first receipt, you need a place for the money to live. Create 'Bank' and 'Cash' assets in the Asset tab. Use 'Opening Balance' to record your current holdings.",
    tutorialSection2Title: "2. The Gemini Protocol: AI Scanning",
    tutorialSection2Desc:
      "Our Gemini AI is trained on thousands of receipt formats. For best results: ensures good lighting, keep the phone steady, and include the merchant name and total amount in the frame.",
    tutorialSection3Title: "3. Command Center: The Living Ledger",
    tutorialSection3Desc:
      "The ledger isn't just a list; it's a dynamic tool. Use 'Pivot View' to group expenses by category or month instantly. Double-click any row to edit details on the fly.",
    tutorialSection4Title: "4. Wealth Intelligence: Net Worth",
    tutorialSection4Desc:
      "SnapFins calculates your Net Worth by subtracting Liabilities from your total Assets. Stay in the green by keeping your bank balances updated and tracking your debts meticulously.",
    tutorialSection5Title: "5. Data Sovereignty & Privacy",
    tutorialSection5Desc:
      "Your financial data is sensitive. SnapFins uses enterprise-grade encryption via Supabase. We never sell your data, and results from Gemini AI are processed securely. You can delete your entire history at any time.",
    tutorialSection6Title: "6. The Conversion Engine",
    tutorialSection6Desc:
      "SnapFins isn't just a tracker; it's a live calculator. We fetch real-time market rates to convert your Crypto, Gold, and secondary bank balances into your primary currency automatically.",
    backToHome: "Back to Home",
    tutorialCTALogin: "Login to Architect Your Wealth",
    tutorialCTADashboard: "Go to Dashboard",
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
    continueWithGithub: "Lanjutkan dengan GitHub",

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
    tutorialSection1Title: "1. Cetak Biru: Aset & Saldo",
    tutorialSection1Desc:
      "Sebelum memindai struk pertama, Anda butuh tempat untuk menyimpan data uang tersebut. Buat aset 'Bank' dan 'Tunai' di tab Aset. Gunakan 'Saldo Awal' untuk mencatat simpanan Anda saat ini.",
    tutorialSection2Title: "2. Protokol Gemini: Scan AI",
    tutorialSection2Desc:
      "AI Gemini kami dilatih pada ribuan format struk. Untuk hasil terbaik: pastikan pencahayaan cukup, pegang ponsel dengan stabil, dan pastikan nama merchant serta jumlah total masuk dalam bingkai.",
    tutorialSection3Title: "3. Pusat Kendali: Buku Besar Dinamis",
    tutorialSection3Desc:
      "Buku besar bukan sekadar daftar; ini adalah alat dinamis. Gunakan 'Tampilan Pivot' untuk mengelompokkan pengeluaran berdasarkan kategori atau bulan secara instan. Klik dua kali baris mana pun untuk mengubah detail.",
    tutorialSection4Title: "4. Kecerdasan Kekayaan: Kekayaan Bersih",
    tutorialSection4Desc:
      "SnapFins menghitung Kekayaan Bersih Anda dengan mengurangi Utang dari total Aset Anda. Tetap berada di zona hijau dengan memperbarui saldo bank dan memantau utang Anda dengan cermat.",
    tutorialSection5Title: "5. Kedaulatan Data & Privasi",
    tutorialSection5Desc:
      "Data keuangan Anda sangat sensitif. SnapFins menggunakan enkripsi kelas perusahaan melalui Supabase. Kami tidak pernah menjual data Anda, dan hasil dari AI Gemini diproses dengan aman. Anda dapat menghapus seluruh riwayat Anda kapan saja.",
    tutorialSection6Title: "6. Mesin Konversi Langsung",
    tutorialSection6Desc:
      "SnapFins bukan sekadar pelacak; ini adalah kalkulator langsung. Kami mengambil kurs pasar real-time untuk mengonversi saldo Kripto, Emas, dan bank asing Anda ke mata uang utama secara otomatis.",
    backToHome: "Kembali ke Beranda",
    tutorialCTALogin: "Masuk & Bangun Kekayaan Anda",
    tutorialCTADashboard: "Buka Dasbor Saya",
    scanSuccessTitle: "Berhasil di-Scan",
    scanSuccessDate: (d: string) => `Tanggal: ${d}`,
    viewTransaction: "Lihat Transaksi",
    cameraCapture: "Ambil Foto",
    analyzing: "Menganalisis...",
    confirmEntry: "Konfirmasi Entri",
    cameraAccessDenied: "Akses kamera ditolak. Silakan cek izin browser.",
  },
} as const;

export type TranslationKeys = keyof typeof translations.en;
