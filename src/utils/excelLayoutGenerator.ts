import ExcelJS from 'exceljs';
import { BoringData, SieveData, ProjectInfo } from '../types';

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
const ALT_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F8FA' } };
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  bottom: { style: 'thin' },
  left: { style: 'thin' },
  right: { style: 'thin' },
};

function downloadWorkbook(wb: ExcelJS.Workbook, fileName: string) {
  wb.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function addTitleBlock(ws: ExcelJS.Worksheet, lastCol: number, subtitle: string) {
  const lines = [
    { text: 'COMMONWEALTH OF KENTUCKY', size: 14, bold: true },
    { text: 'TRANSPORTATION CABINET', size: 11, bold: true },
    { text: 'Division of Geological & Geotechnical Services', size: 10, bold: false },
    { text: subtitle, size: 12, bold: true },
  ];
  lines.forEach(line => {
    const row = ws.addRow([line.text]);
    ws.mergeCells(row.number, 1, row.number, lastCol);
    row.getCell(1).font = { size: line.size, bold: line.bold };
    row.getCell(1).alignment = { horizontal: 'center' };
  });
  ws.addRow([]);
}

function addLabelValueRow(
  ws: ExcelJS.Worksheet,
  lastCol: number,
  left: [string, string],
  right?: [string, string]
) {
  const mid = Math.ceil(lastCol / 2);
  const row = ws.addRow([]);
  row.getCell(1).value = left[0];
  row.getCell(1).font = { bold: true, size: 9 };
  row.getCell(2).value = left[1];
  row.getCell(2).font = { size: 9 };
  if (lastCol > 3) ws.mergeCells(row.number, 2, row.number, mid);
  if (right) {
    row.getCell(mid + 1).value = right[0];
    row.getCell(mid + 1).font = { bold: true, size: 9 };
    row.getCell(mid + 2).value = right[1];
    row.getCell(mid + 2).font = { size: 9 };
    if (mid + 2 < lastCol) ws.mergeCells(row.number, mid + 2, row.number, lastCol);
  }
}

function addProjectBlock(ws: ExcelJS.Worksheet, lastCol: number, project: ProjectInfo) {
  addLabelValueRow(ws, lastCol, ['Project:', project.projectName], ['Project No:', project.projectNumber]);
  addLabelValueRow(ws, lastCol, ['Client:', project.client], ['Date:', project.date]);
  addLabelValueRow(ws, lastCol, ['Location:', project.location], ['County:', project.county]);
  ws.addRow([]);
}

function addSectionTable(
  ws: ExcelJS.Worksheet,
  lastCol: number,
  title: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const titleRow = ws.addRow([title]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, lastCol);
  titleRow.getCell(1).font = { bold: true, size: 10 };

  const headerRow = ws.addRow(headers);
  headers.forEach((_, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });

  rows.forEach((rowData, rIdx) => {
    const row = ws.addRow(rowData);
    rowData.forEach((_, i) => {
      const cell = row.getCell(i + 1);
      cell.font = { size: 8 };
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: 'top', wrapText: true };
      if (rIdx % 2 === 1) cell.fill = ALT_FILL;
    });
  });

  ws.addRow([]);
}

function addFooter(ws: ExcelJS.Worksheet, lastCol: number, project: ProjectInfo) {
  const mid = Math.ceil(lastCol / 2);
  const row = ws.addRow([]);
  row.getCell(1).value = `Logged By: ${project.loggedBy}`;
  ws.mergeCells(row.number, 1, row.number, mid);
  row.getCell(mid + 1).value = `Checked By: ${project.checkedBy}`;
  ws.mergeCells(row.number, mid + 1, row.number, lastCol);
  row.eachCell(cell => {
    cell.font = { size: 8 };
    cell.border = { top: { style: 'medium' } };
  });
}

