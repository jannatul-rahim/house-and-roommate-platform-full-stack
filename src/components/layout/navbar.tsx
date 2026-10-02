import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { NavbarAuth } from "./navbar-auth";
import { NavLinks } from "./nav-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Logo />
        </div>
        <NavLinks />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NavbarAuth />
        </div>
      </div>
    </header>
  );
}
