import { useMemo, useState } from 'react'
import {
  ORBIT,
  FORCE_RULES,
  BW_SOURCES,
  BW_EXCLUDED,
  SM_DECISION,
  SM_CONCLUSION,
  SM_LABEL,
  TC_LABEL,
  STANDARDS_SURVEY,
  TC_NOTES,
  type Ref,
  type Sync,
  type SMClass,
  type BWConf,
  type BWSource,
} from './data/backward'

type BwTab = 'overview' | 'catalog' | 'decision'

// 確立=oxblood(e), 設計判断=ink(p), 仮説=navy(h)
const confClass = (c: BWConf) => 'conf c-' + (c === '確立' ? 'e' : c === '設計判断' ? 'p' : 'h')

/* SMクラス → バッジ配色クラス */
const smCls = (s: SMClass) => 'sm-tag sm-' + s

function RefList({ refs }: { refs: Ref[] }) {
  return (
    <span className="cites">
      {refs.map((r, i) =>
        r.url ? (
          <a key={i} className="cref" href={r.url} target="_blank" rel="noreferrer" title={r.label}>
            {r.label}
          </a>
        ) : (
          <span key={i} className="cref topic">
            {r.label}
          </span>
        ),
      )}
    </span>
  )
}

/* ───────── 軌道の前後分解 図 ───────── */
function OrbitFigure() {
  // ellipse = forward circle (r_f) ⊕ backward circle (r_b)
  const cx = 175,
    cy = 110
  const rf = 78,
    rb = 30
  const a = rf + rb, // 長軸半径
    b = rf - rb // 短軸半径
  return (
    <svg viewBox="0 0 350 220" className="bw-svg orbit" role="img" aria-label="軌道の前後分解">
      <defs>
        <marker id="ahF" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
          <path d="M1,1 L8,4.5 L1,8" fill="none" stroke="var(--accent)" strokeWidth="1.4" />
        </marker>
        <marker id="ahB" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
          <path d="M1,1 L8,4.5 L1,8" fill="none" stroke="var(--accent-2)" strokeWidth="1.4" />
        </marker>
      </defs>
      {/* 軸 */}
      <line x1={cx - a - 16} y1={cy} x2={cx + a + 16} y2={cy} className="bw-axis" />
      <line x1={cx} y1={cy - a - 8} x2={cx} y2={cy + a + 8} className="bw-axis" />
      {/* 後退円 r_b（navy・破線, 時計回り） */}
      <circle cx={cx} cy={cy} r={rb} className="bw-circ-b" />
      <path d={`M${cx + rb},${cy} A${rb},${rb} 0 0 0 ${cx},${cy - rb}`} className="bw-arc-b" markerEnd="url(#ahB)" />
      {/* 前進円 r_f（oxblood・破線, 反時計回り） */}
      <circle cx={cx} cy={cy} r={rf} className="bw-circ-f" />
      <path d={`M${cx + rf},${cy} A${rf},${rf} 0 0 1 ${cx},${cy + rf}`} className="bw-arc-f" markerEnd="url(#ahF)" />
      {/* 合成楕円（実際の軌道, ink） */}
      <ellipse cx={cx} cy={cy} rx={a} ry={b} className="bw-orbit" />
      {/* 半径ラベル */}
      <line x1={cx} y1={cy} x2={cx + rf} y2={cy} className="bw-rline f" />
      <line x1={cx} y1={cy} x2={cx} y2={cy - rb} className="bw-rline b" />
      <text x={cx + rf / 2} y={cy - 6} className="bw-lbl f" textAnchor="middle">r_f</text>
      <text x={cx + 6} y={cy - rb / 2} className="bw-lbl b">r_b</text>
      <text x={cx + a - 4} y={cy + b + 16} className="bw-lbl ink" textAnchor="end">合成＝楕円軌道</text>
    </svg>
  )
}

