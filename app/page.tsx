'use client';

import { useEffect, useState, useMemo } from 'react';
import { BookData } from '@/lib/bookService';

type SortField = 'title' | 'author' | 'price' | 'availability';
type SortOrder = 'asc' | 'desc';

export default function Home() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/books');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBooks(data.books || []);
      }
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Get unique authors for filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = [...new Set(books.map(b => b.author))].sort();
    return authors;
  }, [books]);

  // Get unique availability statuses
  const uniqueAvailability = useMemo(() => {
    const statuses = [...new Set(books.map(b => b.availability || 'Unknown'))].sort();
    return statuses;
  }, [books]);

  // Parse price string to number
  const parsePrice = (price: string | undefined): number => {
    if (!price) return 0;
    const match = price.match(/[\d.,]+/);
    if (match) {
      return parseFloat(match[0].replace(',', '.'));
    }
    return 0;
  };

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(book => {
        const status = book.availability || 'Unknown';
        return status === availabilityFilter;
      });
    }

    // Apply author filter
    if (authorFilter !== 'all') {
      result = result.filter(book => book.author === authorFilter);
    }

    // Apply price range filter
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : null;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : null;
    if (minPrice !== null || maxPrice !== null) {
      result = result.filter(book => {
        const price = parsePrice(book.price);
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'price':
          comparison = parsePrice(a.price) - parsePrice(b.price);
          break;
        case 'availability':
          comparison = (a.availability || '').localeCompare(b.availability || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [books, searchQuery, availabilityFilter, authorFilter, priceRange, sortField, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setAuthorFilter('all');
    setPriceRange({ min: '', max: '' });
    setSortField('title');
    setSortOrder('asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Favorite Books</h1>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 self-center">
            {filteredAndSortedBooks.length} of {books.length} books
          </span>
          <button
            onClick={fetchBooks}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or author..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {uniqueAvailability.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Authors</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                placeholder="Min"
                className="w-1/2 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                placeholder="Max"
                className="w-1/2 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="price">Price</option>
                <option value="availability">Availability</option>
              </select>
              <button
                onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No books found</h3>
          <p className="text-gray-600">
            {books.length > 0 ? 'Try adjusting your filters' : 'Make sure your session cookie is set in .env.local'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAndSortedBooks.map((book) => (
            <a
              key={book.id}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[2/3] relative bg-gray-100">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <span className="text-4xl">📖</span>
                  </div>
                )}
                {book.availability && (
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${
                    book.availability === 'In stock'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.availability}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1 truncate">{book.author}</p>
                {book.price && (
                  <p className="text-sm font-medium text-green-600">{book.price}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
