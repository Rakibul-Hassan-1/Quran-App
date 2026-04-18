import { NextRequest, NextResponse } from "next/server";

const ENGLISH_TRANSLATION_ID = 20;
const BANGLA_TRANSLATION_ID = 161;

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

interface VersePageResponse<TVerse> {
  verses?: TVerse[];
  pagination?: {
    next_page?: number | null;
  };
}

async function fetchSurahVerses(surahId: number) {
  try {
    const verses = [] as Array<{
      translations?: Array<{ text?: string }>;
    }>;
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=en&translations=${ENGLISH_TRANSLATION_ID},${BANGLA_TRANSLATION_ID}&fields=text_uthmani&per_page=50&page=${page}`,
        { next: { revalidate: 86400 } },
      );

      const data = (await response.json()) as VersePageResponse<{
        translations?: Array<{ text?: string }>;
      }>;

      verses.push(...(data.verses || []));
      if (data.pagination?.next_page) {
        page = data.pagination.next_page;
      } else {
        hasNextPage = false;
      }
    }

    return verses.map(sanitizeVerseTranslations);
  } catch (error) {
    console.error("Error fetching surah verses:", error);
    return [];
  }
}

async function fetchSurahDetails(surahId: number) {
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/chapters/${surahId}`,
      { next: { revalidate: 86400 } },
    );
    const data = await response.json();
    return data.chapter;
  } catch (error) {
    console.error("Error fetching surah details:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const surahId = parseInt(id);

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return NextResponse.json({ error: "Invalid surah ID" }, { status: 400 });
  }

  const [verses, details] = await Promise.all([
    fetchSurahVerses(surahId),
    fetchSurahDetails(surahId),
  ]);

  return NextResponse.json({
    verses,
    details,
  });
}
