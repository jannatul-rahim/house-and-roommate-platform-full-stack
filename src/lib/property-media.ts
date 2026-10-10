import type { PropertyImage, PropertyType } from "@/types/api";

// Listings use the photos their owner uploaded. Properties without uploads fall
// back to curated photography matched to the property type; the pick is derived
// from the property id, so a listing always shows the same photos.
const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=75&auto=format&fit=crop`;

const COVERS: Record<PropertyType, string[]> = {
  APARTMENT: ["1545324418-cc1a3fa10c00", "1574362848149-11496d93a7c7", "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688"],
  HOUSE: ["1568605114967-8130f3a36994", "1570129477492-45c003edd2be", "1600585154340-be6161a56a0c", "1580587771525-78b9dba3b914"],
  VILLA: ["1512917774080-9991f1c4c750", "1613490493576-7fde63acd811", "1600596542815-ffad4c1539a9"],
  BUILDING: ["1486406146926-c627a92ad1ab", "1545324418-cc1a3fa10c00", "1574362848149-11496d93a7c7"],
  CONDO: ["1600607687939-ce8a6c25118c", "1493809842364-78817add7ffb", "1484154218962-a197022b5858"],
  OTHER: ["1560448204-e02f11c3d0e2", "1554995207-c18c203602cb", "1536376072261-38c75010e6c9"],
};

const INTERIORS = [
  "1505691938895-1758d7feb511",
  "1595526114035-0d45ed16cfbf",
  "1556911220-bff31c812dba",
  "1529408632839-a54952c491e5",
  "1522771739844-6a9f6d5f14af",
  "1554995207-c18c203602cb",
];

const ROOM_PHOTOS = ["1505691938895-1758d7feb511", "1595526114035-0d45ed16cfbf", "1522771739844-6a9f6d5f14af"];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function propertyCover(id: string, type: PropertyType, width?: number, images?: PropertyImage[]): string {
  if (images?.length) return images[0].url;
  const list = COVERS[type] ?? COVERS.OTHER;
  return photo(list[hash(id) % list.length], width);
}

export function propertyGallery(id: string, type: PropertyType, images?: PropertyImage[]): string[] {
  if (images?.length) return images.map((image) => image.url);
  const start = hash(id) % INTERIORS.length;
  const interiors = [0, 1, 2].map((offset) => photo(INTERIORS[(start + offset) % INTERIORS.length], 800));
  return [propertyCover(id, type, 1600), ...interiors];
}

export function roomPhoto(id: string): string {
  return photo(ROOM_PHOTOS[hash(id) % ROOM_PHOTOS.length], 600);
}

export const marketingPhotos = {
  hero: photo("1502672260266-1c1ef2d93688", 1400),
  heroSecondary: photo("1522708323590-d24dbb6b0267", 800),
  about: photo("1493809842364-78817add7ffb", 1200),
  roommates: photo("1484154218962-a197022b5858", 1000),
};
