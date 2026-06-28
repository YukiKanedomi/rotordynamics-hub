// ローターダイナミクス技術ロードマップのデータモデル（source of truth）。
// 元データ: experts/rotordynamics/knowledge/topics/roadmap-rotating-machinery.md（2026-06-28）

export type Confidence = '確立' | '推定' | '仮説'
export type Horizon = '〜2030' | '〜2035' | '2035〜'

export const HORIZONS: Horizon[] = ['〜2030', '〜2035', '2035〜']
export const isDotted = (h: Horizon) => h === '2035〜' // 点線＝長期シナリオ

export interface Milestone {
  id: string
  title: string
  horizon: Horizon
  confidence: Confidence
  rd: string[] // 横断RD課題クラスタ key
  detail: string
  sources?: string[] // sources の key
  topics?: string[] // 既存ナレッジ topic slug
}

export interface Driver {
  id: string
  name: string
  short: string
  trends: { text: string; confidence: Confidence; source?: string }[]
  demandShift: string
  milestones: Milestone[]
}

export interface Vector {
  id: string
  name: string
  detail: string
  drivers: string[] // 効くドライバ id
}

export interface RDCluster {
  key: string
  name: string
  cause: string
  detail: string
  topics: string[]
}

export interface SourceRef {
  key: string
  title: string
  url: string
  primary: boolean // true=一次/確度高, false=二次/要裏取り
}

export interface TopicLink {
  slug: string
  name: string
  summary: string
}

