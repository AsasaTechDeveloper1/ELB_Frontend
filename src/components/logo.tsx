import darkLogo from "@/assets/logos/dark.svg";
// import logo from "@/assets/logos/main.svg";
import lightLogo from "@/assets/images/Picture1.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative w-[125px] h-[70px] mx-auto mt-[-25px]">
      <Image
        src="/images/logo/Picture1.png"
        width={150}
        height={75}
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}