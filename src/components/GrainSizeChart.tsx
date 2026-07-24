import { useRef, useEffect } from 'react';
import { SieveResult, HydrometerResult } from '../types';

interface Props {
  sieveResults: SieveResult[];
  hydrometerResults: HydrometerResult[];
  width?: number;
  height?: number;
}

export default function GrainSizeChart({ sieveResults, hydrometerResults, width = 700, height = 450 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const xMin = 0.01;
    const xMax = 100;
    const logMin = Math.log10(xMin);
    const logMax = Math.log10(xMax);

    const xScale = (val: number) => margin.left + ((Math.log10(val) - logMin) / (logMax - logMin)) * plotW;
    const yScale = (pct: number) => margin.top + plotH - (pct / 100) * plotH;

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    const gridLines = [-2, -1, 0, 1, 2];
    for (const g of gridLines) {
      const x = margin.left + ((g - logMin) / (logMax - logMin)) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotH);
      ctx.stroke();
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
    ctx.font = '11px Arial';
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
      ctx.fillText(lbl.label, x, margin.top + plotH + 20);
      ctx.beginPath();
      ctx.moveTo(x, margin.top + plotH);
      ctx.lineTo(x, margin.top + plotH + 5);
      ctx.stroke();
    }

    ctx.font = '12px Arial';
    ctx.fillText('Particle Size (mm)', margin.left + plotW / 2, height - 10);

    ctx.textAlign = 'right';
    ctx.font = '11px Arial';
    for (let pct = 0; pct <= 100; pct += 20) {
      const y = yScale(pct);
      ctx.fillText(`${pct}`, margin.left - 8, y + 4);
    }

    ctx.save();
    ctx.translate(15, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText('Percent Passing (%)', 0, 0);
    ctx.restore();

    const dataPoints: { x: number; y: number }[] = [];
    for (const sr of sieveResults) {
      if (sr.weightRetained > 0 || sr.percentPassing < 100) {
        dataPoints.push({ x: sr.openingMm, y: sr.percentPassing });
      }
    }
    for (const hr of hydrometerResults) {
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

    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    const zoneLabels = [
      { x: 0.03, label: 'Clay' },
      { x: 0.3, label: 'Silt' },
      { x: 3, label: 'Sand' },
      { x: 40, label: 'Gravel' },
    ];
    for (const z of zoneLabels) {
      ctx.fillText(z.label, xScale(z.x), margin.top - 8);
    }

    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    const boundaries = [0.002, 0.075, 4.75];
    for (const b of boundaries) {
      const x = xScale(b);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotH);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }, [sieveResults, hydrometerResults, width, height]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} style={{ width, height }} />
    </div>
  );
}
