import { useMemo, useState } from 'react'
import {
  DRIVERS,
  VECTORS,
  RD_CLUSTERS,
  RD_MAP,
  SOURCES,
  SOURCE_MAP,
  TOPIC_MAP,
  HORIZONS,
  isDotted,
  type Confidence,
  type Driver,
  type Milestone,
} from './data/roadmap'

type Tab = 'timeline' | 'drivers' | 'vectors' | 'rdmap' | 'sources'

const KNOWLEDGE_NOTE =
  'このハブは experts/rotordynamics の知識ベースを土台に、社会動向と調査結果をひも付けた技術ロードマップです。'

const confClass = (c: Confidence) =>
  c === '確立' ? 'conf conf-est' : c === '推定' ? 'conf conf-prob' : 'conf conf-hyp'

const RD_COLORS: Record<string, string> = {
  critspeed: '#2563eb',
  stability: '#dc2626',
  emag: '#7c3aed',
  torsional: '#d97706',
  bearing: '#0891b2',
  seal: '#16a34a',
  fwbw: '#db2777',
  digital: '#475569',
}

export default function App() {
  const [tab, setTab] = useState<Tab>('timeline')
  const [active, setActive] = useState<{ m: Milestone; driver: Driver } | null>(null)
  const [rdFilter, setRdFilter] = useState<string | null>(null)

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="badge">Rotordynamics Hub</div>
          <h1>回転機械 ローターダイナミクス技術ロードマップ</h1>
          <p className="lead">{KNOWLEDGE_NOTE}</p>
          <div className="logic">
            <span>社会動向</span><i>→</i><span>回転機械への需要シフト</span><i>→</i>
            <span>RD課題</span><i>→</i><span>要素技術・手法・規格</span>
          </div>
        </div>
      </header>

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

      {active && (
        <Drawer data={active} onClose={() => setActive(null)} />
      )}

      <footer className="foot">
        <span>確度: </span>
        <span className="conf conf-est">確立</span> 一次裏取り済 ·{' '}
        <span className="conf conf-prob">推定</span> 方向は妥当・値未確定 ·{' '}
        <span className="conf conf-hyp">仮説</span> 長期シナリオ
        <span className="foot-sep">|</span>
        実線=〜2035 / 点線=2035〜（長期）
      </footer>
    </div>
  )
}

/* ───────────────────────── タイムライン（スイムレーン） ───────────────────────── */
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
    <div className="timeline">
      <div className="filterbar">
        <span className="filter-label">RD課題で絞り込み:</span>
        <button className={rdFilter === null ? 'chip-f on' : 'chip-f'} onClick={() => setRdFilter(null)}>
          すべて
        </button>
        {RD_CLUSTERS.map((c) => (
          <button
            key={c.key}
            className={rdFilter === c.key ? 'chip-f on' : 'chip-f'}
            style={rdFilter === c.key ? { background: RD_COLORS[c.key], borderColor: RD_COLORS[c.key] } : {}}
            onClick={() => setRdFilter(rdFilter === c.key ? null : c.key)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid">
        <div className="grid-head">
          <div className="lane-col">ドライバ</div>
          {HORIZONS.map((h) => (
            <div key={h} className={isDotted(h) ? 'h-col dotted' : 'h-col'}>
              {h}
              <small>{isDotted(h) ? '長期・シナリオ' : '近中期・実装寄り'}</small>
            </div>
          ))}
        </div>

        {DRIVERS.map((d) => (
          <div className="lane" key={d.id}>
            <div className="lane-col">
              <span className="d-icon">{d.icon}</span>
              <div>
                <strong>{d.id} {d.name}</strong>
                <small>{d.short}</small>
              </div>
            </div>
            {HORIZONS.map((h) => (
              <div key={h} className={isDotted(h) ? 'cell dotted' : 'cell'} data-h={h}>
                {d.milestones
                  .filter((m) => m.horizon === h)
                  .filter((m) => !rdFilter || m.rd.includes(rdFilter))
                  .map((m) => (
                    <button
                      key={m.id}
                      className="ms"
                      onClick={() => onPick(m, d)}
                      style={{ borderLeftColor: RD_COLORS[m.rd[0]] ?? '#94a3b8' }}
                    >
                      <span className={confClass(m.confidence)}>{m.confidence}</span>
                      <span className="ms-title">{m.title}</span>
                    </button>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── ドライバ詳細 ───────────────────────── */
function DriversView({ onPick }: { onPick: (m: Milestone, d: Driver) => void }) {
  return (
    <div className="cards">
      {DRIVERS.map((d) => (
        <section className="card" key={d.id}>
          <h2>
            <span className="d-icon big">{d.icon}</span> {d.id} {d.name}
            <small>{d.short}</small>
          </h2>
          <h3>社会・産業動向</h3>
          <ul className="trends">
            {d.trends.map((t, i) => (
              <li key={i}>
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
              <button key={m.id} className="ms ms-inline" onClick={() => onPick(m, d)} style={{ borderLeftColor: RD_COLORS[m.rd[0]] ?? '#94a3b8' }}>
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
        共通ベクトルが生む横断ローターダイナミクス課題。各カードの「タイムラインで見る」で、その課題を含む
        マイルストーンだけを抽出表示します。色は既存ナレッジトピックに接地。
      </p>
      <div className="rd-grid">
        {RD_CLUSTERS.map((c) => (
          <div className="rd-card" key={c.key} style={{ borderTopColor: RD_COLORS[c.key] }}>
            <div className="rd-head">
              <strong>{c.name}</strong>
              <span className="rd-count">{counts[c.key] ?? 0}件</span>
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
  const primary = SOURCES_BY(true)
  const secondary = SOURCES_BY(false)
  return (
    <div className="sources">
      <h2>一次・確度高（[確立]の根拠）</h2>
      <ul className="src-list">
        {primary.map((s) => (
          <li key={s.key}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
            <code>{s.key}</code>
          </li>
        ))}
      </ul>
      <h2>二次・要裏取り（方向性のみ採用）</h2>
      <ul className="src-list">
        {secondary.map((s) => (
          <li key={s.key}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
            <code>{s.key}</code>
          </li>
        ))}
      </ul>
      <p className="section-note">
        市場規模の絶対値は調査会社間で桁が割れるため方向性のみ採用。一次化タスクは知識ベースの
        open-questions に登録済み。
      </p>
    </div>
  )
}

function SOURCES_BY(primary: boolean) {
  return SOURCES.filter((s) => s.primary === primary)
}

/* ───────────────────────── 詳細ドロワー ───────────────────────── */
function Drawer({ data, onClose }: { data: { m: Milestone; driver: Driver }; onClose: () => void }) {
  const { m, driver } = data
  return (
    <div className="drawer-wrap" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="閉じる">
          ×
        </button>
        <div className="dr-tags">
          <span className="hz">{m.horizon}</span>
          <span className={confClass(m.confidence)}>{m.confidence}</span>
          <span className="pill">
            {driver.icon} {driver.id} {driver.name}
          </span>
        </div>
        <h2>{m.title}</h2>
        <p className="dr-detail">{m.detail}</p>

        <h4>横断RD課題</h4>
        <div className="dr-rd">
          {m.rd.map((k) => (
            <span className="topic-pill" key={k} style={{ background: RD_MAP[k] ? RD_COLORS[k] : '#94a3b8', color: '#fff', borderColor: 'transparent' }}>
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
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
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
