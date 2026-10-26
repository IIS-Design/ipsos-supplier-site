import Image from "next/image";
import logo from "../../public/logos/ipsos-logo.png";

export function IpsosLogo({
  authentication = false,
}: {
  authentication?: boolean;
}) {
  return (
    <Image
      alt="Ipsos"
      className={
        authentication ? "h-14 w-auto shrink-0" : "h-8 w-auto shrink-0"
      }
      preload
      src={logo}
    />
  );
}
