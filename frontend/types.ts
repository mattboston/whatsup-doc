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
