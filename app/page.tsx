'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { BookData } from '@/lib/bookService';

type SortField = 'title' | 'author' | 'price' | 'availability';
type SortOrder = 'asc' | 'desc';

// Multiselect dropdown component
function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const selectAll = () => onChange([...options]);
  const clearAll = () => onChange([]);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
      >
        <span className="truncate text-sm">
          {selected.length === 0
            ? placeholder
            : selected.length === options.length
            ? 'All selected'
            : `${selected.length} selected`}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-gray-50 border-b p-2 flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
          {options.map(option => (
            <label
              key={option}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm truncate">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Progress bar component
function ProgressBar({ progress, show }: { progress: number; show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="bg-white shadow-md p-4 text-center">
        <p className="text-sm text-gray-600">
          Loading books... {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  // Data state - fetched once and stored
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Sorting state (FE only)
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter state (FE only)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  // Fetch books only once on mount
  const fetchBooks = async () => {
    if (hasFetched && books.length > 0) return; // Don't refetch if we have data

    setLoading(true);
    setLoadingProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch('/api/books');
      const data = await response.json();

      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (data.error) {
        setError(data.error);
      } else {
        setBooks(data.books || []);
        setHasFetched(true);
      }
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Failed to fetch books:', err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  };

  // Force refresh (only when user explicitly clicks refresh)
  const forceRefresh = async () => {
    setHasFetched(false);
    setBooks([]);
    setLoading(true);
    setLoadingProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch('/api/books');
      const data = await response.json();

      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (data.error) {
        setError(data.error);
      } else {
        setBooks(data.books || []);
        setHasFetched(true);
      }
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Failed to fetch books:', err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get unique authors for filter
  const uniqueAuthors = useMemo(() => {
    return [...new Set(books.map(b => b.author))].sort();
  }, [books]);

  // Get unique availability statuses
  const uniqueAvailability = useMemo(() => {
    return [...new Set(books.map(b => b.availability || 'Unknown'))].sort();
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

  // Filter and sort books (all FE operations, no API calls)
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

    // Apply availability filter (multiselect)
    if (selectedAvailability.length > 0) {
      result = result.filter(book => {
        const status = book.availability || 'Unknown';
        return selectedAvailability.includes(status);
      });
    }

    // Apply author filter (multiselect)
    if (selectedAuthors.length > 0) {
      result = result.filter(book => selectedAuthors.includes(book.author));
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
  }, [books, searchQuery, selectedAvailability, selectedAuthors, priceRange, sortField, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAvailability([]);
    setSelectedAuthors([]);
    setPriceRange({ min: '', max: '' });
    setSortField('title');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchQuery || selectedAvailability.length > 0 || selectedAuthors.length > 0 || priceRange.min || priceRange.max;

  return (
    <>
      <ProgressBar progress={loadingProgress} show={loading} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Favorite Books</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">
              {filteredAndSortedBooks.length} of {books.length} books
            </span>
            <button
              onClick={forceRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </>
              ) : (
                'Refresh'
              )}
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

            {/* Availability Filter - Multiselect */}
            <MultiSelect
              label="Availability"
              options={uniqueAvailability}
              selected={selectedAvailability}
              onChange={setSelectedAvailability}
              placeholder="All statuses"
            />

            {/* Author Filter - Multiselect */}
            <MultiSelect
              label="Author"
              options={uniqueAuthors}
              selected={selectedAuthors}
              onChange={setSelectedAuthors}
              placeholder="All authors"
            />

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
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && !books.length ? (
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
    </>
  );
}
