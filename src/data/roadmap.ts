// ローターダイナミクス技術ロードマップのデータモデル（source of truth）。
// 元データ: experts/rotordynamics/knowledge/topics/roadmap-rotating-machinery.md（2026-07-02 再調査反映）

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
  sources?: string[] // 横断テーマを裏付ける権威出典
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
      { text: '米国は政策反転（OBBBA 2025: EV税額控除終了）。IEA WEO 2025が米EVを下方修正。ただし高速化トレンドは中国・欧州主導で不変', confidence: '確立', source: 'IEA-WEO-2025' },
      { text: '大型産業ヒートポンプが新実装先: MAN 33MW（油フリー磁気軸受HOFIM）、Siemens 8–70 MWth級', confidence: '確立', source: 'MAN-Helsinki-HP-2024' },
    ],
    demandShift: '油フリー高速ターボ機械（FC/HP/チラー用）、モータ一体型コンプレッサ・ブロワ、e-axle 高速ギア＋軸受統合。軸受は玉→磁気／ガス・フォイルへ。',
    milestones: [
      { id: 'D1-1', title: 'e-axle ギア連成NVH・高速軸受寿命設計', horizon: '〜2030', confidence: '確立', rd: ['bearing', 'torsional'], detail: '燃焼騒音が消えた結果ギアの伝達誤差(TE)・電磁騒音・軸受騒音が顕在化。時変メッシュ剛性×軸受非線形×電磁力が構造伝達経路で相互作用。14–20k rpm 軸受の寿命設計。', sources: ['SAE-MobilityEng-eAxle'] },
      { id: 'D1-2', title: 'HP/チラー用 磁気軸受遠心圧縮機の設計法確立', horizon: '〜2030', confidence: '確立', rd: ['bearing', 'stability'], detail: '無給油磁気軸受で省エネ30–50%。AMB制御ロバスト化と部分負荷運転点でのロータダイナミクス。', sources: ['IEA-FutureHeatPumps-2022'] },
      { id: 'D1-3', title: 'モータ一体ロータの電磁連成解析の標準化', horizon: '〜2035', confidence: '確立', rd: ['emag'], detail: '不平衡磁気吸引力(UMP)が負の半径方向剛性として危険速度を低下、静偏心で0次および2×電源周波数成分を加振。複素固有値・不釣合い応答に織り込む。', sources: ['IEEE-UMP-9270865', 'Holopainen-Sopanen-2005', 'HighSpeedPM-Machines-2022'], topics: ['separation-margin'] },
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
      { text: '【2026-07下方修正】GHR 2025: 発表ベース2030年見通しが49→37 Mtpaへ史上初の下方修正。Fortescue等の大型中止、米45V短縮。FID済4 Mtpaは維持', confidence: '確立', source: 'IEA-GHR-2025-update' },
      { text: 'clean firm powerとして地熱も拡大: IEAは2050年最大800GW、Fervo Cape Station 100MWが2026-10送電開始予定', confidence: '確立', source: 'IEA-Geothermal-2024' },
      { text: '日本のアンモニア燃料: 2030年 300万t → 2050年 3,000万t、電力1%(2030)→10%(2050)。GE×IHI が F級GTで100%専焼を2030年商用化', confidence: '確立', source: 'GEV-IHI-NH3-2025' },
      { text: '主要4OEMが全機種で最低30%水素混焼、100%水素は2028–2035ロードマップ', confidence: '確立', source: 'GreenGasTurbines-OEM-2026' },
    ],
    demandShift: '水素遠心圧縮機（低分子量ゆえ多段・高周速・長スパン→インテグラルギア型が有力）、CO2/超臨界CO2圧縮機（高密度ゆえ6–10段・サブシンクロナス顕在化）、水素・アンモニアGT、膨張機。',
    milestones: [
      { id: 'D2-1', title: '水素遠心圧縮機の危険速度/SM設計（軸分割）', horizon: '〜2030', confidence: '確立', rd: ['critspeed', 'seal'], detail: '水素は分子量極小・音速高く段あたり圧力上昇が小さい→多段・長スパン化で危険速度が低下。インテグラルギアで軸を分割し各軸短スパン化。【2026-07】本格需要の立ち上がりはGHR 2025下方修正・slip連動で2030–2035へ後ろ倒しが現実線。', sources: ['IEA-GHR-2025', 'IEA-GHR-2025-update'], topics: ['separation-margin', 'clearance-excitation-thomas-alford'] },
      { id: 'D2-2', title: 'CO2圧縮機(CCUS,6–10段)の超臨界共振回避＋安定性基準', horizon: '〜2035', confidence: '確立', rd: ['stability', 'seal'], detail: '高密度ゆえインペラ固有振動数が低下→共振リスク増、段あたりヘッド制限で6–10段、サブシンクロナス増大。スワールブレーキ／ダンパシールで対策。実測ベンチマーク: 吐出20 MPaG・8段でlog dec 1.24→ISFDで1.33。', sources: ['GPPS-CO2IGC', 'Baba-2020-GPPS', 'ASME-SwirlBrake-2023'], topics: ['clearance-excitation-thomas-alford', 'rotor-stator-rub'] },
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
      { text: 'GE VernovaのGT受注残100 GW到達（2026-Q1）、重構造GTは2030–31年まで完売・リードタイム約3年。AI/DCが受注残の約20%', confidence: '確立', source: 'GEV-Backlog-2026' },
      { text: 'SMR×DC: Microsoft-TMI再稼働（Crane, 2027運開へ前倒し）、Google-Kairos Hermes2（2030）、Amazon-X-energy 5GW目標（2039）＋KHNP/Doosan量産提携', confidence: '確立', source: 'Constellation-Crane-2025' },
    ],
    demandShift: '大容量チラー用 油フリー磁気軸受遠心圧縮機（Danfoss Turbocor等が標準化）、DC電源用エアロデリバティブGT＋発電機（高速起動・系統追従）、SMR用中型蒸気タービン（標準化・量産）、低GWP冷媒対応の大型・低回転インペラ、廃熱回収sCO2/ORC（長期）。SOFCが発電機需要を一部代替する不確実変数。',
    milestones: [
      { id: 'D3-1', title: '油フリー磁気軸受ターボチラーの大容量化・TDB設計基準', horizon: '〜2030', confidence: '確立', rd: ['bearing', 'stability'], detail: 'AMBロバスト制御、ロータドロップ時のタッチダウン軸受(TDB)摩耗・寿命、設計基準(ISO 14839-5)整備。', sources: ['ISO14839-5-2022'], topics: ['rotor-stator-rub', 'standards-landscape'] },
      { id: 'D3-2', title: '低GWP冷媒(R1234ze等)転換の危険速度再配置', horizon: '〜2035', confidence: '推定', rd: ['critspeed', 'seal'], detail: '低GWP冷媒転換で圧縮機が大型・低回転化（同回転でR134a置換すると部分負荷COP約7%低下）。危険速度配置・シール動特性・励起力が変化。' },
      { id: 'D3-3', title: 'DC電源用エアロデリバティブGT＋発電機の高速起動・系統追従', horizon: '〜2035', confidence: '確立', rd: ['torsional', 'stability'], detail: 'フリーパワータービン構成・急速起動・系統追従。ねじり振動・短絡トルク・SSR（subsynchronous resonance）対策、頻繁起動停止の疲労。', sources: ['Cleanview-BTM-2025'] },
      { id: 'D3-4', title: 'sCO2/ORC廃熱回収の実用化', horizon: '2035〜', confidence: '仮説', rd: ['stability', 'bearing'], detail: '臨界点近傍の実在気体効果下での圧縮機ロータダイナミクス・軸受/シール動特性。DCのGPU廃熱は低温でtrans-critical ORCが優位との比較も。' },
      { id: 'D3-5', title: 'センサレス自己診断AMBの標準化', horizon: '2035〜', confidence: '推定', rd: ['bearing', 'digital'], detail: 'AMB内蔵センサ・電流情報によるモデルベースのタッチダウン予知・自己診断。' },
      { id: 'D3-7', title: 'AIデータセンター負荷急変→発電機ねじり疲労の評価', horizon: '〜2035', confidence: '確立', rd: ['torsional'], detail: 'AI学習サイクルで定格最大70%の電力急変が、同期発電機タービン軸のサブシンクロナス帯ねじり振動を励起。周波数偏差≤1.5 Hz制約とGoodman線図で疲労寿命を評価（preprint段階）。短絡過渡トルク・SSRも古典機構として連なる。', sources: ['AIDC-Torsional-2026', 'ASME-GT1996-ShortCircuitTorsion'] },
      { id: 'D3-8', title: 'SMR用中型蒸気タービンの標準化・量産＋再稼働機の経年ロータ再評価', horizon: '〜2035', confidence: '確立', rd: ['torsional', 'critspeed'], detail: '50–300MWe級蒸気タービン発電機トレインの標準化・量産という新需要形態（従来の1000MWe級一品設計と異なる）。再稼働案件（Crane CEC等）では経年ロータのバランシング・ねじり（系統SSR含む）再評価が実務課題。', sources: ['Constellation-Crane-2025', 'Kairos-TVA-2025', 'Xenergy-Amazon-2025'] },
      { id: 'D3-6', title: '燃料電池台頭による発電機需要侵食シナリオの管理', horizon: '2035〜', confidence: '推定', rd: ['digital'], detail: 'SOFC（Bloom等）がDC主電源として急拡大すると回転機(GT/発電機)需要を一部代替。DeepSeek型のAI効率化による電力需要下振れも同格の不確実変数。市場リスク項目。' },
    ],
  },
  {
    id: 'D4',
    name: '航空・モビリティ',
    short: 'eVTOL・電動推進・FC・舶用',
    trends: [
      { text: 'FC用エアコンプレッサは非接触エアフォイル軸受で最大10万rpm級、先進設計は15万rpm超、オイルフリー9kg以下。IHIが2023年に従来比3.5倍出力の100kW級を発表', confidence: '確立', source: 'IHI-eTurboComp-2023' },
      { text: 'NASA 電動推進モータ最低目標 12 kW/kg（市販約2 kW/kg）、UIUC機で15 kW/kg・効率96%超。GEがMW級ハイブリッド推進を45,000ft模擬試験', confidence: '確立', source: 'NASA-EAP-NTRS' },
      { text: '舶用は IMO 2050脱炭素で e-アンモニア／メタノールが2030年頃から急拡大。ただし実施措置（Net-Zero Framework）の採択は2025-10に1年延期', confidence: '推定', source: 'IMO-NZF-Delay-2025' },
      { text: 'eVTOLの現実線: 欧州独立系2社消滅（Lilium清算・Volocopter売却）。Joby TC 2026年後半見込み・商用2027〜。EHangは有償遊覧を2026-03開始', confidence: '確立', source: 'Joby-Stage4-2026' },
      { text: '宇宙: 2025年の軌道打上げ329回（過去最多）。再使用化でターボポンプが疲労・繰返し熱勾配・サブシンクロナスの繰返し運用設計へ転換', confidence: '確立', source: 'SpaceNews-Launch-2025' },
    ],
    demandShift: '超高速・軽量・高出力密度・オイルフリーが共通ベクトル。FCエアコンプレッサ、電動推進ファン/モータ、航空用ギアボックス、ターボジェネレータ、再使用ロケットターボポンプ、防衛用小型ターボジェット。',
    milestones: [
      { id: 'D4-1', title: 'FCエアコンプレッサ(10–15万rpm)のサブシンクロナス渦動抑制', horizon: '〜2030', confidence: '確立', rd: ['stability', 'bearing'], detail: 'ガス/エアフォイル軸受ロータは起動停止の大振幅・高速時のサブシンクロナス渦動（10–17krpmで渦動比1/2等）。マルチパッド・プリロード設計で抑制。', sources: ['Xu-IMechE-FoilRotor-2024'], topics: ['rotor-stator-rub'] },
      { id: 'D4-2', title: '高出力密度HSPMM(~15kW/kg)の曲げ危険速度・超臨界通過＋能動制御', horizon: '〜2035', confidence: '確立', rd: ['critspeed', 'emag'], detail: '出力密度を上げると軸が細くなり曲げ危険速度に到達→超臨界運転＋制限回転域・能動制御を要する。', sources: ['NASA-EAP-NTRS'] },
      { id: 'D4-3', title: 'ガスフォイル軸受ロータのFSI＋伝達マトリクス検証フロー', horizon: '〜2035', confidence: '確立', rd: ['stability', 'bearing'], detail: 'Riccati伝達マトリクス法・流体構造連成(FSI)で安定性・固有振動数・Campbell線図・不釣合い応答を解析する設計検証フロー確立。FCEV遠心では危険速度をGFBが支配（空力剛性は無視可）。', sources: ['Xu-IMechE-FoilRotor-2024', 'GFB-FCEV-CritSpeed-2023'] },
      { id: 'D4-4', title: '航空機動ジャイロ連成の危険速度マップ', horizon: '〜2035', confidence: '確立', rd: ['fwbw', 'critspeed'], detail: 'yaw/pitch/roll機動で回転体にジャイロモーメント→前進/後退モードの危険速度が分離。機体機動との相互作用を航空安全要件として織り込む。', topics: ['forward-backward-whirl'] },
      { id: 'D4-5', title: 'MW級ハイブリッド推進ターボジェネレータのRD・ねじり評価', horizon: '〜2035', confidence: '確立', rd: ['torsional', 'critspeed'], detail: 'GE/NASA系のMW級・多kVハイブリッド推進系のロータダイナミクス・ねじり振動評価。', sources: ['GE-NASA-Hybrid-2022'] },
      { id: 'D4-6', title: '舶用NH3/メタノール対応の高速ターボ機械', horizon: '〜2035', confidence: '推定', rd: ['critspeed'], detail: '2030年頃から急拡大が必要とされる舶用脱炭素燃料に備えた高速ロータ設計対応。IMO Net-Zero Framework採択の1年延期（2025-10）で実需立ち上がり確度は低下。', sources: ['GMF-DNV-Fuels', 'IMO-NZF-Delay-2025'] },
      { id: 'D4-10', title: '再使用ロケットターボポンプの疲労×サブシンクロナス設計', horizon: '〜2035', confidence: '推定', rd: ['stability', 'critspeed'], detail: '「1回飛べばよい」設計から繰返し運用設計へ。極低温ターボポンプは歴史的にサブシンクロナス・ホワールが破壊的不安定として頻発。疲労・繰返し熱勾配・極低温対応ダンパ（metal mesh等）が課題。', sources: ['SpaceNews-Launch-2025'] },
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
      { text: 'フォイル軸受の実装レンジが跳躍: Garrett が25–1,750 kWcの油フリー遠心圧縮機をHVAC向けに製品化、量産2026年後半。FC数十kW→冷凍MWc級へ', confidence: '確立', source: 'Garrett-OilFree-2026' },
      { text: 'センサレスAMB（KAIST, IEMDC 2025）・AMBドロップ後の再浮上(recontrol)評価が進展', confidence: '確立', source: 'KAIST-SensorlessAMB-2025' },
    ],
    demandShift: 'UQ/サロゲート/PINN/デジタルツイン、AI状態監視・予知保全、能動/セミアクティブ振動制御、CFRP・AMロータ、規格整備が全ドライバを下支え。',
    milestones: [
      { id: 'D5-1', title: 'PCE/Kriging サロゲート＋Monte Carlo のUQをロバスト危険速度設計に実装', horizon: '〜2030', confidence: '確立', rd: ['critspeed', 'digital'], detail: '軸受減衰・クリアランス・不釣合いを確率分布化→危険速度/振幅/安定性の分布を得て製造公差・運転限界設定に適用。', sources: ['Fu-MSSP-UQreview-2023', 'Sensors-CritSpeedProb-2024'] },
      { id: 'D5-2', title: 'AI状態監視＋RUL予測のCM/PHM標準化', horizon: '〜2030', confidence: '確立', rd: ['digital'], detail: '正常時シグネチャ学習＋逸脱検知、RUL推定。ISO 13373系をベースにAI診断ガイドライン化。' },
      { id: 'D5-3', title: 'PINN/物理組込MLによる軸受・シール動特性係数推定', horizon: '〜2035', confidence: '推定', rd: ['digital', 'seal'], detail: '物理知識（軸受動力学・故障機構）を data-driven モデルに組込み、ロバスト性・汎化を高める。', sources: ['TGM-AIEng-2026'] },
      { id: 'D5-4', title: '圧電可動SFD等のセミアクティブ制御の実機適用', horizon: '〜2035', confidence: '確立', rd: ['stability', 'bearing'], detail: '圧電(PZT)駆動で油膜ギャップを能動可変し、危険速度通過時の突発不釣合い振動を抑制。', sources: ['JSV-PiezoSFD-2024'] },
      { id: 'D5-5', title: 'CFRP/鋼ハイブリッド軸・CFRPスリーブPMロータの高速化標準化', horizon: '〜2035', confidence: '確立', rd: ['critspeed'], detail: 'CFRPスリーブは鋼の約10倍の比強度で薄肉化・エアギャップ縮小・高回転化を可能に。熱変位低減・軽量化。', sources: ['JMP-CFRPshaft-2024'] },
      { id: 'D5-6', title: 'API 617/684・ISO 20816/14839/21940 の継続改訂', horizon: '〜2035', confidence: '確立', rd: ['bearing', 'stability'], detail: 'API 617 8th でAMB Annex追加、ISO 14839-5(タッチダウン軸受)2022、ISO 20816への統合進展。【2026-07確認】ISO/CD 21940-12（弾性ロータバランシング）・ISO/DIS 21940-14 が改訂進行中。API 684はTR 684-1(2019)が現行。NERCがIBR近傍タービン発電機のSSTI評価（EMT解析）をガイドライン化(2024-12)。', sources: ['Swanson-Masala-API617-AMB', 'ISO14839-5-2022', 'ISO21940-12-CD', 'NERC-EMT-IBR-2024'], topics: ['standards-landscape'] },
      { id: 'D5-7', title: '流体-構造-熱-電磁フル連成＋オンラインUQのリアルタイムDT', horizon: '2035〜', confidence: '仮説', rd: ['digital', 'emag'], detail: '高忠実度マルチフィジックスを設計ループ内オンラインUQとともにリアルタイムDTへ統合。' },
      { id: 'D5-8', title: 'ガス/エアフォイル軸受機向けの新規API/ISO規格整備', horizon: '2035〜', confidence: '推定', rd: ['bearing', 'stability'], detail: 'AMBはAPI617 Annex＋ISO14839で枠組みがあるが、フォイル/ガス軸受の受入・適格性は規格ギャップが残る。', topics: ['standards-landscape'] },
      { id: 'D5-9', title: 'AMロータ量産適用とRD設計法／AI診断・DTの規格化', horizon: '2035〜', confidence: '推定', rd: ['critspeed', 'digital'], detail: '付加製造(AM)ロータ（内部冷却流路・一体造形）の量産適用とロータダイナミクス設計法整備、AI診断・DTの規格化。' },
    ],
  },
  {
    id: 'D6',
    name: '系統安定化・回転慣性',
    short: '同期調相機・フライホイール（2026-07新設）',
    trends: [
      { text: '英NESO Stability Pathfinder: 慣性36 GVA.sを契約・2026年全量運開。Phase 3は29契約すべて同期調相機（17.1 GVA.s）', confidence: '確立', source: 'NESO-Stability-2025' },
      { text: '独TenneT×Siemens Energy: フライホイール付き同期調相機を含む3系統（Mehrum, 2025運開）。豪AEMOも同期調相機を今後10年の系統安全の鍵と明記', confidence: '確立', source: 'TenneT-Siemens-FWSC-2024' },
      { text: '米ERCOT: 175 MVAr×2基をEPC発注（2027納入）。中国Dinglun 30MW・磁気浮上フライホイール120基が世界最大のFW発電所として系統接続', confidence: '確立', source: 'ANDRITZ-GEV-ERCOT-2025' },
    ],
    demandShift: '再エネ増で系統の回転慣性が減り、「回転慣性という物理量を売る」回転機械＝同期調相機・フライホイールをTSO/ISOが調達。大型高慣性ロータ、フライホイール連結多スパン軸系、磁気浮上FWのAMB制御、既設タービン発電機の調相機転用（クラッチ改造→再RD評価）。リスク: グリッドフォーミングBESSによる代替。',
    milestones: [
      { id: 'D6-1', title: '同期調相機の大量導入と高慣性ロータ設計の定型化', horizon: '〜2030', confidence: '確立', rd: ['torsional', 'critspeed'], detail: '英36 GVA.s全量運開(2026)・米ERCOT 2027納入。大型高慣性ロータのねじり/横振動設計、フライホイール付き機（独Mehrum型）の多スパン軸系危険速度・カップリング設計。', sources: ['NESO-Stability-2025', 'TenneT-Siemens-FWSC-2024', 'ANDRITZ-GEV-ERCOT-2025'] },
      { id: 'D6-2', title: '既設タービン発電機の調相機転用（クラッチ改造）再RD評価', horizon: '〜2030', confidence: '確立', rd: ['torsional', 'critspeed'], detail: '退役火力の発電機を同期調相機へ転用する際のクラッチ付き改造・軸系変更に伴う再ロータダイナミクス評価（危険速度・ねじり・バランシング）。', sources: ['AEMO-TPSS-2025'] },
      { id: 'D6-3', title: '磁気浮上フライホイールESSのAMB×剛体/曲げモード設計標準化', horizon: '〜2035', confidence: '確立', rd: ['bearing', 'stability'], detail: '真空中運転・高周速フライホイールのAMB制御と剛体/曲げモード管理、タッチダウン設計。中国Dinglun 30MW（120基）が実装先行。', sources: ['Dinglun-Flywheel-2024'] },
      { id: 'D6-4', title: 'IBR近傍SSTI×発電機軸系ねじり保護の設計統合', horizon: '〜2035', confidence: '確立', rd: ['torsional'], detail: 'インバータ電源(IBR)近傍のタービン発電機で5–60Hz出力振動がある場合のSSTIリスク評価（NERC EMTガイドライン2024-12）。系統事象（RoCoF・短絡）×軸系ねじりの連成設計。', sources: ['NERC-EMT-IBR-2024'] },
      { id: 'D6-5', title: '慣性市場の制度化と「慣性スペック起点」ロータ最適化', horizon: '2035〜', confidence: '推定', rd: ['torsional', 'digital'], detail: '慣性（GVA.s）取引の制度化に伴い、慣性・短絡容量スペックから逆算するロータ設計最適化。グリッドフォーミングBESSとの機能競合の帰趨が需要の分岐点。' },
    ],
  },
]

