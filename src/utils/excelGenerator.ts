import * as XLSX from 'xlsx';
import { BoringData, SieveData } from '../types';

function projectRows(project: BoringData['project']): (string | number)[][] {
  return [
    ['Project Name', project.projectName],
    ['Project Number', project.projectNumber],
    ['Client', project.client],
    ['Location', project.location],
    ['County', project.county],
    ['State', project.state],
    ['Date', project.date],
    ['Logged By', project.loggedBy],
    ['Checked By', project.checkedBy],
  ];
}

function autoFitColumns(ws: XLSX.WorkSheet, rows: (string | number)[][]) {
  const widths: number[] = [];
  rows.forEach(row => {
    row.forEach((cell, i) => {
      const len = String(cell ?? '').length;
      widths[i] = Math.max(widths[i] || 10, Math.min(len + 2, 60));
    });
  });
  ws['!cols'] = widths.map(wch => ({ wch }));
}

function addSheet(wb: XLSX.WorkBook, name: string, rows: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  autoFitColumns(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, name);
}

export function generateBoringExcel(data: BoringData) {
  const wb = XLSX.utils.book_new();

  addSheet(wb, 'Boring Info', [
    [data.boringType === 'soil' ? 'SOIL BORING LOG (Fig 3-5)' : 'CORE BORING LOG (Fig 3-7)'],
    [],
    ...projectRows(data.project),
    [],
    ['Boring ID', data.boringId],
    ['Ground Elevation', data.groundElevation],
    ['North', data.coordinates.north],
    ['East', data.coordinates.east],
    ['Station', data.station],
    ['Offset', data.offset],
    ['Drilling Method', data.drillingMethod],
    ['Rig Type', data.rigType],
    ['Boring Diameter', data.boringDiameter],
    ['Total Depth (ft)', data.totalDepth],
    ['Groundwater Depth (ft)', data.groundwaterDepth],
    ['Groundwater Date', data.groundwaterDate],
    ['Casing Info', data.casingInfo],
    ['Sealant Info', data.sealantInfo],
    [],
    ['Remarks', data.remarks],
  ]);

  if (data.soilLayers.length > 0) {
    addSheet(wb, 'Soil Layers', [
      ['Depth From (ft)', 'Depth To (ft)', 'Description', 'USCS', 'Color', 'Moisture', 'Consistency', 'Density', 'Inclusions'],
      ...data.soilLayers.map(l => [l.depthFrom, l.depthTo, l.description, l.uscsSymbol, l.color, l.moisture, l.consistency, l.density, l.inclusions]),
    ]);
  }

  if (data.rockLayers.length > 0) {
    addSheet(wb, 'Rock Layers', [
      ['Depth From (ft)', 'Depth To (ft)', 'Rock Type', 'Color', 'Hardness', 'Weathering', 'Fracturing', 'Description'],
      ...data.rockLayers.map(l => [l.depthFrom, l.depthTo, l.rockType, l.color, l.hardness, l.weathering, l.fracturing, l.description]),
    ]);
  }

  if (data.coreRuns.length > 0) {
    addSheet(wb, 'Core Runs', [
      ['Run #', 'Depth From (ft)', 'Depth To (ft)', 'Core Length (ft)', 'Recovery (%)', 'RQD (%)', 'Remarks'],
      ...data.coreRuns.map(r => [r.runNumber, r.depthFrom, r.depthTo, r.coreLength, r.recovery, r.rqd, r.remarks]),
    ]);
  }

  if (data.sptData.length > 0) {
    addSheet(wb, 'SPT Data', [
      ['Depth (ft)', 'Blow 1', 'Blow 2', 'Blow 3', 'Blow 4', 'N-Value', 'Recovery (%)', 'Remarks'],
      ...data.sptData.map(s => [s.depth, s.blow1, s.blow2, s.blow3, s.blow4, s.nValue, s.recovery, s.remarks]),
    ]);
  }

  if (data.samples.length > 0) {
    addSheet(wb, 'Samples', [
      ['Sample #', 'Depth (ft)', 'Type', 'Description'],
      ...data.samples.map(s => [s.number, s.depth, s.type, s.description]),
    ]);
  }

  const fileName = `${data.boringId || 'boring-log'}_${data.boringType}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function generateSieveExcel(data: SieveData) {
  const wb = XLSX.utils.book_new();

  addSheet(wb, 'Sample Info', [
    ['SIEVE ANALYSIS (Fig 10-12)'],
    [],
    ...projectRows(data.project),
    [],
    ['Sample ID', data.sampleId],
    ['Boring ID', data.boringId],
    ['Sample Depth', data.sampleDepth],
    ['Soil Description', data.soilDescription],
    ['Total Weight (g)', data.totalWeight],
    ['USCS Classification', data.classification.uscs],
    ['AASHTO Classification', data.classification.aashto],
  ]);

  addSheet(wb, 'Sieve Results', [
    ['Sieve Size', 'Opening (mm)', 'Weight Retained (g)', '% Retained', 'Cumulative % Retained', '% Passing'],
    ...data.sieveResults.map(r => [r.sieveSize, r.openingMm, r.weightRetained, r.percentRetained, r.cumulativePercentRetained, r.percentPassing]),
  ]);

  if (data.hydrometerResults.length > 0) {
    addSheet(wb, 'Hydrometer', [
      ['Particle Size (mm)', '% Passing'],
      ...data.hydrometerResults.map(h => [h.particleSize, h.percentPassing]),
    ]);
  }

  const fileName = `${data.sampleId || 'sieve-analysis'}_sieve.xlsx`;
  XLSX.writeFile(wb, fileName);
}
