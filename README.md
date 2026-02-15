# Mnogoknig Books App

A Next.js web application that syncs and displays your favorite books from [mnogoknig.com](https://mnogoknig.com).

## Features

- Fetches your wishlist/favorites from mnogoknig.com
- Displays books with cover images, prices, and availability
- **Sorting** by title, author, price, or availability
- **Filtering** by:
  - Text search (title/author)
  - Availability status
  - Author
  - Price range
- Responsive grid layout
- Pagination support (fetches multiple pages)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Scraping**: Cheerio

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/voloshyndmitry/books-app.git
   cd books-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` from the example:
   ```bash
   cp .env.example .env.local
   ```

4. Get your session cookie from mnogoknig.com:
   - Open https://mnogoknig.com and log in
   - Open DevTools (F12) → Application → Cookies
   - Find `mnogoknigcom_session` cookie and copy its value
   - Add all cookies to `.env.local`:
     ```
     MNOGOKNIG_SESSION_COOKIE=mnogoknigcom_session=YOUR_VALUE; other_cookies...
     ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:4827

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MNOGOKNIG_SESSION_COOKIE` | Session cookies from mnogoknig.com (required for authentication) |

## Project Structure

```
books-app/
├── app/
│   ├── api/books/route.ts   # API endpoint to fetch books
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page with filtering/sorting
│   └── globals.css          # Global styles
├── lib/
│   └── bookService.ts       # Mnogoknig.com scraper
├── .env.example             # Environment variables template
└── package.json
```

## How It Works

1. The app uses your session cookie to authenticate with mnogoknig.com
2. It fetches your wishlist pages (1, 2, 3)
3. Parses the HTML using Cheerio to extract book data
4. Returns JSON with: title, author, price, availability, cover image, URL
5. Frontend displays books in a filterable/sortable grid

## License

MIT
