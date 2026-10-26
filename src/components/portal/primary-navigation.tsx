"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useMockAuth } from "@/components/auth/mock-auth-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { confirmContactNavigation } from "@/features/contacts/use-unsaved-changes";
import { IpsosLogo } from "@/components/ipsos-logo";

const baseNavigation = [
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
  { href: "/costs", label: "Costs" },
  { href: "/docs", label: "Docs" },
] as const;

export function PrimaryNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { user, signOut } = useMockAuth();
  const navigation =
    user?.role === "admin"
      ? [
          ...baseNavigation,
          { href: "/settings", label: "Settings" },
        ]
      : baseNavigation;

  const handleSignOut = async () => {
    if (!confirmContactNavigation()) return;
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="border-b bg-white" onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <div className="mx-auto flex min-h-16 max-w-300 flex-wrap items-center gap-3 px-4 py-2 sm:gap-4 sm:px-6">
        <Link
          aria-label="Ipsos Supplier Portal home"
          className="mr-2 flex shrink-0 items-center gap-2"
          href="/projects"
        >
          <IpsosLogo />
          <span className="font-semibold tracking-tight">
            <span className="font-normal text-muted-foreground">
              Supplier Portal
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          id={menuId}
          className={cn(
            "order-last w-full min-w-0 gap-1 border-t pt-2 lg:order-none lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:border-0 lg:pt-0",
            menuOpen ? "flex flex-col" : "hidden",
          )}
        >
          <div className="border-b px-3 pb-3 pt-1 lg:hidden">
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="mt-1 text-xs text-muted-foreground">{user?.role === "admin" ? "Administrator" : "User"}</p>
          </div>
          {navigation.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground lg:h-9 transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
                href={href}
                onClick={() => setMenuOpen(false)}
                key={href}
              >
                {label}
              </Link>
            );
          })}
          <div className="mt-2 border-t py-2 lg:hidden">
            <Link aria-current={pathname === "/account" ? "page" : undefined} className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-muted" href="/account" onClick={() => setMenuOpen(false)}>Account Settings</Link>
          </div>
          <div className="mt-2 border-t pt-2 lg:hidden">
            <Button className="w-full justify-start" onClick={handleSignOut} type="button" variant="ghost"><LogOut aria-hidden="true" className="size-4" />Sign Out</Button>
          </div>
        </nav>

        <div className="ml-auto hidden shrink-0 lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="User menu" className="rounded-md px-3 py-2 text-right hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="button">
                <span className="block font-medium">{user?.firstName} {user?.lastName}</span>
                <span className="block text-xs text-muted-foreground">{user?.role === "admin" ? "Administrator" : "User"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/account">Account Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { void handleSignOut(); }}><LogOut aria-hidden="true" className="size-4" />Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className="ml-auto size-10 px-0 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          ref={menuButton}
          type="button"
          variant="ghost"
        >
          {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </Button>
      </div>
    </header>
  );
}
