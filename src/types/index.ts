export interface ProjectInfo {
  projectName: string;
  projectNumber: string;
  client: string;
  location: string;
  county: string;
  state: string;
  date: string;
  loggedBy: string;
  checkedBy: string;
}

export interface Coordinates {
  north: string;
  east: string;
}

export interface SoilLayer {
  depthFrom: number;
  depthTo: number;
  description: string;
  uscsSymbol: string;
  color: string;
  moisture: 'dry' | 'moist' | 'wet' | '';
  consistency: string;
  density: string;
  inclusions: string;
}

export interface SPTRecord {
  depth: number;
  blow1: number;
  blow2: number;
  blow3: number;
  blow4: number;
  nValue: number;
  recovery: number;
  remarks: string;
}

export interface SampleRecord {
  number: number;
  depth: number;
  type: string;
  description: string;
}

export interface RockLayer {
  depthFrom: number;
  depthTo: number;
  rockType: string;
  color: string;
  hardness: string;
  weathering: string;
  fracturing: string;
  description: string;
}

export interface CoreRun {
  runNumber: number;
  depthFrom: number;
  depthTo: number;
  coreLength: number;
  recovery: number;
  rqd: number;
  remarks: string;
}

export interface BoringData {
  project: ProjectInfo;
  boringId: string;
  boringType: 'soil' | 'core';
  groundElevation: string;
  coordinates: Coordinates;
  station: string;
  offset: string;
  drillingMethod: string;
  rigType: string;
  boringDiameter: string;
  totalDepth: number;
  groundwaterDepth: string;
  groundwaterDate: string;
  casingInfo: string;
  sealantInfo: string;
  soilLayers: SoilLayer[];
  rockLayers: RockLayer[];
  sptData: SPTRecord[];
  samples: SampleRecord[];
  coreRuns: CoreRun[];
  remarks: string;
}

export interface SieveResult {
  sieveSize: string;
  openingMm: number;
  weightRetained: number;
  percentRetained: number;
  cumulativePercentRetained: number;
  percentPassing: number;
}

export interface HydrometerResult {
  particleSize: number;
  percentPassing: number;
}

export interface SieveData {
  project: ProjectInfo;
  sampleId: string;
  boringId: string;
  sampleDepth: string;
  soilDescription: string;
  totalWeight: number;
  sieveResults: SieveResult[];
  hydrometerResults: HydrometerResult[];
  classification: {
    uscs: string;
    aashto: string;
  };
}

export const STANDARD_SIEVES: { size: string; openingMm: number }[] = [
  { size: '3"', openingMm: 75.0 },
  { size: '2"', openingMm: 50.0 },
  { size: '1-1/2"', openingMm: 37.5 },
  { size: '1"', openingMm: 25.0 },
  { size: '3/4"', openingMm: 19.0 },
  { size: '1/2"', openingMm: 12.5 },
  { size: '3/8"', openingMm: 9.5 },
  { size: '#4', openingMm: 4.75 },
  { size: '#10', openingMm: 2.0 },
  { size: '#20', openingMm: 0.85 },
  { size: '#40', openingMm: 0.425 },
  { size: '#60', openingMm: 0.25 },
  { size: '#100', openingMm: 0.15 },
  { size: '#140', openingMm: 0.106 },
  { size: '#200', openingMm: 0.075 },
];

export function createEmptyProject(): ProjectInfo {
  return {
    projectName: '',
    projectNumber: '',
    client: '',
    location: '',
    county: '',
    state: 'KY',
    date: new Date().toISOString().split('T')[0],
    loggedBy: '',
    checkedBy: '',
  };
}

export function createEmptyBoring(): BoringData {
  return {
    project: createEmptyProject(),
    boringId: '',
    boringType: 'soil',
    groundElevation: '',
    coordinates: { north: '', east: '' },
    station: '',
    offset: '',
    drillingMethod: '',
    rigType: '',
    boringDiameter: '',
    totalDepth: 0,
    groundwaterDepth: '',
    groundwaterDate: '',
    casingInfo: '',
    sealantInfo: '',
    soilLayers: [{ depthFrom: 0, depthTo: 0, description: '', uscsSymbol: '', color: '', moisture: '', consistency: '', density: '', inclusions: '' }],
    rockLayers: [],
    sptData: [],
    samples: [],
    coreRuns: [],
    remarks: '',
  };
}

export function createEmptySieve(): SieveData {
  return {
    project: createEmptyProject(),
    sampleId: '',
    boringId: '',
    sampleDepth: '',
    soilDescription: '',
    totalWeight: 0,
    sieveResults: STANDARD_SIEVES.map(s => ({
      sieveSize: s.size,
      openingMm: s.openingMm,
      weightRetained: 0,
      percentRetained: 0,
      cumulativePercentRetained: 0,
      percentPassing: 100,
    })),
    hydrometerResults: [],
    classification: { uscs: '', aashto: '' },
  };
}
