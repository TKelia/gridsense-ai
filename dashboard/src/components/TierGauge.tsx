import { RWANDA_RESIDENTIAL_TIERS } from '../lib/tariff'

export function TierGauge({ kWh, scale = 80 }: { kWh: number; scale?: number }) {
  const tiers = RWANDA_RESIDENTIAL_TIERS
  const bounds = [0, 20, 50, scale]
  const colors = ['bg-emerald-500', 'bg-amber-400', 'bg-rose-500']
  const pos = Math.min(kWh / scale, 1) * 100
  return (
    <div className="mt-2">
      <div className="relative h-7 rounded-full overflow-hidden flex">
        {tiers.map((t, i) => {
          const w = ((bounds[i + 1] - bounds[i]) / scale) * 100
          return (
            <div
              key={i}
              className={`${colors[i]} h-full flex items-center justify-center text-[10px] text-slate-900 font-semibold`}
              style={{ width: `${w}%` }}
            >
              {t.rate}
            </div>
          )
        })}
        <div
          className="absolute top-0 bottom-0 w-1 bg-slate-900 ring-2 ring-white shadow-[0_0_8px_2px_rgba(15,23,42,0.6)]"
          style={{ left: `calc(${pos}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>0</span>
        <span>20 kWh</span>
        <span>50 kWh</span>
        <span>{scale}+ kWh</span>
      </div>
    </div>
  )
}
