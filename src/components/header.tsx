import { ThemeToggle } from "@/components/ui/ToggleTheme";
import { Github, Youtube } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-background border-b border-border/20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="font-bold text-xl text-foreground group-hover:text-[var(--primary)] transition-colors duration-200">
                OpenPothole
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="https://www.youtube.com/watch?v=nPmozZFyn9Q"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="text-muted-foreground hover:text-[var(--primary)] transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/areebahmeddd/OpenPothole"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-[var(--primary)] transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
