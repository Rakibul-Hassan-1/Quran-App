import { Surah } from "@/app/types";
import { NextResponse } from "next/server";

interface QuranChaptersResponse {
  chapters?: Surah[];
}

let surahsCache: Surah[] | null = null;

async function fetchSurahs() {
  if (surahsCache) {
    return surahsCache;
  }

  try {
    const response = await fetch("https://api.quran.com/api/v4/chapters", {
      next: { revalidate: 86400 },
    });
    const data = (await response.json()) as QuranChaptersResponse;
    surahsCache = data.chapters || [];
    return surahsCache;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
}

export async function GET() {
  const surahs = await fetchSurahs();
  return NextResponse.json(surahs);
}