export function generateBoringLayoutExcel(data: BoringData) {
  const wb = new ExcelJS.Workbook();
  const lastCol = 9;
  const ws = wb.addWorksheet('Boring Log', {
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  ws.columns = Array.from({ length: lastCol }, () => ({ width: 13 }));
  ws.getColumn(3).width = 28;

  const subtitle = data.boringType === 'soil' ? 'BORING LOG - SOIL (Fig 3-5)' : 'BORING LOG - CORE/ROCK (Fig 3-7)';
  addTitleBlock(ws, lastCol, subtitle);
  addProjectBlock(ws, lastCol, data.project);

  addLabelValueRow(ws, lastCol, ['Boring ID:', data.boringId], ['Ground Elev:', `${data.groundElevation} ft`]);
  addLabelValueRow(ws, lastCol, ['Station:', data.station], ['Offset:', data.offset]);
  addLabelValueRow(ws, lastCol, ['North:', data.coordinates.north], ['East:', data.coordinates.east]);
  addLabelValueRow(ws, lastCol, ['Drilling Method:', data.drillingMethod], ['Rig Type:', data.rigType]);
  addLabelValueRow(ws, lastCol, ['Boring Diameter:', data.boringDiameter], ['Total Depth:', `${data.totalDepth} ft`]);
  addLabelValueRow(ws, lastCol, [
    'Groundwater:',
    data.groundwaterDepth ? `${data.groundwaterDepth} ft (${data.groundwaterDate})` : 'Not encountered',
  ]);
  if (data.casingInfo) addLabelValueRow(ws, lastCol, ['Casing:', data.casingInfo]);
  if (data.sealantInfo) addLabelValueRow(ws, lastCol, ['Sealant:', data.sealantInfo]);
  ws.addRow([]);

  if (data.boringType === 'soil') {
    addSectionTable(
      ws,
      lastCol,
      'Soil Stratigraphy Log',
      ['Depth From (ft)', 'Depth To (ft)', 'Soil Description', 'USCS', 'Color', 'Moisture', 'Consistency/Density', 'Inclusions'],
      data.soilLayers.map(l => [l.depthFrom, l.depthTo, l.description, l.uscsSymbol, l.color, l.moisture, l.consistency || l.density, l.inclusions])
    );
  } else {
    if (data.rockLayers.length > 0) {
      addSectionTable(
        ws,
        lastCol,
        'Rock Stratigraphy Log',
        ['Depth From', 'Depth To', 'Rock Type', 'Color', 'Hardness', 'Weathering', 'Fracturing', 'Description'],
        data.rockLayers.map(l => [l.depthFrom, l.depthTo, l.rockType, l.color, l.hardness, l.weathering, l.fracturing, l.description])
      );
    }
    if (data.coreRuns.length > 0) {
      addSectionTable(
        ws,
        lastCol,
        'Core Run Data',
        ['Run #', 'Depth From', 'Depth To', 'Core Length (in)', 'Recovery %', 'RQD %', 'Remarks'],
        data.coreRuns.map(r => [r.runNumber, r.depthFrom, r.depthTo, r.coreLength, r.recovery, r.rqd, r.remarks])
      );
    }
  }

  if (data.sptData.length > 0) {
    addSectionTable(
      ws,
      lastCol,
      'SPT Data Summary',
      ['Depth (ft)', 'Blow 1', 'Blow 2', 'Blow 3', 'Blow 4', 'N-Value', 'Recovery (in)', 'Remarks'],
      data.sptData.map(r => [r.depth, r.blow1, r.blow2, r.blow3, r.blow4, r.nValue, r.recovery, r.remarks])
    );
  }

  if (data.samples.length > 0) {
    addSectionTable(
      ws,
      lastCol,
      'Sample Records',
      ['Sample #', 'Depth (ft)', 'Type', 'Description'],
      data.samples.map(s => [s.number, s.depth, s.type, s.description])
    );
  }

  if (data.remarks) {
    const labelRow = ws.addRow(['Remarks:']);
    labelRow.getCell(1).font = { bold: true, size: 9 };
    const remarkRow = ws.addRow([data.remarks]);
    ws.mergeCells(remarkRow.number, 1, remarkRow.number, lastCol);
    remarkRow.getCell(1).font = { size: 9 };
    remarkRow.getCell(1).alignment = { wrapText: true, vertical: 'top' };
    ws.addRow([]);
  }

  addFooter(ws, lastCol, data.project);

  const fileName = `Boring_${data.boringId || 'log'}_${data.boringType === 'soil' ? 'Fig3-5' : 'Fig3-7'}_layout.xlsx`;
  downloadWorkbook(wb, fileName);
}

export function generateSieveLayoutExcel(data: SieveData) {
  const wb = new ExcelJS.Workbook();
  const lastCol = 6;
  const ws = wb.addWorksheet('Sieve Analysis', {
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  ws.columns = Array.from({ length: lastCol }, () => ({ width: 16 }));

  addTitleBlock(ws, lastCol, 'SIEVE ANALYSIS (Fig 10-12)');
  addProjectBlock(ws, lastCol, data.project);

  addLabelValueRow(ws, lastCol, ['Sample ID:', data.sampleId], ['Boring ID:', data.boringId]);
  addLabelValueRow(ws, lastCol, ['Sample Depth:', data.sampleDepth], ['Total Weight (g):', String(data.totalWeight)]);
  addLabelValueRow(ws, lastCol, ['Soil Description:', data.soilDescription]);
  addLabelValueRow(ws, lastCol, ['USCS:', data.classification.uscs], ['AASHTO:', data.classification.aashto]);
  ws.addRow([]);

  addSectionTable(
    ws,
    lastCol,
    'Sieve Results',
    ['Sieve Size', 'Opening (mm)', 'Weight Retained (g)', '% Retained', 'Cum. % Retained', '% Passing'],
    data.sieveResults.map(r => [r.sieveSize, r.openingMm, r.weightRetained, r.percentRetained, r.cumulativePercentRetained, r.percentPassing])
  );

  if (data.hydrometerResults.length > 0) {
    addSectionTable(
      ws,
      lastCol,
      'Hydrometer Results',
      ['Particle Size (mm)', '% Passing'],
      data.hydrometerResults.map(h => [h.particleSize, h.percentPassing])
    );
  }

  addFooter(ws, lastCol, data.project);

  const fileName = `${data.sampleId || 'sieve-analysis'}_sieve_layout.xlsx`;
  downloadWorkbook(wb, fileName);
}
