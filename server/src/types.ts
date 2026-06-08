export type Protocol = 'tcp' | 'udp';

/** A single listening socket, enriched with its owning process & systemd unit. */
export interface Port {
  protocol: Protocol;
  localAddress: string; // "0.0.0.0", "127.0.0.1", "[::]", "127.0.0.53%lo"
  port: number;
  state: string; // "LISTEN" (tcp) | "UNCONN" (udp)
  pid?: number;
  processName?: string;
  unit?: string; // "nginx.service" when resolvable from the pid's cgroup
  externallyReachable: boolean; // bound to a non-loopback interface
}

export interface Service {
  unit: string;
  load: string;
  active: string;
  sub: string;
  description: string;
}

export interface Overview {
  ports: Port[];
  services: Service[];
  generatedAt: string; // ISO timestamp
}
