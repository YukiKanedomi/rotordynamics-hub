// ============================================================
// バックワード励振の整理 — データ
//   knowledge/topics/forward-backward-whirl.md
//   knowledge/topics/separation-margin.md（BW励振源一覧表・SM離調判定）を構造化。
//   対象機: モータ一体・遠心コンプ＋ラジアルタービン・動圧ガス軸受支持TC（横置き）。
// ============================================================
// ナレッジの確度ラベル（[確立]/[設計判断]/[仮説]）。アプリの Confidence とは別系統。
export type BWConf = '確立' | '設計判断' | '仮説'

export type Sync = '同期' | '非同期' | '混在' | '過渡'
// SMで捕捉できるか: main=主対象 / cond=条件付 / out=枠外 / na=該当外
export type SMClass = 'main' | 'cond' | 'out' | 'na'
// 本TC構成での当てはめ: yes=該当 / small=小 / no=非該当
export type TCApply = 'yes' | 'small' | 'no'

export interface Ref {
  label: string
  url?: string
}

export interface BWSource {
  no: string
  name: string
  group?: string // 同一傘（例: ラビング）の表示ラベル
  mechanism: string // 機構の要点
  freq: string // 励振周波数
  sync: Sync
  syncNote?: string
  strength: string // BW強さ
  likelihood: string // 発生可能性
  sm: SMClass
  smNote: string
  evalBy: string // 評価手段
  conf: BWConf
  tc: TCApply
  tcNote?: string
  detail?: string // 機構の詳説（数式が要る行のみ）
  refs: Ref[]
}

export const SM_LABEL: Record<SMClass, string> = {
  main: 'SM主対象',
  cond: 'SM条件付',
  out: 'SM枠外',
  na: '—',
}

export const TC_LABEL: Record<TCApply, string> = {
  yes: '本機 該当',
  small: '本機 小',
  no: '本機 非該当',
}

// ---- 軌道の前後分解（概観の基礎） ----
export const ORBIT = {
  formula: 'z(t) = r_f·e^{+iωt} + r_b·e^{-iωt}',
  major: '長軸 = |r_f| + |r_b|',
  minor: '短軸 = ||r_f| − |r_b||',
  rules: [
    '|r_f| > |r_b| … フォワード楕円',
    '|r_f| < |r_b| … バックワード楕円',
    '|r_f| = |r_b| … 直線振動',
    'r_b = 0 … 純フォワード真円',
  ],
}

// ---- 励振力の向きによる分類（BW励起の判定基準・3則） ----
export const FORCE_RULES: { id: string; title: string; body: string; verdict: string; refs: Ref[] }[] = [
  {
    id: 'co-rot',
    title: '回転系に固定された力（co-rotating）',
    body: '不釣合い力のようにロータと共に自転する力。前進回転力そのもの。',
    verdict: '純フォワード。これ単独ではBW曲げモードを励起しない。',
    refs: [{ label: 'API617-9th 2022' }],
  },
  {
    id: 'stationary',
    title: '静止系に固定された周期力（周波数 ν）',
    body: 'f(t) ∝ cos νt = ½(e^{+iνt} + e^{-iνt}) と前進・後退に等分解される。',
    verdict: 'フォワードとバックワードを等しく励起。BWを直接たたく主経路。',
    refs: [{ label: 'COMSOL Rotordynamics', url: 'https://doc.comsol.com/6.1/doc/com.comsol.help.rotor/rotor_ug_modeling.3.29.html' }],
  },
  {
    id: 'aniso',
    title: '支持の異方性・時間変動剛性',
    body: '直接剛性の非対称(k_xx≠k_yy)・クロスカップリングが共役 z̄ を生み、前進応答に後退成分を混ぜる。',
    verdict: '真円を楕円化（前進円＋後退円）。同期応答に r_b≠0、±2Ω サイドバンド。',
    refs: [
      { label: 'Greenhill & Cornejo 1995', url: 'http://dynatechengr.com/Backward%20Mode%20Paper.pdf' },
      { label: 'Black 1968', url: 'https://journals.sagepub.com/doi/10.1243/JMES_JOUR_1968_010_003_02' },
    ],
  },
]

