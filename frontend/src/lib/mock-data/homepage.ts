export type Region = "all" | "faraya" | "batroun" | "jbeil" | "chouf";
export interface PropertyPreview {
  id: string;
  title: string;
  region: Region;
  location: string;
  image: string;
  price: number;
  rating: string;
  reviews: number;
  host: string;
  guests: number;
  beds: number;
  baths: number;
  feature: string;
  badge: string;
  amenities: readonly string[];
  isNew?: boolean;
}
export const properties: readonly PropertyPreview[] = [
  {
    id: "faraya-crest",
    title: "Faraya Alpine Crest Chalet",
    region: "faraya",
    location: "Faraya Mzaar",
    image: "/images/stayleb-08.jpg",
    price: 380,
    rating: "4.9",
    reviews: 18,
    host: "Host: Karim H.",
    guests: 6,
    beds: 3,
    baths: 2,
    feature: "Heated Jacuzzi",
    badge: "20 kVA",
    amenities: ["Starlink WiFi", "Fireplace", "Ski In/Out"],
  },
  {
    id: "azure-batroun",
    title: "Azure Batroun Cliff Villa",
    region: "batroun",
    location: "Batroun Coast",
    image: "/images/stayleb-09.jpg",
    price: 390,
    rating: "5.0",
    reviews: 24,
    host: "Superhost Karim",
    guests: 4,
    beds: 2,
    baths: 2,
    feature: "Seafront Pool",
    badge: "Private Pool",
    amenities: ["Sunset Terrace", "Old Souk 5m", "24/7 Power"],
  },
  {
    id: "byblos-loft",
    title: "Byblos Portview Stone Loft",
    region: "jbeil",
    location: "Jbeil / Byblos",
    image: "/images/stayleb-10.jpg",
    price: 185,
    rating: "4.85",
    reviews: 12,
    host: "Host: Maya N.",
    guests: 2,
    beds: 1,
    baths: 1,
    feature: "Restored Vaults",
    badge: "Heritage",
    amenities: ["Harbor View", "High-Speed WiFi", "Wine Cellar"],
  },
  {
    id: "chouf-haven",
    title: "Chouf Cedar Haven Eco-Lodge",
    region: "chouf",
    location: "Chouf Reserve",
    image: "/images/stayleb-11.jpg",
    price: 220,
    rating: "",
    reviews: 0,
    host: "Host: Walid J.",
    guests: 8,
    beds: 4,
    baths: 3,
    feature: "Barouk Views",
    badge: "Pine Forest",
    amenities: ["Fireplace", "Solar Backed", "Hiking Access"],
    isNew: true,
  },
];
export interface Destination {
  region: Region;
  title: string;
  eyebrow: string;
  description: string;
  count: number;
  image: string;
}
export const destinations: readonly Destination[] = [
  {
    region: "batroun",
    title: "Batroun",
    eyebrow: "Coast & Souks",
    description: "Old souks, sunset sea clubs & coastal wine trails.",
    count: 34,
    image: "/images/stayleb-12.jpg",
  },
  {
    region: "faraya",
    title: "Faraya & Mzaar",
    eyebrow: "Ski Slopes & Peaks",
    description: "Heated jacuzzis, fireside lofts & snowy mountain peaks.",
    count: 48,
    image: "/images/stayleb-13.jpg",
  },
  {
    region: "jbeil",
    title: "Jbeil / Byblos",
    eyebrow: "Ancient Phoenician Port",
    description: "Historic restored sandstones, ancient port & olive groves.",
    count: 22,
    image: "/images/stayleb-14.jpg",
  },
  {
    region: "chouf",
    title: "Chouf & Barouk",
    eyebrow: "Cedar Biosphere",
    description: "Cedar reserve walks, Ottoman palaces & serene eco-retreats.",
    count: 18,
    image: "/images/stayleb-15.jpg",
  },
];
export const regionOptions: readonly { value: Region; label: string }[] = [
  { value: "all", label: "All Regions (Lebanon)" },
  { value: "faraya", label: "Faraya & Kfardebian (Mzaar)" },
  { value: "batroun", label: "Batroun Coast & Old Souk" },
  { value: "jbeil", label: "Jbeil / Byblos Historic" },
  { value: "chouf", label: "Chouf Cedar Reserve & Barouk" },
];
export const prompts = [
  "Cozy chalet in Faraya with heated jacuzzi & fireplace",
  "Seafront villa in Batroun for 8 with pool & 24/7 power",
  "Stone retreat in Chouf Cedars with mountain view",
] as const;
