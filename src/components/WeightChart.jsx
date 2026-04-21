function formatAxisDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function WeightChart({ points }) {
  if (!points.length) {
    return null;
  }

  const width = 320;
  const height = 180;
  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const weights = points.map((point) => point.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const chartPoints = points.map((point, index) => {
    const x =
      padding.left +
      (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
    const y =
      padding.top +
      chartHeight -
      ((point.weight - minWeight) / range) * chartHeight;

    return {
      ...point,
      x,
      y,
    };
  });

  const path = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const firstPoint = chartPoints[0];
  const lastPoint = chartPoints[chartPoints.length - 1];
  const delta = lastPoint.weight - firstPoint.weight;

  return (
    <section className="mb-5 rounded-3xl border border-slate-200 bg-white/85 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
            Weight
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Progress chart</h2>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Change</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {delta > 0 ? '+' : ''}
            {delta.toFixed(1)} kg
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Weight chart">
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="rgb(203 213 225)"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="rgb(203 213 225)"
            strokeWidth="1"
          />
          <path d={path} fill="none" stroke="rgb(15 23 42)" strokeWidth="3" strokeLinecap="round" />
          {chartPoints.map((point) => (
            <g key={point.date}>
              <circle cx={point.x} cy={point.y} r="4" fill="rgb(15 23 42)" />
            </g>
          ))}
          {firstPoint ? (
            <text
              x={firstPoint.x}
              y={height - 8}
              textAnchor={points.length === 1 ? 'middle' : 'start'}
              fill="rgb(100 116 139)"
              fontSize="10"
            >
              {formatAxisDate(firstPoint.date)}
            </text>
          ) : null}
          {lastPoint && lastPoint.date !== firstPoint?.date ? (
            <text
              x={lastPoint.x}
              y={height - 8}
              textAnchor="end"
              fill="rgb(100 116 139)"
              fontSize="10"
            >
              {formatAxisDate(lastPoint.date)}
            </text>
          ) : null}
          <text
            x={padding.left}
            y={padding.top - 2}
            fill="rgb(100 116 139)"
            fontSize="10"
          >
            {maxWeight.toFixed(1)} kg
          </text>
          <text
            x={padding.left}
            y={height - padding.bottom - 6}
            fill="rgb(148 163 184)"
            fontSize="10"
          >
            {minWeight.toFixed(1)} kg
          </text>
        </svg>
      </div>
    </section>
  );
}

export default WeightChart;
