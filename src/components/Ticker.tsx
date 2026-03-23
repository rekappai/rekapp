type TickerItem = {
  symbol: string
  change_pct: number
}

export default function Ticker({ items }: { items: TickerItem[] }) {
  if (!items.length) return null
  const display = [...items, ...items]
  return (
    <div className="h-[30px] bg-[--ink-raised] border-b border-[--ink-border] flex items-center overflow-hidden">
      <div className="shrink-0 px-3.5 h-full flex items-center border-r border-[--ink-border] font-[family-name:var(--font-dm-mono)] text-[0.54rem] tracking-[0.16em] uppercase text-[--gold]">
        Live
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex gap-10 whitespace-nowrap pl-10" style={{ animation: 'ticker 55s linear infinite' }}>
          {display.map((item, i) => {
            const up = item.change_pct >= 0
            return (
              <span key={i} className="flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[0.6rem]">
                <span className="text-[--text] font-medium">{item.symbol}</span>
                <span className={up ? 'text-[--up]' : 'text-[--down]'}>
                  {up ? '▴' : '▾'} {up ? '+' : ''}{item.change_pct.toFixed(1)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>
      <style>{`@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  )
}
