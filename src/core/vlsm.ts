import { ipv4ToInt, intToIPv4, cidrToMask } from './utils';
import { SubnetResult } from './subnet';

export interface VLSMRequirement {
  id: string;
  name: string;
  hosts: number;
}

export interface VLSMEntry extends SubnetResult {
  requirementName: string;
  requiredHosts: number;
  allocatedCIDR: number;
}

/** Calculate minimum CIDR needed to fit `hosts` usable hosts */
function cidrForHosts(hosts: number): number {
  if (hosts <= 0) return 32;
  for (let cidr = 30; cidr >= 0; cidr--) {
    const usable = Math.pow(2, 32 - cidr) - 2;
    if (usable >= hosts) return cidr;
  }
  return 0;
}

function calcVLSMEntry(networkInt: number, cidr: number, req: VLSMRequirement): VLSMEntry {
  const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const totalIPs = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? 0 : totalIPs - 2;
  const subnetMask = cidrToMask(cidr);
  const wildcardMask = intToIPv4(~maskInt >>> 0);
  const gatewayInt = networkInt + 1;
  const firstUsableInt = cidr <= 30 ? gatewayInt + 1 : gatewayInt;

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    inputIP: intToIPv4(networkInt),
    cidr,
    networkAddress: intToIPv4(networkInt),
    broadcastAddress: intToIPv4(broadcastInt),
    firstHost: intToIPv4(gatewayInt),
    lastHost: intToIPv4(broadcastInt - 1),
    gateway: intToIPv4(gatewayInt),
    firstUsable: intToIPv4(firstUsableInt),
    subnetMask,
    wildcardMask,
    totalIPs,
    usableHosts,
    networkClass: '',
    ipBinary: '',
    maskBinary: '',
    requirementName: req.name,
    requiredHosts: req.hosts,
    allocatedCIDR: cidr,
  };
}

/** Calculate VLSM allocation for a list of requirements */
export function calculateVLSM(
  baseIP: string,
  baseCIDR: number,
  requirements: VLSMRequirement[]
): VLSMEntry[] | { error: string } {
  if (requirements.length === 0) return [];

  // Sort requirements by hosts descending (largest first)
  const sorted = [...requirements].sort((a, b) => b.hosts - a.hosts);

  const baseInt = ipv4ToInt(baseIP);
  const baseMaskInt = baseCIDR === 0 ? 0 : (~0 << (32 - baseCIDR)) >>> 0;
  const networkBase = (baseInt & baseMaskInt) >>> 0;
  const broadcastBase = (networkBase | (~baseMaskInt >>> 0)) >>> 0;

  const results: VLSMEntry[] = [];
  let nextNetwork = networkBase;

  for (const req of sorted) {
    const cidr = cidrForHosts(req.hosts);
    const blockSize = Math.pow(2, 32 - cidr);

    // Align to block boundary
    const aligned = Math.ceil(nextNetwork / blockSize) * blockSize;

    if (aligned + blockSize - 1 > broadcastBase) {
      return { error: `Espaço insuficiente na rede base para alocar "${req.name}" (${req.hosts} hosts)` };
    }

    results.push(calcVLSMEntry(aligned, cidr, req));
    nextNetwork = aligned + blockSize;
  }

  return results;
}
