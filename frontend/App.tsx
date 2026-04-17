import { useCallback, useEffect, useState } from "react";
import { ContainerTable } from "./components/ContainerTable";
import { Header } from "./components/Header";
import type { ContainerInfo } from "./types";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function SkeletonTable() {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Container</th>
            <th>Ports</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <td className="td-name">
                <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: `${28 + i * 8}%`, height: 13 }} />
              </td>
              <td className="td-ports">
                <div className="skeleton sk-badge" style={{ width: 86 }} />
                {i < 3 && <div className="skeleton sk-badge" style={{ width: 68 }} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/containers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setContainers(await res.json());
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch containers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const isFirstLoad = loading && containers.length === 0;

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        count={containers.length}
        loading={loading}
        onRefresh={refresh}
      />
      <main className="main">
        {updatedAt && !isFirstLoad && (
          <p className="updated-at">Updated {updatedAt.toLocaleTimeString()}</p>
        )}
        {isFirstLoad ? (
          <SkeletonTable />
        ) : error ? (
          <div className="error-box">⚠ {error}</div>
        ) : containers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h2 className="empty-title">No containers found</h2>
            <p className="empty-sub">No running containers with published ports detected.</p>
          </div>
        ) : (
          <ContainerTable containers={containers} />
        )}
      </main>
      <footer className="footer">What's Up Doc?</footer>
    </>
  );
}
