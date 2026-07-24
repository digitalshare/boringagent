import { BoringData, SoilLayer, SPTRecord, SampleRecord, RockLayer, CoreRun } from '../types';
import { generateBoringPdf } from '../utils/boringPdfGenerator';

interface Props {
  data: BoringData;
  onChange: (data: BoringData) => void;
}

export default function BoringForm({ data, onChange }: Props) {
  const update = (partial: Partial<BoringData>) => onChange({ ...data, ...partial });
  const updateProject = (field: string, value: string) =>
    update({ project: { ...data.project, [field]: value } });

  const updateSoilLayer = (index: number, field: keyof SoilLayer, value: string | number) => {
    const layers = [...data.soilLayers];
    layers[index] = { ...layers[index], [field]: value };
    update({ soilLayers: layers });
  };

  const addSoilLayer = () => {
    const last = data.soilLayers[data.soilLayers.length - 1];
    update({
      soilLayers: [...data.soilLayers, { depthFrom: last?.depthTo || 0, depthTo: 0, description: '', uscsSymbol: '', color: '', moisture: '', consistency: '', density: '', inclusions: '' }],
    });
  };

  const removeSoilLayer = (index: number) => {
    update({ soilLayers: data.soilLayers.filter((_, i) => i !== index) });
  };

  const updateRockLayer = (index: number, field: keyof RockLayer, value: string | number) => {
    const layers = [...data.rockLayers];
    layers[index] = { ...layers[index], [field]: value };
    update({ rockLayers: layers });
  };

  const addRockLayer = () => {
    const last = data.rockLayers[data.rockLayers.length - 1];
    update({
      rockLayers: [...data.rockLayers, { depthFrom: last?.depthTo || 0, depthTo: 0, rockType: '', color: '', hardness: '', weathering: '', fracturing: '', description: '' }],
    });
  };

  const removeRockLayer = (index: number) => {
    update({ rockLayers: data.rockLayers.filter((_, i) => i !== index) });
  };

  const updateSpt = (index: number, field: keyof SPTRecord, value: string | number) => {
    const records = [...data.sptData];
    records[index] = { ...records[index], [field]: value };
    if (field === 'blow2' || field === 'blow3') {
      const b2 = field === 'blow2' ? Number(value) : records[index].blow2;
      const b3 = field === 'blow3' ? Number(value) : records[index].blow3;
      records[index].nValue = b2 + b3;
    }
    update({ sptData: records });
  };

  const addSpt = () => {
    update({
      sptData: [...data.sptData, { depth: 0, blow1: 0, blow2: 0, blow3: 0, blow4: 0, nValue: 0, recovery: 0, remarks: '' }],
    });
  };

  const removeSpt = (index: number) => {
    update({ sptData: data.sptData.filter((_, i) => i !== index) });
  };

  const updateSample = (index: number, field: keyof SampleRecord, value: string | number) => {
    const records = [...data.samples];
    records[index] = { ...records[index], [field]: value };
    update({ samples: records });
  };

  const addSample = () => {
    const lastNum = data.samples.length > 0 ? Math.max(...data.samples.map(s => s.number)) : 0;
    update({
      samples: [...data.samples, { number: lastNum + 1, depth: 0, type: 'Split Spoon', description: '' }],
    });
  };

  const removeSample = (index: number) => {
    update({ samples: data.samples.filter((_, i) => i !== index) });
  };

  const updateCoreRun = (index: number, field: keyof CoreRun, value: string | number) => {
    const runs = [...data.coreRuns];
    runs[index] = { ...runs[index], [field]: value };
    update({ coreRuns: runs });
  };

  const addCoreRun = () => {
    const lastNum = data.coreRuns.length > 0 ? Math.max(...data.coreRuns.map(r => r.runNumber)) : 0;
    const last = data.coreRuns[data.coreRuns.length - 1];
    update({
      coreRuns: [...data.coreRuns, { runNumber: lastNum + 1, depthFrom: last?.depthTo || 0, depthTo: 0, coreLength: 0, recovery: 0, rqd: 0, remarks: '' }],
    });
  };

  const removeCoreRun = (index: number) => {
    update({ coreRuns: data.coreRuns.filter((_, i) => i !== index) });
  };

  const handleGeneratePdf = () => {
    generateBoringPdf(data);
  };

  return (
    <div className="form-container">
      <h2>Boring Log Data Entry</h2>

      <fieldset className="form-section">
        <legend>Project Information</legend>
        <div className="form-grid">
          <label>Project Name<input type="text" value={data.project.projectName} onChange={e => updateProject('projectName', e.target.value)} /></label>
          <label>Project Number<input type="text" value={data.project.projectNumber} onChange={e => updateProject('projectNumber', e.target.value)} /></label>
          <label>Client<input type="text" value={data.project.client} onChange={e => updateProject('client', e.target.value)} /></label>
          <label>Location<input type="text" value={data.project.location} onChange={e => updateProject('location', e.target.value)} /></label>
          <label>County<input type="text" value={data.project.county} onChange={e => updateProject('county', e.target.value)} /></label>
          <label>State<input type="text" value={data.project.state} onChange={e => updateProject('state', e.target.value)} /></label>
          <label>Date<input type="date" value={data.project.date} onChange={e => updateProject('date', e.target.value)} /></label>
          <label>Logged By<input type="text" value={data.project.loggedBy} onChange={e => updateProject('loggedBy', e.target.value)} /></label>
          <label>Checked By<input type="text" value={data.project.checkedBy} onChange={e => updateProject('checkedBy', e.target.value)} /></label>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Boring Information</legend>
        <div className="form-grid">
          <label>Boring ID<input type="text" value={data.boringId} onChange={e => update({ boringId: e.target.value })} /></label>
          <label>Boring Type
            <select value={data.boringType} onChange={e => update({ boringType: e.target.value as 'soil' | 'core' })}>
              <option value="soil">Soil Boring</option>
              <option value="core">Core/Rock Boring</option>
            </select>
          </label>
          <label>Ground Elevation (ft)<input type="text" value={data.groundElevation} onChange={e => update({ groundElevation: e.target.value })} /></label>
          <label>North Coordinate<input type="text" value={data.coordinates.north} onChange={e => update({ coordinates: { ...data.coordinates, north: e.target.value } })} /></label>
          <label>East Coordinate<input type="text" value={data.coordinates.east} onChange={e => update({ coordinates: { ...data.coordinates, east: e.target.value } })} /></label>
          <label>Station<input type="text" value={data.station} onChange={e => update({ station: e.target.value })} /></label>
          <label>Offset<input type="text" value={data.offset} onChange={e => update({ offset: e.target.value })} /></label>
          <label>Drilling Method<input type="text" value={data.drillingMethod} onChange={e => update({ drillingMethod: e.target.value })} /></label>
          <label>Rig Type<input type="text" value={data.rigType} onChange={e => update({ rigType: e.target.value })} /></label>
          <label>Boring Diameter<input type="text" value={data.boringDiameter} onChange={e => update({ boringDiameter: e.target.value })} /></label>
          <label>Total Depth (ft)<input type="number" value={data.totalDepth} onChange={e => update({ totalDepth: Number(e.target.value) })} /></label>
          <label>Groundwater Depth (ft)<input type="text" value={data.groundwaterDepth} onChange={e => update({ groundwaterDepth: e.target.value })} /></label>
          <label>Groundwater Date<input type="date" value={data.groundwaterDate} onChange={e => update({ groundwaterDate: e.target.value })} /></label>
          <label>Casing Info<input type="text" value={data.casingInfo} onChange={e => update({ casingInfo: e.target.value })} /></label>
          <label>Sealant Info<input type="text" value={data.sealantInfo} onChange={e => update({ sealantInfo: e.target.value })} /></label>
        </div>
      </fieldset>

      {data.boringType === 'soil' && (
        <fieldset className="form-section">
          <legend>Soil Layers</legend>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Depth From (ft)</th>
                  <th>Depth To (ft)</th>
                  <th>Description</th>
                  <th>USCS</th>
                  <th>Color</th>
                  <th>Moisture</th>
                  <th>Consistency</th>
                  <th>Density</th>
                  <th>Inclusions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.soilLayers.map((layer, i) => (
                  <tr key={i}>
                    <td><input type="number" step="0.1" value={layer.depthFrom} onChange={e => updateSoilLayer(i, 'depthFrom', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={layer.depthTo} onChange={e => updateSoilLayer(i, 'depthTo', Number(e.target.value))} /></td>
                    <td><input type="text" value={layer.description} onChange={e => updateSoilLayer(i, 'description', e.target.value)} /></td>
                    <td><input type="text" value={layer.uscsSymbol} onChange={e => updateSoilLayer(i, 'uscsSymbol', e.target.value)} style={{ width: '60px' }} /></td>
                    <td><input type="text" value={layer.color} onChange={e => updateSoilLayer(i, 'color', e.target.value)} /></td>
                    <td>
                      <select value={layer.moisture} onChange={e => updateSoilLayer(i, 'moisture', e.target.value)}>
                        <option value="">-</option>
                        <option value="dry">Dry</option>
                        <option value="moist">Moist</option>
                        <option value="wet">Wet</option>
                      </select>
                    </td>
                    <td><input type="text" value={layer.consistency} onChange={e => updateSoilLayer(i, 'consistency', e.target.value)} /></td>
                    <td><input type="text" value={layer.density} onChange={e => updateSoilLayer(i, 'density', e.target.value)} /></td>
                    <td><input type="text" value={layer.inclusions} onChange={e => updateSoilLayer(i, 'inclusions', e.target.value)} /></td>
                    <td><button className="btn-remove" onClick={() => removeSoilLayer(i)}>X</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-add" onClick={addSoilLayer}>+ Add Soil Layer</button>
        </fieldset>
      )}

      {data.boringType === 'core' && (
        <fieldset className="form-section">
          <legend>Rock Layers</legend>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Depth From (ft)</th>
                  <th>Depth To (ft)</th>
                  <th>Rock Type</th>
                  <th>Color</th>
                  <th>Hardness</th>
                  <th>Weathering</th>
                  <th>Fracturing</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.rockLayers.map((layer, i) => (
                  <tr key={i}>
                    <td><input type="number" step="0.1" value={layer.depthFrom} onChange={e => updateRockLayer(i, 'depthFrom', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={layer.depthTo} onChange={e => updateRockLayer(i, 'depthTo', Number(e.target.value))} /></td>
                    <td><input type="text" value={layer.rockType} onChange={e => updateRockLayer(i, 'rockType', e.target.value)} /></td>
                    <td><input type="text" value={layer.color} onChange={e => updateRockLayer(i, 'color', e.target.value)} /></td>
                    <td><input type="text" value={layer.hardness} onChange={e => updateRockLayer(i, 'hardness', e.target.value)} /></td>
                    <td><input type="text" value={layer.weathering} onChange={e => updateRockLayer(i, 'weathering', e.target.value)} /></td>
                    <td><input type="text" value={layer.fracturing} onChange={e => updateRockLayer(i, 'fracturing', e.target.value)} /></td>
                    <td><input type="text" value={layer.description} onChange={e => updateRockLayer(i, 'description', e.target.value)} /></td>
                    <td><button className="btn-remove" onClick={() => removeRockLayer(i)}>X</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-add" onClick={addRockLayer}>+ Add Rock Layer</button>
        </fieldset>
      )}

      {data.boringType === 'core' && (
        <fieldset className="form-section">
          <legend>Core Runs</legend>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Run #</th>
                  <th>Depth From (ft)</th>
                  <th>Depth To (ft)</th>
                  <th>Core Length (in)</th>
                  <th>Recovery %</th>
                  <th>RQD %</th>
                  <th>Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.coreRuns.map((run, i) => (
                  <tr key={i}>
                    <td><input type="number" value={run.runNumber} onChange={e => updateCoreRun(i, 'runNumber', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={run.depthFrom} onChange={e => updateCoreRun(i, 'depthFrom', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={run.depthTo} onChange={e => updateCoreRun(i, 'depthTo', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={run.coreLength} onChange={e => updateCoreRun(i, 'coreLength', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={run.recovery} onChange={e => updateCoreRun(i, 'recovery', Number(e.target.value))} /></td>
                    <td><input type="number" step="0.1" value={run.rqd} onChange={e => updateCoreRun(i, 'rqd', Number(e.target.value))} /></td>
                    <td><input type="text" value={run.remarks} onChange={e => updateCoreRun(i, 'remarks', e.target.value)} /></td>
                    <td><button className="btn-remove" onClick={() => removeCoreRun(i)}>X</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-add" onClick={addCoreRun}>+ Add Core Run</button>
        </fieldset>
      )}

      <fieldset className="form-section">
        <legend>SPT Data (Standard Penetration Test)</legend>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Depth (ft)</th>
                <th>Blow 1 (0-6")</th>
                <th>Blow 2 (6-12")</th>
                <th>Blow 3 (12-18")</th>
                <th>Blow 4 (18-24")</th>
                <th>N-Value</th>
                <th>Recovery (in)</th>
                <th>Remarks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.sptData.map((record, i) => (
                <tr key={i}>
                  <td><input type="number" step="0.5" value={record.depth} onChange={e => updateSpt(i, 'depth', Number(e.target.value))} /></td>
                  <td><input type="number" value={record.blow1} onChange={e => updateSpt(i, 'blow1', Number(e.target.value))} /></td>
                  <td><input type="number" value={record.blow2} onChange={e => updateSpt(i, 'blow2', Number(e.target.value))} /></td>
                  <td><input type="number" value={record.blow3} onChange={e => updateSpt(i, 'blow3', Number(e.target.value))} /></td>
                  <td><input type="number" value={record.blow4} onChange={e => updateSpt(i, 'blow4', Number(e.target.value))} /></td>
                  <td className="n-value-cell">{record.nValue}</td>
                  <td><input type="number" step="0.1" value={record.recovery} onChange={e => updateSpt(i, 'recovery', Number(e.target.value))} /></td>
                  <td><input type="text" value={record.remarks} onChange={e => updateSpt(i, 'remarks', e.target.value)} /></td>
                  <td><button className="btn-remove" onClick={() => removeSpt(i)}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add" onClick={addSpt}>+ Add SPT Record</button>
      </fieldset>

      <fieldset className="form-section">
        <legend>Sample Records</legend>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Sample #</th>
                <th>Depth (ft)</th>
                <th>Type</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.samples.map((sample, i) => (
                <tr key={i}>
                  <td><input type="number" value={sample.number} onChange={e => updateSample(i, 'number', Number(e.target.value))} /></td>
                  <td><input type="number" step="0.5" value={sample.depth} onChange={e => updateSample(i, 'depth', Number(e.target.value))} /></td>
                  <td>
                    <select value={sample.type} onChange={e => updateSample(i, 'type', e.target.value)}>
                      <option value="Split Spoon">Split Spoon</option>
                      <option value="Shelby Tube">Shelby Tube</option>
                      <option value="Core">Core</option>
                      <option value="Bulk">Bulk</option>
                    </select>
                  </td>
                  <td><input type="text" value={sample.description} onChange={e => updateSample(i, 'description', e.target.value)} /></td>
                  <td><button className="btn-remove" onClick={() => removeSample(i)}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add" onClick={addSample}>+ Add Sample</button>
      </fieldset>

      <fieldset className="form-section">
        <legend>Remarks</legend>
        <textarea
          rows={4}
          value={data.remarks}
          onChange={e => update({ remarks: e.target.value })}
          placeholder="Additional remarks, observations, or notes..."
        />
      </fieldset>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleGeneratePdf}>
          Generate PDF ({data.boringType === 'soil' ? 'Fig 3-5: Soil Boring Log' : 'Fig 3-7: Core Boring Log'})
        </button>
      </div>
    </div>
  );
}
