"use client";

import AyahDisplay from "@/app/components/AyahDisplay";
import SearchComponent from "@/app/components/SearchComponent";
import SettingsPanel from "@/app/components/SettingsPanel";
import SurahList from "@/app/components/SurahList";
import { useSettings } from "@/app/context/SettingsContext";
import { Ayah, Surah } from "@/app/types";
import {
  ArrowLeft,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface SurahPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SurahPage({ params }: SurahPageProps) {
  const { settings, toggleTheme } = useSettings();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [surahDetails, setSurahDetails] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { id } = use(params);
  const surahId = parseInt(id);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const surahsResponse = await fetch("/api/surahs");
        const surahsData = await surahsResponse.json();
        setSurahs(surahsData);

        const surahResponse = await fetch(`/api/surah/${surahId}`);
        const surahData = await surahResponse.json();
        setSurahDetails(surahData.details);
        setVerses(surahData.verses || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (surahId >= 1 && surahId <= 114) {
      fetchData();
    }
  }, [surahId]);

  useEffect(() => {
    const scrollToHashAyah = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#ayah-")) {
        return;
      }

      const targetId = hash.slice(1);
      let attempts = 0;
      const maxAttempts = 12;

      const tryScroll = () => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(tryScroll, 120);
        }
      };

      tryScroll();
    };

    scrollToHashAyah();
    window.addEventListener("hashchange", scrollToHashAyah);

    return () => {
      window.removeEventListener("hashchange", scrollToHashAyah);
    };
  }, [verses, surahId]);

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
            <Link href="/" className="text-2xl font-bold text-white">
              Quran
            </Link>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <SurahList surahs={surahs} currentSurahId={surahId} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <Link
                href="/"
                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={20} />
              </Link>
            </div>

            <div className="min-w-0 flex-1 max-w-none sm:max-w-md">
              <SearchComponent onSearch={(query) => handleSearch(query)} />
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : surahDetails ? (
            <AyahDisplay
              ayahs={verses}
              surahName={surahDetails.name_simple}
              highlightTerm={searchQuery}
            />
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                  Surah not found
                </h2>
                <p className="text-gray-600 dark:text-slate-300">
                  Please select a valid surah from the sidebar
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
