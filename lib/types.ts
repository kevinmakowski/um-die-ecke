export type PostType = "request" | "offer";

export const CATEGORIES = [
  "Umzug",
  "Reparatur",
  "Transport",
  "Garten & Haushalt",
  "Kinderbetreuung",
  "Sonstiges",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Post {
  id: string;
  type: PostType;
  category: Category;
  title: string;
  description: string;
  location: string;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
  authorName: string;
  createdAt: string;
}
