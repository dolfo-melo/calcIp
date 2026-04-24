import {
  ipv6ToInt,
  bigIntToIPv6,
  expandIPv6,
  compressIPv6,
  formatIPv6Binary,
  getIPv6AddressType,
} from './utils';

export interface IPv6Result {
  id: string;
  timestamp: number;
  // Inputs
  inputAddress: string;
  prefix: number;
  // Calculated
  expandedAddress: string;
  compressedAddress: string;
  networkAddress: string;
  networkCompressed: string;
  prefixLength: number;
  totalAddresses: bigint;
  addressType: string;
  binaryRepresentation: string;
  // Additional info
  firstAddress: string;
  lastAddress: string;
}

/** Main IPv6 subnet calculation */
export function calculateIPv6(address: string, prefix: number): IPv6Result {
  const addrInt = ipv6ToInt(address);
  const prefixBigInt = BigInt(prefix);

  // Network mask: first `prefix` bits set to 1
  const maxBits = BigInt(128);
  const mask =
    prefix === 0
      ? BigInt(0)
      : ((BigInt(1) << maxBits) - BigInt(1)) ^ ((BigInt(1) << (maxBits - prefixBigInt)) - BigInt(1));

  const networkInt = addrInt & mask;
  const hostMask = ~mask & ((BigInt(1) << maxBits) - BigInt(1));
  const lastInt = networkInt | hostMask;

  const totalAddresses =
    prefix === 128 ? BigInt(1) : BigInt(1) << (maxBits - prefixBigInt);

  const networkAddr = bigIntToIPv6(networkInt);
  const lastAddr = bigIntToIPv6(lastInt);

  const expanded = expandIPv6(address);
  const compressed = compressIPv6(address);

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    inputAddress: address,
    prefix,
    expandedAddress: expanded,
    compressedAddress: compressed,
    networkAddress: networkAddr,
    networkCompressed: compressIPv6(networkAddr),
    prefixLength: prefix,
    totalAddresses,
    addressType: getIPv6AddressType(expanded),
    binaryRepresentation: formatIPv6Binary(address),
    firstAddress: networkAddr,
    lastAddress: lastAddr,
  };
}

/** Format large BigInt as human-readable number (e.g., 2^64) */
export function formatAddressCount(n: bigint): string {
  // Try to express as power of 2
  let power = 0;
  let temp = n;
  while (temp > BigInt(1) && temp % BigInt(2) === BigInt(0)) {
    temp /= BigInt(2);
    power++;
  }
  if (temp === BigInt(1)) return `2^${power} ≈ ${formatBigIntShort(n)}`;
  return formatBigIntShort(n);
}

function formatBigIntShort(n: bigint): string {
  const s = n.toString();
  if (s.length <= 9) return s;
  const units = ['', 'mil', 'milhões', 'bilhões', 'trilhões', 'quatrilhões', 'quintilhões'];
  const idx = Math.floor((s.length - 1) / 3);
  const val = Number(n / BigInt(10 ** ((idx - 1) * 3 || 1)));
  return `~${(val / 1000).toFixed(1)} ${units[Math.min(idx, units.length - 1)]}`;
}
