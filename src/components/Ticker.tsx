type Item = { symbol: string; change_pct: number }

export default function Ticker({ items }: { items: Item[] }) {
  if (!items.length) return null
  const display = [...items, ...items]
  return (
    <div className="ticker-bar">
      <div className="ticker-tag">Live</div>
      <div className="ticker-scroll">
        <div className="ticker-track">
          {display.map((item, i) => {
            const up = item.change_pct >= 0
            return (
              <span key={i} className="ti">
                <span className="ti-sym">{item.symbol}</span>
                <span className={up ? 'ti-up' : 'ti-dn'}>
                  {up ? '▴' : '▾'} {up ? '+' : ''}{item.change_pct.toFixed(1)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
