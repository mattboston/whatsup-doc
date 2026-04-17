interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  count: number;
  loading: boolean;
  onRefresh: () => void;
}

export function Header({ theme, onToggleTheme, count, loading, onRefresh }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-icon">🐳</span>
          <span className="header-title">
            What's Up <em>Doc?</em>
          </span>
        </div>
        <div className="header-controls">
          {count > 0 && (
            <span className="header-count">
              {count} container{count !== 1 ? "s" : ""}
            </span>
          )}
          <button
            className={`icon-btn ${loading ? "spinning" : ""}`}
            onClick={onRefresh}
            title="Refresh"
            aria-label="Refresh"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.65 2.35A8 8 0 1 0 15 8" />
              <path d="M15 2v4h-4" />
            </svg>
          </button>
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
