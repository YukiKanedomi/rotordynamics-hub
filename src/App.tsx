import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { DriverIcon } from './icons'
import {
  DRIVERS,
  VECTORS,
  RD_CLUSTERS,
  RD_MAP,
  SOURCES,
  SOURCE_MAP,
  TOPIC_MAP,
  HORIZONS,
  NARRATIVE,
  ANCHOR,
  SOLUTIONS,
  type Confidence,
  type Driver,
  type Horizon,
  type Milestone,
} from './data/roadmap'

type Tab = 'story' | 'linkage' | 'timeline' | 'drivers' | 'vectors' | 'rdmap' | 'sources'

/* 確度 → クラス（small caps バッジ・ノード形状の両方で使用） */
const confKey = (c: Confidence) => (c === '確立' ? 'e' : c === '推定' ? 'p' : 'h')
const confClass = (c: Confidence) => 'conf c-' + confKey(c)

/* 横断RD課題の色（cream 上で成立する muted な編集色） */
const RD_COLORS: Record<string, string> = {
  critspeed: '#1F3A5F',
  stability: '#5C1A1B',
  emag: '#5B2A4A',
  torsional: '#8A5A16',
  bearing: '#0F4C4C',
  seal: '#2E5E3A',
  fwbw: '#6B3F2A',
  digital: '#44505C',
}

/* ───── 連続時間軸: horizon を年バンドに割り付け、バンド内で等間隔配置 ───── */
const NOW = 2026,
  END = 2041,
  BREAK = 2035
const xp = (y: number) => ((y - NOW) / (END - NOW)) * 100
const BAND: Record<Horizon, [number, number]> = {
  '〜2030': [2026, 2030],
  '〜2035': [2030, 2035],
  '2035〜': [2035, 2041],
}
function nodesOf(d: Driver): { m: Milestone; yr: number }[] {
  const out: { m: Milestone; yr: number }[] = []
  HORIZONS.forEach((h) => {
    const ms = d.milestones.filter((m) => m.horizon === h)
    const [a, b] = BAND[h]
    const pad = (b - a) * 0.2
    const lo = a + pad,
      hi = b - pad
    ms.forEach((m, i) => {
      const yr = ms.length === 1 ? (lo + hi) / 2 : lo + ((hi - lo) * i) / (ms.length - 1)
      out.push({ m, yr })
    })
  })
  return out
}

/* 段違い配置: x が近いノードを別の行へ逃がし、重なりを避ける */
function rowOffset(row: number) {
  if (row === 0) return 0
  const step = Math.ceil(row / 2) * 18
  return row % 2 === 1 ? -step : step
}
function packRows<T extends { x: number }>(nodes: T[]): (T & { row: number })[] {
  const MINGAP = 7 // 横方向の最小間隔（%）。これ未満で近接する点は上下へ段違い配置
  const lastX: number[] = []
  return nodes.map((n) => {
    let r = 0
    while (lastX[r] !== undefined && n.x - lastX[r] < MINGAP) r++
    lastX[r] = n.x
    return { ...n, row: r }
  })
}

