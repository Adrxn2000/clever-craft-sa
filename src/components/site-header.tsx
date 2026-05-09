import { Link } from "@tanstack/react-router";
import { Sparkles, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  onNewGeneration?: () => void;
  showNewGeneration?: boolean;
}

export function SiteHeader({ onNewGeneration, showNewGeneration = true }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold leading-tight truncate">ContentCraft</div>
            <div className="text-xs text-primary-foreground/70 leading-tight truncate hidden sm:block">
              Generate professional content in seconds
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/docs"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Documentation
          </Link>
          {showNewGeneration && (
            <Button
              onClick={onNewGeneration}
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">New Generation</span>
              <span className="inline xs:hidden">New</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
