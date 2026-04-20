import {
  Package, Book, Wrench, Laptop, Shield, Beaker, Palette, Music,
  Dumbbell, Microscope, GraduationCap, Library, Folder,
  type LucideIcon,
} from "lucide-react";

export const DEPARTMENT_ICONS = {
  package: Package,
  book: Book,
  wrench: Wrench,
  laptop: Laptop,
  shield: Shield,
  beaker: Beaker,
  palette: Palette,
  music: Music,
  dumbbell: Dumbbell,
  microscope: Microscope,
  graduation: GraduationCap,
  library: Library,
  folder: Folder,
} satisfies Record<string, LucideIcon>;

export type DepartmentIconKey = keyof typeof DEPARTMENT_ICONS;

export const DEPARTMENT_ICON_OPTIONS: Array<{ key: DepartmentIconKey; labelAr: string }> = [
  { key: "package", labelAr: "صندوق / مواد" },
  { key: "book", labelAr: "كتاب / مواد تعليمية" },
  { key: "library", labelAr: "مكتبة" },
  { key: "graduation", labelAr: "تعليم" },
  { key: "laptop", labelAr: "تقنية" },
  { key: "wrench", labelAr: "صيانة" },
  { key: "shield", labelAr: "أمن / سلامة" },
  { key: "beaker", labelAr: "مختبر / كيمياء" },
  { key: "microscope", labelAr: "علوم" },
  { key: "palette", labelAr: "فنون" },
  { key: "music", labelAr: "موسيقى" },
  { key: "dumbbell", labelAr: "رياضة" },
  { key: "folder", labelAr: "عام" },
];

export const getDepartmentIcon = (key?: string | null): LucideIcon =>
  (key && key in DEPARTMENT_ICONS)
    ? DEPARTMENT_ICONS[key as DepartmentIconKey]
    : Folder;
