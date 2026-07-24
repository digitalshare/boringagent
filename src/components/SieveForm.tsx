import { SieveData, HydrometerResult } from '../types';
import { generateSievePdf } from '../utils/sievePdfGenerator';
import GrainSizeChart from './GrainSizeChart';

interface Props {
  data: SieveData;
  onChange: (data: SieveData) => void;
}

export default function SieveForm({ data, onChange }: Props) {
  const update = (partial: Partial<SieveData>) => onChange({ ...data, ...partial });
  const updateProject = (field: string, value: string) =>
    update({ project: { ...data.project, [field]: value } });

  const recalculate = (results: SieveData['sieveResults']) => {
    const totalWeight = results.reduce((sum, r) => sum + r.weightRetained, 0);
    let cumRetained = 0;
    const updated = results.map(r => {
      const pctRetained = totalWeight > 0 ? (r.weightRetained / totalWeight) * 100 : 0;
      cumRetained += pctRetained;
      return {
        ...r,
        percentRetained: Math.round(pctRetained * 100) / 100,
        cumulativePercentRetained: Math.round(cumRetained * 100) / 100,
        percentPassing: Math.round((100 - cumRetained) * 100) / 100,
      };
    });
    return { results: updated, totalWeight };
  };

  const updateSieveWeight = (index: number, weight: number) => {
    const results = [...data.sieveResults];
    results[index] = { ...results[index], weightRetained: weight };
    const { results: updated, totalWeight } = recalculate(results);
    update({ sieveResults: updated, totalWeight });
  };

  const addHydrometer = () => {
    update({
      hydrometerResults: [...data.hydrometerResults, { particleSize: 0, percentPassing: 0 }],
    });
  };

  const updateHydrometer = (index: number, field: keyof HydrometerResult, value: number) => {
    const results = [...data.hydrometerResults];
    results[index] = { ...results[index], [field]: value };
    update({ hydrometerResults: results });
  };

  const removeHydrometer = (index: number) => {
    update({ hydrometerResults: data.hydrometerResults.filter((_, i) => i !== index) });
  };

  const handleGeneratePdf = () => {
    generateSievePdf(data);
  };

  const d10 = data.sieveResults.find(r => r.percentPassing <= 10);
  const d30 = data.sieveResults.find(r => r.percentPassing <= 30);
  const d60 = data.sieveResults.find(r => r.percentPassing <= 60);

  return (
    <div className="form-container">
      <h2>Sieve Analysis Data Entry</h2>

      <fieldset className="form-section">
        <legend>Project & Sample Information</legend>
        <div className="form-grid">
          <label>Project Name<input type="text" value={data.project.projectName} onChange={e => updateProject('projectName', e.target.value)} /></label>
          <label>Project Number<input type="text" value={data.project.projectNumber} onChange={e => updateProject('projectNumber', e.target.value)} /></label>
          <label>Client<input type="text" value={data.project.client} onChange={e => updateProject('client', e.target.value)} /></label>
          <label>Location<input type="text" value={data.project.location} onChange={e => updateProject('location', e.target.value)} /></label>
          <label>Sample ID<input type="text" value={data.sampleId} onChange={e => update({ sampleId: e.target.value })} /></label>
          <label>Boring ID<input type="text" value={data.boringId} onChange={e => update({ boringId: e.target.value })} /></label>
          <label>Sample Depth (ft)<input type="text" value={data.sampleDepth} onChange={e => update({ sampleDepth: e.target.value })} /></label>
          <label>Soil Description<input type="text" value={data.soilDescription} onChange={e => update({ soilDescription: e.target.value })} /></label>
          <label>Date<input type="date" value={data.project.date} onChange={e => updateProject('date', e.target.value)} /></label>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Sieve Data (ASTM E11 Standard Sieves)</legend>
        <p className="form-hint">Total Weight: {data.totalWeight.toFixed(2)} g</p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Sieve Size</th>
                <th>Opening (mm)</th>
                <th>Weight Retained (g)</th>
                <th>% Retained</th>
                <th>Cum. % Retained</th>
                <th>% Passing</th>
              </tr>
            </thead>
            <tbody>
              {data.sieveResults.map((sr, i) => (
                <tr key={i}>
                  <td className="sieve-size-cell">{sr.sieveSize}</td>
                  <td className="sieve-size-cell">{sr.openingMm}</td>
                  <td><input type="number" step="0.1" min="0" value={sr.weightRetained} onChange={e => updateSieveWeight(i, Number(e.target.value))} /></td>
                  <td className="calc-cell">{sr.percentRetained.toFixed(2)}</td>
                  <td className="calc-cell">{sr.cumulativePercentRetained.toFixed(2)}</td>
                  <td className="calc-cell">{sr.percentPassing.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Hydrometer Results (Optional)</legend>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Particle Size (mm)</th>
                <th>% Passing</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.hydrometerResults.map((hr, i) => (
                <tr key={i}>
                  <td><input type="number" step="0.001" value={hr.particleSize} onChange={e => updateHydrometer(i, 'particleSize', Number(e.target.value))} /></td>
                  <td><input type="number" step="0.1" value={hr.percentPassing} onChange={e => updateHydrometer(i, 'percentPassing', Number(e.target.value))} /></td>
                  <td><button className="btn-remove" onClick={() => removeHydrometer(i)}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add" onClick={addHydrometer}>+ Add Hydrometer Reading</button>
      </fieldset>

      <fieldset className="form-section">
        <legend>Classification & Summary</legend>
        <div className="form-grid">
          <label>USCS Classification<input type="text" value={data.classification.uscs} onChange={e => update({ classification: { ...data.classification, uscs: e.target.value } })} /></label>
          <label>AASHTO Classification<input type="text" value={data.classification.aashto} onChange={e => update({ classification: { ...data.classification, aashto: e.target.value } })} /></label>
        </div>
        <div className="summary-grid">
          <span>D10: {d10 ? `${d10.openingMm} mm` : 'N/A'}</span>
          <span>D30: {d30 ? `${d30.openingMm} mm` : 'N/A'}</span>
          <span>D60: {d60 ? `${d60.openingMm} mm` : 'N/A'}</span>
          <span>Cu (D60/D10): {d10 && d60 ? (d60.openingMm / d10.openingMm).toFixed(2) : 'N/A'}</span>
          <span>Cc (D30²/(D60×D10)): {d10 && d30 && d60 ? ((d30.openingMm ** 2) / (d60.openingMm * d10.openingMm)).toFixed(2) : 'N/A'}</span>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Grain Size Distribution Chart Preview</legend>
        <GrainSizeChart sieveResults={data.sieveResults} hydrometerResults={data.hydrometerResults} />
      </fieldset>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleGeneratePdf}>
          Generate PDF (Fig 10-12: Sieve Analysis)
        </button>
      </div>
    </div>
  );
}
