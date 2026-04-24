import Papa from 'papaparse';
import { SubnetResult } from '../core/subnet';
import { VLSMEntry } from '../core/vlsm';

// BOM garante que Excel e o SO identifiquem UTF-8 corretamente
const UTF8_BOM = '﻿';

function triggerDownload(content: string, filename: string, mime: string, addBOM = false) {
  const payload = addBOM ? UTF8_BOM + content : content;
  const blob = new Blob([payload], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSubnetToCSV(results: SubnetResult[], filename = 'subnets.csv') {
  const data = results.map((r) => ({
    'IP de Entrada': r.inputIP,
    'CIDR': `/${r.cidr}`,
    'Endereço de Rede': r.networkAddress,
    'Broadcast': r.broadcastAddress,
    'Primeiro Host': r.firstHost,
    'Último Host': r.lastHost,
    'Máscara': r.subnetMask,
    'Wildcard': r.wildcardMask,
    'Total de IPs': r.totalIPs,
    'Hosts Utilizáveis': r.usableHosts,
    'Classe': r.networkClass,
  }));
  const csv = Papa.unparse(data);
  triggerDownload(csv, filename, 'text/csv;charset=utf-8', true);
}

export function exportVLSMToCSV(entries: VLSMEntry[], filename = 'vlsm.csv') {
  const data = entries.map((e, i) => ({
    '#': i + 1,
    'Sub-rede': e.requirementName,
    'Hosts Requeridos': e.requiredHosts,
    'Hosts Alocados': e.usableHosts,
    'Rede': `${e.networkAddress}/${e.cidr}`,
    'Máscara': e.subnetMask,
    'Primeiro Host': e.firstHost,
    'Último Host': e.lastHost,
    'Broadcast': e.broadcastAddress,
  }));
  const csv = Papa.unparse(data);
  triggerDownload(csv, filename, 'text/csv;charset=utf-8', true);
}

export function exportToJSON(data: unknown, filename = 'subnetrain-export.json') {
  const json = JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
  triggerDownload(json, filename, 'application/json;charset=utf-8', true);
}
