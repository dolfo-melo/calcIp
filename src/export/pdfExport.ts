import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubnetResult, calculateSubnet, generatePossibleSubnets } from '../core/subnet';
import { VLSMEntry } from '../core/vlsm';
import { Project } from '../db/indexeddb';

const PRIMARY = [0, 255, 65] as [number, number, number];    // term-bright
const ACCENT  = [0, 255, 204] as [number, number, number];   // term-cyan
const DARK    = [2, 12, 2] as [number, number, number];      // term-black
const LIGHT   = [13, 31, 13] as [number, number, number];    // term-card
const MUTED   = [45, 122, 45] as [number, number, number];   // term-muted
const TEXT    = [224, 255, 224] as [number, number, number]; // term-white
const AMBER   = [255, 179, 0] as [number, number, number];   // term-amber

function addHeader(doc: jsPDF, title: string) {
  // Page background
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 297, 'F');

  // Header separator
  doc.setDrawColor(...PRIMARY);
  doc.line(14, 28, 196, 28);

  // Títulos
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SubnetRain', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Calculadora de Sub-redes', 14, 22);

  // Report title
  doc.setTextColor(...ACCENT);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 120, 14);

  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 120, 20);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(...MUTED);
    doc.line(14, 285, 196, 285);
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.text('SubnetRain — Terminal Corporativo', 14, 292);
    doc.text(`Página ${i} de ${pageCount}`, 196, 292, { align: 'right' });
  }
}


export function exportSubnetToPDF(results: SubnetResult[], title = 'Relatório de Sub-redes') {
  const doc = new jsPDF();
  
  // Override addPage to apply dark background automatically
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function() {
    originalAddPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, 210, 297, 'F');
    return this;
  };

  addHeader(doc, title);

  let y = 36;

  results.forEach((r, idx) => {
    if (idx > 0) y += 6;
    if (y > 240) { doc.addPage(); addHeader(doc, title); y = 36; }

    // Section header
    doc.setFillColor(...ACCENT);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(0, 0, 0); // user prefers black text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Resumo da Rede: ${r.networkAddress}/${r.cidr} — Classe ${r.networkClass}`, 16, y + 5);
    y += 10;

    const formatBinary = (bin: string) => {
      const parts = bin.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}\n${parts[2]}.${parts[3]}`;
      }
      return bin;
    };

    const rows = [
      ['Endereço de Rede', r.networkAddress, 'Broadcast', r.broadcastAddress],
      ['Gateway', r.gateway ?? r.firstHost, 'Classe', r.networkClass],
      ['Primeiro Host', r.firstHost, 'Último Host', r.lastHost],
      ['Máscara', r.subnetMask, 'Wildcard', r.wildcardMask],
      ['Total de IPs', r.totalIPs.toLocaleString('pt-BR'), 'Hosts Utilizáveis', r.usableHosts.toLocaleString('pt-BR')],
      ['IP (binário)', formatBinary(r.ipBinary), 'Máscara (binário)', formatBinary(r.maskBinary)],
    ];

    autoTable(doc, {
      startY: y,
      body: rows,
      theme: 'grid',
      styles: { font: 'courier', fontSize: 8, textColor: TEXT, fillColor: DARK, lineColor: MUTED, lineWidth: 0.1, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: PRIMARY, fillColor: LIGHT, cellWidth: 40 },
        1: { fontStyle: 'normal', cellWidth: 55 },
        2: { fontStyle: 'bold', textColor: AMBER, fillColor: LIGHT, cellWidth: 40 },
        3: { fontStyle: 'normal', cellWidth: 55 },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error jspdf-autotable adds lastAutoTable to the doc instance at runtime
    y = (doc.lastAutoTable?.finalY ?? y + 20) + 12;

    // Subnets table for this result
    if (r.cidr < 31) {
      const subnets = generatePossibleSubnets(r.networkAddress, r.cidr);
      
      if (y > 240) { doc.addPage(); addHeader(doc, title); y = 36; }

      doc.setFillColor(...ACCENT);
      doc.rect(14, y, 182, 7, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Lista de Todas as ${subnets.length} Sub-redes Possíveis`, 16, y + 5);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Endereço da Rede', 'Range de Hosts Úteis', 'Broadcast']],
        body: subnets.map(s => [
          s.networkAddress,
          s.usableHosts > 0 ? `${s.firstUsable ?? s.firstHost} - ${s.lastHost}` : 'N/A',
          s.broadcastAddress
        ]),
        theme: 'grid',
        headStyles: { fillColor: LIGHT, textColor: TEXT, fontSize: 9, fontStyle: 'bold', lineColor: MUTED, lineWidth: 0.1 },
        bodyStyles: { font: 'courier', fontSize: 8, textColor: TEXT, fillColor: DARK, lineColor: MUTED, lineWidth: 0.1 },
        alternateRowStyles: { fillColor: [6, 16, 6] },
        columnStyles: {
          0: { textColor: PRIMARY, fontStyle: 'bold' }, // Rede destacada em Verde Bright
          1: { textColor: ACCENT },                     // Hosts em Ciano
          2: { textColor: AMBER, fontStyle: 'bold' }    // Broadcast destacado em Laranja/Âmbar
        },
        margin: { left: 14, right: 14 },
      });

      // @ts-expect-error jspdf-autotable adds lastAutoTable to the doc instance at runtime
      y = (doc.lastAutoTable?.finalY ?? y + 20) + 12;
    }
  });

  addFooter(doc);
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportVLSMToPDF(entries: VLSMEntry[], baseNetwork: string) {
  const doc = new jsPDF();

  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function() {
    originalAddPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, 210, 297, 'F');
    return this;
  };

  const title = `VLSM — ${baseNetwork}`;
  addHeader(doc, title);

  autoTable(doc, {
    startY: 36,
    head: [['#', 'Sub-rede', 'Req. Hosts', 'Hosts Aloc.', 'Rede/CIDR', 'Máscara', 'Gateway', '1° Host', 'Último Host', 'Broadcast']],
    body: entries.map((e, i) => [
      i + 1,
      e.requirementName,
      e.requiredHosts,
      e.usableHosts,
      `${e.networkAddress}/${e.cidr}`,
      e.subnetMask,
      e.gateway ?? '',
      e.firstHost,
      e.lastHost,
      e.broadcastAddress,
    ]),
    theme: 'grid',
    headStyles: { fillColor: LIGHT, textColor: PRIMARY, fontSize: 7, fontStyle: 'bold', lineColor: MUTED, lineWidth: 0.1 },
    bodyStyles: { font: 'courier', fontSize: 7, textColor: TEXT, fillColor: DARK, lineColor: MUTED, lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [6, 16, 6] },
    margin: { left: 10, right: 10 },
  });

  addFooter(doc);
  doc.save(`VLSM_${baseNetwork.replace(/[./]/g, '_')}.pdf`);
}

