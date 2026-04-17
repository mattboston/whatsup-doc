const DOCKER_SOCKET = Bun.env.DOCKER_SOCKET_PATH ?? "/var/run/docker.sock";
const HOSTNAME = Bun.env.HOST_HOSTNAME || "localhost";

interface DockerContainerPort {
  PrivatePort: number;
  PublicPort?: number;
  Type: string;
}

interface DockerContainer {
  Id: string;
  Names: string[];
  Ports: DockerContainerPort[];
}

export interface ContainerPort {
  protocol: "http" | "https" | "tcp";
  port: string;
  url: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  ports: ContainerPort[];
}

async function dockerFetch<T>(path: string): Promise<T> {
  const response = await fetch(`http://localhost${path}`, {
    unix: DOCKER_SOCKET,
  });
  if (!response.ok) throw new Error(`Docker API ${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

async function detectProtocol(port: string): Promise<"http" | "https" | "tcp"> {
  for (const protocol of ["http", "https"] as const) {
    try {
      await fetch(`${protocol}://${HOSTNAME}:${port}`, {
        signal: AbortSignal.timeout(2000),
        redirect: "manual",
        headers: { "x-whatsup-doc-probe": "true" },
      });
      return protocol;
    } catch {
      // try next
    }
  }
  return "tcp";
}

export async function getContainers(): Promise<ContainerInfo[]> {
  const containers = await dockerFetch<DockerContainer[]>("/containers/json");

  const results = await Promise.all(
    containers
      .map(async (container): Promise<ContainerInfo | null> => {
        const name = container.Names[0]?.replace(/^\//, "") ?? container.Id.slice(0, 12);

        const publishedPorts = [
          ...new Set(
            container.Ports.filter((p) => p.Type === "tcp" && p.PublicPort).map((p) =>
              String(p.PublicPort)
            )
          ),
        ];

        if (publishedPorts.length === 0) return null;

        const ports: ContainerPort[] = await Promise.all(
          publishedPorts.map(async (port) => {
            const protocol = await detectProtocol(port);
            const url = protocol === "tcp"
              ? `http://${HOSTNAME}:${port}`
              : `${protocol}://${HOSTNAME}:${port}`;
            return { protocol, port, url };
          })
        );

        return { id: container.Id, name, ports };
      })
  );

  return (results.filter(Boolean) as ContainerInfo[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
