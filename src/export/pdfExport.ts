import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubnetResult } from '../core/subnet';
import { VLSMEntry } from '../core/vlsm';
import { Project } from '../db/indexeddb';

const PRIMARY = [37, 99, 235] as [number, number, number];    // blue-600
const ACCENT  = [16, 185, 129] as [number, number, number];   // emerald-500
const DARK    = [15, 23, 42] as [number, number, number];     // slate-900
const LIGHT   = [248, 250, 252] as [number, number, number];  // slate-50

function addHeader(doc: jsPDF, title: string) {
  // Background header bar
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 28, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SubnetRain', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Calculadora de Sub-redes', 14, 22);

  // Report title
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 120, 14);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 120, 20);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...DARK);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('SubnetRain — Calculadora de sub-redes profissional', 14, 292);
    doc.text(`Página ${i} de ${pageCount}`, 196, 292, { align: 'right' });
  }
}


export function exportSubnetToPDF(results: SubnetResult[], title = 'Relatório de Sub-redes') {
  const doc = new jsPDF();
  addHeader(doc, title);

  let y = 36;

  results.forEach((r, idx) => {
    if (idx > 0) y += 6;
    if (y > 240) { doc.addPage(); addHeader(doc, title); y = 36; }

    // Section header
    doc.setFillColor(...ACCENT);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${r.networkAddress}/${r.cidr} — Classe ${r.networkClass}`, 16, y + 5);
    y += 10;

    const rows = [
      ['Endereço de Rede', r.networkAddress, 'Broadcast', r.broadcastAddress],
      ['Primeiro Host', r.firstHost, 'Último Host', r.lastHost],
      ['Máscara', r.subnetMask, 'Wildcard', r.wildcardMask],
      ['Total de IPs', r.totalIPs.toLocaleString(), 'Hosts Utilizáveis', r.usableHosts.toLocaleString()],
      ['IP (binário)', r.ipBinary, 'Máscara (binário)', r.maskBinary],
    ];

    autoTable(doc, {
      startY: y,
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8, textColor: DARK, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: LIGHT, cellWidth: 40 },
        1: { fontStyle: 'normal', cellWidth: 55 },
        2: { fontStyle: 'bold', fillColor: LIGHT, cellWidth: 40 },
        3: { fontStyle: 'normal', cellWidth: 55 },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error jspdf-autotable adds lastAutoTable to the doc instance at runtime
    y = (doc.lastAutoTable?.finalY ?? y + 20) + 4;
  });

  addFooter(doc);
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportVLSMToPDF(entries: VLSMEntry[], baseNetwork: string) {
  const doc = new jsPDF();
  const title = `VLSM — ${baseNetwork}`;
  addHeader(doc, title);

  autoTable(doc, {
    startY: 36,
    head: [['#', 'Sub-rede', 'Req. Hosts', 'Hosts Aloc.', 'Rede/CIDR', 'Máscara', '1° Host', 'Último Host', 'Broadcast']],
    body: entries.map((e, i) => [
      i + 1,
      e.requirementName,
      e.requiredHosts,
      e.usableHosts,
      `${e.networkAddress}/${e.cidr}`,
      e.subnetMask,
      e.firstHost,
      e.lastHost,
      e.broadcastAddress,
    ]),
    theme: 'striped',
    headStyles: { fillColor: PRIMARY, textColor: 255, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: DARK },
    alternateRowStyles: { fillColor: LIGHT },
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
