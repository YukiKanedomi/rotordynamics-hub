import { useMemo, useState, type CSSProperties } from 'react'
import {
  DRIVERS,
  VECTORS,
  RD_CLUSTERS,
  RD_MAP,
  SOURCES,
  SOURCE_MAP,
  TOPIC_MAP,
  HORIZONS,
  type Confidence,
  type Driver,
  type Horizon,
  type Milestone,
} from './data/roadmap'

type Tab = 'timeline' | 'drivers' | 'vectors' | 'rdmap' | 'sources'

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

export default function App() {
  const [tab, setTab] = useState<Tab>('timeline')
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
        {tab === 'timeline' && (
          <TimelineView
            rdFilter={rdFilter}
            setRdFilter={setRdFilter}
            onPick={(m, driver) => setActive({ m, driver })}
          />
        )}
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
                    <span className="ic">{d.icon}</span>
                    <span className="ln">
                      {d.id} {d.name}
                    </span>
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

/* ───────────────────────── ドライバ詳細 ───────────────────────── */
function DriversView({ onPick }: { onPick: (m: Milestone, d: Driver) => void }) {
  return (
    <div className="cards">
      {DRIVERS.map((d, i) => (
        <section className="card" key={d.id}>
          <h2 className="card-h">
            <span className="lnum">{String(i + 1).padStart(2, '0')}</span>
            <span className="d-icon">{d.icon}</span> {d.name}
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
                    {d.icon} {d.id}
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
          <span className="pill">{driver.icon} {driver.id} {driver.name}</span>
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
