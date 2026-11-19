import { countryCode } from "@/lib/countries";

export function CountryFlag({
  country,
  className,
}: {
  country: string;
  className?: string;
}) {
  const code = countryCode(country);
  if (!code) return null;

  return (
    <span
      aria-hidden="true"
      className={`fi fi-${code} inline-block shrink-0 align-middle leading-none rounded-[1px] ${className ?? "h-3 w-4"}`}
    />
  );
}
