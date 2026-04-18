export interface Surah {
  id: number;
  revelation_order: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  name_complex: string;
  verses_count: number;
}

export interface Ayah {
  id: number;
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  text_uthmani: string;
  translations: Array<{
    id: number;
    text: string;
    resource_id: number;
  }>;
}

export interface Settings {
  arabicFont: string;
  arabicFontSize: number;
  translationFontSize: number;
  theme: "light" | "dark";
}
