import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BoringData } from '../types';

export function generateBoringPdf(data: BoringData): void {
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
  const title = data.boringType === 'soil' ? 'BORING LOG - SOIL (Fig 3-5)' : 'BORING LOG - CORE/ROCK (Fig 3-7)';
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 18;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

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

  doc.setFont('helvetica', 'bold');
  doc.text('County:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.project.county, infoRight + 60, y);
  y += lineH + 4;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Boring ID:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.boringId, infoLeft + 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Ground Elev:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.groundElevation + ' ft', infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Station:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.station, infoLeft + 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Offset:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.offset, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('North:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.coordinates.north, infoLeft + 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('East:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.coordinates.east, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Drilling Method:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.drillingMethod, infoLeft + 80, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Rig Type:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.rigType, infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Boring Diameter:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.boringDiameter, infoLeft + 80, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Depth:', infoRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.totalDepth + ' ft', infoRight + 60, y);
  y += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Groundwater:', infoLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.groundwaterDepth ? `${data.groundwaterDepth} ft (${data.groundwaterDate})` : 'Not encountered', infoLeft + 80, y);
  y += lineH;

  if (data.casingInfo) {
    doc.setFont('helvetica', 'bold');
    doc.text('Casing:', infoLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.casingInfo, infoLeft + 80, y);
    y += lineH;
  }

  if (data.sealantInfo) {
    doc.setFont('helvetica', 'bold');
    doc.text('Sealant:', infoLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.sealantInfo, infoLeft + 80, y);
    y += lineH;
  }

  y += 6;

  if (data.boringType === 'soil') {
    y = generateSoilLogTable(doc, data, y, margin, pageWidth, pageHeight);
  } else {
    y = generateCoreLogTable(doc, data, y, margin, pageWidth, pageHeight);
  }

  if (data.sptData.length > 0) {
    y += 10;
    if (y > pageHeight - 120) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SPT Data Summary', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Depth (ft)', 'Blow 1', 'Blow 2', 'Blow 3', 'Blow 4', 'N-Value', 'Recovery (in)', 'Remarks']],
      body: data.sptData.map(r => [
        r.depth.toString(),
        r.blow1.toString(),
        r.blow2.toString(),
        r.blow3.toString(),
        r.blow4.toString(),
        r.nValue.toString(),
        r.recovery.toString(),
        r.remarks,
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 250] },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (data.samples.length > 0) {
    y += 6;
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample Records', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Sample #', 'Depth (ft)', 'Type', 'Description']],
      body: data.samples.map(s => [
        s.number.toString(),
        s.depth.toString(),
        s.type,
        s.description,
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 250] },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (data.remarks) {
    y += 6;
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', margin, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    const remarkLines = doc.splitTextToSize(data.remarks, pageWidth - 2 * margin);
    doc.text(remarkLines, margin, y);
    y += remarkLines.length * 10 + 10;
  }

  const footerY = pageHeight - 30;
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Logged By: ${data.project.loggedBy}`, margin, footerY);
  doc.text(`Checked By: ${data.project.checkedBy}`, pageWidth / 2 - 50, footerY);
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

  const filename = `Boring_${data.boringId || 'log'}_${data.boringType === 'soil' ? 'Fig3-5' : 'Fig3-7'}.pdf`;
  doc.save(filename);
}

function generateSoilLogTable(doc: jsPDF, data: BoringData, startY: number, margin: number, _pageWidth: number, _pageHeight: number): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Soil Stratigraphy Log', margin, startY);
  startY += 4;

  autoTable(doc, {
    startY,
    head: [['Depth From (ft)', 'Depth To (ft)', 'Soil Description', 'USCS', 'Color', 'Moisture', 'Consistency/Density', 'Inclusions']],
    body: data.soilLayers.map(l => [
      l.depthFrom.toString(),
      l.depthTo.toString(),
      l.description,
      l.uscsSymbol,
      l.color,
      l.moisture,
      l.consistency || l.density,
      l.inclusions,
    ]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 55 },
      2: { cellWidth: 120 },
      3: { cellWidth: 40 },
      4: { cellWidth: 50 },
      5: { cellWidth: 45 },
      6: { cellWidth: 70 },
      7: { cellWidth: 70 },
    },
  });

  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

function generateCoreLogTable(doc: jsPDF, data: BoringData, startY: number, margin: number, _pageWidth: number, pageHeight: number): number {
  if (data.rockLayers.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Rock Stratigraphy Log', margin, startY);
    startY += 4;

    autoTable(doc, {
      startY,
      head: [['Depth From', 'Depth To', 'Rock Type', 'Color', 'Hardness', 'Weathering', 'Fracturing', 'Description']],
      body: data.rockLayers.map(l => [
        l.depthFrom.toString(),
        l.depthTo.toString(),
        l.rockType,
        l.color,
        l.hardness,
        l.weathering,
        l.fracturing,
        l.description,
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 250] },
    });

    startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (data.coreRuns.length > 0) {
    if (startY > pageHeight - 100) {
      doc.addPage();
      startY = margin;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Core Run Data', margin, startY);
    startY += 4;

    autoTable(doc, {
      startY,
      head: [['Run #', 'Depth From', 'Depth To', 'Core Length (in)', 'Recovery %', 'RQD %', 'Remarks']],
      body: data.coreRuns.map(r => [
        r.runNumber.toString(),
        r.depthFrom.toString(),
        r.depthTo.toString(),
        r.coreLength.toString(),
        r.recovery.toString(),
        r.rqd.toString(),
        r.remarks,
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 250] },
    });

    startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  }

  return startY;
}
