import type { ContainerInfo } from "../types";

export function ContainerTable({ containers }: { containers: ContainerInfo[] }) {
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
          {containers.map((container) => (
            <tr key={container.id}>
              <td className="td-name">
                <div className="name-inner">
                  <span className="row-icon">📦</span>
                  <span className="row-name">{container.name}</span>
                </div>
              </td>
              <td className="td-ports">
                <div className="ports-inner">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
