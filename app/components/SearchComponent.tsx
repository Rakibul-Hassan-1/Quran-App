"use client";

import { Ayah } from "@/app/types";
import { Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const ENGLISH_TRANSLATION_ID = 20;
const BANGLA_TRANSLATION_ID = 161;

function getTranslationText(ayah: Ayah, resourceId: number) {
  return ayah.translations?.find(
    (translation) => translation.resource_id === resourceId,
  )?.text;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, term: string) {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) {
    return text;
  }

  const escapedTerm = escapeRegExp(trimmedTerm);
  const pattern = trimmedTerm.includes(" ")
    ? `(${escapedTerm})`
    : `(?<![\\p{L}\\p{N}_])(${escapedTerm})(?![\\p{L}\\p{N}_])`;
  const regex = new RegExp(pattern, "giu");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === trimmedTerm.toLowerCase()) {
      return (
        <mark
          key={`${part}-${index}`}
          className="bg-yellow-200 dark:bg-yellow-500/60 px-0.5 rounded-sm"
        >
          {part}
        </mark>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

interface SearchComponentProps {
  onSearch: (query: string, results: Ayah[]) => void;
}

export default function SearchComponent({ onSearch }: SearchComponentProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    (rawQuery: string) => {
      const trimmedQuery = rawQuery.trim();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!trimmedQuery) {
        abortControllerRef.current?.abort();
        setIsLoading(false);
        setResults([]);
        onSearch("", []);
        return;
      }

      setIsLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
            { signal: controller.signal },
          );
          const data = (await response.json()) as Ayah[];

          if (!controller.signal.aborted) {
            setResults(data);
            onSearch(trimmedQuery, data);
          }
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            console.error("Search error:", error);
            setResults([]);
            onSearch(trimmedQuery, []);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      }, 250);
    },
    [onSearch],
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    runSearch(value);
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQuery("");
    setIsLoading(false);
    setResults([]);
    setIsOpen(false);
    onSearch("", []);
  };

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search ayahs..."
          className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-10 text-sm sm:text-base text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 sm:max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500">
              Searching...
            </div>
          )}
          {!isLoading && results.length > 0 && (
            <div className="p-2">
              {results.map((ayah) => {
                const englishText = getTranslationText(
                  ayah,
                  ENGLISH_TRANSLATION_ID,
                );
                const banglaText = getTranslationText(
                  ayah,
                  BANGLA_TRANSLATION_ID,
                );

                return (
                  <Link
                    key={ayah.id}
                    href={`/surah/${ayah.chapter_id}#ayah-${ayah.verse_number}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    <div className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                      {ayah.verse_key}
                    </div>
                    {englishText && (
                      <div className="line-clamp-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                        {highlightText(englishText, query)}
                      </div>
                    )}
                    {banglaText && (
                      <div className="line-clamp-2 text-xs sm:text-sm text-gray-700 dark:text-slate-200 mt-1">
                        {highlightText(banglaText, query)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isOpen && query && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center shadow-lg">
          <p className="text-sm text-gray-500 dark:text-slate-300">
            No results found
          </p>
        </div>
      )}
    </div>
  );
}