// ───────────────────────── 共通ベクトル（縦糸） ─────────────────────────
export const VECTORS: Vector[] = [
  { id: 'V1', name: '油フリー化', detail: '磁気軸受(AMB)・ガス/フォイル軸受への移行。潤滑油の汚染・損失・保守を排除し、安定性(サブシンクロナス)・タッチダウンが業界横断の共通課題になる。フォイルはHVAC 25–1,750 kWcへ量産拡大（2026）、磁気浮上フライホイールも実装先。', drivers: ['D1', 'D3', 'D4', 'D6'], sources: ['DellaCorte-2012-MSSP', 'ISO14839-5-2022', 'Khatri-Hawkins-ISMB16', 'Garrett-OilFree-2026'] },
  { id: 'V2', name: '超高速・高出力密度化', detail: '軸細径化→曲げ危険速度に到達→超臨界(supercritical)運転が標準に。内部減衰・回転慣性励振が不安定化要因として共通化。', drivers: ['D1', 'D4'], sources: ['NASA-EAP-2023', 'MDPI-AMB-Review-2025'] },
  { id: 'V3', name: 'モータ一体化・系統連成', detail: '高速PMモータ直結→電磁連成（UMP＝負の半径方向剛性で危険速度低下・2×電源周波数加振）、インバータ駆動ねじり。系統側でもIBR近傍SSTI・負荷急変ねじりが発電機軸系に連なる。', drivers: ['D1', 'D3', 'D4', 'D6'], sources: ['Gerada-2014-IEEE-TIE', 'Holopainen-Sopanen-2005', 'HighSpeedPM-Machines-2022', 'NERC-EMT-IBR-2024'] },
  { id: 'V4', name: '作動流体の極端化', detail: '低分子量(H2)＝アエロ励振小だが多段・長スパンで危険速度律速／高密度(sCO2)＝旋回流クロスカップルでサブシンクロナス安定性律速。', drivers: ['D2', 'D3'], sources: ['Baba-2020-GPPS', 'TAMU-sCO2-Tutorial', 'SwRI-STEP-Rotordyn-2018'] },
  { id: 'V5', name: 'デジタル化', detail: 'UQ/サロゲート/PINN/デジタルツイン、AI状態監視・予知保全が設計・運用を横断的に変える。', drivers: ['D5'], sources: ['Fu-MSSP-UQreview-2023', 'DT-Sensors-2024'] },
]

