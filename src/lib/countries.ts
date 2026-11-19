export const countryCodes: Record<string, string> = {
  Argentina: "ar",
  Brazil: "br",
  Canada: "ca",
  France: "fr",
  Germany: "de",
  Japan: "jp",
  Romania: "ro",
  "United States": "us",
};

export function countryCode(country: string): string | undefined {
  return countryCodes[country.trim()];
}

export const countryRegions: Record<string, "NA" | "EU" | "APAC" | "MENA" | "LATAM"> = {
  Argentina: "LATAM",
  Brazil: "LATAM",
  Canada: "NA",
  France: "EU",
  Germany: "EU",
  Japan: "APAC",
  Romania: "EU",
  "United States": "NA",
};

export function countryRegion(country: string): string | undefined {
  return countryRegions[country.trim()];
}
