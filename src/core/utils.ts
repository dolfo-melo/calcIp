// ─── IP Utility Helpers ───────────────────────────────────────────────────────

/** Parse dotted-decimal IP into array of 4 octets */
export function parseIPv4(ip: string): number[] {
  return ip.split('.').map(Number);
}

/** Convert dotted-decimal IP to 32-bit integer */
export function ipv4ToInt(ip: string): number {
  const parts = parseIPv4(ip);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/** Convert 32-bit integer to dotted-decimal IP */
export function intToIPv4(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

/** Convert dotted-decimal IP to binary string with dot separators */
export function ipv4ToBinary(ip: string): string {
  return parseIPv4(ip)
    .map((o) => o.toString(2).padStart(8, '0'))
    .join('.');
}

/** Validate an IPv4 address */
export function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

/** Validate CIDR prefix (/0 to /32) */
export function isValidCIDR4(cidr: number): boolean {
  return Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
}

/** Convert subnet mask in decimal to CIDR prefix */
export function maskToCIDR(mask: string): number {
  const n = ipv4ToInt(mask);
  return n.toString(2).split('').filter((b) => b === '1').length;
}

/** Convert CIDR prefix to dotted-decimal subnet mask */
export function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return intToIPv4(mask);
}

/** Detect if a string looks like a decimal mask (has dots) or CIDR (just number) */
export function parseMaskInput(input: string): number | null {
  const trimmed = input.trim().replace(/^\//, '');
  if (/^\d{1,2}$/.test(trimmed)) {
    const cidr = parseInt(trimmed);
    return isValidCIDR4(cidr) ? cidr : null;
  }
  if (isValidIPv4(trimmed)) return maskToCIDR(trimmed);
  return null;
}

// ─── IPv6 Utilities ──────────────────────────────────────────────────────────

/** Expand a compressed IPv6 address to full 8-group notation */
export function expandIPv6(ip: string): string {
  let addr = ip.trim();
  if (addr.includes('::')) {
    const sides = addr.split('::');
    const left = sides[0] ? sides[0].split(':') : [];
    const right = sides[1] ? sides[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    const middle = Array(missing).fill('0000');
    addr = [...left, ...middle, ...right].join(':');
  }
  return addr
    .split(':')
    .map((g) => g.padStart(4, '0'))
    .join(':');
}

/** Compress an expanded IPv6 address (remove leading zeros + longest :: run) */
export function compressIPv6(ip: string): string {
  const expanded = expandIPv6(ip);
  // Remove leading zeros
  const groups = expanded.split(':').map((g) => g.replace(/^0+/, '') || '0');
  // Replace longest run of consecutive zeros with ::
  let best = { start: -1, len: 0 };
  let cur = { start: -1, len: 0 };
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (cur.start === -1) cur = { start: i, len: 1 };
      else cur.len++;
      if (cur.len > best.len) best = { ...cur };
    } else {
      cur = { start: -1, len: 0 };
    }
  }
  if (best.len >= 2) {
    const before = groups.slice(0, best.start).join(':');
    const after = groups.slice(best.start + best.len).join(':');
    return `${before}::${after}`.replace(/^::/, '::').replace(/::$/, '::');
  }
  return groups.join(':');
}

/** Convert expanded IPv6 address to array of 8 BigInt 16-bit groups */
export function ipv6ToGroups(ip: string): bigint[] {
  return expandIPv6(ip)
    .split(':')
    .map((g) => BigInt(`0x${g}`));
}

/** Convert 128-bit BigInt back to expanded IPv6 */
export function bigIntToIPv6(n: bigint): string {
  const groups: string[] = [];
  for (let i = 7; i >= 0; i--) {
    groups.unshift(((n >> BigInt(i * 16)) & BigInt(0xffff)).toString(16).padStart(4, '0'));
  }
  return groups.join(':');
}

/** Parse an IPv6 address + prefix length into a BigInt network address */
export function ipv6ToInt(ip: string): bigint {
  const groups = ipv6ToGroups(ip);
  return groups.reduce((acc, g) => (acc << BigInt(16)) | g, BigInt(0));
}

/** Validate an IPv6 address (basic) */
export function isValidIPv6(ip: string): boolean {
  try {
    const expanded = expandIPv6(ip);
    const groups = expanded.split(':');
    if (groups.length !== 8) return false;
    return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
  } catch {
    return false;
  }
}

/** Validate IPv6 prefix length */
export function isValidCIDR6(prefix: number): boolean {
  return Number.isInteger(prefix) && prefix >= 0 && prefix <= 128;
}

/** Convert full IPv6 to binary string (128 chars, no separators) */
export function ipv6ToBinary(ip: string): string {
  return ipv6ToGroups(ip)
    .map((g) => g.toString(2).padStart(16, '0'))
    .join('');
}

/** Format binary string of IPv6 into readable blocks of 16 bits */
export function formatIPv6Binary(ip: string): string {
  const bin = ipv6ToBinary(ip);
  return bin.match(/.{16}/g)!.join(' : ');
}

/** Detect address type of an IPv6 address */
export function getIPv6AddressType(ip: string): string {
  const expanded = expandIPv6(ip);
  const firstGroup = parseInt(expanded.split(':')[0], 16);
  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') return 'Loopback (::1)';
  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') return 'Endereço não especificado (::)';
  if (expanded.startsWith('fe80')) return 'Link-Local (fe80::/10)';
  if (expanded.startsWith('fc') || expanded.startsWith('fd')) return 'Unique Local (fc00::/7)';
  if (expanded.startsWith('ff')) return 'Multicast (ff00::/8)';
  if ((firstGroup & 0xe000) === 0x2000) return 'Global Unicast (2000::/3)';
  if (expanded.startsWith('0000:0000:0000:0000:0000:ffff')) return 'Mapeado IPv4 (::ffff:0:0/96)';
  return 'Desconhecido';
}
