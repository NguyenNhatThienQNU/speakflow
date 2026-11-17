"use client";
import { useUiLang } from "./store";

/** t("Tiếng Việt", "English") → chọn theo cấp độ / cài đặt người dùng */
export function useT() {
  const lang = useUiLang();
  return (vi: string, en: string) => (lang === "vi" ? vi : en);
}
