# Quran App

Modern Quran reading web app built with Next.js App Router. এই app দিয়ে আপনি:

- সব Surah list দেখতে পারবেন
- নির্দিষ্ট Surah ওপেন করে Arabic ayah + English/Bangla translation পড়তে পারবেন
- দ্রুত English/Bangla text search করতে পারবেন
- Dark/Light theme toggle করতে পারবেন
- Arabic font style, Arabic font size, translation font size customize করতে পারবেন

## 1) Project Summary

Quran App মূলত একটি client-first reading interface, যেখানে data আসে Quran.com API থেকে।
Project architecture এমনভাবে করা যে browser directly third-party API তে না গিয়ে internal Next API routes ব্যবহার করে data fetch করে।
এতে future-এ authentication, caching policy, filtering, analytics যোগ করা সহজ হয়।

## 2) Core Features

- Surah sidebar navigation (1-114)
- Surah detail page with full ayah list
- Arabic Uthmani text rendering
- English translation (resource_id: 20)
- Bangla translation (resource_id: 161)
- Search suggestions + result list
- Search highlight (word boundary aware for single-word query)
- Auto-scroll to ayah via URL hash (`#ayah-<number>`)
- Settings panel with live preview
- Local storage based persistent user preferences
- Dark mode support

## 3) Tech Stack

- Framework: Next.js 16 (App Router)
- UI: React 19 + Tailwind CSS v4
- Language: TypeScript
- Icons: lucide-react
- Linting: ESLint + eslint-config-next
- Data Source: Quran.com API v4

## 4) System Architecture

High-level flow:

1. User UI action (open surah / search) triggers fetch to internal API.
2. Next route handler calls Quran.com API.
3. Route handler sanitizes/normalizes response.
4. Next returns clean JSON to UI.
5. UI renders data and applies settings/theme.

### Components of the system

- UI Layer:
  Home page, Surah page, Search input, Surah list, Ayah display, Settings drawer.
- State Layer:
  SettingsContext handles theme + typography preferences.
- API Layer:
  `/api/surahs`, `/api/surah/[id]`, `/api/search`.
- External Provider:
  `https://api.quran.com/api/v4`.

## 5) Project Structure

```text
app/
	api/
		search/route.ts           # search route (en+bn)
		surah/[id]/route.ts       # surah details + all verses
		surahs/route.ts           # all chapter list
	components/
		AyahDisplay.tsx
		SearchComponent.tsx
		SettingsPanel.tsx
		SurahList.tsx
	context/
		SettingsContext.tsx
	surah/[id]/page.tsx         # dynamic surah page
	types/index.ts              # shared TS types
	globals.css
	layout.tsx
	page.tsx                    # home page
```

## 6) API Documentation (Internal)

### `GET /api/surahs`

Returns all surahs/chapters.

- Source: `quran.com/api/v4/chapters`
- Cache strategy: revalidate ~24 hours (`86400s`)

Example response (short):

```json
[
  {
    "id": 1,
    "name_simple": "Al-Fatihah",
    "name_arabic": "الفاتحة",
    "verses_count": 7
  }
]
```

### `GET /api/surah/:id`

Returns a single surah details + all verses with English/Bangla translations.

- Valid `id`: 1 to 114
- Invalid id -> `400 { "error": "Invalid surah ID" }`
- Verses are fetched with pagination until complete
- Cache strategy: revalidate ~24 hours (`86400s`)

Example response (short):

```json
{
  "details": {
    "id": 1,
    "name_simple": "Al-Fatihah"
  },
  "verses": [
    {
      "id": 1,
      "verse_key": "1:1",
      "chapter_id": 1,
      "text_uthmani": "...",
      "translations": [
        { "resource_id": 20, "text": "..." },
        { "resource_id": 161, "text": "..." }
      ]
    }
  ]
}
```

### `GET /api/search?q=<query>`

Returns matching ayahs for English and Bangla search.

- Empty query -> `[]`
- Per language search size: `25`
- Combined unique results capped at `40`
- Cache strategy: revalidate ~5 minutes (`300s`)

## 7) Data Sanitization Rules

API layer translation text থেকে footnote/sup tags clean করে।

- Removes `<sup>...</sup>` মার্কআপ
- Collapses extra whitespace
- Returns trimmed plain text

এর ফলে UI তে cleaner translation দেখা যায় এবং search highlight predictable হয়।

## 8) Settings System

User preferences stored in `localStorage` key:

- `quran_settings`

Default settings:

- `arabicFont`: `font-arabic-1`
- `arabicFontSize`: `28`
- `translationFontSize`: `16`
- `theme`: `light`

Theme apply method:

- `document.documentElement` এ `dark` class toggle
- CSS variables + Tailwind dark variant দিয়ে style switch

## 9) Search Behavior

- Debounced search (~250ms)
- Previous request aborted using `AbortController`
- Search dropdown তে quick preview
- Main page তে full result cards
- Single-word query তে word boundary based highlight
- Multi-word query তে exact phrase match highlight

## 10) Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

## 11) Local Development Setup

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open browser:

- `http://localhost:3000`

### Lint

```bash
npm run lint
```

### Production build and start

```bash
npm run build
npm run start
```

## 12) Environment Variables

এই project run করতে currently কোন required `.env` variable লাগছে না।
সব external data call route handler থেকে fixed Quran.com endpoint এ যাচ্ছে।

## 13) Deployment Guideline

Recommended: Vercel

1. Repo connect করুন Vercel এ
2. Framework auto-detect হবে (Next.js)
3. Build command: `npm run build`
4. Start command: `npm run start` (Vercel serverless contextে auto handle)
5. Deploy

Other platforms:

- Node server mode deploy করলে নিশ্চিত করুন outbound HTTPS allowed
- Quran.com API access blocked না হয়

## 14) Performance Notes

- Surah list endpoint in-memory cache + Next revalidate strategy ব্যবহার করে
- Search endpoint low TTL cache ব্যবহার করে দ্রুত updated search রাখতে
- Surah details page paginated fetch করে large chapter সম্পূর্ণ load করে

## 15) Troubleshooting

### সমস্যা: Surah data load হচ্ছে না

- Internet connectivity check করুন
- Quran.com API temporarily down কিনা check করুন
- Browser console / terminal logs দেখুন

### সমস্যা: Theme ঠিকমতো apply হচ্ছে না

- localStorage clear করে reload দিন
- `quran_settings` invalid JSON হলে default settings fallback হবে

### সমস্যা: Search result inconsistent

- Query trim করে search দিন
- খুব ছোট query বা spelling mismatch হলে ফল কম আসতে পারে
- API latency থাকলে কিছু সময় অপেক্ষা করুন

### সমস্যা: Hash ayah jump (`#ayah-n`) কাজ করছে না

- নিশ্চিত করুন target ayah exists
- page load শেষে smooth scroll retry mechanism কয়েকবার run হয়

## 16) Security and Reliability Notes

- Internal API proxy approach browser-side direct third-party coupling কমায়
- Invalid surah ID guarded at server route level
- Failed external API call হলে app gracefully empty state/fallback UI দেখায়

## 17) Future Improvements (Suggested)

- Offline caching (PWA)
- Bookmark / last-read position
- Tafsir integration
- Audio recitation sync
- Multi-translation toggle from UI
- Better transliteration support
- Unit + integration tests

## 18) Scripts Reference

- `npm run dev` -> Start development server
- `npm run build` -> Build production app
- `npm run start` -> Start production server
- `npm run lint` -> Run ESLint checks


