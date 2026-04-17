import type { ContainerInfo } from "../types";

export function ContainerCard({ container }: { container: ContainerInfo }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📦</div>
        <div className="card-name">{container.name}</div>
      </div>
      <div className="card-ports">
        {container.ports.map(({ protocol, port, url }) => (
          <a
            key={`${protocol}:${port}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`badge ${protocol}`}
          >
            <span className="badge-proto">{protocol}</span>
            <span className="badge-port">{port}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
