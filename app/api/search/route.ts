import { Ayah } from "@/app/types";
import { NextResponse } from "next/server";

const ENGLISH_TRANSLATION_ID = 20;
const BANGLA_TRANSLATION_ID = 161;
const SEARCH_RESULT_LIMIT = 25;
const MAX_RETURN_RESULTS = 40;

function stripTranslationFootnotes(text: string) {
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeVerseTranslations<
  T extends { translations?: Array<{ text?: string }> },
>(verse: T): T {
  if (!verse.translations) {
    return verse;
  }

  return {
    ...verse,
    translations: verse.translations.map((translation) => ({
      ...translation,
      text: translation.text
        ? stripTranslationFootnotes(translation.text)
        : translation.text,
    })),
  };
}

interface SearchResultItem {
  verse_key: string;
}

interface QuranSearchResponse {
  search?: {
    results?: SearchResultItem[];
  };
}

interface VerseByKeyResponse {
  verse?: Omit<Ayah, "chapter_id">;
}

async function fetchSearchKeys(query: string, language: "en" | "bn") {
  const response = await fetch(
    `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=${SEARCH_RESULT_LIMIT}&page=1&language=${language}`,
    { next: { revalidate: 300 } },
  );

  const data = (await response.json()) as QuranSearchResponse;
  const results = data.search?.results || [];

  return results
    .map((result) => result.verse_key?.trim())
    .filter((key): key is string => Boolean(key));
}

async function fetchVerseByKey(verseKey: string): Promise<Ayah | null> {
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=en&translations=${ENGLISH_TRANSLATION_ID},${BANGLA_TRANSLATION_ID}&fields=text_uthmani`,
      { next: { revalidate: 300 } },
    );
    const data = (await response.json()) as VerseByKeyResponse;

    if (!data.verse) {
      return null;
    }

    const chapterId = Number.parseInt(verseKey.split(":")[0], 10);
    return sanitizeVerseTranslations({
      ...data.verse,
      chapter_id: Number.isNaN(chapterId) ? 0 : chapterId,
    });
  } catch (error) {
    console.error(`Error fetching verse ${verseKey}:`, error);
    return null;
  }
}

async function fastSearch(query: string) {
  try {
    const [englishKeys, banglaKeys] = await Promise.all([
      fetchSearchKeys(query, "en"),
      fetchSearchKeys(query, "bn"),
    ]);

    const uniqueKeys = Array.from(
      new Set([...englishKeys, ...banglaKeys]),
    ).slice(0, MAX_RETURN_RESULTS);

    if (uniqueKeys.length === 0) {
      return [] as Ayah[];
    }

    const verses = await Promise.all(
      uniqueKeys.map((key) => fetchVerseByKey(key)),
    );
    return verses.filter((verse): verse is Ayah => Boolean(verse));
  } catch (error) {
    console.error("Error during fast search:", error);
    return [] as Ayah[];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  const results = await fastSearch(query.trim());

  return NextResponse.json(results);
}