// ───────────────────────── ドライバ（5本柱） ─────────────────────────
export const DRIVERS: Driver[] = [
  {
    id: 'D1',
    name: '電動化・産業脱炭素',
    short: 'EV/e-axle・ヒートポンプ・産業電化',
    trends: [
      { text: 'e-axle 入力 14–20k rpm → 2035年 25k、30k rpm 級が試作段階（NEVロードマップ2.0）。DOE 2025 は 50 kW/L 目標', confidence: '確立', source: 'MDPI-EVS-13-4-65' },
      { text: 'ヒートポンプ世界ストック 180M台(2020)→約600M台(2030, IEA-NZE)、暖房需要の20%超', confidence: '確立', source: 'IEA-FutureHeatPumps-2022' },
      { text: 'BASF/SABIC/Linde が世界初の6MW電気スチームクラッカー実証、商用化~2027', confidence: '確立', source: 'BASF-eCracker-2024' },
    ],
    demandShift: '油フリー高速ターボ機械（FC/HP/チラー用）、モータ一体型コンプレッサ・ブロワ、e-axle 高速ギア＋軸受統合。軸受は玉→磁気／ガス・フォイルへ。',
    milestones: [
      { id: 'D1-1', title: 'e-axle ギア連成NVH・高速軸受寿命設計', horizon: '〜2030', confidence: '確立', rd: ['bearing', 'torsional'], detail: '燃焼騒音が消えた結果ギアの伝達誤差(TE)・電磁騒音・軸受騒音が顕在化。時変メッシュ剛性×軸受非線形×電磁力が構造伝達経路で相互作用。14–20k rpm 軸受の寿命設計。', sources: ['SAE-MobilityEng-eAxle'] },
      { id: 'D1-2', title: 'HP/チラー用 磁気軸受遠心圧縮機の設計法確立', horizon: '〜2030', confidence: '確立', rd: ['bearing', 'stability'], detail: '無給油磁気軸受で省エネ30–50%。AMB制御ロバスト化と部分負荷運転点でのロータダイナミクス。', sources: ['IEA-FutureHeatPumps-2022'] },
      { id: 'D1-3', title: 'モータ一体ロータの電磁連成解析の標準化', horizon: '〜2035', confidence: '確立', rd: ['emag'], detail: '不平衡磁気吸引力(UMP)が負の半径方向剛性として危険速度を低下、静偏心で0次および2×電源周波数成分を加振。複素固有値・不釣合い応答に織り込む。', sources: ['IEEE-UMP-9270865'], topics: ['separation-margin'] },
      { id: 'D1-4', title: 'インバータ駆動ねじり振動の評価定着', horizon: '〜2035', confidence: '確立', rd: ['torsional'], detail: 'VFD/PWM が電気周波数の基本波・6次・12次でねじり加振。第1ねじり固有値超えで連続反転トルク→破損例。固有値との分離余裕10%以上推奨。' },
      { id: 'D1-5', title: '軸受選定マップ（玉↔磁気↔ガス）整備', horizon: '〜2035', confidence: '推定', rd: ['bearing'], detail: '高速化で玉軸受は発熱・潤滑が限界。速度・出力密度・油フリー要件で磁気/ガス・フォイルへ移行する選定指針。' },
      { id: 'D1-6', title: 'e-axle 25–30k rpm 量産化の軸受移行閾値設計', horizon: '2035〜', confidence: '推定', rd: ['bearing'], detail: '転がり軸受のDN値限界を超え、ハイブリッド/エア軸受への移行閾値（寿命・損失・コスト）を定量化。' },
      { id: 'D1-7', title: '50 kW/L 級モータの熱-構造-ロータ連成最適化', horizon: '2035〜', confidence: '推定', rd: ['emag', 'critspeed'], detail: '高出力密度で軸細径化＋発熱増。熱膨張による危険速度シフトを含む統合最適化。' },
    ],
  },
  {
    id: 'D2',
    name: 'エネルギー転換',
    short: '水素・アンモニア・e-fuel・CCUS',
    trends: [
      { text: 'IEA: 2030年までに稼働確度の高い低排出水素 4 Mtpa 超(FID済)、計画電解装置の過半は稼働目標年を超過(slip)', confidence: '確立', source: 'IEA-GHR-2025' },
      { text: '日本のアンモニア燃料: 2030年 300万t → 2050年 3,000万t、電力1%(2030)→10%(2050)。GE×IHI が F級GTで100%専焼を2030年商用化', confidence: '確立', source: 'GEV-IHI-NH3-2025' },
      { text: '主要4OEMが全機種で最低30%水素混焼、100%水素は2028–2035ロードマップ', confidence: '確立', source: 'GreenGasTurbines-OEM-2026' },
    ],
    demandShift: '水素遠心圧縮機（低分子量ゆえ多段・高周速・長スパン→インテグラルギア型が有力）、CO2/超臨界CO2圧縮機（高密度ゆえ6–10段・サブシンクロナス顕在化）、水素・アンモニアGT、膨張機。',
    milestones: [
      { id: 'D2-1', title: '水素遠心圧縮機の危険速度/SM設計（軸分割）', horizon: '〜2030', confidence: '確立', rd: ['critspeed', 'seal'], detail: '水素は分子量極小・音速高く段あたり圧力上昇が小さい→多段・長スパン化で危険速度が低下。インテグラルギアで軸を分割し各軸短スパン化。', sources: ['IEA-GHR-2025'], topics: ['separation-margin', 'clearance-excitation-thomas-alford'] },
      { id: 'D2-2', title: 'CO2圧縮機(CCUS,6–10段)の超臨界共振回避＋安定性基準', horizon: '〜2035', confidence: '確立', rd: ['stability', 'seal'], detail: '高密度ゆえインペラ固有振動数が低下→共振リスク増、段あたりヘッド制限で6–10段、サブシンクロナス増大。スワールブレーキ／ダンパシールで対策。', sources: ['GPPS-CO2IGC', 'ASME-SwirlBrake-2023'], topics: ['clearance-excitation-thomas-alford', 'rotor-stator-rub'] },
      { id: 'D2-3', title: '水素ドライガスシール・低MW励振の動特性DB', horizon: '〜2035', confidence: '推定', rd: ['seal'], detail: '低分子量ガスでのシール起因クロスカップル係数の実測データベース化。水素経済向けドライガスシール再設計。', topics: ['clearance-excitation-thomas-alford'] },
      { id: 'D2-4', title: 'NH3・H2 100%GTの燃焼変更に伴う軸系影響評価', horizon: '〜2035', confidence: '確立', rd: ['torsional', 'critspeed'], detail: '燃料多様化に伴う横振動・ねじり振動への影響評価。', sources: ['GEV-IHI-NH3-2025'] },
      { id: 'D2-5', title: 'sCO2発電商用機の高密度ロータダイナミクス対応', horizon: '2035〜', confidence: '仮説', rd: ['stability', 'bearing'], detail: '5,000–10,000 psi 超でガス密度が水に近づく。ダンパシール単独で不足する領域への支持/ダンパ新方式。', sources: ['TAMU-sCO2-Tutorial'] },
      { id: 'D2-6', title: '不確かさ織り込みの確率論的安定性設計・DT', horizon: '2035〜', confidence: '推定', rd: ['stability', 'digital'], detail: '高密度ガス×ロータ非線形運動の不確かさを織り込んだ確率論的安定性設計／デジタルツイン。' },
      { id: 'D2-7', title: '膨張機(エキスパンダ)のRD体系化', horizon: '2035〜', confidence: '仮説', rd: ['critspeed'], detail: '水素液化・CO2液化/輸送・sCO2サイクルの膨張機固有のロータダイナミクスは現状文献空白。' },
    ],
  },
  {
    id: 'D3',
    name: 'データセンター/AI',
    short: '電力・冷却需要の爆発',
    trends: [
      { text: 'DC電力需要 2024年 415 TWh → 2030年 約945 TWh（世界電力の~1.5%→~3%）。AI特化サーバが増分のほぼ半分', confidence: '確立', source: 'IEA-EnergyAI-2025' },
      { text: 'behind-the-meter／オンサイト発電が2025年以降主流化、82 GW規模がannounce。短納期ガスタービン採用拡大', confidence: '確立', source: 'Cleanview-BTM-2025' },
      { text: 'DC液冷市場は2030年に約150–190億ドル、CAGR 20–26%（調査会社で幅大＝要裏取り）', confidence: '推定', source: 'RnM-DCLiquid-2025' },
    ],
    demandShift: '大容量チラー用 油フリー磁気軸受遠心圧縮機（Danfoss Turbocor等が標準化）、DC電源用エアロデリバティブGT＋発電機（高速起動・系統追従）、低GWP冷媒対応の大型・低回転インペラ、廃熱回収sCO2/ORC（長期）。SOFCが発電機需要を一部代替する不確実変数。',
    milestones: [
      { id: 'D3-1', title: '油フリー磁気軸受ターボチラーの大容量化・TDB設計基準', horizon: '〜2030', confidence: '確立', rd: ['bearing', 'stability'], detail: 'AMBロバスト制御、ロータドロップ時のタッチダウン軸受(TDB)摩耗・寿命、設計基準(ISO 14839-5)整備。', sources: ['ISO14839-5-2022'], topics: ['rotor-stator-rub', 'standards-landscape'] },
      { id: 'D3-2', title: '低GWP冷媒(R1234ze等)転換の危険速度再配置', horizon: '〜2035', confidence: '推定', rd: ['critspeed', 'seal'], detail: '低GWP冷媒転換で圧縮機が大型・低回転化（同回転でR134a置換すると部分負荷COP約7%低下）。危険速度配置・シール動特性・励起力が変化。' },
      { id: 'D3-3', title: 'DC電源用エアロデリバティブGT＋発電機の高速起動・系統追従', horizon: '〜2035', confidence: '確立', rd: ['torsional', 'stability'], detail: 'フリーパワータービン構成・急速起動・系統追従。ねじり振動・短絡トルク・SSR（subsynchronous resonance）対策、頻繁起動停止の疲労。', sources: ['Cleanview-BTM-2025'] },
      { id: 'D3-4', title: 'sCO2/ORC廃熱回収の実用化', horizon: '2035〜', confidence: '仮説', rd: ['stability', 'bearing'], detail: '臨界点近傍の実在気体効果下での圧縮機ロータダイナミクス・軸受/シール動特性。DCのGPU廃熱は低温でtrans-critical ORCが優位との比較も。' },
      { id: 'D3-5', title: 'センサレス自己診断AMBの標準化', horizon: '2035〜', confidence: '推定', rd: ['bearing', 'digital'], detail: 'AMB内蔵センサ・電流情報によるモデルベースのタッチダウン予知・自己診断。' },
      { id: 'D3-6', title: '燃料電池台頭による発電機需要侵食シナリオの管理', horizon: '2035〜', confidence: '推定', rd: ['digital'], detail: 'SOFC（Bloom等）がDC主電源として急拡大すると回転機(GT/発電機)需要を一部代替。市場リスク項目。' },
    ],
  },
  {
    id: 'D4',
    name: '航空・モビリティ',
    short: 'eVTOL・電動推進・FC・舶用',
    trends: [
      { text: 'FC用エアコンプレッサは非接触エアフォイル軸受で最大10万rpm級、先進設計は15万rpm超、オイルフリー9kg以下。IHIが2023年に従来比3.5倍出力の100kW級を発表', confidence: '確立', source: 'IHI-eTurboComp-2023' },
      { text: 'NASA 電動推進モータ最低目標 12 kW/kg（市販約2 kW/kg）、UIUC機で15 kW/kg・効率96%超。GEがMW級ハイブリッド推進を45,000ft模擬試験', confidence: '確立', source: 'NASA-EAP-NTRS' },
      { text: '舶用は IMO 2050脱炭素で e-アンモニア／メタノールが2030年頃から急拡大', confidence: '確立', source: 'GMF-DNV-Fuels' },
    ],
    demandShift: '超高速・軽量・高出力密度・オイルフリーが共通ベクトル。FCエアコンプレッサ、電動推進ファン/モータ、航空用ギアボックス、ターボジェネレータ。',
    milestones: [
      { id: 'D4-1', title: 'FCエアコンプレッサ(10–15万rpm)のサブシンクロナス渦動抑制', horizon: '〜2030', confidence: '確立', rd: ['stability', 'bearing'], detail: 'ガス/エアフォイル軸受ロータは起動停止の大振幅・高速時のサブシンクロナス渦動（10–17krpmで渦動比1/2等）。マルチパッド・プリロード設計で抑制。', sources: ['Xu-IMechE-FoilRotor-2024'], topics: ['rotor-stator-rub'] },
      { id: 'D4-2', title: '高出力密度HSPMM(~15kW/kg)の曲げ危険速度・超臨界通過＋能動制御', horizon: '〜2035', confidence: '確立', rd: ['critspeed', 'emag'], detail: '出力密度を上げると軸が細くなり曲げ危険速度に到達→超臨界運転＋制限回転域・能動制御を要する。', sources: ['NASA-EAP-NTRS'] },
      { id: 'D4-3', title: 'ガスフォイル軸受ロータのFSI＋伝達マトリクス検証フロー', horizon: '〜2035', confidence: '確立', rd: ['stability', 'bearing'], detail: 'Riccati伝達マトリクス法・流体構造連成(FSI)で安定性・固有振動数・Campbell線図・不釣合い応答を解析する設計検証フロー確立。', sources: ['Xu-IMechE-FoilRotor-2024'] },
      { id: 'D4-4', title: '航空機動ジャイロ連成の危険速度マップ', horizon: '〜2035', confidence: '確立', rd: ['fwbw', 'critspeed'], detail: 'yaw/pitch/roll機動で回転体にジャイロモーメント→前進/後退モードの危険速度が分離。機体機動との相互作用を航空安全要件として織り込む。', topics: ['forward-backward-whirl'] },
      { id: 'D4-5', title: 'MW級ハイブリッド推進ターボジェネレータのRD・ねじり評価', horizon: '〜2035', confidence: '確立', rd: ['torsional', 'critspeed'], detail: 'GE/NASA系のMW級・多kVハイブリッド推進系のロータダイナミクス・ねじり振動評価。', sources: ['GE-NASA-Hybrid-2022'] },
      { id: 'D4-6', title: '舶用NH3/メタノール対応の高速ターボ機械', horizon: '〜2035', confidence: '推定', rd: ['critspeed'], detail: '2030年頃から急拡大する舶用脱炭素燃料に備えた高速ロータ設計対応。', sources: ['GMF-DNV-Fuels'] },
      { id: 'D4-7', title: '200席級FC推進・空調統合100kW超コンプレッサの量産信頼性', horizon: '2035〜', confidence: '仮説', rd: ['bearing', 'critspeed'], detail: '大型旅客機のFC推進・空調統合に向けた100kW超エアコンプレッサ量産ロータの信頼性実証。' },
      { id: 'D4-8', title: 'GT発電機を置換するFC＋電動ターボの航空認証級規格', horizon: '2035〜', confidence: '仮説', rd: ['critspeed', 'digital'], detail: '航空認証レベルの振動・騒音・寿命規格の整備。' },
      { id: 'D4-9', title: '12 kW/kg超 次世代電動機ロータの熱-構造-振動連成', horizon: '2035〜', confidence: '推定', rd: ['emag', 'critspeed'], detail: 'NASA目標を超える出力密度のための熱-構造-振動連成設計。' },
    ],
  },
  {
    id: 'D5',
    name: 'デジタル化・油フリー化・規格',
    short: '技術側ドライバ（全ドライバ横断）',
    trends: [
      { text: 'ロータ系の不確かさ定量化(UQ)が2023年に体系化（PCE/Kriging/Monte Carlo/区間/Bayesian）。危険速度の確率論的評価が実装段階', confidence: '確立', source: 'Fu-MSSP-UQreview-2023' },
      { text: 'デジタルツインの中核はサロゲート＋PINN。ただしロータダイナミクス専用のリアルタイムDTはまだ事例希薄', confidence: '推定', source: 'TGM-AIEng-2026' },
      { text: '油フリー磁気軸受市場でAMBが最大セグメント。圧電駆動可動SFD等の能動制御が2024に活発。CFRP/鋼ハイブリッド軸が高速化を後押し', confidence: '確立', source: 'JSV-PiezoSFD-2024' },
    ],
    demandShift: 'UQ/サロゲート/PINN/デジタルツイン、AI状態監視・予知保全、能動/セミアクティブ振動制御、CFRP・AMロータ、規格整備が全ドライバを下支え。',
    milestones: [
      { id: 'D5-1', title: 'PCE/Kriging サロゲート＋Monte Carlo のUQをロバスト危険速度設計に実装', horizon: '〜2030', confidence: '確立', rd: ['critspeed', 'digital'], detail: '軸受減衰・クリアランス・不釣合いを確率分布化→危険速度/振幅/安定性の分布を得て製造公差・運転限界設定に適用。', sources: ['Fu-MSSP-UQreview-2023', 'Sensors-CritSpeedProb-2024'] },
      { id: 'D5-2', title: 'AI状態監視＋RUL予測のCM/PHM標準化', horizon: '〜2030', confidence: '確立', rd: ['digital'], detail: '正常時シグネチャ学習＋逸脱検知、RUL推定。ISO 13373系をベースにAI診断ガイドライン化。' },
      { id: 'D5-3', title: 'PINN/物理組込MLによる軸受・シール動特性係数推定', horizon: '〜2035', confidence: '推定', rd: ['digital', 'seal'], detail: '物理知識（軸受動力学・故障機構）を data-driven モデルに組込み、ロバスト性・汎化を高める。', sources: ['TGM-AIEng-2026'] },
      { id: 'D5-4', title: '圧電可動SFD等のセミアクティブ制御の実機適用', horizon: '〜2035', confidence: '確立', rd: ['stability', 'bearing'], detail: '圧電(PZT)駆動で油膜ギャップを能動可変し、危険速度通過時の突発不釣合い振動を抑制。', sources: ['JSV-PiezoSFD-2024'] },
      { id: 'D5-5', title: 'CFRP/鋼ハイブリッド軸・CFRPスリーブPMロータの高速化標準化', horizon: '〜2035', confidence: '確立', rd: ['critspeed'], detail: 'CFRPスリーブは鋼の約10倍の比強度で薄肉化・エアギャップ縮小・高回転化を可能に。熱変位低減・軽量化。', sources: ['JMP-CFRPshaft-2024'] },
      { id: 'D5-6', title: 'API 617/684・ISO 20816/14839/21940 の継続改訂', horizon: '〜2035', confidence: '確立', rd: ['bearing', 'stability'], detail: 'API 617 8th でAMB Annex追加、ISO 14839-5(タッチダウン軸受)2022、ISO 20816への統合進展。', sources: ['Swanson-Masala-API617-AMB', 'ISO14839-5-2022'], topics: ['standards-landscape'] },
      { id: 'D5-7', title: '流体-構造-熱-電磁フル連成＋オンラインUQのリアルタイムDT', horizon: '2035〜', confidence: '仮説', rd: ['digital', 'emag'], detail: '高忠実度マルチフィジックスを設計ループ内オンラインUQとともにリアルタイムDTへ統合。' },
      { id: 'D5-8', title: 'ガス/エアフォイル軸受機向けの新規API/ISO規格整備', horizon: '2035〜', confidence: '推定', rd: ['bearing', 'stability'], detail: 'AMBはAPI617 Annex＋ISO14839で枠組みがあるが、フォイル/ガス軸受の受入・適格性は規格ギャップが残る。', topics: ['standards-landscape'] },
      { id: 'D5-9', title: 'AMロータ量産適用とRD設計法／AI診断・DTの規格化', horizon: '2035〜', confidence: '推定', rd: ['critspeed', 'digital'], detail: '付加製造(AM)ロータ（内部冷却流路・一体造形）の量産適用とロータダイナミクス設計法整備、AI診断・DTの規格化。' },
    ],
  },
]

