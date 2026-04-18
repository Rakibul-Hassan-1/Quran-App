"use client";

import SearchComponent from "@/app/components/SearchComponent";
import SettingsPanel from "@/app/components/SettingsPanel";
import SurahList from "@/app/components/SurahList";
import { useSettings } from "@/app/context/SettingsContext";
import { Ayah, Surah } from "@/app/types";
import { Menu, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function Home() {
  const { settings, toggleTheme } = useSettings();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Ayah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateSidebarState = () => {
      setSidebarOpen(mediaQuery.matches);
    };

    updateSidebarState();
    mediaQuery.addEventListener("change", updateSidebarState);

    return () => {
      mediaQuery.removeEventListener("change", updateSidebarState);
    };
  }, []);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch("/api/surahs");
        const data = await response.json();
        setSurahs(data);
      } catch (error) {
        console.error("Failed to fetch surahs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const handleSearch = (query: string, results: Ayah[]) => {
    setSearchQuery(query);
    setSearchResults(results);
  };

  return (
    <div className="relative flex h-dvh bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="absolute inset-0 z-30 bg-black/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-72 overflow-hidden bg-emerald-50 border-r border-emerald-200 dark:bg-slate-900 dark:border-slate-700 transition-transform duration-300 lg:static lg:z-auto lg:w-80 lg:translate-x-0 shrink-0`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-emerald-200 dark:border-slate-700 bg-emerald-600 dark:bg-emerald-700">
            <h1 className="text-2xl font-bold text-white">Quran</h1>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <SurahList surahs={surahs} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0 flex-1 max-w-none sm:max-w-md">
              <SearchComponent onSearch={handleSearch} />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {settings.theme === "dark" ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <SettingsIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-3 sm:mb-4">
                Search Results for &quot;{searchQuery}&quot;
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mb-4 sm:mb-6">
                Found {searchResults.length}{" "}
                {searchResults.length === 1 ? "result" : "results"}
              </p>
              {searchResults.length > 0 ? (
                <div className="grid gap-4">
                  {searchResults.map((ayah) => {
                    const englishText = getTranslationText(
                      ayah,
                      ENGLISH_TRANSLATION_ID,
                    );
                    const banglaText = getTranslationText(
                      ayah,
                      BANGLA_TRANSLATION_ID,
                    );

                    return (
                      <div
                        key={ayah.id}
                        className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4"
                      >
                        <div className="mb-2 text-sm font-semibold text-green-600 dark:text-emerald-400">
                          {ayah.verse_key}
                        </div>
                        {englishText && (
                          <p className="text-sm sm:text-base text-gray-700 dark:text-slate-200 mb-2">
                            {highlightText(englishText, searchQuery)}
                          </p>
                        )}
                        {banglaText && (
                          <p className="text-sm sm:text-base text-gray-800 dark:text-slate-100 mb-2">
                            {highlightText(banglaText, searchQuery)}
                          </p>
                        )}
                        <p
                          className="text-right text-base sm:text-lg font-arabic leading-relaxed"
                          dir="rtl"
                        >
                          {ayah.text_uthmani}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-8 text-center">
                  <p className="text-gray-500 dark:text-slate-300">
                    No results found
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center max-w-md">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 mb-3 sm:mb-4">
                  Welcome to Quran
                </h2>
                <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg">
                  Select a Surah from the sidebar to begin reading
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