/* ───────── ジャイロ分裂 Campbell 図 ───────── */
function CampbellFigure() {
  // x: 回転数Ω, y: 振動数ω. 0..100 → svg
  const W = 350,
    H = 220,
    L = 38,
    R = 14,
    T = 14,
    B = 30
  const px = (v: number) => L + (v / 100) * (W - L - R)
  const py = (v: number) => H - B - (v / 100) * (H - T - B)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bw-svg campbell" role="img" aria-label="ジャイロ効果による前後分裂">
      <defs>
        <marker id="ahX" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M1,1 L7,4 L1,7" fill="none" stroke="var(--dim)" strokeWidth="1.2" />
        </marker>
      </defs>
      {/* 軸 */}
      <line x1={L} y1={py(0)} x2={px(100)} y2={py(0)} className="bw-axis" markerEnd="url(#ahX)" />
      <line x1={L} y1={py(0)} x2={L} y2={T} className="bw-axis" markerEnd="url(#ahX)" />
      <text x={px(100)} y={py(0) + 20} className="bw-lbl dim" textAnchor="end">回転数 Ω</text>
      <text x={L - 6} y={T + 6} className="bw-lbl dim" textAnchor="end">振動数 ω</text>
      {/* 1× 同期線 */}
      <line x1={px(0)} y1={py(0)} x2={px(92)} y2={py(92)} className="bw-line-1x" />
      <text x={px(86)} y={py(92) - 4} className="bw-lbl dim">1×</text>
      {/* 静止系加振 ν（水平線） */}
      <line x1={px(0)} y1={py(34)} x2={px(100)} y2={py(34)} className="bw-line-ext" />
      <text x={px(2)} y={py(34) - 5} className="bw-lbl ext">静止系加振 ν</text>
      {/* 前進枝（gyroscopic stiffening, 右上がり） */}
      <path d={`M${px(0)},${py(48)} Q${px(50)},${py(64)} ${px(100)},${py(92)}`} className="bw-branch-f" />
      <text x={px(100)} y={py(92) - 6} className="bw-lbl f" textAnchor="end">前進枝</text>
      {/* 後退枝（gyroscopic softening, 右下がり） */}
      <path d={`M${px(0)},${py(48)} Q${px(50)},${py(34)} ${px(100)},${py(20)}`} className="bw-branch-b" />
      <text x={px(100)} y={py(20) - 6} className="bw-lbl b" textAnchor="end">後退枝</text>
      {/* 交点: 前進×1× = 前進危険速度 */}
      <circle cx={px(73)} cy={py(73)} r={4.5} className="bw-cross f" />
      <text x={px(73) + 7} y={py(73) + 12} className="bw-lbl f">前進危険速度</text>
      {/* 交点: 後退枝×静止系加振 = BW共振 */}
      <circle cx={px(58)} cy={py(34)} r={4.5} className="bw-cross b" />
      <text x={px(58) - 6} y={py(34) + 16} className="bw-lbl b" textAnchor="end">BW共振（外部加振）</text>
    </svg>
  )
}

