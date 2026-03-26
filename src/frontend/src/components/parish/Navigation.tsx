import React, { useState, useEffect } from "react";
import { useSiteSettings } from "../../hooks/useQueries";
import { Link, useLocation } from "../../router";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface NavItem {
  name: string;
  path: string;
  visible: boolean;
}

const DEFAULT_NAV: NavItem[] = [
  { name: "Aktualności", path: "/aktualnosci", visible: true },
  { name: "Liturgia", path: "/liturgia", visible: true },
  { name: "Wspólnoty", path: "/wspolnoty", visible: true },
  { name: "Galeria", path: "/galeria", visible: true },
  { name: "Kancelaria", path: "/kancelaria", visible: true },
  { name: "Kontakt", path: "/kontakt", visible: true },
  { name: "Modlitwa", path: "/modlitwa", visible: true },
  { name: "Życie", path: "/zycie", visible: true },
  { name: "Sklep", path: "/sklep", visible: true },
];

export function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: settings } = useSiteSettings();

  const navItems: NavItem[] = React.useMemo(() => {
    if (settings?.navigation) {
      try {
        const saved = JSON.parse(settings.navigation) as NavItem[];
        const merged = [...saved];
        for (const def of DEFAULT_NAV) {
          if (!merged.find((s) => s.path === def.path)) {
            merged.push(def);
          }
        }
        return merged;
      } catch {
        return DEFAULT_NAV;
      }
    }
    return DEFAULT_NAV;
  }, [settings]);

  const navLogoUrl = React.useMemo(() => {
    if (settings?.contactData) {
      try {
        const d = JSON.parse(settings.contactData) as { navLogoUrl?: string };
        return d.navLogoUrl || "";
      } catch {}
    }
    return "";
  }, [settings]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
      style={{ height: "var(--nav-height, 72px)" }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0"
          data-ocid="nav.logo.link"
        >
          {navLogoUrl ? (
            <img
              src={navLogoUrl}
              alt="Logo parafii"
              className="w-10 h-10 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-border bg-accent/30 flex items-center justify-center">
              <span className="font-display text-sm font-light text-foreground/70">
                PJ
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <div className="font-display text-sm font-light leading-tight text-foreground">
              Parafia
            </div>
            <div className="font-display text-xs font-light leading-tight text-muted-foreground">
              św. Jana Chrzciciela
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const isActive = location.pathname === item.path;
              const ocid = `nav.${item.path.replace("/", "") || "home"}.link`;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link px-3 py-1.5 font-sans text-sm font-light tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "active text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={ocid}
                >
                  {item.name}
                </Link>
              );
            })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden flex flex-col gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile.toggle"
          >
            <span
              className={`block w-5 h-0.5 bg-current transition-transform duration-300 origin-center ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-current transition-transform duration-300 origin-center ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu - fully opaque to prevent bleed-through */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg py-4 animate-fade-in">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-6 py-3 font-sans text-sm font-light transition-colors ${
                    isActive
                      ? "text-foreground bg-accent/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                  }`}
                  data-ocid={`nav.mobile.${item.path.replace("/", "") || "home"}.link`}
                >
                  {item.name}
                </Link>
              );
            })}
        </div>
      )}
    </header>
  );
}