// ───────────────────────── ストーリー（冒頭ナラティブ＋権威アンカー） ─────────────────────────
// refs は出典キー（SOURCE_MAP にあればリンク）または既存ナレッジ topic slug。
export const NARRATIVE: { text: string; refs: string[] }[] = [
  { text: '世界は脱炭素・電化・AIという3つの不可逆な潮流に同時に晒され、エネルギーと航空の双方でネットゼロ2050が政策目標として確定した。', refs: ['ICAO-LTAG-2022', 'IEA-GHR-2024'] },
  { text: 'その帰結として、回転機械への要求は「より高速・高出力密度・潤滑油フリー・極端な作動流体」へ一斉にシフトしている。', refs: ['NASA-EAP-2023', 'CleanHydrogenJU-SRIA-2022'] },
  { text: '航空はMW級電動推進で電動機13 kW/kg級・2035年就航を狙い、軽量薄肉・超高速ロータが標準化する。', refs: ['NASA-EAP-2023', 'CleanAviation-SRIA-2024'] },
  { text: 'エネルギー転換は水素・アンモニア・sCO2を主役に据え、低分子量ガスの多段長スパン圧縮機や、水の密度に迫る高密度sCO2ターボ機械を生む。', refs: ['CleanHydrogenJU-SRIA-2022', 'DOE-STEP-SwRI-2024'] },
  { text: 'AIデータセンターは電力需要を2030年に倍増（415→945 TWh）させ、油フリー磁気軸受チラー圧縮機と液冷ポンプの需要を爆発させている。', refs: ['IEA-EnergyAI-2025', 'Uptime-GDCS-2025'] },
  { text: '再エネの拡大は同時に系統の回転慣性を減らし、「慣性という物理量を売る」同期調相機・フライホイールという新しい回転機械需要を生んでいる（英36 GVA.s契約・独フライホイール調相機・米ERCOT発注）。', refs: ['NESO-Stability-2025', 'TenneT-Siemens-FWSC-2024', 'AEMO-TPSS-2025'] },
  { text: 'これら機種を超えて、進化方向は油フリー化・超高速/高出力密度・モータ一体化・作動流体の極端化・デジタル化の5本に収束する。', refs: ['DellaCorte-2012-MSSP', 'MDPI-AMB-Review-2025'] },
  { text: '結果としてロータダイナミクスには古典的難問が新条件で再来する——危険速度の超臨界通過と分離余裕、自励・サブシンクロナス安定性、シール/隙間の流体励起、電磁連成とねじり。', refs: ['separation-margin', 'clearance-excitation-thomas-alford', 'forward-backward-whirl'] },
  { text: 'ターボ機械の権威も「開発後段で顕在化する問題は本質的に動的で、減衰の定量化と流体-構造連成こそ最難関」と総括しており、課題の核心は一致している。', refs: ['ASME-Spakovszky-2023'] },
  { text: '解の方向は、磁気・ガス/フォイル軸受とダンパシール／スワールブレーキによる安定化、能動制御、そして不確かさ定量化(UQ)・デジタルツインでの確率論的設計に向かう。', refs: ['DellaCorte-NASA-2016', 'Fu-MSSP-UQreview-2023', 'DT-Sensors-2024'] },
  { text: '規格（API 617/684, ISO 20816/14839/21940）はこの変化に追従改訂中だが、油フリー/ガス軸受機を正面から扱う規格は未整備で、ここを埋めることがロードマップ後半の到達点になる。', refs: ['ISO20816-1-2016', 'ISO14839-5-2022'] },
]

