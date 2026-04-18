"use client";

import { Surah } from "@/app/types";
import Link from "next/link";

interface SurahListProps {
  surahs: Surah[];
  currentSurahId?: number;
}

export default function SurahList({ surahs, currentSurahId }: SurahListProps) {
  return (
    <div className="h-full overflow-y-auto bg-emerald-50 dark:bg-slate-900 p-3 sm:p-4">
      <h3 className="mb-4 text-lg font-bold text-emerald-900 dark:text-emerald-300">
        Surahs
      </h3>
      <div className="space-y-2">
        {surahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className={`block rounded-lg px-3 py-2 transition-colors ${
              currentSurahId === surah.id
                ? "bg-emerald-600 text-white"
                : "bg-white/90 text-emerald-950 hover:bg-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {surah.name_simple}
                </div>
                <div className="text-sm opacity-75 truncate">
                  {surah.name_arabic}
                </div>
              </div>
              <div className="text-sm opacity-75 shrink-0">
                {surah.verses_count}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