// ───────────────────────── 共通ベクトル（縦糸） ─────────────────────────
export const VECTORS: Vector[] = [
  { id: 'V1', name: '油フリー化', detail: '磁気軸受(AMB)・ガス/フォイル軸受への移行。潤滑油の汚染・損失・保守を排除。', drivers: ['D1', 'D3', 'D4'] },
  { id: 'V2', name: '超高速・高出力密度化', detail: '軸細径化→曲げ危険速度に到達→超臨界(supercritical)運転が標準に。', drivers: ['D1', 'D4'] },
  { id: 'V3', name: 'モータ一体化', detail: '高速PMモータ直結→電磁連成（UMP・偏心・2×電源周波数）、インバータ駆動ねじり。', drivers: ['D1', 'D3', 'D4'] },
  { id: 'V4', name: '作動流体の極端化', detail: '低分子量(H2)＝多段・長スパン化／高密度(sCO2)＝サブシンクロナス・インペラ共振。', drivers: ['D2', 'D3'] },
  { id: 'V5', name: 'デジタル化', detail: 'UQ/サロゲート/PINN/デジタルツイン、AI状態監視・予知保全。', drivers: ['D5'] },
]

// ───────────────────────── 横断RD課題クラスタ ─────────────────────────
export const RD_CLUSTERS: RDCluster[] = [
  { key: 'critspeed', name: '危険速度通過・分離余裕', cause: 'V2 超高速', detail: '超臨界運転の起動/停止過渡、SM確保、たわみロータ。', topics: ['separation-margin'] },
  { key: 'stability', name: '安定性（自励・サブシンクロナス）', cause: 'V1,V4', detail: 'ガス膜/フォイル不安定、シール旋回流クロスカップル、log dec、ダンパシール/スワールブレーキ。', topics: ['rotor-stator-rub', 'clearance-excitation-thomas-alford', 'forward-backward-whirl'] },
  { key: 'emag', name: 'モータ電磁連成', cause: 'V3', detail: 'UMP（負の半径方向剛性・危険速度低下・2×電源周波数）、偏心。', topics: ['separation-margin'] },
  { key: 'torsional', name: 'ねじり振動', cause: 'V3 インバータ', detail: 'VFD/PWM の6次・12次励振、トルクリプル、トレインねじり分離余裕。', topics: [] },
  { key: 'bearing', name: '軸受選定・タッチダウン', cause: 'V1', detail: '玉/磁気/ガスの選定マップ、AMBロータドロップ・TDB摩耗寿命。', topics: ['rotor-stator-rub', 'standards-landscape'] },
  { key: 'seal', name: 'シール/隙間励振', cause: 'V4', detail: 'H2低MW＝励振小だが長スパン、sCO2高密度＝強クロスカップル、Thomas/Alford。', topics: ['clearance-excitation-thomas-alford'] },
  { key: 'fwbw', name: '前進/後退・ジャイロ', cause: 'V2,V4', detail: '航空機動のジャイロモーメント、後退モード、危険速度マップ分裂。', topics: ['forward-backward-whirl'] },
  { key: 'digital', name: 'デジタル化（UQ/DT/AI）', cause: 'V5', detail: 'UQ・サロゲート・PINN・デジタルツイン、AI状態監視・予知保全。', topics: [] },
]