export const ANCHOR = {
  quote:
    '開発後段で顕在化する問題は本質的に動的（surge / flutter / rotordynamic）であり、最難関は減衰の定量化と流体-構造連成（FSI）の予測である。',
  attribution: 'Z. S. Spakovszky, “Instabilities Everywhere! Hard Problems in Aero-Engines”, 2021 IGTI Scholar Lecture',
  ref: 'ASME-Spakovszky-2023',
}

// ───────────────────────── 解の方向（リンク図の第4層 L4） ─────────────────────────
// rd = 対応する横断RD課題クラスタ key（L3→L4 のリンク元）。
export interface Solution {
  id: string
  name: string
  detail: string
  rd: string[]
  sources?: string[]
}
export const SOLUTIONS: Solution[] = [
  { id: 'S1', name: '先進軸受（磁気・ガス/フォイル）', detail: '非接触・油フリー支持。AMBは能動制御で多モードを管理、ガス/フォイル軸受は減衰確保とサブシンクロナス渦動の抑制が要点。', rd: ['stability', 'bearing', 'critspeed'], sources: ['DellaCorte-2012-MSSP', 'MDPI-AMB-Review-2025'] },
  { id: 'S2', name: 'ダンパシール／スワールブレーキ', detail: '旋回流クロスカップル剛性を低減し最低次モードの減衰比を増す。高密度ガス機の安定性律速に対する直接の解。', rd: ['stability', 'seal'], sources: ['ASME-SwirlBrake-2023', 'Baba-2020-GPPS'] },
  { id: 'S3', name: '能動振動制御・SFD', detail: '圧電可動SFD等で危険速度通過時の突発不釣合いを抑制、能動制御で軽量柔軟ロータ・電磁連成を安定化。', rd: ['critspeed', 'stability', 'emag'], sources: ['JSV-PiezoSFD-2024', 'SwRI-STEP-Rotordyn-2018'] },
  { id: 'S4', name: 'UQ・デジタルツイン', detail: '不確かさ定量化と確率論的設計、オンライン推定によりロバスト危険速度・安定性設計と予知保全へ。', rd: ['digital', 'critspeed', 'torsional'], sources: ['Fu-MSSP-UQreview-2023', 'DT-Sensors-2024'] },
  { id: 'S5', name: '規格整備（API/ISO）', detail: 'API 617/684・ISO 20816/14839 の追従改訂と、油フリー/ガス軸受機を正面から扱う新規格の整備。', rd: ['bearing', 'stability', 'torsional', 'fwbw'], sources: ['ISO20816-1-2016', 'ISO14839-5-2022', 'API-TR684-1-2019'] },
]

