"use client";

import { useSettings } from "@/app/context/SettingsContext";
import { X } from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="absolute right-0 top-0 h-full w-full sm:max-w-sm bg-white dark:bg-slate-900 shadow-lg overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold text-gray-700 dark:text-slate-200">
              Arabic Font
            </label>
            <select
              value={settings.arabicFont}
              onChange={(e) => updateSettings({ arabicFont: e.target.value })}
              className="w-full rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-800 dark:text-slate-100"
            >
              <option value="font-arabic-1">Traditional (Amiri)</option>
              <option value="font-arabic-2">Modern (Lateef)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 flex items-center justify-between font-semibold text-gray-700 dark:text-slate-200">
              <span>Arabic Font Size</span>
              <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
                {settings.arabicFontSize}px
              </span>
            </label>
            <input
              type="range"
              min="20"
              max="40"
              value={settings.arabicFontSize}
              onChange={(e) =>
                updateSettings({ arabicFontSize: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 flex items-center justify-between font-semibold text-gray-700 dark:text-slate-200">
              <span>Translation Font Size</span>
              <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
                {settings.translationFontSize}px
              </span>
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.translationFontSize}
              onChange={(e) =>
                updateSettings({
                  translationFontSize: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-slate-800 p-4">
            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
              Preview
            </p>
            <p
              className="mb-2 text-right font-arabic"
              style={{
                fontSize: `${settings.arabicFontSize}px`,
                fontFamily:
                  settings.arabicFont === "font-arabic-1"
                    ? "'Amiri', serif"
                    : "'Lateef', serif",
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p
              className="dark:text-slate-200"
              style={{
                fontSize: `${settings.translationFontSize}px`,
              }}
            >
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
