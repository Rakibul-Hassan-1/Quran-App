"use client";

import { useSettings } from "@/app/context/SettingsContext";
import { Ayah } from "@/app/types";

interface AyahDisplayProps {
  ayahs: Ayah[];
  surahName: string;
  highlightTerm?: string;
}

const ENGLISH_TRANSLATION_ID = 20;
const BANGLA_TRANSLATION_ID = 161;

function cleanTranslationText(text: string) {
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, term?: string) {
  const trimmedTerm = (term || "").trim();
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

export default function AyahDisplay({
  ayahs,
  surahName,
  highlightTerm,
}: AyahDisplayProps) {
  const { settings } = useSettings();

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="mb-2 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100">
          {surahName}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-slate-300">
          {ayahs.length} {ayahs.length === 1 ? "verse" : "verses"}
        </p>
      </div>

      {ayahs.map((ayah) => {
        const englishTranslation = ayah.translations?.find(
          (translation) => translation.resource_id === ENGLISH_TRANSLATION_ID,
        );
        const banglaTranslation = ayah.translations?.find(
          (translation) => translation.resource_id === BANGLA_TRANSLATION_ID,
        );

        return (
          <div
            key={ayah.id}
            className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
            id={`ayah-${ayah.verse_number}`}
          >
            <div className="mb-3 sm:mb-4 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Ayah {ayah.verse_number}
            </div>

            <div
              className="mb-3 sm:mb-4 text-right font-arabic leading-relaxed text-gray-900 dark:text-slate-100 wrap-break-word"
              style={{
                fontSize: `${settings.arabicFontSize}px`,
                fontFamily:
                  settings.arabicFont === "font-arabic-1"
                    ? "'Amiri', serif"
                    : "'Lateef', serif",
              }}
              dir="rtl"
            >
              {ayah.text_uthmani}
            </div>

            {(englishTranslation || banglaTranslation) && (
              <div
                className="border-l-4 border-green-500 bg-green-50 dark:bg-slate-800 pl-4 text-gray-700 dark:text-slate-200"
                style={{
                  fontSize: `${settings.translationFontSize}px`,
                }}
              >
                {englishTranslation?.text && (
                  <p className="italic mb-2 wrap-break-word">
                    {highlightText(
                      cleanTranslationText(englishTranslation.text),
                      highlightTerm,
                    )}
                  </p>
                )}
                {banglaTranslation?.text && (
                  <p className="text-gray-800 dark:text-slate-100 wrap-break-word">
                    {highlightText(
                      cleanTranslationText(banglaTranslation.text),
                      highlightTerm,
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="mt-2 text-xs text-gray-400 dark:text-slate-500">
              {ayah.verse_key}
            </div>
          </div>
        );
      })}

      {ayahs.length === 0 && (
        <div className="rounded-lg bg-gray-50 dark:bg-slate-900 px-6 py-12 text-center">
          <p className="text-gray-500 dark:text-slate-300">No verses found.</p>
        </div>
      )}
    </div>
  );
}
