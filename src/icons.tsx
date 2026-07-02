// ドライバ識別用のミニマル・ラインアイコン（絵文字を使わない方針）。
// stroke=currentColor で色を継承、サイズは CSS で上書き可能。aria-hidden。
type Props = { id: string; className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export function DriverIcon({ id, className }: Props) {
  const p = { ...base, className, width: 18, height: 18 }
  switch (id) {
    // D1 電動化 — 稲妻（電力）
    case 'D1':
      return (
        <svg {...p}>
          <path d="M13 2 L6 13 H11 L11 22 L18 9 H13 Z" />
        </svg>
      )
    // D2 エネルギー転換 — 二原子分子（H2/エネルギーキャリア）
    case 'D2':
      return (
        <svg {...p}>
          <circle cx="8" cy="12" r="3.2" />
          <circle cx="16" cy="12" r="3.2" />
          <path d="M11.2 12 H12.8" />
        </svg>
      )
    // D3 データセンター/AI — サーバラック
    case 'D3':
      return (
        <svg {...p}>
          <rect x="4" y="4.5" width="16" height="6" rx="1.3" />
          <rect x="4" y="13.5" width="16" height="6" rx="1.3" />
          <path d="M7 7.5 h0.01 M7 16.5 h0.01" />
        </svg>
      )
    // D4 航空・モビリティ — 翼（ペーパープレーン）
    case 'D4':
      return (
        <svg {...p}>
          <path d="M3 12 L21 4 L14 20 L11 13 Z" />
          <path d="M11 13 L21 4" />
        </svg>
      )
    // D5 デジタル化・規格 — ノードグラフ（ネットワーク/DT）
    case 'D5':
      return (
        <svg {...p}>
          <circle cx="6" cy="8" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="12" cy="18" r="2" />
          <path d="M7.7 9.3 L10.5 16.3 M16.3 9.3 L13.5 16.3 M8 8 H16" />
        </svg>
      )
    // D6 系統安定化・回転慣性 — フライホイール（円＋スポーク＋回転矢印）
    case 'D6':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="1.6" />
          <path d="M12 5 V8.5 M12 15.5 V19 M5 12 H8.5 M15.5 12 H19" />
          <path d="M19.5 7.5 A9.4 9.4 0 0 0 16.5 4.5" />
        </svg>
      )
    default:
      return null
  }
}
