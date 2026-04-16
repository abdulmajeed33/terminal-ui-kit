import { useEffect, useMemo, useRef } from 'react';

interface ChartPanelProps {
  period: number;
}

function generateSeries(points: number, seed = 1): number[] {
  let value = 42;
  const arr: number[] = [];

  for (let i = 0; i < points; i += 1) {
    const drift = Math.sin((i + seed) / 13) * 0.55 + Math.cos((i + seed) / 21) * 0.35;
    const shock = ((Math.sin((i + seed) * 4.71) + 1) / 2 - 0.5) * 1.35;
    value += drift * 0.18 + shock * 0.22;
    if (i === Math.floor(points * 0.71)) value += 5.4;
    if (i === Math.floor(points * 0.79)) value -= 4.1;
    arr.push(value);
  }

  return arr;
}

function generateOscillator(points: number): number[] {
  return Array.from({ length: points }, (_, i) => 52 + Math.sin(i / 8) * 9 + Math.cos(i / 15) * 6 + Math.sin(i * 1.71) * 3);
}

export function ChartPanel({ period }: ChartPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const series = generateSeries(period, 3);
    const last = series[series.length - 1];
    const delta = last - series[0];
    const pct = (delta / series[0]) * 100;

    return `Last: ${last.toFixed(2)}   Vol: 13m   +/-: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}   ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  }, [period]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = containerRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      if (!width || !height) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const pad = { top: 18, right: 42, bottom: 34, left: 12 };
      const oscH = 76;
      const plotH = height - pad.top - pad.bottom - oscH - 16;
      const plotW = width - pad.left - pad.right;
      const mainTop = pad.top;
      const oscTop = mainTop + plotH + 16;

      const series = generateSeries(period, 3);
      const upper = series.map((v, i) => v + 1.8 + Math.sin(i / 7) * 0.6);
      const lower = series.map((v, i) => v - 1.8 - Math.cos(i / 9) * 0.45);
      const osc = generateOscillator(period);

      const minY = Math.min(...lower) - 0.8;
      const maxY = Math.max(...upper) + 0.8;
      const oscMin = 35;
      const oscMax = 70;

      const xAt = (i: number) => pad.left + (i / (period - 1)) * plotW;
      const yAt = (v: number) => mainTop + (1 - (v - minY) / (maxY - minY)) * plotH;
      const yOsc = (v: number) => oscTop + (1 - (v - oscMin) / (oscMax - oscMin)) * oscH;

      ctx.beginPath();
      ctx.moveTo(xAt(0), yAt(series[0]));
      series.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
      ctx.lineTo(xAt(period - 1), mainTop + plotH);
      ctx.lineTo(xAt(0), mainTop + plotH);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, mainTop, 0, mainTop + plotH);
      areaGrad.addColorStop(0, 'rgba(63, 222, 117, .18)');
      areaGrad.addColorStop(1, 'rgba(63, 222, 117, .02)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      const drawLine = (data: number[], color: string, widthLine: number, useOscillator = false) => {
        ctx.beginPath();
        data.forEach((v, i) => {
          const x = xAt(i);
          const y = useOscillator ? yOsc(v) : yAt(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = widthLine;
        ctx.stroke();
      };

      drawLine(upper, 'rgba(115, 235, 255, .95)', 1.15);
      drawLine(lower, 'rgba(115, 235, 255, .95)', 1.15);
      drawLine(series, 'rgba(84, 243, 135, 1)', 1.8);

      const last = series[series.length - 1];
      const lastY = yAt(last);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(123, 226, 160, .65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, lastY);
      ctx.lineTo(width - pad.right, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#5ce08f';
      ctx.fillRect(width - pad.right + 2, lastY - 8, 34, 16);
      ctx.fillStyle = '#04211a';
      ctx.font = '10px Arial';
      ctx.fillText(last.toFixed(2), width - pad.right + 6, lastY + 4);

      const oscGuide = yOsc(50);
      ctx.strokeStyle = 'rgba(240, 225, 104, .8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, oscGuide);
      ctx.lineTo(width - pad.right, oscGuide);
      ctx.stroke();

      drawLine(osc, '#f3e64a', 2, true);

      ctx.fillStyle = '#a6c6d5';
      ctx.font = '10px Arial';
      for (let i = 0; i < 5; i += 1) {
        const value = maxY - ((maxY - minY) / 4) * i;
        const y = mainTop + (plotH / 4) * i + 3;
        ctx.fillText(value.toFixed(2), width - pad.right + 4, y);
      }

      const labels = period === 30
        ? ['May', 'Jun']
        : period === 90
          ? ['Apr', 'May', 'Jun']
          : period === 180
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            : ['Jul', 'Sep', 'Nov', 'Jan', 'Mar', 'May'];

      ctx.fillStyle = '#96bacb';
      labels.forEach((label, i) => {
        const x = pad.left + (plotW / Math.max(labels.length - 1, 1)) * i;
        ctx.fillText(label, x - 8, height - 10);
      });
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(wrap);
    window.addEventListener('resize', draw);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', draw);
    };
  }, [period]);

  return (
    <div className="chart-layout body-fill">
      <div className="chart-canvas-wrap" ref={containerRef}>
        <div className="chart-watermark">BRT</div>
        <div className="chart-axes-label mono">{stats}</div>
        <canvas ref={canvasRef} className="chart-canvas" aria-label="Chart template demo" />
        <div className="panel-rail">
          <span className="rail-chev">«</span>
          Chart Data
        </div>
      </div>
    </div>
  );
}
