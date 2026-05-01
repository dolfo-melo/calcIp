import {
  ipv4ToInt,
  intToIPv4,
  cidrToMask,
  ipv4ToBinary,
} from './utils';

export interface SubnetResult {
  id: string;
  timestamp: number;
  // Inputs
  inputIP: string;
  cidr: number;
  // Calculated
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  gateway?: string;
  firstUsable?: string;
  subnetMask: string;
  wildcardMask: string;
  totalIPs: number;
  usableHosts: number;
  networkClass: string;
  ipBinary: string;
  maskBinary: string;
}

/** Get network class (A/B/C/D/E) from first octet */
function getNetworkClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0]);
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D (Multicast)';
  return 'E (Reservado)';
}

/** Main IPv4 subnet calculation */
export function calculateSubnet(ip: string, cidr: number): SubnetResult {
  const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const ipInt = ipv4ToInt(ip);
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  const totalIPs = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.max(0, totalIPs - 2);

  const firstHostInt = cidr >= 31 ? networkInt : networkInt + 1;
  const lastHostInt = cidr >= 31 ? broadcastInt : broadcastInt - 1;

  const subnetMask = cidrToMask(cidr);
  const wildcardMask = intToIPv4(~maskInt >>> 0);

  // firstUsable = gateway+1 (first IP available for workstations/servers)
  // For /30 (2 usable) firstUsable == lastHost; for /31+/32 same as firstHost
  const firstUsableInt = cidr <= 30 ? firstHostInt + 1 : firstHostInt;

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    inputIP: ip,
    cidr,
    networkAddress: intToIPv4(networkInt),
    broadcastAddress: intToIPv4(broadcastInt),
    firstHost: intToIPv4(firstHostInt),
    lastHost: intToIPv4(lastHostInt),
    gateway: intToIPv4(firstHostInt),
    firstUsable: intToIPv4(firstUsableInt),
    subnetMask,
    wildcardMask,
    totalIPs,
    usableHosts,
    networkClass: getNetworkClass(ip),
    ipBinary: ipv4ToBinary(ip),
    maskBinary: ipv4ToBinary(subnetMask),
  };
}
