// Mirrors server/src/types.ts (kept in sync by hand for phase 1).
export type Protocol = 'tcp' | 'udp';

export interface Port {
  protocol: Protocol;
  localAddress: string;
  port: number;
  state: string;
  pid?: number;
  processName?: string;
  unit?: string;
  externallyReachable: boolean;
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
  generatedAt: string;
}
