import * as cheerio from 'cheerio';

export interface BookData {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  price?: string;
  availability?: string;
  url?: string;
}

const MNOGOKNIG_BASE_URL = 'https://mnogoknig.com';
const WISHLIST_PAGES = [1, 2, 3];

/**
 * Fetches user's favorite books from mnogoknig.com (all pages)
 * Requires session cookie from browser
 */
export async function fetchFavoriteBooks(): Promise<BookData[]> {
  const sessionCookie = process.env.MNOGOKNIG_SESSION_COOKIE;

  if (!sessionCookie) {
    console.error('MNOGOKNIG_SESSION_COOKIE not set in environment');
    return [];
  }

  const allBooks: BookData[] = [];

  for (const page of WISHLIST_PAGES) {
    try {
      console.log(`Fetching wishlist page ${page}...`);

      const response = await fetch(`${MNOGOKNIG_BASE_URL}/en/wishlist?page=${page}`, {
        headers: {
          'Cookie': sessionCookie,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch page ${page}: ${response.status} ${response.statusText}`);
        continue;
      }

      const html = await response.text();

      // Save HTML for debugging
      const fs = await import('fs');
      fs.writeFileSync(`/tmp/wishlist-page-${page}.html`, html);
      console.log(`Saved HTML to /tmp/wishlist-page-${page}.html`);

      // Check page title to see if logged in
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      console.log(`Page ${page} title: ${titleMatch ? titleMatch[1] : 'unknown'}`);

      // Check if login link exists (means not logged in)
      const hasLoginLink = html.includes('href="https://mnogoknig.com/en/login"');
      console.log(`Page ${page} has login link: ${hasLoginLink}`);

      const books = parseBooks(html, page);
      console.log(`Found ${books.length} books on page ${page}`);
      allBooks.push(...books);

      // Stop if page returned no books (reached end)
      if (books.length === 0) {
        console.log(`No books on page ${page}, stopping pagination`);
        break;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
    }
  }

  console.log(`Total books fetched: ${allBooks.length}`);
  return allBooks;
}

/**
 * Parse books from HTML using cheerio
 * Selector: .w-full.max-w-sm.flex.flex-col.justify-between
 */
function parseBooks(html: string, page: number): BookData[] {
  const $ = cheerio.load(html);
  const books: BookData[] = [];

  // Log selector matches
  const elements = $('.w-full.max-w-sm.flex.flex-col.justify-between');
  console.log(`Selector matched ${elements.length} elements on page ${page}`);

  // Use the provided selector for book elements
  elements.each((index, element) => {
    const $el = $(element);

    // Extract book URL from first link
    const linkEl = $el.find('a[href*="/products/"]').first();
    const url = linkEl.attr('href') || '';
    // Generate unique ID using page and index to avoid duplicates
    const urlSlug = url ? url.split('/').filter(Boolean).pop() || '' : '';
    const id = `p${page}-i${index}-${urlSlug || 'nourl'}`;

    // Extract title from link title attribute or span inside link
    const title = linkEl.attr('title')
      || $el.find('a[title]').attr('title')
      || $el.find('span.text-base.font-normal').first().text().trim()
      || $el.find('img').first().attr('alt')
      || '';

    // Extract author from the truncate text-gray-500 div
    const author = $el.find('.truncate.text-gray-500').first().text().trim()
      || $el.find('.text-gray-500.text-sm.font-light').first().text().trim();

    // Extract cover image
    let coverImage = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
    if (coverImage && !coverImage.startsWith('http')) {
      coverImage = `${MNOGOKNIG_BASE_URL}${coverImage}`;
    }

    // Extract price from the font-bold text-gray-900 div
    const price = $el.find('.font-bold.text-gray-900').first().text().trim();

    // Extract availability from green/red text
    const availability = $el.find('.text-green-600, .text-green-500').first().text().trim()
      || $el.find('.text-red-600, .text-red-500').first().text().trim()
      || '';

    if (title) {
      books.push({
        id,
        title,
        author: author || 'Unknown Author',
        coverImage,
        price,
        availability,
        url: url || undefined,
      });
    }
  });

  return books;
}
