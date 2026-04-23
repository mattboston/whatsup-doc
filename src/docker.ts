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
  HostConfig: { NetworkMode: string };
  NetworkSettings: { Networks: Record<string, unknown> };
}

export interface ContainerPort {
  protocol: "http" | "https" | "tcp" | "udp";
  port: string;
  url: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  ports: ContainerPort[];
  networkMode: string;
  networkName: string;
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
    containers.map(async (container): Promise<ContainerInfo | null> => {
      const name = container.Names[0]?.replace(/^\//, "") ?? container.Id.slice(0, 12);
      const networkMode = container.HostConfig.NetworkMode;
      const networkName = Object.keys(container.NetworkSettings.Networks)[0] ?? networkMode;
      const isHost = networkMode === "host";

      const portKey = (p: DockerContainerPort) =>
        isHost ? String(p.PrivatePort) : p.PublicPort ? String(p.PublicPort) : null;

      const tcpPorts = [...new Set(
        container.Ports.filter((p) => p.Type === "tcp" && portKey(p)).map((p) => portKey(p)!)
      )];

      const udpPorts = [...new Set(
        container.Ports.filter((p) => p.Type === "udp" && portKey(p)).map((p) => portKey(p)!)
      )];

      if (tcpPorts.length === 0 && udpPorts.length === 0 && !isHost) return null;

      const tcpPortInfos: ContainerPort[] = await Promise.all(
        tcpPorts.map(async (port) => {
          const protocol = await detectProtocol(port);
          const url = `${protocol === "tcp" ? "http" : protocol}://${HOSTNAME}:${port}`;
          return { protocol, port, url };
        })
      );

      const udpPortInfos: ContainerPort[] = udpPorts.map((port) => ({
        protocol: "udp" as const,
        port,
        url: `udp://${HOSTNAME}:${port}`,
      }));

      const ports = [...tcpPortInfos, ...udpPortInfos].sort(
        (a, b) => Number(a.port) - Number(b.port)
      );

      return { id: container.Id, name, ports, networkMode, networkName };
    })
  );

  return (results.filter(Boolean) as ContainerInfo[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