export function exportProjectToPDF(project: Project) {
  if (project.calculations.length > 0) {
    exportSubnetToPDF(
      project.calculations as SubnetResult[],
      `Projeto: ${project.name}`
    );
  }
}

export function exportPossibleSubnetsToPDF(subnets: SubnetResult[], baseNetwork: string, cidr: number) {
  const doc = new jsPDF();
  
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function() {
    originalAddPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, 210, 297, 'F');
    return this;
  };

  const title = `Relatório de Sub-redes /${cidr} — ${baseNetwork}`;
  addHeader(doc, title);

  // 1) "Antigo modelo" (Resumo da rede principal) na primeira folha
  const r = calculateSubnet(baseNetwork, cidr);
  let y = 36;
  
  doc.setFillColor(...ACCENT);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Resumo da Rede Base: ${r.networkAddress}/${r.cidr} — Classe ${r.networkClass}`, 16, y + 5);
  y += 10;

  const rows = [
    ['Endereço de Rede', r.networkAddress, 'Broadcast', r.broadcastAddress],
    ['Gateway', r.gateway ?? r.firstHost, 'Classe', r.networkClass],
    ['Primeiro Host', r.firstHost, 'Último Host', r.lastHost],
    ['Máscara', r.subnetMask, 'Wildcard', r.wildcardMask],
    ['Total de IPs', r.totalIPs.toLocaleString('pt-BR'), 'Hosts Utilizáveis', r.usableHosts.toLocaleString('pt-BR')],
    ['IP (binário)', r.ipBinary, 'Máscara (binário)', r.maskBinary],
  ];

  autoTable(doc, {
    startY: y,
    body: rows,
    theme: 'grid',
    styles: { font: 'courier', fontSize: 8, textColor: TEXT, fillColor: DARK, lineColor: MUTED, lineWidth: 0.1, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: PRIMARY, fillColor: LIGHT, cellWidth: 40 },
      1: { fontStyle: 'normal', cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: AMBER, fillColor: LIGHT, cellWidth: 40 },
      3: { fontStyle: 'normal', cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error jspdf-autotable adds lastAutoTable to the doc instance at runtime
  y = (doc.lastAutoTable?.finalY ?? y + 20) + 12;

  // 2) Tabela de Todas as Sub-redes
  doc.setFillColor(...ACCENT);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lista de Todas as ${subnets.length} Sub-redes Possíveis`, 16, y + 5);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Endereço da Rede', 'Range de Hosts Úteis', 'Broadcast']],
    body: subnets.map(s => [
      s.networkAddress,
      s.usableHosts > 0 ? `${s.firstUsable ?? s.firstHost} - ${s.lastHost}` : 'N/A',
      s.broadcastAddress
    ]),
    theme: 'grid',
    headStyles: { fillColor: LIGHT, textColor: TEXT, fontSize: 9, fontStyle: 'bold', lineColor: MUTED, lineWidth: 0.1 },
    bodyStyles: { font: 'courier', fontSize: 8, textColor: TEXT, fillColor: DARK, lineColor: MUTED, lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [6, 16, 6] },
    columnStyles: {
      0: { textColor: PRIMARY, fontStyle: 'bold' }, // Rede destacada em Verde Bright
      1: { textColor: ACCENT },                     // Hosts em Ciano
      2: { textColor: AMBER, fontStyle: 'bold' }    // Broadcast destacado em Laranja/Âmbar
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`Subredes_${baseNetwork.replace(/[./]/g, '_')}_${cidr}.pdf`);
}