function OverviewView() {
  return (
    <div className="bw-ov">
      <div className="figtag">Fundamentals — 前後ホワールと軌道の分解</div>
      <p className="section-note">
        ロータの軸中心が描く軌道（whirl）の回転向きが、自転（spin, Ω）と同じならフォワード、逆なら
        バックワード。一般の楕円軌道は逆回りの2円に分解でき、<span className="ob">異方性が真円を楕円に変えると
        後退（BW）成分が必ず生まれる</span>——これがBW励振を読み解く鍵。
      </p>

      <div className="bw-figgrid">
        <figure className="bw-fig">
          <OrbitFigure />
          <figcaption>
            楕円軌道 ＝ 前進円(r_f) ⊕ 後退円(r_b)。{ORBIT.major}、{ORBIT.minor}。
          </figcaption>
        </figure>
        <figure className="bw-fig">
          <CampbellFigure />
          <figcaption>
            ジャイロ効果で静止時1モードが前進枝（右上がり）／後退枝（右下がり）に分裂。後退枝は静止系加振と
            交差してBW共振を起こしうる。
          </figcaption>
        </figure>
      </div>

      <div className="bw-insight">
        <span className="bw-insight-k">核心</span>
        <p>
          <strong>異方性（向きで剛さが違う）は、まん丸の振れ回りを楕円に変える。楕円＝前進円＋後退円なので
          後退(BW)成分が必ず生まれる。</strong>{' '}
          複素座標 z=x+iy では、等方なら前進 e^{'{+iωt}'}・後退 e^{'{−iωt}'} は独立だが、
          k_xx≠k_yy やクロスカップリングがあると共役 z̄ が現れて前後が結合する。
        </p>
        <div className="bw-rules-orbit">
          {ORBIT.rules.map((r) => (
            <span className="bw-orbit-rule" key={r}>{r}</span>
          ))}
        </div>
      </div>

      <h2 className="sec-h">励振力の向きによる分類<small>（BW励起の判定基準・3則）</small></h2>
      <p className="section-note">
        BWモードを「たたく」かどうかは力の向きで決まる。同期不釣合いは純前進だが、静止系の周期力と
        異方性は後退成分を生む。
      </p>
      <div className="bw-rules">
        {FORCE_RULES.map((r, i) => (
          <div className="bw-rule" key={r.id}>
            <div className="bw-rule-n">{i + 1}</div>
            <div className="bw-rule-body">
              <strong>{r.title}</strong>
              <p className="bw-rule-mech">{r.body}</p>
              <p className="bw-rule-verdict">{r.verdict}</p>
              <RefList refs={r.refs} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────── 励振源カタログ ───────── */
const SYNC_FILTERS: (Sync | 'all')[] = ['all', '同期', '非同期', '混在', '過渡']
const SM_FILTERS: (SMClass | 'all')[] = ['all', 'main', 'cond', 'out']

function CatalogCard({ s }: { s: BWSource }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'bw-card' + (s.tc === 'no' ? ' na' : '')}>
      <button className="bw-card-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="bw-no">{s.no}</span>
        <span className="bw-card-title">
          {s.group && <span className="bw-group">{s.group}</span>}
          <strong>{s.name}</strong>
        </span>
        <span className="bw-card-badges">
          <span className={smCls(s.sm)}>{SM_LABEL[s.sm]}</span>
          <span className={'tc-tag tc-' + s.tc}>{TC_LABEL[s.tc]}</span>
        </span>
        <span className={'bw-chev' + (open ? ' open' : '')}>▾</span>
      </button>

      <div className="bw-card-meta">
        <span className="bw-m"><i>機構</i>{s.mechanism}</span>
      </div>

      <div className="bw-card-grid">
        <div><i>励振周波数</i>{s.freq}</div>
        <div><i>速度同期</i>{s.sync}{s.syncNote ? `（${s.syncNote}）` : ''}</div>
        <div><i>BW強さ</i>{s.strength}</div>
        <div><i>発生可能性</i>{s.likelihood}</div>
        <div><i>評価手段</i>{s.evalBy}</div>
        <div><i>確度</i><span className={confClass(s.conf)}>{s.conf}</span></div>
      </div>

      {open && (
        <div className="bw-card-more">
          <p className="bw-sm-note"><i>SMの扱い</i>{s.smNote}</p>
          {s.tcNote && <p className="bw-tc-note"><i>本機での扱い</i>{s.tcNote}</p>}
          {s.detail && (
            <p className="bw-detail"><i>詳説</i>{s.detail}</p>
          )}
          <div className="bw-card-refs">
            <span className="bw-refs-l">出典</span>
            <RefList refs={s.refs} />
          </div>
        </div>
      )}
    </div>
  )
}

function CatalogView() {
  const [sync, setSync] = useState<Sync | 'all'>('all')
  const [sm, setSm] = useState<SMClass | 'all'>('all')
  const [tcOnly, setTcOnly] = useState(false)

  const list = useMemo(
    () =>
      BW_SOURCES.filter(
        (s) =>
          (sync === 'all' || s.sync === sync) &&
          (sm === 'all' || s.sm === sm) &&
          (!tcOnly || s.tc === 'yes'),
      ),
    [sync, sm, tcOnly],
  )

  return (
    <div className="bw-cat">
      <div className="figtag">Catalog — BW励振源 11機構</div>
      <p className="section-note">
        純フォワード不釣合い(1×)はBWを励起しないため除外。各機構を<span className="ob">速度同期・SMの扱い・本機
        該当</span>で整理した。カードを開くと詳説と出典が出る。
      </p>

      <div className="bw-filters">
        <div className="bw-fgroup">
          <span className="filter-label">速度同期</span>
          {SYNC_FILTERS.map((f) => (
            <button key={f} className={sync === f ? 'chip-f on dark' : 'chip-f'} onClick={() => setSync(f)}>
              {f === 'all' ? 'すべて' : f}
            </button>
          ))}
        </div>
        <div className="bw-fgroup">
          <span className="filter-label">SMの扱い</span>
          {SM_FILTERS.map((f) => (
            <button
              key={f}
              className={sm === f ? 'chip-f on ' + (f !== 'all' ? 'sm-' + f : 'dark') : 'chip-f'}
              onClick={() => setSm(f)}
            >
              {f === 'all' ? 'すべて' : SM_LABEL[f as SMClass]}
            </button>
          ))}
        </div>
        <label className="bw-toggle">
          <input type="checkbox" checked={tcOnly} onChange={(e) => setTcOnly(e.target.checked)} />
          本機（ガス軸受TC）該当のみ
        </label>
      </div>

      <div className="bw-count">
        {list.length} / {BW_SOURCES.length} 機構
      </div>

      <div className="bw-cards">
        {list.map((s) => (
          <CatalogCard key={s.no} s={s} />
        ))}
        {list.length === 0 && <p className="vt-empty">該当する機構はありません。</p>}
      </div>

      <p className="section-note bw-excl">{BW_EXCLUDED}</p>
    </div>
  )
}

/* ───────── 離調判定（SM） ───────── */
function DecisionView() {
  return (
    <div className="bw-dec">
      <div className="figtag">Decision — バックワードモードに離調(SM)は要るか</div>
      <p className="section-note">
        危険速度分離余裕(SM)は本質的に「1×同期不釣合い応答が危険速度に接近すること」を避ける速度軸上の
        余裕。速度同期しない励振は捕捉できない。BWがSMの土俵に乗るのは1ケースだけ。
      </p>

      <div className="bw-tree">
        <div className="bw-tree-q">
          <span className="bw-q-k">Q</span>
          {SM_DECISION.q}
        </div>
        <div className="bw-tree-branches">
          {SM_DECISION.branches.map((b, i) => (
            <div className={'bw-branch sm-' + b.cls} key={i}>
              <div className="bw-branch-cond">{b.cond}</div>
              <div className="bw-branch-arrow">↓</div>
              <div className="bw-branch-verdict">{b.verdict}</div>
              <div className="bw-branch-ex">
                <span className={smCls(b.cls)}>{SM_LABEL[b.cls]}</span>
                {b.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bw-conclusion">
        <span className="bw-concl-k">結論</span>
        <p>{SM_CONCLUSION}</p>
      </div>

      <h2 className="sec-h">規格・文献での扱い<small>（世界調査）</small></h2>
      <ol className="bw-survey">
        {STANDARDS_SURVEY.map((s, i) => (
          <li key={i}>
            <span className="bw-survey-t">{s.text}</span>
            <RefList refs={s.refs} />
          </li>
        ))}
      </ol>

      <h2 className="sec-h">本TC構成での当てはめ<small>（モータ一体・遠心＋ラジアル・ガス軸受）</small></h2>
      <ul className="bw-tcnotes">
        {TC_NOTES.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

export default function BackwardSection() {
  const [tab, setTab] = useState<BwTab>(() => {
    const h = typeof location !== 'undefined' ? location.hash : ''
    if (h.includes('catalog')) return 'catalog'
    if (h.includes('decision')) return 'decision'
    return 'overview'
  })
  return (
    <>
      <header className="masthead">
        <p className="kicker">Rotordynamics&nbsp;Hub · Reference</p>
        <h1>バックワード励振の整理</h1>
        <p className="dek">
          後ろ向き振れ回り（backward whirl）を生む励振源を機構別に整理し、危険速度分離余裕（SM）の
          対象になるか／安定性解析・干渉線図で扱うかを判別する。動圧ガス軸受支持ターボチャージャ
          （モータ一体・遠心コンプ＋ラジアルタービン）を主対象とする。
        </p>
        <div className="logic">
          <span>力の向き</span><i>→</i><span>速度同期か</span><i>→</i>
          <span>SM対象か</span><i>→</i><span>評価手段</span>
        </div>
      </header>

      <div className="rule-double" />

      <nav className="tabs">
        {([
          ['overview', '概観'],
          ['catalog', '励振源カタログ'],
          ['decision', '離調判定（SM）'],
        ] as [BwTab, string][]).map(([k, label]) => (
          <button key={k} className={tab === k ? 'tab on' : 'tab'} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'overview' && <OverviewView />}
        {tab === 'catalog' && <CatalogView />}
        {tab === 'decision' && <DecisionView />}
      </main>
    </>
  )
}