// ---- BW励振源 一覧（11機構＋ラビング2レジーム） ----
export const BW_SOURCES: BWSource[] = [
  {
    no: '1',
    name: '軸受／支持の異方性',
    mechanism:
      '直接剛性の非対称(k_xx≠k_yy)で同期不釣合いがBWモード共振を励起。タテ/ヨコ剛性差が振れ回りを楕円化＝前進円＋後退円で後退成分が常在。共振の原因はBWモードだが歳差方向はforward。減衰でoverdamp可（自重偏心・非円形ボアが異方源）。',
    freq: '1×Ω（−1X）',
    sync: '同期',
    syncNote: '1×',
    strength: '小〜中',
    likelihood: '中〜高',
    sm: 'cond',
    smNote: 'BW臨界が応答に現れればAF判定。規格上は非要求、減衰で対処。',
    evalBy: '異方性込み同期不釣合い応答(AF) ／ 減衰',
    conf: '確立',
    tc: 'yes',
    tcNote: 'SMの土俵に乗り得る唯一のBW源。',
    detail:
      '複素座標 z=x+iy で、等方なら方程式は z だけで閉じ前進 e^{+iωt}・後退 e^{-iωt} は独立。異方(k_xx≠k_yy)やクロスカップリング(k_xy≠k_yx)があると共役 z̄ が現れて前後が結合し、同期応答が楕円 z=r_f e^{+iωt}+r_b e^{-iωt}（r_b≠0）になる。',
    refs: [
      { label: 'Greenhill & Cornejo 1995', url: 'http://dynatechengr.com/Backward%20Mode%20Paper.pdf' },
      { label: 'Black 1968', url: 'https://journals.sagepub.com/doi/10.1243/JMES_JOUR_1968_010_003_02' },
    ],
  },
  {
    no: '2',
    name: '外部／静止系加振',
    mechanism:
      '空間に固定された揺れ（エンジン燃焼・往復運動・路面）は前進回転力＋後退回転力に等分され、後退モードも同じだけ加振する。',
    freq: '外部加振 ν（非同期）',
    sync: '非同期',
    strength: '中〜大',
    likelihood: '用途依存（自動車：高）',
    sm: 'out',
    smNote: '速度同期しないため速度軸ベースのSMでは捕捉不可。',
    evalBy: '干渉線図 ＋ 強制応答',
    conf: '確立',
    tc: 'yes',
    tcNote: 'エンジン直結TCでは最重要かつTC固有性が高い。',
    detail:
      '静止調和力 f∝cos νt=½(e^{+iνt}+e^{-iνt}) は前進・後退回転力が等振幅ゆえ後退モードも等しく加振。ジャイロでBW固有振動数は回転数とともに低下（Campbell右下がり）し、ある回転数域で加振周波数と交差しうる。',
    refs: [{ label: 'COMSOL FW/BW whirl', url: 'https://doc.comsol.com/6.1/doc/com.comsol.help.rotor/rotor_ug_modeling.3.29.html' }],
  },
  {
    no: '3a',
    name: '断続接触（部分ラビング・軽度）',
    group: 'ラビング（ロータ-ステータ接触）',
    mechanism:
      '接触が1周期の一部だけ起こる。区分線形(bilinear)で±nX高調波・分数調波を生み、接触点が空間準固定ゆえ各高調波が前進・後退に分裂。軌道は有界。',
    freq: 'nΩ・(1/n)Ω（−nX 等）',
    sync: '同期',
    syncNote: '高次／分数次',
    strength: '接触依存（中）',
    likelihood: '中（微小すきま・過渡/サージ）',
    sm: 'out',
    smNote: '1×SM対象外。故障症状＝接触回避の問題。',
    evalBy: 'フルスペクトル ＋ オーダートラッキング',
    conf: '確立',
    tc: 'yes',
    refs: [{ label: 'Orbit / Yu 2022', url: 'https://www.bakerhughes.com/bently-nevada/orbit-home/orbit-article/rub-diagnostics-based-vibration-data' }],
  },
  {
    no: '3b',
    name: '持続接触（dry whirl → whip・重度）',
    group: 'ラビング（ロータ-ステータ接触）',
    mechanism:
      '接触が持続。転がり(no-slip)=dry whirl（後退・周波数∝回転数）、全滑り(full sliding)=dry whip（後退・結合系固有振動数ロック・破壊的）。回転数増で whirl→whip 遷移。応力が (Ω+ω) で交番し疲労・破損リスク大。',
    freq: '結合系BW固有振動数（≈一定・高周波・非同期）',
    sync: '非同期',
    syncNote: '自励',
    strength: '大（破壊的）',
    likelihood: '低〜中',
    sm: 'out',
    smNote: '自励のためSM枠外。',
    evalBy: '接触込み複素固有値（log decrement）',
    conf: '確立',
    tc: 'yes',
    tcNote: '油膜クッションが無いガス軸受TCで残る数少ない自励BW。',
    refs: [
      { label: 'Jiang & Ulbrich 2005', url: 'https://asmedigitalcollection.asme.org/vibrationacoustics/article-abstract/127/6/594/447650' },
      { label: 'Black 1968', url: 'https://journals.sagepub.com/doi/10.1243/JMES_JOUR_1968_010_003_02' },
    ],
  },
  {
    no: '5',
    name: '軸流コンプレッサ Alford 力（β<0）',
    mechanism:
      '低流量で「すきまが狭い側ほど効率が落ちる」状態になり、翼の接線力の偏りが回転と逆向きの押しを生んで後退を自励。',
    freq: 'BW固有振動数（subsync・非同期）',
    sync: '非同期',
    syncNote: '自励',
    strength: '中',
    likelihood: '低（軸流かつ低流量のみ）',
    sm: 'out',
    smNote: '自励のためSM枠外。',
    evalBy: 'log decrement（β<0 域）',
    conf: '確立',
    tc: 'no',
    tcNote: '本機は遠心コンプ／ラジアルタービン。backward自励は軸流特有で非該当。',
    refs: [{ label: 'Spakovszky 2000 (PDF)', url: 'https://dspace.mit.edu/bitstream/handle/1721.1/106475/Spakovszky_Analysis%20of.pdf' }],
  },
  {
    no: "5'",
    name: '遠心コンプ シール／インペラ力',
    mechanism:
      '主役はシール＋インペラ流体力(Wachel系)で、通常は前進。後退は基本問題にならない（modified Alford Q=c·63000·hp/(H_c·D_c·N)·ratio, c=3.0、不安定はサブシンクロナス forward）。',
    freq: 'forward subsync',
    sync: '非同期',
    syncNote: '自励',
    strength: '（BWは小・forwardが主役）',
    likelihood: '—',
    sm: 'na',
    smNote: 'forward不安定として安定性で評価。',
    evalBy: 'log decrement',
    conf: '確立',
    tc: 'small',
    tcNote: '本機の空力クロスカップリングはこちら（forward）。anti-swirlで実効値を負側へ。',
    refs: [
      { label: 'Nicholas & Kocur 2005' },
      { label: 'Wachel 1975' },
      { label: 'API617-9th 2022' },
    ],
  },
  {
    no: '6',
    name: 'ロータ／軸の非対称',
    mechanism:
      '剛い軸/柔らかい軸がロータと共回りするため回転系では「方向性のある剛性」。振れ回りを楕円化し後退成分を生むが、混ざる周波数が 2Ω ずれる。慣性異方性(polar≠diametral・2極ロータ)も同類のパラメトリック。',
    freq: '2Ω, 結合相手 (2Ω−ω)',
    sync: '同期',
    syncNote: '2×',
    strength: '小',
    likelihood: '低（TCはほぼ軸対称）',
    sm: 'out',
    smNote: '2×・1×SM主対象外。',
    evalBy: 'パラメトリック／組合せ共振の安定性解析',
    conf: '設計判断',
    tc: 'small',
    detail:
      '行1の異方性を回転系に置いたもの。静止系に直すと剛性が 2Ω で脈動する項になり、周波数 ω が相手 (2Ω−ω) と結合。この相手が後退側(負周波数)に来る速度で後退曲げモードが共振（「2Ω」は剛性脈動、後退励起はその (2Ω−ω) 側）。',
    refs: [{ label: 'Han & Chu 2013', url: 'https://link.springer.com/article/10.1007/s11071-013-0835-6' }],
  },
  {
    no: '7',
    name: '横き裂ロータ（breathing crack）',
    mechanism:
      '開閉き裂の剛性周期変動（asymmetric shaft等価）が前進臨界通過直後に後退ホワール帯（post-resonance BW, Po-BW）を励起。軸受異方性・き裂進展に高感度で亀裂診断指標。',
    freq: '過渡(始動/減速)のPo-BW（低加速時≈1X近傍）',
    sync: '過渡',
    syncNote: 'パラメトリック',
    strength: '中〜大（進展で増）',
    likelihood: '故障時（亀裂あれば）',
    sm: 'out',
    smNote: '故障・パラメトリックでSM枠外。',
    evalBy: 'フルスペクトル(FSA)・パラメトリック安定性',
    conf: '確立',
    tc: 'yes',
    refs: [
      { label: 'Al-Shudeifat 2019 JSV', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0022460X18308022' },
      { label: 'Alzarooni 2022 Sci.Rep.', url: 'https://www.nature.com/articles/s41598-022-12068-w' },
    ],
  },
  {
    no: '8',
    name: 'ミスアライメント／自在継手',
    mechanism:
      'カップリング／継手の角度依存剛性変動が 2× を生み、torsional-lateral連成で FW/BW の 1X・2X 成分を励起。',
    freq: '2Ω（1X, 3X）',
    sync: '同期',
    syncNote: '2×・準パラメトリック',
    strength: '中',
    likelihood: '中（据付・カップリング）',
    sm: 'out',
    smNote: '2×・1×SM主対象外。',
    evalBy: 'フルスペクトル（δ1, δ2 指標）',
    conf: '確立',
    tc: 'small',
    tcNote: '単軸で継手無→軸受ミスアライメントのみ。',
    refs: [
      { label: 'Patel-Zuo-Darpe 2011', url: 'https://journals.sagepub.com/doi/10.1243/09544062JMES2432' },
      { label: 'U-joint JSV 1998', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0022460X98919861' },
    ],
  },
  {
    no: '9',
    name: '電動機 UMP（不平衡磁気吸引力）',
    mechanism:
      '偏心由来の電磁力が負の半径方向剛性として働き固有振動数を下げ、前進・後退両ホワール＋2×電源周波数＋スロット側帯を励起。モータ一体型のみ該当。',
    freq: '2×電源周波数, 偏心同期成分, スロット側帯',
    sync: '混在',
    syncNote: '動的偏心=同期 / 電源=非同期',
    strength: '中',
    likelihood: 'モータ一体型TC／燃料電池コンプで中',
    sm: 'out',
    smNote: '電磁・非回転数同期を含みSM枠外。',
    evalBy: '電磁-構造連成の強制応答',
    conf: '確立',
    tc: 'yes',
    tcNote: 'モータ一体で有効化。ロータ偏心・磁気的偏心の管理がBWに効く。',
    refs: [
      { label: 'Holopainen 2002' },
      { label: 'Xiang 2016 JSV', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0022460X16001371' },
      { label: 'Guo-Chu 2002 JSV', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0022460X0194088X' },
      { label: 'Li 2021 JSV', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0022460X20307215' },
    ],
  },
  {
    no: '10',
    name: '静翼／ノズル通過（N×Ω, RSI）',
    mechanism:
      '静止系に固定された空間周期力（ロータ-ステータ相互作用）。Tyler-Sofrin 則 m=nB±kV で、空間エイリアシングの折返しが負側のとき後退進行波(BTW)モードを励起。',
    freq: 'N_vane×Ω（BPF）と高調波',
    sync: '同期',
    syncNote: '高次',
    strength: '中',
    likelihood: '中（タービンノズル・コンプ拡散翼）',
    sm: 'out',
    smNote: '高次・1×SM対象外→干渉/SAFE線図。',
    evalBy: '干渉線図／SAFE（Tyler-Sofrin）・強制応答',
    conf: '確立',
    tc: 'yes',
    refs: [
      { label: 'Tyler-Sofrin 1962 (SAE 620532)' },
      { label: 'Brown-Schmauch NASA J2X', url: 'https://ntrs.nasa.gov/citations/20120014487' },
    ],
  },
  {
    no: '11',
    name: 'ベース角運動／マニューバ',
    mechanism:
      '支持系の角運動(rolling/pitch)がジャイロ連成＋パラメトリック励振を誘発し、特に rolling base で BW を選択的に励起。',
    freq: 'ベース運動周波数 ± Ω',
    sync: '非同期',
    syncNote: '外部',
    strength: '中（車両/航空マニューバ）',
    likelihood: '車載TCで中',
    sm: 'out',
    smNote: '行2の拡張でSM枠外。',
    evalBy: '干渉線図 ＋ ベース励振強制応答',
    conf: '確立',
    tc: 'yes',
    refs: [{ label: 'base-excited / geared rotor base motion' }],
  },
]

// 単軸TCに通常該当しない（記録のみ）
export const BW_EXCLUDED =
  '逆回転二重ロータの不釣合い起因BW、SFD非線形の発散BW（ガス軸受TCにSFD無）、横-ねじり連成の組合せ共振は単軸TCに通常非該当（記録のみ）。'

// ---- SM（離調）判定の決定木 ----
export const SM_DECISION: {
  q: string
  branches: { cond: string; verdict: string; cls: SMClass; example: string }[]
} = {
  q: 'そのBW励振は「速度同期（回転数の整数倍）」か？',
  branches: [
    {
      cond: '同期 1×（軸受異方性由来）',
      verdict: '異方性込み同期不釣合い応答でBW枝がAF≥2.5で現れるかを確認。現れれば forward 同様にSM確保、現れなければ離調不要。',
      cls: 'cond',
      example: '行1（軸受／支持の異方性）',
    },
    {
      cond: '同期だが高次・分数次・2×',
      verdict: '1×不釣合い応答のSM主対象ではない。フルスペクトル／干渉線図で別評価。',
      cls: 'out',
      example: '行3a・6・8・10',
    },
    {
      cond: '非同期（外部・自励）',
      verdict: '速度軸ベースのSMでは捕捉不可。干渉線図（外部）または log decrement（自励）で評価。',
      cls: 'out',
      example: '行2・3b・5・11',
    },
    {
      cond: '過渡・故障・電磁',
      verdict: 'SMの枠組みの外。パラメトリック安定性・電磁-構造連成の強制応答で扱う。',
      cls: 'out',
      example: '行7・9',
    },
  ],
}

export const SM_CONCLUSION =
  'BWモードの離調（SM）は原則不要。例外は行1（軸受異方性・1×）のみで、これも「ルール決め打ち」でなく異方性込み不釣合い応答のAFで判定する。残りは離調でなく安定性解析（log decrement）と干渉線図で押さえる。'

// ---- 規格・文献での扱い（世界調査 2026-06-24） ----
export const STANDARDS_SURVEY: { text: string; refs: Ref[] }[] = [
  {
    text: 'BWモードの離調(SM)を規定・要求する規格は世界に存在しない（全主要規格を一次本文で確認）。API 617 §6.8.4.14／API 612 §6.8.4.10 は安定性解析を逐語で "first forward damped mode"（前進限定）と明示。',
    refs: [{ label: 'API617-9th 2022' }, { label: 'API-TR684-1 2019' }],
  },
  {
    text: 'ISO 14839-3（AMB）は離調枠組みを持たず感度関数(SNTF)のゾーン分けで安定性評価。電動機・発電機規格(NEMA MG1/IEC 60034-14/IEEE)は危険速度離調を規定せず実測振動限界のみ。',
    refs: [{ label: 'ISO14839-3 2006' }],
  },
  {
    text: '本テーマを正面から論じた代表文献は Greenhill & Cornejo (ASME 1995) 唯一。直接剛性非対称があると不釣合いが backward モード共振を励起しうるが、減衰で overdamp され危険速度が消える。離調"規則"は提示せず、提言は「直接剛性非対称を避けよ」。',
    refs: [{ label: 'Greenhill & Cornejo 1995', url: 'http://dynatechengr.com/Backward%20Mode%20Paper.pdf' }],
  },
  {
    text: '標準実務の根拠: "Usually only the forward eigenvalue is important … critical speeds at least 15% away"（Gunter）。世界的コンセンサスは「直接剛性非対称を避ける＋減衰で overdamp」。',
    refs: [{ label: 'Gunter, Intro to Rotordynamics' }],
  },
]

// ---- 本TC構成での当てはめ（要約） ----
export const TC_NOTES: string[] = [
  '自励BWはほぼ消える：軸流Alford(行5)は非該当、遠心空力(行5\')・ガス軸受ハーフホワールはいずれも forward。残る自励BWは dry whip（接触起因, 行3b）のみ。',
  '代わりに UMP（行9）が前面に：高速PMモータの偏心UMP（負剛性）が前進・後退両ホワール＋2×電源周波数を励起。ロータ偏心・磁気的偏心の管理がBWに効く。',
  '強制／パラメトリック系BW＝外部加振(行2)・ベーン/ノズル通過(行10)・き裂Po-BW(行7)・ベース角運動(行11)。いずれも非同期/高次/故障でSM枠外。',
  '離調(SM)結論は不変：SMの土俵に乗るBW源は行1（軸受異方性・1×）のみ。',
]
