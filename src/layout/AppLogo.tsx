// src/layout/AppLogo.tsx
import Link from "next/link";
import Image from "next/image";

type Props = {
  href: string;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
};

export default function AppLogo({ href, isExpanded, isHovered, isMobileOpen }: Props) {
  return (
    <Link href={href} className="flex items-center p-2">
      {isExpanded || isHovered || isMobileOpen ? (
        <>
          <Image
            className="dark:hidden"
            src="/images/logo/logo.svg"
            alt="Company logo"
            width={150}
            height={40}
            priority
          />
          <Image
            className="hidden dark:block"
            src="/images/logo/logo-dark.svg"
            alt="Company logo"
            width={150}
            height={40}
            priority
          />
        </>
      ) : (
        <Image
          src="/images/logo/logo-icon.svg"
          alt="Company logo"
          width={32}
          height={32}
          priority
        />
      )}
    </Link>
  );
}
