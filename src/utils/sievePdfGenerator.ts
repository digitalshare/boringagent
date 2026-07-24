import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SieveData } from '../types';

export function generateSievePdf(data: SieveData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('COMMONWEALTH OF KENTUCKY', pageWidth / 2, y, { align: 'center' });
  y += 14;
  doc.setFontSize(10);
  doc.text('TRANSPORTATION CABINET', pageWidth / 2, y, { align: 'center' });
  y += 12;
  doc.text('Division of Geological & Geotechnical Services', pageWidth / 2, y, { align: 'center' });
  y += 16;

  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SIEVE ANALYSIS - GRAIN SIZE DISTRIBUTION (Fig 10-12)', pageWidth / 2, y, { align: 'center' });
  y += 18;

  doc.setFontSize(8);
  const infoLeft = margin;
  const infoRight = pageWidth / 2 + 10;
  const lineH = 11;

  doc.setFont('helvetica', 'bold');
  doc.text('Project:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.project.projectName, infoLeft + 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Project No:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.project.projectNumber, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Client:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.project.client, infoLeft + 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.project.date, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Location:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.project.location, infoLeft + 50, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Sample ID:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.sampleId, infoLeft + 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Boring ID:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.boringId, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Sample Depth:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.sampleDepth, infoLeft + 60, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Weight:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.totalWeight.toFixed(2)} g`, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Description:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.soilDescription, infoLeft + 60, y);
  y += lineH + 6;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Sieve Analysis Results', margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Sieve Size', 'Opening (mm)', 'Weight Retained (g)', '% Retained', 'Cum. % Retained', '% Passing']],
    body: data.sieveResults.map(sr => [
      sr.sieveSize,
      sr.openingMm.toString(),
      sr.weightRetained.toFixed(2),
      sr.percentRetained.toFixed(2),
      sr.cumulativePercentRetained.toFixed(2),
      sr.percentPassing.toFixed(2),
    ]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 250] },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  const d10 = data.sieveResults.find(r => r.percentPassing <= 10);
  const d30 = data.sieveResults.find(r => r.percentPassing <= 30);
  const d60 = data.sieveResults.find(r => r.percentPassing <= 60);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Gradation Coefficients:', margin, y);
  y += 10;
  doc.setFont('helvetica', 'normal');

  const d10Val = d10 ? d10.openingMm : null;
  const d30Val = d30 ? d30.openingMm : null;
  const d60Val = d60 ? d60.openingMm : null;

  const cu = d10Val && d60Val ? (d60Val / d10Val).toFixed(2) : 'N/A';
  const cc = d10Val && d30Val && d60Val ? ((d30Val ** 2) / (d60Val * d10Val)).toFixed(2) : 'N/A';

  doc.text(`D10: ${d10Val ? d10Val + ' mm' : 'N/A'}`, margin, y);
  doc.text(`D30: ${d30Val ? d30Val + ' mm' : 'N/A'}`, margin + 120, y);
  doc.text(`D60: ${d60Val ? d60Val + ' mm' : 'N/A'}`, margin + 240, y);
  y += 10;
  doc.text(`Cu (Uniformity Coefficient): ${cu}`, margin, y);
  doc.text(`Cc (Coefficient of Curvature): ${cc}`, margin + 240, y);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.text(`USCS Classification: ${data.classification.uscs || 'N/A'}`, margin, y);
  doc.text(`AASHTO Classification: ${data.classification.aashto || 'N/A'}`, margin + 250, y);
  y += 16;

  if (data.hydrometerResults.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Hydrometer Results:', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Particle Size (mm)', '% Passing']],
      body: data.hydrometerResults.map(hr => [
        hr.particleSize.toString(),
        hr.percentPassing.toFixed(2),
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      tableWidth: 200,
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (y > pageHeight - 280) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Grain Size Distribution Curve', margin, y);
  y += 6;

  const chartCanvas = generateChartCanvas(data);
  const chartImgData = chartCanvas.toDataURL('image/png');
  const chartWidth = pageWidth - 2 * margin;
  const chartHeight = chartWidth * 0.55;
  doc.addImage(chartImgData, 'PNG', margin, y, chartWidth, chartHeight);
  y += chartHeight + 10;

  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Logged By: ${data.project.loggedBy}`, margin, footerY);
  doc.text(`Checked By: ${data.project.checkedBy}`, pageWidth / 2 - 50, footerY);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

  const filename = `Sieve_${data.sampleId || 'analysis'}_Fig10-12.pdf`;
  doc.save(filename);
}

function generateChartCanvas(data: SieveData): HTMLCanvasElement {
  const width = 700;
  const height = 385;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  const margin = { top: 25, right: 25, bottom: 50, left: 55 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const xMin = 0.01;
  const xMax = 100;
  const logMin = Math.log10(xMin);
  const logMax = Math.log10(xMax);

  const xScale = (val: number) => margin.left + ((Math.log10(val) - logMin) / (logMax - logMin)) * plotW;
  const yScale = (pct: number) => margin.top + plotH - (pct / 100) * plotH;

  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 0.5;

  const subGridValues = [-2, -1.7, -1.52, -1.3, -1, -0.7, -0.52, -0.3, 0, 0.3, 0.52, 0.7, 1, 1.3, 1.52, 1.7, 2];
  for (const g of subGridValues) {
    const x = margin.left + ((g - logMin) / (logMax - logMin)) * plotW;
    if (x >= margin.left && x <= margin.left + plotW) {
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotH);
      ctx.stroke();
    }
  }

  for (let pct = 0; pct <= 100; pct += 10) {
    const y = yScale(pct);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + plotW, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(margin.left, margin.top, plotW, plotH);

  ctx.fillStyle = '#333333';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';

  const xLabels = [
    { val: 0.01, label: '0.01' },
    { val: 0.1, label: '0.1' },
    { val: 1, label: '1' },
    { val: 10, label: '10' },
    { val: 100, label: '100' },
  ];
  for (const lbl of xLabels) {
    const x = xScale(lbl.val);
    ctx.fillText(lbl.label, x, margin.top + plotH + 18);
    ctx.beginPath();
    ctx.moveTo(x, margin.top + plotH);
    ctx.lineTo(x, margin.top + plotH + 4);
    ctx.stroke();
  }

  ctx.font = '11px Arial';
  ctx.fillText('Particle Size (mm)', margin.left + plotW / 2, height - 8);

  ctx.textAlign = 'right';
  ctx.font = '10px Arial';
  for (let pct = 0; pct <= 100; pct += 20) {
    const y = yScale(pct);
    ctx.fillText(`${pct}`, margin.left - 6, y + 3);
  }

  ctx.save();
  ctx.translate(12, margin.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = '11px Arial';
  ctx.fillText('Percent Passing (%)', 0, 0);
  ctx.restore();

  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 3]);
  const boundaries = [0.002, 0.075, 4.75];
  for (const b of boundaries) {
    const x = xScale(b);
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + plotH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = '#888888';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  const zoneLabels = [
    { x: 0.005, label: 'Clay' },
    { x: 0.03, label: 'Silt' },
    { x: 0.5, label: 'Fine Sand' },
    { x: 2, label: 'Med Sand' },
    { x: 10, label: 'Gravel' },
  ];
  for (const z of zoneLabels) {
    ctx.fillText(z.label, xScale(z.x), margin.top - 6);
  }

  const dataPoints: { x: number; y: number }[] = [];
  for (const sr of data.sieveResults) {
    if (sr.weightRetained > 0 || sr.percentPassing < 100) {
      dataPoints.push({ x: sr.openingMm, y: sr.percentPassing });
    }
  }
  for (const hr of data.hydrometerResults) {
    dataPoints.push({ x: hr.particleSize, y: hr.percentPassing });
  }
  dataPoints.sort((a, b) => b.x - a.x);

  if (dataPoints.length > 0) {
    ctx.strokeStyle = '#1a5276';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xScale(dataPoints[0].x), yScale(dataPoints[0].y));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(xScale(dataPoints[i].x), yScale(dataPoints[i].y));
    }
    ctx.stroke();

    ctx.fillStyle = '#1a5276';
    for (const pt of dataPoints) {
      ctx.beginPath();
      ctx.arc(xScale(pt.x), yScale(pt.y), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas;
}