/* ブレークポイント判定（モバイル=縦リフロー / デスクトップ=横スイムレーン） */
function useIsMobile() {
  const q = '(max-width: 760px)'
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const h = () => setM(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return m
}

export default function App() {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<Tab>('story')
  const [active, setActive] = useState<{ m: Milestone; driver: Driver } | null>(null)
  const [rdFilter, setRdFilter] = useState<string | null>(null)

  return (
    <div className="app">
      <header className="masthead">
        <p className="kicker">Rotordynamics&nbsp;Hub · Technology&nbsp;Roadmap</p>
        <h1>回転機械の<br />ローターダイナミクス</h1>
        <p className="dek">
          社会動向から回転機械への需要シフトを読み、そこに生じるローターダイナミクスの課題と、
          それに応える要素技術の整備時期を一枚に俯瞰する。近中期（〜2035）を確度の高い実線、
          長期（2035〜）を点線で示す。
        </p>
        <div className="logic">
          <span>社会動向</span><i>→</i><span>需要シフト</span><i>→</i>
          <span>RD課題</span><i>→</i><span>要素技術</span>
        </div>
      </header>

      <div className="rule-double" />

      <nav className="tabs">
        {([
          ['story', 'ストーリー'],
          ['linkage', 'つながり図'],
          ['timeline', 'ロードマップ'],
          ['drivers', '5ドライバ'],
          ['vectors', '共通ベクトル'],
          ['rdmap', 'RD課題マップ'],
          ['sources', '出典'],
        ] as [Tab, string][]).map(([k, label]) => (
          <button key={k} className={tab === k ? 'tab on' : 'tab'} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'story' && <StoryView />}
        {tab === 'linkage' && <LinkageView isMobile={isMobile} />}
        {tab === 'timeline' &&
          (isMobile ? (
            <TimelineMobile
              rdFilter={rdFilter}
              setRdFilter={setRdFilter}
              onPick={(m, driver) => setActive({ m, driver })}
            />
          ) : (
            <TimelineView
              rdFilter={rdFilter}
              setRdFilter={setRdFilter}
              onPick={(m, driver) => setActive({ m, driver })}
            />
          ))}
        {tab === 'drivers' && <DriversView onPick={(m, driver) => setActive({ m, driver })} />}
        {tab === 'vectors' && <VectorsView />}
        {tab === 'rdmap' && (
          <RDMapView
            onJump={(key) => {
              setRdFilter(key)
              setTab('timeline')
            }}
          />
        )}
        {tab === 'sources' && <SourcesView />}
      </main>

      {active && <Drawer data={active} onClose={() => setActive(null)} />}

      <footer className="foot">
        <sup>†</sup> 確度: <span className="conf c-e">確立</span> 一次裏取り済 ·{' '}
        <span className="conf c-p">推定</span> 方向は妥当・値未確定 ·{' '}
        <span className="conf c-h">仮説</span> 長期シナリオ。 実線=〜2035 ／ 点線=2035〜。
      </footer>
    </div>
  )
}

/* ───────────────────────── ロードマップ（連続時間軸） ───────────────────────── */
function TimelineView({
  rdFilter,
  setRdFilter,
  onPick,
}: {
  rdFilter: string | null
  setRdFilter: (k: string | null) => void
  onPick: (m: Milestone, d: Driver) => void
}) {
  return (
    <div className="tl">
      <div className="tl-masth">
        <div>
          <div className="figtag">Fig. 1 — 5 Drivers × Continuous Timeline</div>
          <p className="section-note">
            横軸は実時間。各ドライバの帯に並ぶ点が技術マイルストーン。点をたどると「いつ・何を」確立
            すべきかが分かる。<span className="ob">塗り＝確立</span>、白抜き＝推定、破線＝仮説。
          </p>
        </div>
        <aside className="margin">
          <b>図の読み方。</b>下の課題タグで絞り込むと、その横断RD課題に関わる点だけが残る。点をタップ
          すると詳細・関連ナレッジ・出典が開く。
        </aside>
      </div>

      <div className="filterbar">
        <span className="filter-label">RD課題で絞り込み</span>
        <button className={rdFilter === null ? 'chip-f on' : 'chip-f'} onClick={() => setRdFilter(null)}>
          すべて
        </button>
        {RD_CLUSTERS.map((c) => (
          <button
            key={c.key}
            className={rdFilter === c.key ? 'chip-f on' : 'chip-f'}
            style={rdFilter === c.key ? { background: RD_COLORS[c.key], borderColor: RD_COLORS[c.key], color: '#fff' } : {}}
            onClick={() => setRdFilter(rdFilter === c.key ? null : c.key)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="tl-scroll">
        <div className="tl-inner">
          <div className="tl-scale">
            {[['now 2026', 2026], ['2030', 2030], ['2035', 2035], ['2040+', 2040]].map(([t, y]) => (
              <span key={t as string} className="tk" style={{ left: xp(y as number) + '%' }}>
                {t as string}
              </span>
            ))}
          </div>

          <div className="tl-chart">
            <div className="tl-brk" style={{ left: xp(BREAK) + '%' }}>
              <span>2035</span>
            </div>
            {DRIVERS.map((d) => {
              const packed = packRows(
                nodesOf(d)
                  .map((n) => ({ ...n, x: xp(n.yr) }))
                  .sort((a, b) => a.x - b.x),
              )
              return (
                <div className="tl-lane" key={d.id}>
                  <div className="tl-head">
                    <DriverIcon id={d.id} className="d-svg" />
                    <span className="lid">{d.id}</span>
                    <span className="ln">{d.name}</span>
                    <small>{d.short}</small>
                  </div>
                  <div className="tl-track" style={{ '--bx': xp(BREAK) + '%' } as CSSProperties}>
                    {packed.map(({ m, x, row }) => {
                      const off = rowOffset(row)
                      const dim = rdFilter && !m.rd.includes(rdFilter)
                      return (
                        <button
                          key={m.id}
                          className={'tl-node ' + confClass(m.confidence) + (dim ? ' dim' : '')}
                          style={{ left: x + '%', top: off + 'px' }}
                          onClick={() => onPick(m, d)}
                        >
                          {off !== 0 && (
                            <span
                              className={'stem ' + (off < 0 ? 'down' : 'up')}
                              style={{ height: Math.abs(off) + 'px' }}
                            />
                          )}
                          <span className="mk" />
                          <span className="tip">
                            {m.title}
                            <i className={confClass(m.confidence)}>{m.confidence}</i>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <figcaption className="figcap">
        図1 ── 5つの社会的ドライバを連続時間軸の上に置き、技術マイルストーンを発生時期に配置した。
        実線=〜2035（確度の高い近中期）、点線=2035〜（長期シナリオ）。点にカーソル／タップで詳細。
      </figcaption>

      <div className="legend">
        <span className="lg"><span className="di di-e" />確立</span>
        <span className="lg"><span className="di di-p" />推定</span>
        <span className="lg"><span className="di di-h" />仮説</span>
        <span className="lg lg-line">── 〜2035 ／ ┄┄ 2035〜</span>
      </div>
    </div>
  )
}

/* ───────────────────────── ストーリー（ナラティブ＋アンカー＋つながり） ───────────────────────── */
function Cite({ refs }: { refs: string[] }) {
  return (
    <span className="cites">
      {refs.map((r) => {
        const s = SOURCE_MAP[r]
        if (s)
          return (
            <a key={r} className="cref" href={s.url} target="_blank" rel="noreferrer" title={s.title}>
              {r}
            </a>
          )
        const t = TOPIC_MAP[r]
        return (
          <span key={r} className="cref topic" title={t?.summary}>
            {t ? t.name : r}
          </span>
        )
      })}
    </span>
  )
}

function StoryView() {
  return (
    <div className="story">
      <div className="figtag">Narrative — なぜこのロードマップになるのか</div>
      <p className="section-note">
        大きな社会動向から、回転機械の共通変化、ローターダイナミクスの古典難問の再来、解の方向まで。
        各文を一次・権威出典（IEA / NASA / 規格 / 査読）に紐づけ、根拠を辿れるようにした。
      </p>
      <ol className="narr">
        {NARRATIVE.map((n, i) => (
          <li key={i}>
            <span className="narr-t">{n.text}</span>
            <Cite refs={n.refs} />
          </li>
        ))}
      </ol>

      <blockquote className="anchor">
        <p>“{ANCHOR.quote}”</p>
        <footer>
          — {ANCHOR.attribution} <Cite refs={[ANCHOR.ref]} />
        </footer>
      </blockquote>

      <h2 className="sec-h">つながり — 機種を超えて再帰する5つの共通ベクトル</h2>
      <p className="section-note">
        別々のドライバが同じローターダイナミクス課題に収束することを、横断的な総説・規格が裏付ける。
      </p>
      <div className="themes">
        {VECTORS.map((v) => (
          <div className="theme" key={v.id}>
            <div className="v-id">{v.id}</div>
            <div className="v-body">
              <strong>{v.name}</strong>
              <p>{v.detail}</p>
              <div className="theme-drivers">
                {v.drivers.map((id) => (
                  <span className="pill" key={id}>{id}</span>
                ))}
              </div>
              {v.sources && (
                <div className="theme-src">
                  裏付け: <Cite refs={v.sources} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── つながり図（4層リンク図） ───────────────────────── */
function LinkageView({ isMobile }: { isMobile: boolean }) {
  const [sel, setSel] = useState<string | null>(null)

  const { LAYERS, edges, fAdj, bAdj, detailMap } = useMemo(() => {
    const LAYERS = [
      { key: 'L1', title: '社会動向', nodes: DRIVERS.map((d) => ({ id: d.id, head: d.id, label: d.name })) },
      { key: 'L2', title: '回転機械の変化', nodes: VECTORS.map((v) => ({ id: v.id, head: v.id, label: v.name })) },
      { key: 'L3', title: 'RD課題', nodes: RD_CLUSTERS.map((c) => ({ id: c.key, head: '', label: c.name })) },
      { key: 'L4', title: '解の方向', nodes: SOLUTIONS.map((s) => ({ id: s.id, head: s.id, label: s.name })) },
    ]
    const edges: [string, string][] = []
    VECTORS.forEach((v) => v.drivers.forEach((d) => edges.push([d, v.id])))
    RD_CLUSTERS.forEach((c) => (c.cause.match(/V\d/g) || []).forEach((v) => edges.push([v, c.key])))
    SOLUTIONS.forEach((s) => s.rd.forEach((rd) => edges.push([rd, s.id])))
    const fAdj: Record<string, string[]> = {}
    const bAdj: Record<string, string[]> = {}
    edges.forEach(([a, b]) => {
      ;(fAdj[a] = fAdj[a] || []).push(b)
      ;(bAdj[b] = bAdj[b] || []).push(a)
    })
    const detailMap: Record<string, { title: string; detail: string; sources: string[] }> = {}
    DRIVERS.forEach((d) => (detailMap[d.id] = { title: `${d.id}　${d.name}`, detail: d.short, sources: [] }))
    VECTORS.forEach((v) => (detailMap[v.id] = { title: `${v.id}　${v.name}`, detail: v.detail, sources: v.sources || [] }))
    RD_CLUSTERS.forEach((c) => (detailMap[c.key] = { title: c.name, detail: c.detail, sources: [] }))
    SOLUTIONS.forEach((s) => (detailMap[s.id] = { title: `${s.id}　${s.name}`, detail: s.detail, sources: s.sources || [] }))
    return { LAYERS, edges, fAdj, bAdj, detailMap }
  }, [])

  const chain = useMemo(() => {
    if (!sel) return null
    const nodes = new Set<string>([sel])
    const es = new Set<string>()
    let fr = [sel]
    while (fr.length) {
      const nx: string[] = []
      fr.forEach((id) => (fAdj[id] || []).forEach((b) => { es.add(id + '__' + b); if (!nodes.has(b)) { nodes.add(b); nx.push(b) } }))
      fr = nx
    }
    fr = [sel]
    while (fr.length) {
      const nx: string[] = []
      fr.forEach((id) => (bAdj[id] || []).forEach((a) => { es.add(a + '__' + id); if (!nodes.has(a)) { nodes.add(a); nx.push(a) } }))
      fr = nx
    }
    return { nodes, es }
  }, [sel, fAdj, bAdj])

  const cls = (id: string) => (sel ? (chain && chain.nodes.has(id) ? ' inchain' : ' dim') : '')

  const posMap = useMemo(() => {
    const COLX = [60, 300, 545, 805], COLW = [150, 160, 195, 180], TOP = 46, H = 580, BOT = 22
    const m: Record<string, { x: number; cy: number; w: number; xLeft: number; xRight: number }> = {}
    LAYERS.forEach((L, li) => {
      const k = L.nodes.length
      L.nodes.forEach((n, i) => {
        const cy = TOP + ((H - TOP - BOT) * (i + 0.5)) / k
        m[n.id] = { x: COLX[li], cy, w: COLW[li], xLeft: COLX[li], xRight: COLX[li] + COLW[li] }
      })
    })
    return m
  }, [LAYERS])

  const cap = sel ? detailMap[sel] : null

  return (
    <div className="lk">
      <div className="figtag">Fig. 2 — 4層リンク図（社会動向 → 機械の変化 → RD課題 → 解の方向）</div>
      <p className="section-note">
        Phaal/Cambridge式の多層リンク図。ノードを{isMobile ? 'タップ' : 'クリック'}すると、上流（社会動向）から
        下流（解）までの<span className="ob">因果の連鎖</span>がハイライトされる。リンクこそが地図の本体。
      </p>

      {!isMobile ? (
        <div className="lk-figure">
          <svg viewBox="0 0 1000 580" className="lk-svg" onClick={() => setSel(null)}>
            {LAYERS.map((L, li) => (
              <text key={L.key} x={[135, 380, 642, 895][li]} y={18} className="lk-coltitle" textAnchor="middle">
                {L.title}
              </text>
            ))}
            {edges.map(([a, b], i) => {
              const pa = posMap[a], pb = posMap[b]
              if (!pa || !pb) return null
              const x1 = pa.xRight, y1 = pa.cy, x2 = pb.xLeft, y2 = pb.cy, mx = (x1 + x2) / 2
              const on = chain ? chain.es.has(a + '__' + b) : false
              const off = chain ? !on : false
              return <path key={i} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} className={'lk-link' + (on ? ' on' : '') + (off ? ' off' : '')} />
            })}
            {LAYERS.map((L, li) =>
              L.nodes.map((n) => {
                const p = posMap[n.id]
                return (
                  <foreignObject key={n.id} x={p.x} y={p.cy - 26} width={p.w} height={52}>
                    <button
                      className={'lk-node l' + (li + 1) + (sel === n.id ? ' sel' : '') + cls(n.id)}
                      onClick={(e) => { e.stopPropagation(); setSel(sel === n.id ? null : n.id) }}
                    >
                      {n.head && <span className="lk-head">{n.head}</span>}
                      <span className="lk-label">{n.label}</span>
                    </button>
                  </foreignObject>
                )
              }),
            )}
          </svg>
        </div>
      ) : (
        <div className="lk-stack">
          {LAYERS.map((L, li) => (
            <section className="lk-layer" key={L.key}>
              <div className="lk-ltitle"><span className="lk-lk">{L.key}</span>{L.title}</div>
              <div className="lk-row">
                {L.nodes.map((n) => (
                  <button
                    key={n.id}
                    className={'lk-chip l' + (li + 1) + (sel === n.id ? ' sel' : '') + cls(n.id)}
                    onClick={() => setSel(sel === n.id ? null : n.id)}
                  >
                    {n.head && <b>{n.head}</b>} {n.label}
                  </button>
                ))}
              </div>
              {li < 3 && <div className="lk-down">↓</div>}
            </section>
          ))}
        </div>
      )}

      <div className={'lk-cap' + (cap ? ' on' : '')}>
        {cap ? (
          <>
            <strong>{cap.title}</strong>
            <span className="lk-cap-d">{cap.detail}</span>
            {cap.sources.length > 0 && (
              <span className="lk-cap-s">裏付け: <Cite refs={cap.sources} /></span>
            )}
          </>
        ) : (
          <span className="hint2">ノードを選ぶと、その社会動向→機械→課題→解の連鎖が浮かび上がります。</span>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── ロードマップ（モバイル＝縦リフロー） ───────────────────────── */
const HLABEL: Record<Horizon, string> = {
  '〜2030': '近中期 前半',
  '〜2035': '近中期',
  '2035〜': '長期・シナリオ',
}
function TimelineMobile({
  rdFilter,
  setRdFilter,
  onPick,
}: {
  rdFilter: string | null
  setRdFilter: (k: string | null) => void
  onPick: (m: Milestone, d: Driver) => void
}) {
  return (
    <div className="tl">
      <div className="figtag">Fig. 1 — 5 Drivers × Timeline</div>
      <p className="section-note">
        時間に沿って技術マイルストーンを縦に配置。各カードは担当ドライバ（色・記号）で色分け。
        <span className="ob">塗り＝確立</span>、白抜き＝推定、破線＝仮説。下のタグで絞り込み、カードのタップで詳細。
      </p>

      <div className="filterbar">
        <span className="filter-label">RD課題で絞り込み</span>
        <button className={rdFilter === null ? 'chip-f on' : 'chip-f'} onClick={() => setRdFilter(null)}>
          すべて
        </button>
        {RD_CLUSTERS.map((c) => (
          <button
            key={c.key}
            className={rdFilter === c.key ? 'chip-f on' : 'chip-f'}
            style={rdFilter === c.key ? { background: RD_COLORS[c.key], borderColor: RD_COLORS[c.key], color: '#fff' } : {}}
            onClick={() => setRdFilter(rdFilter === c.key ? null : c.key)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="vtl">
        {HORIZONS.map((h) => {
          const items = DRIVERS.flatMap((d) =>
            d.milestones.filter((m) => m.horizon === h).map((m) => ({ m, d })),
          ).filter(({ m }) => !rdFilter || m.rd.includes(rdFilter))
          return (
            <section className={'vt-sec' + (h === '2035〜' ? ' future' : '')} key={h}>
              <div className="vt-head">
                <span className="vt-node" />
                <span className="vt-h">{h}</span>
                <small>{HLABEL[h]}</small>
              </div>
              <div className="vt-list">
                {items.length === 0 && <p className="vt-empty">該当なし</p>}
                {items.map(({ m, d }) => (
                  <button
                    key={m.id}
                    className="vt-card"
                    style={{ borderLeftColor: RD_COLORS[m.rd[0]] ?? '#999' }}
                    onClick={() => onPick(m, d)}
                  >
                    <span className="vt-row">
                      <span className="vt-driver">
                        <DriverIcon id={d.id} className="d-svg sm" />
                        <b>{d.id}</b> {d.name}
                      </span>
                      <span className={confClass(m.confidence)}>{m.confidence}</span>
                    </span>
                    <span className="vt-title">{m.title}</span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="legend">
        <span className="lg"><span className="di di-e" />確立</span>
        <span className="lg"><span className="di di-p" />推定</span>
        <span className="lg"><span className="di di-h" />仮説</span>
        <span className="lg lg-line">● 〜2035 ／ ◌ 2035〜（破線レール）</span>
      </div>
    </div>
  )
}

/* ───────────────────────── ドライバ詳細 ───────────────────────── */
function DriversView({ onPick }: { onPick: (m: Milestone, d: Driver) => void }) {
  return (
    <div className="cards">
      {DRIVERS.map((d, i) => (
        <section className="card" key={d.id}>
          <h2 className="card-h">
            <span className="lnum">{String(i + 1).padStart(2, '0')}</span>
            <DriverIcon id={d.id} className="d-svg big" />
            {d.name}
            <small>{d.short}</small>
          </h2>
          <h3>社会・産業動向</h3>
          <ul className="trends">
            {d.trends.map((t, j) => (
              <li key={j}>
                <span className={confClass(t.confidence)}>{t.confidence}</span> {t.text}
                {t.source && SOURCE_MAP[t.source] && (
                  <a className="src" href={SOURCE_MAP[t.source].url} target="_blank" rel="noreferrer">
                    出典↗
                  </a>
                )}
              </li>
            ))}
          </ul>
          <h3>回転機械への需要シフト</h3>
          <p className="shift">{d.demandShift}</p>
          <h3>マイルストーン</h3>
          <div className="ms-row">
            {d.milestones.map((m) => (
              <button key={m.id} className="ms-inline" onClick={() => onPick(m, d)}>
                <span className="hz">{m.horizon}</span>
                <span className={confClass(m.confidence)}>{m.confidence}</span>
                <span className="ms-title">{m.title}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ───────────────────────── 共通ベクトル ───────────────────────── */
function VectorsView() {
  return (
    <div className="vectors">
      <p className="section-note">
        ドライバは違っても、回転機械の進化方向は次の5本に収束する（ロードマップの「縦糸」）。
      </p>
      {VECTORS.map((v) => (
        <div className="vector" key={v.id}>
          <div className="v-id">{v.id}</div>
          <div className="v-body">
            <strong>{v.name}</strong>
            <p>{v.detail}</p>
            <div className="v-drivers">
              {v.drivers.map((id) => {
                const d = DRIVERS.find((x) => x.id === id)!
                return (
                  <span className="pill" key={id}>
                    {d.id} {d.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────────────── RD課題マップ ───────────────────────── */
function RDMapView({ onJump }: { onJump: (key: string) => void }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    DRIVERS.forEach((d) => d.milestones.forEach((m) => m.rd.forEach((k) => (c[k] = (c[k] ?? 0) + 1))))
    return c
  }, [])
  return (
    <div className="rdmap">
      <p className="section-note">
        共通ベクトルが生む横断ローターダイナミクス課題。各カードの「タイムラインで見る」で、その課題を
        含むマイルストーンだけを抽出表示する。色は既存ナレッジトピックに接地。
      </p>
      <div className="rd-grid">
        {RD_CLUSTERS.map((c) => (
          <div className="rd-card" key={c.key} style={{ borderTopColor: RD_COLORS[c.key] }}>
            <div className="rd-head">
              <strong>{c.name}</strong>
              <span className="rd-count">{counts[c.key] ?? 0}</span>
            </div>
            <small className="rd-cause">主因: {c.cause}</small>
            <p>{c.detail}</p>
            <div className="rd-topics">
              {c.topics.length === 0 && <em className="thin">専用トピック未整備（要拡充）</em>}
              {c.topics.map((slug) => (
                <span className="topic-pill" key={slug}>
                  {TOPIC_MAP[slug]?.name ?? slug}
                </span>
              ))}
            </div>
            <button className="jump" onClick={() => onJump(c.key)}>
              タイムラインで見る →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── 出典 ───────────────────────── */
function SourcesView() {
  const primary = SOURCES.filter((s) => s.primary)
  const secondary = SOURCES.filter((s) => !s.primary)
  return (
    <div className="sources">
      <h2 className="sec-h">一次・確度高<small>（[確立] の根拠）</small></h2>
      <ol className="src-list">
        {primary.map((s) => (
          <li key={s.key}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
            <code>{s.key}</code>
          </li>
        ))}
      </ol>
      <h2 className="sec-h">二次・要裏取り<small>（方向性のみ採用）</small></h2>
      <ol className="src-list">
        {secondary.map((s) => (
          <li key={s.key}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
            <code>{s.key}</code>
          </li>
        ))}
      </ol>
      <p className="section-note">
        市場規模の絶対値は調査会社間で桁が割れるため方向性のみ採用。一次化タスクは知識ベースの
        open-questions に登録済み。
      </p>
    </div>
  )
}

/* ───────────────────────── 詳細ドロワー ───────────────────────── */
function Drawer({ data, onClose }: { data: { m: Milestone; driver: Driver }; onClose: () => void }) {
  const { m, driver } = data
  const horizonLabel = m.horizon === '2035〜' ? '2035〜 長期' : m.horizon
  return (
    <div className="drawer-wrap" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="閉じる">×</button>
        <div className="dr-tags">
          <span className="hz">{horizonLabel}</span>
          <span className={confClass(m.confidence)}>{m.confidence}</span>
          <span className="pill"><DriverIcon id={driver.id} className="d-svg sm" /> {driver.id} {driver.name}</span>
        </div>
        <h2 className="dr-h">{m.title}</h2>
        <p className="dr-detail">{m.detail}</p>

        <h4>横断RD課題</h4>
        <div className="dr-rd">
          {m.rd.map((k) => (
            <span className="topic-pill solid" key={k} style={{ background: RD_COLORS[k], borderColor: RD_COLORS[k] }}>
              {RD_MAP[k]?.name ?? k}
            </span>
          ))}
        </div>

        {m.topics && m.topics.length > 0 && (
          <>
            <h4>関連ナレッジ（experts/rotordynamics）</h4>
            <ul className="dr-topics">
              {m.topics.map((slug) => (
                <li key={slug}>
                  <strong>{TOPIC_MAP[slug]?.name ?? slug}</strong>
                  <small>{TOPIC_MAP[slug]?.summary}</small>
                </li>
              ))}
            </ul>
          </>
        )}

        {m.sources && m.sources.length > 0 && (
          <>
            <h4>出典</h4>
            <ul className="dr-src">
              {m.sources.map((key) => {
                const s = SOURCE_MAP[key]
                return s ? (
                  <li key={key}>
                    <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                  </li>
                ) : (
                  <li key={key}>{key}</li>
                )
              })}
            </ul>
          </>
        )}
      </aside>
    </div>
  )
}