// ───────────────────────── 既存ナレッジ topic ─────────────────────────
export const TOPICS: TopicLink[] = [
  { slug: 'separation-margin', name: '危険速度分離余裕（離調率）', summary: 'SMはAFベース・1×同期が主対象。BWモードはSM非要求。' },
  { slug: 'rotor-stator-rub', name: 'ラビング（ロータ-ステータ接触）', summary: 'dry whipはAMB-TDBで確立、ガス軸受直接事例は希薄。' },
  { slug: 'clearance-excitation-thomas-alford', name: '隙間励振（Thomas/Alford力）', summary: 'βの符号で向き決定。遠心forward、軸流backward。' },
  { slug: 'forward-backward-whirl', name: 'フォワード／バックワードホワール', summary: 'ジャイロによる前進/後退分裂、後退励振源の分類。' },
  { slug: 'standards-landscape', name: '主要規格の地勢', summary: 'API617 AMB Annex・ISO14839-5、ガス軸受機の規格不在。' },
]

// ───────────────────────── 出典 ─────────────────────────
export const SOURCES: SourceRef[] = [
  { key: 'IEA-EnergyAI-2025', title: 'IEA — Energy and AI (DC電力 415→945 TWh, 2030)', url: 'https://www.iea.org/reports/energy-and-ai/executive-summary', primary: true },
  { key: 'IEA-FutureHeatPumps-2022', title: 'IEA — The Future of Heat Pumps (180M→600M台, 2030)', url: 'https://www.iea.org/reports/the-future-of-heat-pumps', primary: true },
  { key: 'IEA-GHR-2025', title: 'IEA — Global Hydrogen Review 2025 (4 Mtpa+, slip)', url: 'https://www.iea.org/reports/global-hydrogen-review-2025', primary: true },
  { key: 'GEV-IHI-NH3-2025', title: 'GE Vernova × IHI — 100% ammonia combustion milestone', url: 'https://www.gevernova.com/news/press-releases/ihi-ge-vernova-achieve-milestone-100-ammonia', primary: true },
  { key: 'GreenGasTurbines-OEM-2026', title: 'Hydrogen-Ready Gas Turbines OEM Comparison 2026', url: 'https://www.greengasturbines.com/blog/hydrogen-ready-gas-turbines-oem-comparison', primary: true },
  { key: 'IHI-eTurboComp-2023', title: "IHI — World's lightest electric turbo compressor (100kW, air bearing)", url: 'https://www.ihi.co.jp/en/all_news/2023/technology/1199839_3531.html', primary: true },
  { key: 'NASA-EAP-NTRS', title: 'NASA — Overview of Electrified Aircraft Propulsion (12 kW/kg)', url: 'https://ntrs.nasa.gov/api/citations/20170006235/downloads/20170006235.pdf', primary: true },
  { key: 'GE-NASA-Hybrid-2022', title: 'NASA/GE — MW-class hybrid-electric engine 45,000ft test', url: 'https://www.flyingmag.com/nasa-ge-test-hybrid-electric-engine/', primary: true },
  { key: 'BASF-eCracker-2024', title: "BASF/SABIC/Linde — world's first electric steam cracker (6MW)", url: 'https://www.basf.com/global/en/media/news-releases/2024/04/p-24-177', primary: true },
  { key: 'Cleanview-BTM-2025', title: 'Cleanview — Behind-the-Meter Data Centers (82GW)', url: 'https://cleanview.co/reports/behind-the-meter-data-centers', primary: true },
  { key: 'Fu-MSSP-UQreview-2023', title: 'Fu et al. — Uncertainty analysis of rotor systems (MSSP 2023)', url: 'https://ouci.dntb.gov.ua/en/works/9QO6zOm4/', primary: true },
  { key: 'Sensors-CritSpeedProb-2024', title: 'Probabilistic Analysis of Critical Speed (Sensors 2024)', url: 'https://www.mdpi.com/1424-8220/24/13/4349', primary: true },
  { key: 'JSV-PiezoSFD-2024', title: 'Piezoelectric driven split-pad squeeze film damper (JSV 2024)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0022460X24000944', primary: true },
  { key: 'JMP-CFRPshaft-2024', title: 'CFRP/steel hybrid rotating shaft (J. Manuf. Proc. 2024)', url: 'https://www.sciencedirect.com/science/article/pii/S1526612524003001', primary: true },
  { key: 'Xu-IMechE-FoilRotor-2024', title: 'Rotordynamics of high-speed air compressor w/ gas foil bearings (IMechE 2024)', url: 'https://journals.sagepub.com/doi/10.1177/09544062231222974', primary: true },
  { key: 'GPPS-CO2IGC', title: 'High-pressure CO2 integrally geared compressor (GPPS)', url: 'https://journal.gpps.global/Experimental-evaluation-of-performance-and-mechanical-reliability-for-high-pressure,124724,0,2.html', primary: true },
  { key: 'TAMU-sCO2-Tutorial', title: 'Turbomachinery for Super-Critical CO2 (TAMU tutorial)', url: 'https://oaktrust.library.tamu.edu/server/api/core/bitstreams/8be820c6-6221-4de8-8a90-5d079410b688/content', primary: true },
  { key: 'ASME-SwirlBrake-2023', title: 'Swirl Brake Design for Rotordynamic Stability (ASME 2023)', url: 'https://asmedigitalcollection.asme.org/openengineering/article/doi/10.1115/1.4062934/', primary: true },
  { key: 'Swanson-Masala-API617-AMB', title: 'New AMB Requirements in API 617 8th Edition (TAMU)', url: 'https://oaktrust.library.tamu.edu/handle/1969.1/162709', primary: true },
  { key: 'ISO14839-5-2022', title: 'ISO 14839-5:2022 — Touch-down bearings', url: 'https://www.iso.org/standard/70649.html', primary: true },
  { key: 'IEEE-UMP-9270865', title: 'UMP Analysis for Rotordynamics of Induction Motors (IEEE)', url: 'https://ieeexplore.ieee.org/document/9270865', primary: true },
  { key: 'SAE-MobilityEng-eAxle', title: 'E-Axles Speed Electrification (SAE Mobility Engineering)', url: 'https://www.mobilityengineeringtech.com/component/content/article/43637-sae-ma-02948', primary: true },
  { key: 'MDPI-EVS-13-4-65', title: 'Multi-Criteria Analysis of Electric Motors for EVs (MDPI EVS)', url: 'https://www.mdpi.com/2032-6653/13/4/65', primary: true },
  { key: 'GMF-DNV-Fuels', title: 'Zero-emission shipping fuels: methanol and ammonia (GMF/DNV)', url: 'https://globalmaritimeforum.org/news/zero-emission-shipping-fuels-methanol-and-ammonia/', primary: true },
  { key: 'TGM-AIEng-2026', title: 'AI in Engineering 2026: Simulation, Digital Twins & Surrogates (TGM)', url: 'https://www.tgm.solutions/en/top-technologies-in-engineering/ai-in-engineering-2026-how-simulation-digital-twins-surrogate-models-are-redefining-cae/', primary: false },
  { key: 'RnM-DCLiquid-2025', title: 'Data Center Liquid Cooling Market 2025-2030 (二次・要裏取り)', url: 'https://www.globenewswire.com/news-release/2025/06/26/3106063/28124/en/Data-Center-Liquid-Cooling-Market-Size-Share-Trends-Analysis-Report-with-Growth-Forecasts-2025-2030.html', primary: false },
]

export const SOURCE_MAP: Record<string, SourceRef> = Object.fromEntries(
  SOURCES.map((s) => [s.key, s]),
)
export const RD_MAP: Record<string, RDCluster> = Object.fromEntries(
  RD_CLUSTERS.map((c) => [c.key, c]),
)
export const TOPIC_MAP: Record<string, TopicLink> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
)
