export interface NavItem {
  label: string;
  href: string;
}

export enum AlgorithmType {
  ROUND_ROBIN = 'Round Robin',
  WEIGHTED = 'Weighted',
  IP_HASH = 'IP Hash'
}

export interface ServerNode {
  id: number;
  name: string;
  status: 'active' | 'down';
  weight?: number;
  activeConnections: number;
}

export interface RequestPacket {
  id: number;
  targetServerId: number | null;
  progress: number; // 0 to 100
  color: string;
}