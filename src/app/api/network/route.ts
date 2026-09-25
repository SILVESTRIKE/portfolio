/*
Reason for existence: Next.js API Route serving virtualized WebOS network telemetry, listening sockets, interface configs, gateway, and UFW firewall status.
System impact if absent: NetworkApp will lack network telemetry data and fail to display server socket connections.
*/

import { NextResponse } from 'next/server';

interface SocketItem {
  proto: string;
  local: string;
  foreign: string;
  state: string;
  service: string;
  port: number;
}

interface InterfaceItem {
  name: string;
  ip: string;
  mac: string;
  cidr: string;
  isUp: boolean;
}

interface NetworkApiResponse {
  primaryInterface: InterfaceItem;
  interfaces: InterfaceItem[];
  gateway: string;
  dns: string[];
  ufwActive: boolean;
  sockets: SocketItem[];
}

const DEMO_SOCKETS: SocketItem[] = [
  { proto: 'tcp', local: '0.0.0.0:80', foreign: '*:*', state: 'LISTEN', service: 'nginx/http', port: 80 },
  { proto: 'tcp', local: '0.0.0.0:443', foreign: '*:*', state: 'LISTEN', service: 'nginx/https', port: 443 },
  { proto: 'tcp', local: '*:3000', foreign: '*:*', state: 'LISTEN', service: 'next-portfolio', port: 3000 },
  { proto: 'tcp', local: '127.0.0.1:5432', foreign: '0.0.0.0:*', state: 'LISTEN', service: 'postgresql-odoo', port: 5432 },
  { proto: 'tcp', local: '127.0.0.1:6379', foreign: '0.0.0.0:*', state: 'LISTEN', service: 'redis-server', port: 6379 },
  { proto: 'tcp', local: '127.0.0.1:8081', foreign: '0.0.0.0:*', state: 'LISTEN', service: 'pgweb-odoo', port: 8081 },
  { proto: 'tcp', local: '127.0.0.1:8828', foreign: '0.0.0.0:*', state: 'LISTEN', service: 'doru-daemon', port: 8828 },
  { proto: 'tcp', local: '127.0.0.1:8829', foreign: '0.0.0.0:*', state: 'LISTEN', service: 'daemon-events', port: 8829 },
  { proto: 'udp', local: '127.0.0.1:53', foreign: '*:*', state: 'LISTEN', service: 'systemd-resolved', port: 53 }
];

const DEMO_INTERFACES: InterfaceItem[] = [
  {
    name: 'eth0',
    ip: '10.0.4.15',
    mac: '52:54:00:12:34:56',
    cidr: '10.0.4.15/24',
    isUp: true
  },
  {
    name: 'lo',
    ip: '127.0.0.1',
    mac: '00:00:00:00:00:00',
    cidr: '127.0.0.1/8',
    isUp: true
  },
  {
    name: 'docker0',
    ip: '172.17.0.1',
    mac: '02:42:1a:8b:9c:01',
    cidr: '172.17.0.1/16',
    isUp: true
  }
];

export async function GET() {
  const response: NetworkApiResponse = {
    primaryInterface: DEMO_INTERFACES[0],
    interfaces: DEMO_INTERFACES,
    gateway: '10.0.4.1',
    dns: ['1.1.1.1', '8.8.8.8'],
    ufwActive: true,
    sockets: DEMO_SOCKETS
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
