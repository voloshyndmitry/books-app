import { NextResponse } from 'next/server';
import { fetchFavoriteBooks } from '@/lib/bookService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const books = await fetchFavoriteBooks();
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books', books: [] },
      { status: 500 }
    );
  }
}
