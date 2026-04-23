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
