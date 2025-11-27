'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * SearchBar Component
 *
 * The primary search interface. Designed to feel as intuitive as Google:
 * - Natural language parsing (e.g., "steel importers Germany")
 * - Autocomplete for HS codes, countries, company names
 * - Recent searches in dropdown
 *
 * The bar transitions from simple text input to structured query as user types.
 */

interface SearchBarProps {
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

interface Suggestion {
  type: 'hs_code' | 'company' | 'country' | 'product' | 'recent';
  value: string;
  label: string;
  description?: string;
}

export function SearchBar({
  onFocus,
  onBlur,
  placeholder = 'Search...',
  className = '',
  size = 'large',
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // Mock suggestions - would call API
      const mockSuggestions: Suggestion[] = [
        { type: 'hs_code', value: '730890', label: '730890', description: 'Iron/steel structures, parts' },
        { type: 'company', value: 'comp_123', label: 'Müller Stahlbau GmbH', description: 'Hamburg, DE' },
        { type: 'country', value: 'DE', label: 'Germany', description: '15.2M shipments' },
      ];
      setSuggestions(mockSuggestions);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Parse query and navigate to search results
    // In production, this would use NLP to extract structured filters
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    router.push(`/search?${searchParams.toString()}`);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'company') {
      router.push(`/companies/${suggestion.value}`);
    } else if (suggestion.type === 'hs_code') {
      router.push(`/search?hsCode=${suggestion.value}`);
    } else if (suggestion.type === 'country') {
      router.push(`/search?destination=${suggestion.value}`);
    }
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 200);
  };

  const sizeClasses = {
    default: 'h-10 text-sm',
    large: 'h-14 text-base',
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center bg-white border-2 rounded-xl shadow-sm
            transition-all duration-200
            ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
            ${sizeClasses[size]}
          `}
        >
          {/* Search icon */}
          <div className="pl-4 pr-2 flex items-center">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1 h-full bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            className="h-full px-6 bg-blue-600 text-white font-medium rounded-r-xl hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 text-left"
            >
              {/* Type indicator */}
              <span className="flex-shrink-0 mt-0.5">
                {suggestion.type === 'hs_code' && (
                  <span className="px-1.5 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                    HS
                  </span>
                )}
                {suggestion.type === 'company' && (
                  <span className="px-1.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded">
                    Co
                  </span>
                )}
                {suggestion.type === 'country' && (
                  <span className="px-1.5 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded">
                    Loc
                  </span>
                )}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.label}
                </p>
                {suggestion.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
