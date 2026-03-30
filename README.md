# SnapFins - Precision Finance Tracking & AI Wealth Management

![SnapFins Dashboard Preview](public/dashboard-preview.png)

SnapFins is a high-performance, premium personal finance application designed to give you absolute clarity over your wealth. Built with **Next.js 16**, **Tailwind CSS v4**, and **Supabase**, it combines modern aesthetics with powerful AI-driven insights to transform how you manage your money.

---

## Features

- **AI-Powered Scanner**: Automatically scan receipts and categorize transactions using Google Gemini AI integration.
- **Precision Analytics**: Real-time trend tracking, net worth visualization, and expense distribution using Recharts.
- **Global & Local**: Full multi-language support (English & Indonesian) and currency management.
- **Immersive UI**: A state-of-the-art interface featuring Material Design 3 principles, glassmorphism, and seamless dark/light mode transitions.
- **Secure Authentication**: Robust session management and OAuth (GitHub/Google) powered by Supabase.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile experiences.
- **Wealth Insights**: Dynamic growth indicators and real-time financial health badges.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: CSS Transitions & Framer Motion inspired micro-interactions.
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: Google Material Symbols.

### Backend & Infrastructure
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Deployment**: Optimized for Vercel.

---

## Getting Started

### Prerequisites

- Node.js 20+ 
- NPM / Yarn / Pnpm
- A Supabase Project
- A Google AI (Gemini) API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/meryzennn/snapfins.git
   cd snapfins
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the results.

---

## Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & API)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks (Theme, Lang, etc.)
├── lib/            # Shared libraries (AI, Supabase)
├── utils/          # Helper functions and utilities
└── types/          # TypeScript definitions
```

---

## Database Schema

The project includes SQL migration files for setting up your Supabase database:
- `schema_assets_v1.sql`
- `schema_assets_v2_migration.sql`
- `schema_linked_asset_migration.sql`

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Support the Creator

If you find this project useful, consider supporting the development through the "Support the Creator" button in the app!

---
*Built by [meryzennn](https://github.com/meryzennn)*