// ───────────────────────── 横断RD課題クラスタ ─────────────────────────
export const RD_CLUSTERS: RDCluster[] = [
  { key: 'critspeed', name: '危険速度通過・分離余裕', cause: 'V2 超高速', detail: '超臨界運転の起動/停止過渡、SM確保、たわみロータ。', topics: ['separation-margin'] },
  { key: 'stability', name: '安定性（自励・サブシンクロナス）', cause: 'V1,V4', detail: 'ガス膜/フォイル不安定、シール旋回流クロスカップル、log dec、ダンパシール/スワールブレーキ。', topics: ['rotor-stator-rub', 'clearance-excitation-thomas-alford', 'forward-backward-whirl'] },
  { key: 'emag', name: 'モータ電磁連成', cause: 'V3', detail: 'UMP（負の半径方向剛性・危険速度低下・2×電源周波数）、偏心。', topics: ['separation-margin'] },
  { key: 'torsional', name: 'ねじり振動', cause: 'V3 インバータ・系統', detail: 'VFD/PWM の6次・12次励振、トルクリプル、トレインねじり分離余裕。IBR近傍SSTI（NERC EMTガイドライン2024）、AI-DC負荷急変ねじり疲労。', topics: [] },
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
  // ── 2026-06-28 深掘り（一次格上げ・RD因果・横断テーマ・俯瞰文献） ──
  { key: 'IEA-GHR-2024', title: 'IEA — Global Hydrogen Review 2024（需要97Mt/低排出<1Mt, FID 20GW）', url: 'https://www.iea.org/reports/global-hydrogen-review-2024', primary: true },
  { key: 'IEA-GEO-2025', title: 'IEA — Global EV Outlook 2025（2030 EV 40%・走行245M台）', url: 'https://www.iea.org/reports/global-ev-outlook-2025/executive-summary', primary: true },
  { key: 'IEA-CCUS-2025', title: 'IEA — CCUS Projects Database 2025（CO2回収 50→430 Mt）', url: 'https://www.iea.org/data-and-statistics/data-product/ccus-projects-database', primary: true },
  { key: 'ReFuelEU-2023', title: 'EU — ReFuelEU Aviation（SAF 6%/2030→70%/2050, e-fuel 1.2%→35%）', url: 'https://transport.ec.europa.eu/transport-modes/air/environment/refueleu-aviation_en', primary: true },
  { key: 'IMO-2023-GHG', title: 'IMO — 2023 GHG Strategy（−20%/2030・−70%/2040・netzero 2050）', url: 'https://www.imo.org/en/ourwork/environment/pages/2023-imo-strategy-on-reduction-of-ghg-emissions-from-ships.aspx', primary: true },
  { key: 'ICAO-LTAG-2022', title: 'ICAO — LTAG net-zero 2050（技術寄与~20%）', url: 'https://www.icao.int/environmental-protection/long-term-global-aspirational-goal-ltag-international-aviation', primary: true },
  { key: 'NASA-EAP-2023', title: 'NASA — Electric Aircraft Propulsion（MW電動機 13.2 kW/kg@96%, EIS 2035–40）', url: 'https://ntrs.nasa.gov/citations/20230008891', primary: true },
  { key: 'CleanAviation-SRIA-2024', title: 'Clean Aviation JU — SRIA 2024（正味CO2▲90% by 2035, HPA=水素GT/FC圧縮機）', url: 'https://clean-aviation.eu/sites/default/files/2024-09/2024-Clean-Aviation-SRIA.pdf', primary: true },
  { key: 'CleanHydrogenJU-SRIA-2022', title: 'Clean Hydrogen JU — SRIA KPI（H2圧縮機 2.5→2 kWh/kg・寿命14→20yr, GT 0–100%H2）', url: 'https://www.clean-hydrogen.europa.eu/knowledge-management/strategy-map-and-key-performance-indicators/clean-hydrogen-ju-sria-key-performance-indicators-kpis_en', primary: true },
  { key: 'HydrogenCouncil-Compass-2025', title: 'Hydrogen Council — Global Hydrogen Compass 2025（投資>$110bn, 2030生産9–14 Mtpa）', url: 'https://compass.hydrogencouncil.com/wp-content/uploads/2025/09/Hydrogen-Council-Global-Hydrogen-Compass-2025.pdf', primary: true },
  { key: 'DOE-STEP-SwRI-2024', title: 'DOE/SwRI/GTI — STEP Demo 10 MWe sCO2（初発電 2024）', url: 'https://www.swri.org/newsroom/press-releases/step-demo-supercritical-co2-pilot-plant-generates-electricity-the-first-time', primary: true },
  { key: 'SwRI-STEP-Rotordyn-2018', title: 'SwRI — 10 MWe sCO2 turbine rotordynamics（715°C/250bar/27krpm, ティルパッド＋SFD）', url: 'https://sco2symposium.com/papers2018/testing/076_Paper.pdf', primary: true },
  { key: 'DellaCorte-2012-MSSP', title: 'DellaCorte — Oil-Free Shaft Support Rotordynamics: Past/Present/Future (MSSP 2012)', url: 'https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20110011144.pdf', primary: true },
  { key: 'DellaCorte-NASA-2016', title: 'DellaCorte — Technical Development Path for Gas Foil Bearings (NASA 2016)', url: 'https://ntrs.nasa.gov/api/citations/20160013553/downloads/20160013553.pdf', primary: true },
  { key: 'Gerada-2014-IEEE-TIE', title: 'Gerada et al. — High-Speed Electrical Machines: Technologies, Trends (IEEE TIE 2014)', url: 'https://eprints.nottingham.ac.uk/36293/', primary: true },
  { key: 'Holopainen-Sopanen-2005', title: 'Holopainen et al. — Electromechanical interaction in rotordynamics (UMP, JSV 2005)', url: 'https://sarjaweb.vtt.fi/pdf/publications/2004/P543.pdf', primary: true },
  { key: 'HighSpeedPM-Machines-2022', title: 'High-Speed PM Motors: A Review (Machines 2022, 10(7):549)', url: 'https://www.mdpi.com/2075-1702/10/7/549', primary: true },
  { key: 'Baba-2020-GPPS', title: 'Baba et al. — High-pressure CO2 IGC（20 MPaG, log dec 1.24→1.33 ISFD）(GPPS 2020)', url: 'https://journal.gpps.global/Experimental-evaluation-of-performance-and-mechanical-reliability-for-high-pressure,124724,0,2.html', primary: true },
  { key: 'AIDC-Torsional-2026', title: 'Hossain et al. — AI Data Centers & turbine-generator torsional fatigue (arXiv 2026, preprint)', url: 'https://arxiv.org/html/2605.01173v1', primary: true },
  { key: 'ASME-GT1996-ShortCircuitTorsion', title: 'Transient Torsional Vibration under Short Circuit (ASME GT1996)', url: 'https://asmedigitalcollection.asme.org/GT/proceedings/GT1996/78743/V003T07A001/237643', primary: true },
  { key: 'ISO20816-1-2016', title: 'ISO 20816-1:2016（ISO 10816+7919 を統合＝振動評価規格の収斂）', url: 'https://www.iso.org/standard/63180.html', primary: true },
  { key: 'DT-Sensors-2024', title: 'A Review of Digital Twinning for Rotating Machinery (Sensors 2024, 24(15):5002)', url: 'https://www.mdpi.com/1424-8220/24/15/5002', primary: true },
  { key: 'ASME-Spakovszky-2023', title: 'Spakovszky — Instabilities Everywhere! Hard Problems in Aero-Engines (ASME 2023 IGTI)', url: 'https://doi.org/10.1115/1.4055424', primary: true },
  { key: 'MDPI-AMB-Review-2025', title: 'Review on R&D of Magnetic Bearings (Energies 2025, 18(12):3222)', url: 'https://www.mdpi.com/1996-1073/18/12/3222', primary: true },
  { key: 'Cryo-Turboexpander-2023', title: 'Cryogenic turboexpander on gas foil bearings, 175k rpm (Sādhanā 2023)', url: 'https://link.springer.com/article/10.1007/s12046-023-02298-7', primary: true },
  { key: 'GFB-FCEV-CritSpeed-2023', title: 'GFB/Labyrinth/Impeller impact on FCEV compressor critical speed (Lubricants 2023)', url: 'https://www.mdpi.com/2075-4442/11/12/532', primary: true },
  { key: 'Uptime-GDCS-2025', title: 'Uptime Institute — Global Data Center Survey 2025（PUE 1.54, DLC 22%）', url: 'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2025.Annual.Survey.Report.pdf', primary: true },
  { key: 'API-TR684-1-2019', title: 'API TR 684-1 — Rotordynamic Tutorial（横危険速度・安定性・ねじり・分離余裕）', url: 'https://standards.globalspec.com/std/14225369/api-tr-684-1', primary: true },
  { key: 'Khatri-Hawkins-ISMB16', title: 'Khatri & Hawkins — API 617 vs ISO 14839-3 for AMB compressors (ISMB16)', url: 'https://www.magneticbearings.org/app/uploads/publications/ismb16/ismb16_008.pdf', primary: true },
  // ── 2026-07-02 再調査（D6新設・情勢変化・技術規格最新） ──
  { key: 'NESO-Stability-2025', title: 'NESO — Stability Pathfinder（慣性36 GVA.s契約・2026全量運開, Phase3は全29契約が同期調相機）', url: 'https://www.neso.energy/news/first-phase-stability-pathfinders-delivered', primary: true },
  { key: 'TenneT-Siemens-FWSC-2024', title: 'Siemens Energy — TenneT向けフライホイール付き同期調相機（Mehrum, 2025）', url: 'https://www.siemens-energy.com/global/en/home/press-releases/siemens-energy-technology-stabilizes-german-power-grid.html', primary: true },
  { key: 'AEMO-TPSS-2025', title: 'AEMO — 2025 Transition Plan for System Security（同期調相機が系統安全の鍵）', url: 'https://aemo.com.au/en/newsroom/news-updates/synchronous-condenser-testing-on-track', primary: true },
  { key: 'ANDRITZ-GEV-ERCOT-2025', title: 'ANDRITZ×GE Vernova — ERCOT向け同期調相機 175 MVAr×2基（2027納入）', url: 'https://www.andritz.com/newsroom-en/hydro/2025-05-27-lcra-group', primary: true },
  { key: 'Dinglun-Flywheel-2024', title: 'Dinglun 30MW — 磁気浮上フライホイール120基・世界最大FW発電所（中国, 2024）', url: 'https://www.energy-storage.news/worlds-largest-30mw-flywheel-energy-storage-project-connects-to-grid-in-china/', primary: true },
  { key: 'Constellation-Crane-2025', title: 'Constellation — Crane Clean Energy Center（旧TMI-1再稼働, 2027運開前倒し・DOE $1B）', url: 'https://www.constellationenergy.com/news/2025/09/one-year-later-crane-clean-energy-center-still-in-the-spotlight-and-ahead-of-schedule.html', primary: true },
  { key: 'Kairos-TVA-2025', title: 'Kairos Power×Google×TVA — Hermes 2（50MW, 2030）米初Gen IV PPA', url: 'https://kairospower.com/external_updates/google-kairos-power-tva-collaborate-to-meet-americas-growing-energy-needs', primary: true },
  { key: 'Xenergy-Amazon-2025', title: 'X-energy×Amazon — Xe-100×12基・2039年5GW目標＋KHNP/Doosan量産提携', url: 'https://x-energy.com/media/news-releases/x-energy-amazon-korea-hydro-amp-nuclear-power-and-doosan-enerbility-announce-partnership-to-scale-advanced-nuclear-energy-for-ai-infrastructure', primary: true },
  { key: 'IEA-Geothermal-2024', title: 'IEA — The Future of Geothermal Energy（2050年最大800GW・投資$2.5T）', url: 'https://www.iea.org/reports/the-future-of-geothermal-energy/executive-summary', primary: true },
  { key: 'Fervo-CapeStation-2025', title: 'Fervo — Cape Station（世界初商用EGS, 100MW 2026-10送電開始予定）', url: 'https://fervoenergy.com/fervo-energy-secures-421-million-in-non-recourse-project-financing-for-cape-station/', primary: true },
  { key: 'SpaceNews-Launch-2025', title: 'SpaceNews — 2025年軌道打上げ329回（過去最多, Falcon 9単独165回）', url: 'https://spacenews.com/spacex-china-drive-new-record-for-orbital-launches-in-2025/', primary: true },
  { key: 'Reuters-DroneJet-2026', title: 'Reuters — ドローン用ミニジェットエンジン供給不足（PBS生産5→8倍計画）', url: 'https://www.usnews.com/news/world/articles/2026-04-07/ukraines-attack-drone-fleet-faces-a-mini-jet-engine-supply-crunch', primary: true },
  { key: 'MAN-Helsinki-HP-2024', title: 'MAN — ヘルシンキ向け世界最大33MW空気熱源HP（油フリー磁気軸受HOFIM）', url: 'https://www.man-es.com/company/press-releases/press-details/2024/08/28/man-energy-solutions-to-supply-world-s-largest-air-to-water-heat-pump-for-helsinki-s-district-heating', primary: true },
  { key: 'IEA-GHR-2025-update', title: 'IEA — GHR 2025（発表ベース49→37 Mtpaへ史上初の下方修正・FID済4Mtpa維持）', url: 'https://www.iea.org/reports/global-hydrogen-review-2025/executive-summary', primary: true },
  { key: 'OBBBA-2025', title: 'OBBBA（2025-07成立）— EV税額控除終了・45V短縮・ITC/PTC制限（Kirkland解説）', url: 'https://www.kirkland.com/publications/kirkland-alert/2025/08/one-big-beautiful-bill-act-brings-big-changes-to-green-energy-tax-credits', primary: true },
  { key: 'IEA-WEO-2025', title: 'IEA — World Energy Outlook 2025（CPS復活・米EV下方修正）', url: 'https://www.iea.org/reports/world-energy-outlook-2025/executive-summary', primary: true },
  { key: 'Joby-Stage4-2026', title: 'Joby — FAA型式証明Stage 4完了（2026-03）・TC 2026後半見込み', url: 'https://www.commercialuavnews.com/faa-regulation-certification-aam-joby-archer-electra', primary: true },
  { key: 'EHang-6K-2026', title: 'EHang — 広州・合肥で有償遊覧飛行開始（2026-03, SEC 6-K）', url: 'https://www.sec.gov/Archives/edgar/data/0001759783/000119312526262868/d123612dex991.htm', primary: true },
  { key: 'Lilium-End-2026', title: 'FlightGlobal — Lilium事業終了（プロトタイプ処分, 2026-04）・Volocopter売却', url: 'https://www.flightglobal.com/aerospace/2026/04/lilium-jets-journey-ends-on-scrapheap-as-prototypes-fail-to-sell/', primary: true },
  { key: 'GEV-Backlog-2026', title: 'GE Vernova — GT受注残100 GW（2026-Q1）・2030–31年完売（決算報道, 一次直接確認未了）', url: 'https://rbnenergy.com/daily-posts/blog/backlog-natural-gas-turbines-expands-surging-demand-supply-constraints', primary: false },
  { key: 'STEP-Phase1-2024', title: 'SwRI/GTI — STEP Demo Phase 1完了（実績500°C・27krpm・net~4MWe。715°C/10MWeはPhase 2目標）', url: 'https://www.swri.org/newsroom/press-releases/step-demo-pilot-plant-achieves-full-operational-conditions-phase-1-of-testing', primary: true },
  { key: 'IMO-NZF-Delay-2025', title: 'IMO — Net-Zero Framework採択を1年延期（2025-10, 再開2026）', url: 'https://www.imo.org/en/mediacentre/pressbriefings/pages/imo-net-zero-shipping-talks-to-resume-in-2026.aspx', primary: true },
  { key: 'ISO21940-12-CD', title: 'ISO/CD 21940-12 — 弾性ロータバランシング改訂（CD段階）・DIS 21940-14', url: 'https://www.iso.org/standard/86180.html', primary: true },
  { key: 'Garrett-OilFree-2026', title: 'Garrett — フォイル軸受・油フリー遠心圧縮機 25–1,750 kWc（HVAC, 量産2026後半）', url: 'https://www.garrettmotion.com/news/media/press-release/garrett-motion-introduces-breakthrough-oil-free-centrifugal-compressor-technology-for-hvac-systems-at-ahr-expo-2026-in-las-vegas/', primary: true },
  { key: 'NERC-EMT-IBR-2024', title: 'NERC — EMT Studies for IBR ガイドライン（SSTI 5–60Hz・軸系ねじり保護, 2024-12）', url: 'https://www.nerc.com/globalassets/who-we-are/standing-committees/rstc/irps/reliability_guideline_recommended_practices_for_emt_studies_for_ibr_approved.pdf', primary: true },
  { key: 'KAIST-SensorlessAMB-2025', title: 'KAIST — センサレスAMB位置推定（IEMDC 2025 Best Oral）', url: 'https://kmatrix.kaist.ac.kr/sensorless-control-of-active-magnetic-bearings/', primary: true },
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
