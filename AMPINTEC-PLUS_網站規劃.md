# AMPINTEC PLUS — SLM 金屬3D列印代工服務 一頁式網站規劃

> 本文件由 Claude Code 依據 `AGCODE-TEST` 資料夾內的簡報 PDF（《AMPINTEC PLUS – Sustainable & Cost-Effective Manufacturing with 3D Printing》）與 Logo 整理而成，並參考 eos.info、nikon-slm-solutions.com 的版型/視覺風格。
> **本文件為 Plan，實際網頁程式碼由 Antigravity 製作。**
>
> 已與業主確認的兩項規格：
> 1. 中英文採「右上角語言切換按鈕」（EN / 中），非雙語並列。
> 2. 聯絡表單第一版為「純前端佔位」，送出後以前端訊息模擬成功，**不串接任何後端/第三方服務**（之後可再串接）。

---

## 0. 2026/06/25 修訂紀要（依業主最新指示與簡報更新版調整）

業主已更新簡報 PDF 內容，並針對目前網頁規劃提出 10 點調整指示。本次修訂涵蓋 §3.3、§3.4、§3.5、§3.8、§3.9、§3.10，異動摘要如下，細節請見對應章節：

1. §3.3 痛點卡片：第1項由「開模具要10萬元以上」改為「總體成本觀念」；4張卡片新增點擊展開說明的互動（手風琴模式，比照 §3.12 FAQ 的展開收合）。
2. §3.3 結尾標語：加入「AMPINTEC 雖以3D金屬列印為主力，但仍具備傳統製造工法整合能力，可為客戶提供完整且最適合的製程方案」的訊息。
3. §3.4 品牌故事與創辦團隊：文案改寫為更商業化、更專業的敘述（不再逐字對應簡報原文）；創辦人姓名更正為「黃博正 Bo-Jeng Huang」、「邱楷勛 Kai-Hsun Chiu」。
4. §3.5 核心技術：加工能力清單新增「鑄造、鍛造」；列印技術類別由 2 類（FDM／SLM-LPBF-DMLS）擴充為 4 類（FDM、SLA、SLS、SLM/LPBF）。
5. §3.8 設備規格與產能：移除「未來產能規劃」子區塊（不在公開網站呈現）。
6. §3.9 為什麼選擇我們：原「傳統製造 vs 3D列印製造」二方對比表，改為「傳統製造 / 一般3D列印代工 / AMPINTEC PLUS」三方量化比較條狀圖（視覺比照既有「研發週期縮短案例」的條狀圖做法）。
7. §3.10 案例分享：「國際產業趨勢案例」改為可滑鼠拖曳旋轉的 3D 模型展示（取代靜態示意圖）；「AMPINTEC 技術與加工實績」改用簡報中真實的案例圖片/照片。

> 以下章節已依此次指示全面改寫，舊版內容（含舊版未來產能時間點 2026 Q3）已被取代；簡報更新版中「自研列印機」時間點已變更為 2027 Q1、規格為 300×300mm/2雷射（現行）與 660×660mm/4雷射（規劃中）（見原簡報 p.3），但因 §3.8 該區塊整體下線，此更新僅供業主內部參考，不會出現在公開網站。

---

## 0.1 Antigravity 實作問題回報與修正指示（業主測試發現）

業主測試 Antigravity 依本文件實作的網頁後，回報以下問題。逐一診斷如下，供 Antigravity 修正：

**問題1／2／7／8（Hero 數據顯示0、痛點卡片點不開、三方比較條狀圖與研發週期條狀圖未正常顯示、FAQ 點不開）— 同一根本原因：**

檢查目前 `app.js` 檔案結尾，整支檔案僅有一個 `document.addEventListener('DOMContentLoaded', () => { ... })`，但結尾卻出現**兩個**連續的 `});`（多了一個重複的收尾括號），導致整支 `app.js` 出現 JavaScript 語法錯誤（括號不成對），瀏覽器會直接拋出 `SyntaxError` 並讓整支腳本完全無法執行。這也解釋了為何下列功能全部失效：
- Hero 數據 count-up 動畫（`animateStats()` 從未被呼叫，數字停留在 HTML 預設的 `0`）
- 痛點卡片手風琴展開（對應的 `click` 事件監聽器從未被註冊）
- 三方比較條狀圖／研發週期條狀圖的 `IntersectionObserver` 動畫（從未被註冊，所有 `.bar-fill` 維持 inline `width: 0%`，畫面上只看到空的 `.bar-track` 灰底，這就是業主觀察到「所有比較都是相同的顏色」的原因——其實是 bar 都沒有展開，看到的只是底色軌道）
- FAQ 手風琴展開（同樣的 `click` 事件監聽器從未被註冊）

**修正方式：** 刪除 `app.js` 結尾多出的那一個重複 `});`，確保檔案只有一個 `document.addEventListener(...)` 區塊正確收尾（開頭 1 個 `addEventListener(`，結尾對應 1 個 `});`）。建議 Antigravity 修正後務必用瀏覽器 Console 確認**沒有任何 SyntaxError**，並逐一手動測試：Hero 數字動畫、4 張痛點卡點擊展開、三方比較圖表 8 列是否展開且 3 色可辨識、研發週期條狀圖是否展開、FAQ 5 題是否可點擊展開。

**問題7 額外的視覺微調建議（修好上述語法錯誤後仍建議調整）：** 目前「傳統製造」與「一般3D列印代工」兩條色條分別使用 `var(--color-gray-text)`（`#8E8E93`）與 `#AEAEB2`，兩者都是灰色調、明度接近，即使動畫修好後仍可能讓人覺得「看起來很像同一色」。建議將「一般3D列印代工」改用一個與灰色、金色都能明顯區分的第三色（例如帶藍灰調的 `#6B7A8F` 或淺藍 `#5B8DBE`），確保三方色條一眼可辨。

---

## 0.2 第二輪 Antigravity 實作問題回報與修正指示

> ⚠️ **此「問題1」已被後續指示取代，僅保留為歷史紀錄：** 下方診斷與修正建議是基於「保留第3欄但調整字級」的前提。但 §3.2 後續四次修訂已決定**直接移除**整個「國際航太與品質認證」欄位，Hero 數據強調條改為 3 欄（見 §3.2）。請 Antigravity **以 §3.2 的「移除＋3欄」指示為準**，不需再執行下方第3欄字級調整的修正。

**問題1（已取代，僅供歷史參考）：Hero 數據強調條，第3欄「國際航太與品質認證」版面與其他3欄沒有切齊，字級需調整**

- 診斷：`.stat-number` 是 4 欄共用的同一個 class，固定 `font-size: 2.8rem`；但第3欄實際內容是 `hero.stat_cert = "AS9100D / ISO 9001 / QMS"`（一整串文字），比其他3欄的短內容（如「±0.1 mm」「14 天」「90%」）長得多。用同樣的大字級會被迫換行或擠版，導致第3欄的高度與其他3欄不同，造成 4 個 `.stat-label` 的底部邊界沒有對齊。
- 修正指示：
  1. 第3個 `.stat-item` 的 `.stat-number` 需要套用獨立的字級（建議縮小至約 1.3～1.5rem，實際以不換行或最多2行為原則微調），不要與其他3欄共用同一個固定 2.8rem 字級。
  2. `.stat-item` 統一加上 `display: flex; flex-direction: column; justify-content: flex-end;`（或給 `.hero-stats` 4 欄設定一致的 `min-height`），確保不論數字內容文字長短或是否換行，4 個 `.stat-label` 都能對齊在同一條底部基準線上。
  3. 若視覺上仍覺得「AS9100D / ISO 9001 / QMS」三個認證並列在一個大數字位置不協調，可考慮改用 §3.6 `.quality-badges` 的小徽章樣式（更小字級＋分隔的小方塊）取代目前的單一大字級字串，更符合「多個獨立認證」的呈現邏輯。

**問題4：「量化比較」三方條狀圖，色條不可以遮到文字**

- 程式碼檢查：目前 `.chart-bar-container` 結構為 `.bar-name`（標籤）→ `.bar-track`（含 `.bar-fill` 色條，`overflow: hidden`）→ `.bar-val`（數字），三者是並排的 flex 子項目，理論上色條只會在 `.bar-track` 自己的範圍內延展，不會蓋到旁邊的文字。若畫面上仍觀察到文字被遮蓋，請 Antigravity 用瀏覽器開發者工具實際檢查重疊的元素，常見可能原因與對應修正：
  1. `.bar-name`／`.bar-val` 沒有設定 `flex-shrink: 0`，在容器較窄時被擠壓變形，文字卻維持 `white-space: nowrap` 而向外溢出蓋住 `.bar-track`——修正：明確給 `.bar-name`、`.bar-val` 加上 `flex-shrink: 0;`。
  2. `.bar-ampintec` 的 `box-shadow` 金色光暈在動畫展開時暈出 `.bar-track` 範圍，蓋到相鄰文字——修正：確認 `.bar-track` 有 `overflow: hidden`，或將 `box-shadow` 改小／移除暈光效果。
  3. `.chart-row` 與 `.chart-bars` 之間的 `margin`／`line-height` 不足，造成相鄰兩行的文字與色條視覺重疊——修正：確認 `.chart-row` 間 `gap`（目前規劃為 25px）與每個 `.chart-bar-container` 的高度足夠不擁擠。
  - 修正後請至少在 Desktop 與手機寬度（< 480px）兩種尺寸下實際檢視 8 組指標、3 條色條，確認標籤文字、色條、數值三者互不重疊遮蔽。

---

## 0.3 第三輪 Antigravity 實作問題回報與修正指示

**問題5：英文版不應出現中文字——已實際比對程式碼，找到以下確認的漏洞（非全部，已挑出可確認的）：**

逐一比對 `index.html` 用到的全部 214 個 `data-i18n` key，確認 `translations.js` 的 zh/en 兩個物件都有對應內容、且 en 內容不含中文字——**翻譯檔本身沒有問題**。漏洞出在 HTML 中有幾處中文是「直接寫死、完全沒有掛 `data-i18n`」，導致切換英文後這幾處仍固定顯示中文，需個別修正：

1. `<title>` 與 `<meta name="description">`（`<head>` 內）：目前固定寫死中文，切換語言不會更動瀏覽器標籤標題與 SEO 描述。修正：新增 i18n key（例如 `meta.title`／`meta.description`），並請 Antigravity 在 `switchLanguage()` 函式內額外加一段：切換時同步更新 `document.title` 與 `meta[name="description"]` 的 `content` 屬性。
2. §3.6 品質保證區塊，兩張 Before/After 卡片的標題 `<div class="compare-card-title">精密配合面製程比對 (配合精密加工)</div>` 與 `<div class="compare-card-title">大尺寸零件砂模鑄造比對 (配合精密加工)</div>`：目前完全沒有 `data-i18n` 屬性。修正：補上 `data-i18n="quality.compare1_title"` / `data-i18n="quality.compare2_title"`，並在翻譯檔新增對應 zh/en 文案（en 例如："Precision Fit Process Comparison"、"Large-Part Sand Casting Comparison"）。
3. §3.5 加工能力「機械加工」面板中，`<span class="detail-label">包含細項 / Sub-processes:</span>` 與 6 個 `<span class="cap-detail-badge">車床 Turning</span>`（銑床 Milling、鑽床 Drilling、磨床 Grinding、三軸加工 3-Axis、五軸加工 5-Axis）：這些是中英文寫在同一個字串裡、沒有掛 `data-i18n`，導致即使切到英文畫面，仍會同時看到中文字。修正：拆成純中文／純英文兩個版本並各自掛 `data-i18n`（例如 `technology.cap_panels.machining.sub_label` 及 `technology.cap_panels.machining.sub1`～`sub6`，en 版本僅含 `Turning`／`Milling`／`Drilling`／`Grinding`／`3-Axis Machining`／`5-Axis Machining`，不含中文）。

> 以上 4 類為已確認的具體漏洞；建議 Antigravity 額外用「英文模式 + 瀏覽器內搜尋中文字／或目視逐區掃過一次」做最終驗收，因為日後若再手動新增內容，仍可能出現同樣「寫死雙語字串、未掛 data-i18n」的問題。

**語言切換按鈕文字：** `app.js` 第 51 行 `langSwitchBtn.textContent = lang === 'zh' ? 'EN' : '中';` 中的 `'中'` 改為 `'TW'`，`'EN'` 維持不變。

**問題7：§3.8 設備規格與產能，移除重複的「製程組合能力」說明**

目前 §3.8 的「製程組合能力」4-icon 區塊（SLM & SLS 列印／CNC 精密加工／雷射切割／3D 掃描品檢）內容與其他區塊重複：「SLM & SLS 列印」「CNC 精密加工」「雷射切割」已包含在 §3.5 全方位加工與後處理能力的 8 個分類中；「3D 掃描品檢」也已出現在 §3.6 檢測能力網格的「3D掃描與三次元量測」。**指示：移除 §3.8 整個「製程組合能力」子區塊**（HTML 中的 `.eq-processes-wrap` 與其 4 個 `.process-item`），§3.8 只保留「列印尺寸規格表」。

**問題8：三方比較相關的標題統一格式為「（傳統製造、一般3D列印代工、AMPINTEC PLUS）」**

目前 `advantages.chart_title` 為「傳統製造 / 一般3D列印代工 / AMPINTEC PLUS 量化比較」（en: "Traditional Mfg / Generic AM / AMPINTEC PLUS Comparison"），分隔符號為 `/`。**指示：凡是並列呈現這三個名稱作為標題/敘述的地方，統一改為頓號＋括號格式：**
- 中：「（傳統製造、一般3D列印代工、AMPINTEC PLUS）量化比較」
- EN：「(Traditional Manufacturing, Generic AM Bureau, AMPINTEC PLUS) Comparison」

---

## 1. 設計風格方向（融合 EOS + Nikon SLM）

| 項目 | 規格 |
|---|---|
| 整體基調 | 工業感、精密、冷調科技。淺色區塊參考 EOS 的白底黑字乾淨感；重點區塊（Hero、Footer、數據強調區）採用 Nikon SLM 的深色背景＋金屬強調色，營造金屬列印的質感 |
| 背景色 | 淺色區塊 `#F7F7F8`／純白 `#FFFFFF`；深色區塊 `#0D0D0F`／`#141416` |
| 品牌墨色 | `#1A1A1A`（取自 Logo 的炭黑色） |
| 強調色 Accent | 金屬金 `#C9A227`（CTA 按鈕、底線、icon hover、數據強調文字），避免使用過於活潑的色彩，維持精密金屬質感 |
| 卡片/分隔 | 深灰漸層卡片 `linear-gradient(135deg,#2b2b2d,#161618)`，邊框 1px 金色 10% 透明度做細節點綴 |
| 字體 | 標題：Inter / Noto Sans TC Bold～ExtraBold，字距略寬、Eyebrow 標籤全大寫；正文：Inter / Noto Sans TC Regular |
| 圖像風格 | 高對比工業攝影（列印機特寫、金屬零件、剖面拓樸輕量化零件）、深色去背產品圖、細金色分隔線 |
| Logo | 使用 `Image/AMPINTEC LOGO.png`（深炭灰線稿，透明背景，淺色背景區塊直接套用；深色背景區塊需準備反白版本或加白色色板） |
| 互動 | CTA 按鈕 hover 微金光描邊；數字採用 count-up 動畫；案例卡片 hover 上浮陰影 |
| RWD | Desktop 優先（工業/B2B採購多為桌機瀏覽），需完整支援手機單欄堆疊 |

---

## 2. 網站架構（單頁式 + 錨點導覽）

```
Header（fixed, 半透明黑底）
 ├─ Logo
 ├─ 導覽：關於我們 #about｜核心技術 #technology｜品質保證 #quality｜材料 #materials｜
 │         產能設備 #equipment｜為什麼選擇我們 #advantages｜案例 #cases｜常見問題 #faq｜聯絡我們 #contact
 ├─ 語言切換 EN / 中
 └─ CTA 按鈕：「免費諮詢 / Get a Quote」（捲動至 #contact）

#hero        Hero 主視覺
#painpoints  我們解決的痛點
#about       品牌故事與創辦人
#technology  核心技術 / 服務範疇
#quality     品質保證與認證
#materials   材料選擇
#equipment   設備規格與產能
#advantages  為什麼選擇積層製造 / 為什麼選擇台灣製造
#cases       案例分享（產業趨勢案例 + AMPINTEC 實績）
#applications 還能為您做什麼
#faq         常見問題
#contact     聯絡我們（含表單）
Footer
```

---

## 3. 各區塊內容規劃（含中英文文案）

### 3.1 Header / Nav
- 中：關於我們、核心技術、品質保證、材料、產能設備、為什麼選擇我們、案例分享、常見問題、聯絡我們
- EN：About、Technology、Quality、Materials、Capacity、Why Us、Case Studies、FAQ、Contact
- CTA：中「免費諮詢」／EN「Get a Quote」

### 3.2 Hero `#hero`
- Eyebrow（金色小字）：中「SLM 金屬3D列印 代工製造服務」／EN「SLM METAL 3D PRINTING CONTRACT MANUFACTURING」
- 主標：
  - 中：「精密製造 × 庫存最佳化 × 客製化解決方案 × ESG 綠色製造」
  - EN：「Precision Manufacturing × Inventory Optimization × Customized Solutions × ESG Green Manufacturing」

> **2026/06/25 五次修訂（業主回報）：** 主標英文版「Precision Manufacturing × Inventory Optimization / Customized Solutions × ESG Green Manufacturing」目前與中文版套用同一個 `.hero-title` 字級（3.8rem）。中文字數少、單字緊湊，英文單字長度遠超中文，在同一字級下容易撐破版面、與 Hero 區其他元素（Eyebrow、副標、數據強調條）的左右邊界對不齊，視覺上「界線不一致」。
> **指示：** 英文模式下 `.hero-title` 字級需縮小（不可與中文沿用同一固定字級），確保英文標題兩行的左右邊界與 Eyebrow、副標、按鈕、數據強調條維持一致的版面寬度。
> **技術做法建議：** `app.js` 的 `switchLanguage()` 已會設定 `document.documentElement.lang = 'en'`，CSS 可直接用 `html[lang="en"] .hero-title { font-size: ...; }` 之類的語言屬性選擇器，針對英文模式單獨覆寫字級，不需要額外的 JS 邏輯。同樣的「中英文字數差異造成字級/版面不一致」問題，建議 Antigravity 順便檢查網站內其他「中英並列、共用同一字級」的大標題（如各區塊 `.section-title`）是否有類似風險，一併用語言屬性選擇器處理，避免之後逐一回報。
>
> **狀態：已實作。** 確認 Antigravity 已在 `style.css` 加入 `html[lang="en"] .hero-title { font-size: 2.4rem; letter-spacing: 0px; }`，並主動將同樣的做法套用到 `html[lang="en"] .section-title { font-size: 2.1rem; }`（採納了上方「順便檢查其他大標題」的建議）。此項目視為已解決，後續若仍有版面邊界回報，需重新確認具體位置。
- 副標：
  - 中：「結合金屬3D列印與傳統機械加工，提供從設計到量產的 MIT（Made in Taiwan）一站式解決方案」
  - EN：「Combining metal additive manufacturing with traditional machining — a Made-in-Taiwan, design-to-production solution.」
- 背景：深色工業攝影（SLM 列印機 / 列印中零件特寫），疊加漸層黑色遮罩
> **2026/06/25 四次修訂：** 移除「AS9100D／ISO 9001／Taiwan QMS 認證」這一項（與 §3.6 品質保證區塊的認證徽章列重複，且文字過長導致版面與其他3欄無法切齊），數據強調條由 4 欄改為 **3 欄**，並調整排序。

- 數據強調條（count-up 動畫，3 組，等寬 3 欄排列）：
  1. 交期最快 14 天起
  2. 公差精度 ±0.2 mm（媲美精密鑄造）
  3. 研發週期最高縮短 90%（3個月→2週）
- 兩顆 CTA：「了解服務 / Learn More」（次要，捲動 #technology）、「免費諮詢 / Get a Quote」（主要，金色，捲動 #contact）

### 3.3 我們解決的痛點 `#painpoints`
> 取材自簡報中業務痛點敘事（原簡報 p.20「實務案例分享」零件A/B/C/D），重寫為精簡標語卡，4 張卡片。

**卡片標語（4 張）：**

| 中文 | English |
|---|---|
| 只比較單價數字，卻忽略了治具、庫存與失敗成本的「總體成本」？ | Comparing sticker prices alone, while ignoring the total cost of tooling, inventory, and failure? |
| 市場銷量預估不準，模具攤提變庫存壓力？ | Sales forecasts miss, and amortized tooling becomes inventory burden? |
| 鑄造良率卡關，客訴成本比想像更高？ | Casting yield issues driving up hidden rework and complaint costs? |
| 工程師說「這樣一定要做」，老師傅卻說「做不到」？ | Engineers insist it's necessary, but the machinist says it can't be made? |

**互動規格（2026/06/25 二次修訂，澄清與 FAQ 的差異）：** 每張卡片預設只顯示上方標語＋展開 icon（＋/收合時轉為－）。**視覺樣式**比照 §3.12 FAQ 手風琴（icon 切換、展開動畫效果），但**互動邏輯不同於 FAQ**：FAQ 是一次只能展開一題的傳統手風琴（展開新的一題會自動收合其他題）；而這 4 張痛點卡片**每張完全獨立開關，互不影響**——點擊卡片1展開說明，不會收合卡片2/3/4，使用者可以同時展開全部4張，也可以只展開其中1張。請 Antigravity 務必確認：4 張卡片各自綁定獨立的 click 事件與獨立的展開狀態（不要共用同一組「只能開一個」的手風琴邏輯）。

**展開說明內容（4 組，對應原簡報 p.20 零件A～D）：**

1. **總體成本觀念**
   - 中：「傳統開模具動輒10萬元以上，且設計只要微調往往就要重新開模或修模，實際工期常因溝通、修改、甚至結構讓步而超出預期；若把治具、庫存攤提與失敗重工都算進去，『總體成本』往往比報價單上的數字高出許多。SLM 金屬3D列印免開模、單價透明，從總體成本來看更具優勢。」
   - EN：「Traditional tooling often costs NT$100k+, and even minor design tweaks can mean re-cutting or repairing the mold — real timelines often slip due to revisions or design compromises. Factor in tooling, inventory carrying cost, and rework, and the *total* cost is usually far higher than the quoted unit price. SLM metal 3D printing skips tooling entirely, with transparent per-part cost — a clear win on total cost.」
2. **市場預估與庫存壓力**
   - 中：「市場銷售量預估常常失準——以為會大賣、模具費用可以順利攤提，但實務上可能根本賣不動，或不確定能否賣得動；資本已經投入且交期冗長，導致庫存囤積與資金卡死。以3D列印依實際需求按件生產，免去囤貨賭注。」
   - EN：「Sales forecasts are often wrong — tooling cost gets justified assuming strong demand, but the product may not sell at all, or demand is uncertain. Capital is already committed and lead times are long, leaving you stuck with inventory and tied-up cash. With 3D printing, you produce to actual demand — no more betting on stockpiles.」
3. **鑄造良率與客訴成本**
   - 中：「一般鑄造毛胚即便驗證良率達8成，量產過程仍可能出現砂孔等缺陷，需要額外的人力處理，增加客訴與訂單流失的風險。SLM 金屬3D列印逐層熔融成型，內部品質更可控，降低不良率帶來的隱性成本。」
   - EN：「Even when conventional casting validates at 80% yield, mass production can still produce sand-hole defects — requiring extra manpower and driving up complaint and lost-order risk. SLM metal 3D printing builds layer by layer with controllable internal quality, reducing the hidden cost of defects.」
4. **設計可行性與老師傅經驗斷層**
   - 中：「工程師、設計師認為『這樣一定要做』，現場老師傅卻可能直接說『做不到』——傳統刀具與夾治具有幾何可達性限制，加上資深老師傅逐漸退休，經驗傳承出現斷層。SLM 金屬3D列印不受刀具可達性限制，能直接實現複雜幾何與內部流道，把設計圖原汁原味做出來。」
   - EN：「Engineers may insist a feature 'has to be there,' while the machinist says it can't be made — traditional tooling has real geometric reach limits, and experienced machinists are retiring with no one to replace that know-how. SLM metal 3D printing isn't constrained by tool reachability, so complex geometries and internal channels can be built exactly as designed.」

**結尾標語（2026/06/25 二次修訂：原版過於敘事，改為精簡有力的信心喊話／slogan，非說明文字）：**
- 中：「免開模、零妥協，把不可能變成可面市的零件。不只3D列印，更給您最適合的製程方案。」
- EN：「No tooling, no compromise — we turn the impossible into market-ready parts. More than 3D printing — the right process, built for you.」

### 3.4 品牌故事 `#about`
> 業主指示：創辦人姓名更正為「黃博正 Bo-Jeng Huang」、「邱楷勛 Kai-Hsun Chiu」；文案不需逐字對應簡報原文，改寫為更商業化、更專業的敘述。**2026/06/25 二次修訂：**時間軸第一階段不應以「學生時期」等青澀經驗作為敘事脈絡，改以雙方在機械工程與精密製造領域的既有專業歷練為起點。

時間軸（Timeline，3 個節點）：
- **2015** 中：深耕機械產品工程與精密製造領域多年，看準積層製造正在改寫產業遊戲規則，攜手創業投入塑膠3D列印技術服務，協助客戶將設計概念快速轉化為實體驗證，奠定日後跨足金屬積層製造的技術基礎。（2026/06/25 三次修訂：移除「創辦人黃博正與共同創辦人邱楷勛」具名敘述，姓名留給下方創辦人卡片介紹即可，時間軸以團隊/公司為敘事主體。）／EN：Drawing on years of hands-on experience in mechanical product engineering and precision manufacturing, the team recognized that additive manufacturing was rewriting the industry's rules, joining forces to launch a plastic 3D printing service — helping clients turn design concepts into physical validation parts, and laying the technical foundation for the later move into metal additive manufacturing.
- **2018** 中：隨著航太產業帶動積層製造邁向標準化製程的全球趨勢，團隊正式投入金屬3D列印技術的應用設計與設備開發，建立起金屬列印的核心工程能力。／EN：As aerospace-led adoption pushed additive manufacturing toward becoming a standard industrial process worldwide, the team committed to metal 3D-printing application design and equipment development — building the core engineering capability behind today's metal AM services.
- **2025** 中：正式成立積層製造品牌 AMPINTEC PLUS，整合金屬3D列印與傳統機械加工，提供 MIT（Made in Taiwan）一站式設計製造解決方案，並開始布局國際市場。／EN：Officially launched AMPINTEC PLUS, integrating metal additive manufacturing with traditional machining to deliver a complete, Made-in-Taiwan design-to-production solution — and began expanding into international markets.

創辦人卡片（2 張）：
- **黃博正 Bo-Jeng Huang｜創辦人 Founder**：中「擁有10年以上機械產品工程與專案管理經驗，曾領導團隊開發超高速氫能設備。是少數將 SLM 金屬3D列印應用於超高速旋轉機械的工程師，協助客戶降低20%碳排放；並透過積層製造扣件重新設計，將半導體產線維護效率提升200%。2025年創立 AMPINTEC PLUS，致力於推動金屬積層製造的商業化應用。」／EN「Bo-Jeng brings over a decade of mechanical product engineering and project management experience, including leading the development of ultra-high-speed hydrogen equipment. He is among the few engineers worldwide to apply SLM metal 3D printing to ultra-high-speed rotating machinery, helping clients cut carbon emissions by 20%, and redesigned AM fasteners that improved semiconductor line maintenance efficiency by 200%. He founded AMPINTEC PLUS in 2025 to drive the commercialization of metal additive manufacturing.」
- **邱楷勛 Kai-Hsun Chiu｜共同創辦人 Co-Founder**：中「具備北非汽車自動化專案，以及中國、東南亞模具產線開發的跨國實務經驗，曾任全球前三大伺服器與筆電 ODM 廠資深機械工程師，深耕精密製造與供應鏈管理。2025年共同創立 AMPINTEC PLUS，負責整合傳統製造工藝與國際客戶開發。」／EN「Kai-Hsun brings cross-border experience from automotive automation projects in North Africa and tooling production line development in China and Southeast Asia, along with a tenure as Senior Mechanical Engineer at a top-three global server and laptop ODM. His expertise spans precision manufacturing and supply chain management. He co-founded AMPINTEC PLUS in 2025, leading the integration of traditional manufacturing processes and international client development.」

### 3.5 核心技術 / 服務範疇 `#technology`
三欄式服務流程卡片（對齊 PDF p.7）：
1. **創意構思 Model Design** — 中「跳脫傳統設計限制，將想法化為實體」／EN「Leap from traditional design constraints to make ideas real」
2. **SLM 列印製造 SLM Production** — 中「SLM 金屬3D列印機，可信賴的精密製程」／EN「Trustworthy, precise production with SLM metal 3D printers」
3. **產品分析 Product Analysis** — 中「品質性能分析，確保產品表現」／EN「Quality performance analysis to ensure product reliability」

> **2026/06/25 二次修訂：** 加工能力列改為「可點選切換細項」的分類設計，取代單純並列所有細項的 icon 列，規格如下。

**加工能力頂層分類（8 個可點選的分類 badge，單選、點選後下方細項面板切換內容）：**

中：機械加工、雷射、水刀、拋光、焊接、鑄造、鍛造、3D列印
／EN：Machining, Laser, Waterjet, Polishing, Welding, Casting, Forging, 3D Printing

- 「機械加工」為原本「車、銑、刨、鑽、磨、三軸/四軸/五軸加工」等多個獨立 badge 的**統一整合項**：取消「刨 Planing」這一項細項（不再保留、不在細項面板中出現），其餘車、銑、鑽、磨、三軸、五軸加工整併為「機械加工」分類下的細項。
- 預設選中／頁面載入時顯示的分類為「**3D列印**」，下方細項面板顯示原有的 4 張列印技術卡（FDM、SLA、SLS、SLM／LPBF／DMLS，內容沿用下方「列印技術四大類」文案）。
- 點選其他分類 badge（如「機械加工」）時，下方細項面板**切換**為該分類對應的細項說明（非疊加顯示），點選效果與既有 `.faq-question` / `.painpoint-card` 的 active 樣式邏輯一致（選中的 badge 加上 active 樣式，如底色/底線變金色）。

**各分類細項面板內容（點選後顯示）：**

1. **機械加工 Machining**（細項：車床 Turning、銑床 Milling、鑽床 Drilling、磨床 Grinding、三軸加工 3-Axis、五軸加工 5-Axis）
   - 中：「結合車、銑、鑽、磨等傳統機械工法，並提供三軸至五軸數控加工，針對列印後的零件進行精密尺寸修整與表面處理。」
   - EN：「Combining turning, milling, drilling, and grinding with 3 to 5-axis CNC machining for precision dimensional finishing and surface treatment of printed parts.」
2. **雷射 Laser**
   - 中：「雷射切割／雷射熔接，適合薄板材料的高精度切割與局部熱處理應用。」
   - EN：「Laser cutting and welding for high-precision cutting and localized heat treatment of sheet materials.」
3. **水刀 Waterjet**
   - 中：「水刀切割不受材料硬度與熱影響限制，適合厚板與複合材料的精密切割。」
   - EN：「Waterjet cutting is unaffected by material hardness or heat, ideal for precision cutting of thick plates and composite materials.」
4. **拋光 Polishing**
   - 中：「機械拋光與表面處理，可達 Ra 0.1～0.01 µm 等級的鏡面光澤。」
   - EN：「Mechanical polishing and surface finishing achieving mirror-grade Ra 0.1–0.01 µm surface roughness.」
5. **焊接 Welding**
   - 中：「精密焊接修補與組件接合，確保結構強度與密合度。」
   - EN：「Precision welding for repair and component joining, ensuring structural strength and fit.」
6. **鑄造 Casting**
   - 中：「傳統砂模／精密鑄造工藝，適合大尺寸零件或高量產需求的成本最佳化方案。」
   - EN：「Traditional sand casting and investment casting for large parts or cost-optimized high-volume production.」
7. **鍛造 Forging**
   - 中：「鍛造工藝強化金屬內部結晶結構，提升零件的機械強度與疲勞壽命。」
   - EN：「Forging refines internal grain structure to enhance mechanical strength and fatigue life.」
8. **3D列印 3D Printing**（細項：FDM、SLA、SLS、SLM／LPBF／DMLS，預設顯示）

列印技術四大類（內容對齊原簡報 p.8 Printer Spec.，為上方「3D列印」分類的細項內容）：
- FDM 塑膠積層列印 / FDM Plastic Additive Manufacturing — 中「適合前期外觀驗證、快速打樣與治具製作，低成本高效能。」／EN「Ideal for initial physical verification, rapid prototyping, and fixture making at low cost.」
- SLA 光固化樹脂列印 / SLA Photosensitive Resin Printing — 中「高表面細緻度，適合外觀打樣與精密驗證模型，最大成型尺寸 1400×700×600mm。」／EN「High surface fidelity for appearance prototypes and precision verification models, max build size 1400×700×600mm.」
- SLS 尼龍碳纖列印 / SLS Nylon-PA CF Printing — 中「高強度尼龍材料，適合功能性測試與高強度耐用零件，最大成型尺寸 200×400×400mm。」／EN「High-strength nylon material for functional testing and durable parts, max build size 200×400×400mm.」
- SLM／LPBF／DMLS 金屬列印 / SLM／LPBF／DMLS Metal Printing — 中「直接熔融金屬粉末，適合高強度、輕量化、複雜內部流道與航太/半導體零件，最大成型尺寸 300×300×300mm。」／EN「Direct melting of metal powders, best for high-strength, lightweight, complex channels, and aerospace/semi parts, max build size 300×300×300mm.」

### 3.6 品質保證與認證 `#quality`
- 認證徽章列：**AS9100D**、**ISO 9001**、**Taiwan QMS**

> **2026/06/25 四次修訂：** 「公差精度顯著提升」的介紹內容全面替換，不再使用「傳統製程±0.8mm／傳統砂模鑄造±1.7mm → SLM±0.2mm」的 Before/After 框架，改為以下兩張獨立說明卡：

- **卡片1／列印薄壁能力**
  - 中：「一般列印成型厚度 1mm；AMPINTEC PLUS 最薄可達 0.5mm」
  - EN：「General printing wall thickness: 1mm; AMPINTEC PLUS: as thin as 0.5mm」
- **卡片2／公差精度**
  - 中：「媲美精密鑄造，公差 ±0.2mm」
  - EN：「Rivals precision casting — tolerance of ±0.2mm」
  - 備註小字（沿用）：中「*根據尺寸與GD&T要求而變化」／EN「*Varies by part size and GD&T requirements」

> **對應 HTML 明確規格：**
> - **卡片1（薄壁能力）維持 Before/After 雙欄結構**：`quality.p_before1` = 「一般列印成型厚度 1mm」／"General printing: 1mm"；`quality.p_after1` = 「AMPINTEC PLUS 最薄 0.5mm」／"AMPINTEC PLUS: as thin as 0.5mm"。
> - **卡片2（公差精度）改為單一數值呈現，不是 Before/After 比較**：移除 `val-before` 欄位（即不使用 `quality.p_before2`，HTML 中該 `.comp-val.val-before` 區塊整個刪除），只保留一個置中的數值 `quality.p_after2` = 「媲美精密鑄造，公差 ±0.2mm」／"Rivals precision casting — tolerance of ±0.2mm"。
> - 兩張卡片皆不應再出現「±0.8mm」「±1.7mm」這類舊版傳統公差數字。
> - §0.3 新增的 `quality.compare1_title`／`quality.compare2_title` 標題同步改為「薄壁列印能力 / Thin-Wall Printing」、「公差精度 / Tolerance」。
- 檢測能力 icon 網格（6項）：金相分析 Metallographic Analysis、拉伸強度分析 Tensile Strength Analysis、粒徑分析 Particle Size Analysis、流動率分析 Flow Rate Analysis、3D掃描與三次元量測 3D Scanning & CMM、硬度分析 Hardness Analysis

### 3.7 材料選擇 `#materials`
材料卡片網格（6張，icon + 名稱，對齊原簡報 p.9 Metal Powder Selection）：
- 鋁合金 Aluminum Alloy
- 鎳合金 Nickel Alloy
- 鐵基合金 Iron-Based Alloy
- 銅合金 Copper Alloy
- 鈦合金 Titanium Alloy
- 客製合金 Customized（依客戶需求客製粉末成分）

> **2026/06/25 修訂（業主指示）：** 移除「(含 Scalmalloy®)」字樣，鋁合金卡片只顯示「鋁合金 Aluminum Alloy」即可。對應程式碼：`translations.js` 的 `materials.m1`（zh/en 皆有此字樣，含 `<br><small>(含 Scalmalloy®)</small>` 的 HTML 子標籤，需整段移除，只保留主名稱字串）。

下方補充：中「3D列印金屬材料與傳統金屬材料機械性質對照表，詳細數據歡迎透過下方表單索取」／EN「Mechanical property comparison between AM and conventional metals available on request — use the contact form below.」
> 此處刻意導流到 Contact 表單，作為 Lead Magnet。

### 3.8 設備規格與產能 `#equipment`
列印尺寸規格表：

> **2026/06/25 三次修訂：** SLM 金屬列印尺寸由 248×298×290mm 修正為 **300×300×300mm**（對齊現行機台實際規格），此數字異動需同步更新 §3.5 中「SLM／LPBF／DMLS 金屬列印」描述內的最大成型尺寸。

| 設備 Type | 列印尺寸 Build Size (L×W×H, mm) |
|---|---|
| SLM 金屬 SLM Metal | 300 × 300 × 300 |
| SLS 尼龍碳纖 SLS Nylon-PA CF | 200 × 400 × 400 |
| SLA 光敏樹脂 SLA Photosensitive | 1400 × 700 × 600 |

> **2026/06/25 五次修訂：**「製程組合能力」4-icon 子區塊（原內容：SLM & SLS 列印、CNC 加工、雷射切割、3D 掃描品檢）已整段移除，理由與規格見 §0.3 問題7（與 §3.5 加工能力分類、§3.6 檢測能力網格重複）。§3.8 目前只保留上方「列印尺寸規格表」一項內容。

> **2026/06/25 更新：「未來產能規劃」子區塊整體移除，不在公開網站呈現。**（原內容為自研列印機建置計畫，簡報更新版時間點已調整為 2027 Q1，僅供業主內部參考，不寫入網站文案。）

### 3.9 為什麼選擇積層製造／為什麼選擇台灣製造 `#advantages`
**(a) 積層製造優勢（6 icon 卡）**
中：1.交期更快 2.降低加工成本 3.快速研發驗證與設計迭代 4.免開模具成本 5.降低碳足跡 6.傳統製造有顯著的工具、時間與失敗成本
EN：1. Faster lead time 2. Lower machining cost 3. Rapid R&D validation & iteration 4. No tooling cost 5. Lower carbon footprint 6. Traditional manufacturing carries significant tooling, time, and failure costs

**(b) 傳統製造／一般3D列印代工／AMPINTEC PLUS 三方量化比較條狀圖**（2026/06/25 由二方對比表改版為三方比較條狀圖，視覺與互動比照下方 (c) 既有的「研發週期縮短案例」條狀圖做法：標籤＋橫向進度條，進入視口時以動畫展開寬度）

> 數據來源：基礎兩方（傳統製造／3D列印為基礎製造）數值沿用原簡報 p.18「Traditional vs. Additive Manufacturing-Based Reshoring」圖表（來源：3D Systems white paper，1～10分相對量級，分數方向依各指標脈絡，部分指標「越低越好」、部分「越高越好」，見下表標註）；「一般3D列印代工」為業主補充指示採用之第三方比較，依產業常見認知（多數代工廠僅提供列印、不含傳統機械加工整合、客製彈性與成本效益略低於 AMPINTEC PLUS）合理推估，**圖表需標註「示意性產業比較」**，避免被誤認為具名競品的實測數據。

| 比較指標（方向） | 傳統製造 Traditional | 一般3D列印代工 Generic AM Bureau | AMPINTEC PLUS |
|---|---|---|---|
| 治具/夾具成本（越低越好） | 9 | 2 | 2 |
| 交貨時間（越低越好） | 8 | 3 | 2 |
| 人工成本（越低越好） | 9 | 5 | 4 |
| 最小訂購量（越低越好） | 9 | 2 | 1 |
| 庫存與倉儲成本（越低越好） | 8 | 3 | 2 |
| 環境適應性／客製彈性（越高越好） | 3 | 7 | 9 |
| 成本效益（中小量，越高越好） | 3 | 6 | 9 |
| 製程整合度（3D列印＋傳統機械加工，越高越好） | 6 | 4 | 10 |

- 圖表型式：每一指標一列，列內並排 3 條橫向色條（傳統＝灰、一般3D列印代工＝銀/淺金、AMPINTEC PLUS＝主色金），條長 = 分數×10%，並於圖表上方加圖例（色塊＋名稱）。
- 「製程整合度」指標用於呼應 §3.3 結尾標語與 §3.10(b) 提到的「AMPINTEC 同時具備3D列印與傳統機械加工整合能力」，是 AMPINTEC PLUS 相對一般3D列印代工廠的核心差異化優勢，建議特別標示或加註小字說明。

**(c) 研發週期縮短案例**：中「特殊流道設計：3個月 → 2週」／EN「Special flow-path design: 3 months → 2 weeks」（既有條狀圖維持不變，作為 (b) 的視覺設計參考範本）

**(d) 為什麼選擇台灣製造（精簡化、移除原始簡報中的內部敏感金額，改以優勢分類呈現，避免對特定地區/廠商造成負面比較爭議）**

| 比較面向 | 海外代工常見風險 | AMPINTEC PLUS（台灣製造） |
|---|---|---|
| 物流與報關 | 流程繁瑣、時間長 | 國內快速到貨 |
| 工程溝通 | 時差/語言隔閡，全檢風險高 | 同語言即時對接，降低誤差 |
| 交期穩定性 | 延誤機率較高 | 透明排程、即時更新 |
| 智財與保密 | 技術外流風險 | 受台灣法律保障，可簽署 NDA |

> ⚠️ 內容提醒：原始 PDF（p.31）含具體報價金額與「中國製造」的內部成本比較數字，屬內部銷售教育用途。公開網站建議改用上表「風險分類」呈現方式，避免地緣敏感與可能的事實爭議；若客戶堅持要呈現具體數字，需先請業主書面確認金額來源與授權公開。

### 3.10 案例分享 `#cases`
**分兩個子區塊，務必清楚標示來源/性質，避免誤導為 AMPINTEC 自製或暗示合作關係：**

**(a) 產業趨勢案例 Industry Benchmark Cases**（標註「公開產業案例，非本公司製造，僅作技術趨勢說明」／"Public industry examples cited for technology context — not manufactured by AMPINTEC PLUS"）

> **2026/06/25 更新：靜態示意圖改為「可滑鼠拖曳旋轉的 3D 模型」展示**，取代原本的靜態背景圖卡片，讓客戶能直接在畫面上旋轉相似造型的模型，更直覺呈現零件的幾何複雜度。

- SpaceX Raptor 引擎：推力/重量比案例，來源標註 YouTube/公開資料 → 3D 展示造型建議：火箭引擎噴嘴／燃燒室（迴轉體造型，由噴嘴輪廓旋轉生成）
- LEAP71：火箭推進器（20kN推力）與熱交換器，材料 CuCrZr → 3D 展示造型建議：渦輪/葉輪造型（中心輪轂＋放射狀扭曲葉片）
- nTop × Lions Racing Team：Formula Student 賽車零件，材料 鋁合金/鈦合金 → 3D 展示造型建議：拓樸優化輕量化支架／桁架結構（鏤空格狀框架）
- Apple Watch：鈦合金應用 → 3D 展示造型建議：圓角錶殼造型（簡化的 rounded-box 殼體）

**技術做法建議（供 Antigravity 評估，非強制規格）：**
- 目前手上僅有簡報中的零件「圖片」，沒有實際 CAD/3D 模型檔（.step/.stl/.glb），故 4 個展示造型須以「程式生成的簡易幾何示意模型」呈現（如上方造型建議），並在卡片上清楚標註「示意3D模型」字樣，待業主日後提供實際零件 3D 檔案後再置換為真實模型。
- 函式庫建議採 Google `<model-viewer>`（透過 CDN 載入之網頁元件，不需安裝在本機，原生支援滑鼠拖曳/觸控旋轉與縮放）；若選擇以程式即時生成幾何（而非載入固定模型檔），則需改用 Three.js（同樣經 CDN 載入）在頁面內直接繪製幾何並自行實作拖曳旋轉。兩種函式庫互斥，Antigravity 可依實作便利性二選一，但需採其中之一，不應額外安裝本機套件。
- 每個 3D 展示區塊建議加入操作提示文字（如「🖱️ 拖曳旋轉」／"Drag to rotate"）與「示意圖，非實際合作案例」的標註，呼應本節最上方的來源聲明。

**(b) AMPINTEC 實績 Capability Highlights**（可標示為自家能力展示）

> **2026/06/25 更新：改用簡報中真實的案例圖片/照片**，取代純文字敘述卡片，增加可信度。

- 半導體產業：組裝時間由 60–120 秒縮短至 3–5 秒（每批3000件）／Assembly time reduced from 60–120s to 3–5s per 3,000-pc batch → 配圖：原簡報 p.27「CASE1」工程塑膠扣件 3D 渲染圖（灰色零件、淺綠底）
- 精密產業：超光滑鏡面處理 Ra 0.1～0.01 µm／Ultra-smooth mirror finish Ra 0.1–0.01 µm → 配圖：原簡報 p.28 黃麻布上的鏡面拋光金屬零件實拍照
- 微孔道加工：直徑<1mm、深度90mm 鈦合金孔／Sub-1mm diameter, 90mm-deep channel in titanium alloy → 配圖：原簡報 p.27「CASE4」鈦合金支架實拍照（含 <1mm 孔、90mm 深度標註）

> ⚠️ 此區塊上線前建議業主確認：(b) 中的案例是否為 AMPINTEC 實際交付案例（可標公司/產業名稱則加分），若涉及客戶保密，僅可用匿名化敘述；上述配圖出處頁碼依業主提供之簡報更新版頁序（p.27、p.28）標註，Antigravity 製作時請從該簡報直接擷取對應圖片區域，去除原圖中的文字標籤後使用。

### 3.11 還能為您做什麼 `#applications`
4 張卡片：
- 展覽用品快速製作 Use in Exhibitions
- 快速樣品 Quick Sample
- 產品升級改良 Product Upgrading
- 物料需求規劃 Material Requirements Planning（MRP 顧問服務）

### 3.12 常見問題 `#faq`
> ⚠️ 原始簡報僅有「Q&A」標題、無實際內容，以下為**草稿問答**，需業主確認/修改後才能正式上線。

1. **Q：最小訂購量是多少？／What's the minimum order quantity?**
   A：SLM列印不受傳統模具限制，單件即可生產，依零件複雜度與材料報價。
2. **Q：交期大概多久？／What's the typical lead time?**
   A：原型約14–30天，正式量產依數量與後處理需求評估，下單前提供明確排程。
3. **Q：圖檔需要什麼格式？／What file formats do you accept?**
   A：建議提供 STEP/STP 或 IGES 格式，亦可協助評估 2D 圖面轉換。
4. **Q：機密圖檔是否安全？／Is my design data kept confidential?**
   A：台灣本地製造、受台灣法律保障，可簽署 NDA 保密協議。
5. **Q：可以接受小量客製或試做嗎？／Do you accept small-batch or prototype orders?**
   A：可以，AMPINTEC PLUS 特別適合中小量客製化與快速試做驗證。

### 3.13 聯絡我們 `#contact`（依業主指定欄位）

**左側：直接聯絡資訊**
- Email：ampintecplus@gmail.com
- LINE ID：srryy830427
- 中：「填寫表單，我們將在1–2個工作日內回覆」／EN：「Submit the form and we'll respond within 1–2 business days.」

**右側：聯絡表單（中英雙語標籤，依右上角語言切換顯示對應語言；以下為欄位規格，純前端，送出後顯示成功提示，不串接後端）**

| # | 欄位（中） | Field (EN) | 輸入類型 | 必填 |
|---|---|---|---|---|
| 1 | 公司名稱 | Company Name | text | 必填 Required |
| 2 | 姓名 | Name | text | 必填 Required |
| 3 | 職稱 | Job Title | text | 選填 Optional |
| 4 | Email | Email | email（含格式驗證） | 必填 Required |
| 5 | 聯絡電話 | Phone Number | tel | 必填 Required |
| 6 | 產品需求敘述 | Project / Requirement Description | textarea（多行，建議4–6行） | 必填 Required |

額外建議（非業主硬性要求，建議加入但可選）：
- 個資同意 checkbox：中「我同意 AMPINTEC PLUS 依本表單內容與我聯繫」／EN「I agree that AMPINTEC PLUS may contact me based on the information provided.」（必勾選才能送出）
- 送出按鈕：中「送出諮詢需求」／EN「Submit Inquiry」
- 前端驗證：Email 格式、電話僅數字/+-空格、必填欄位空白提示
- 送出後行為（第一版規格）：表單清空 + 顯示成功訊息（中「感謝您的諮詢，我們將盡快與您聯繫！」／EN「Thank you for your inquiry — we'll be in touch shortly!」），**不發送任何網路請求**，純前端模擬。

### 3.14 Footer
- Logo + Slogan（中「精密製造 × 庫存最佳化 × 客製化解決方案 × ESG 綠色製造」）
- 導覽連結重複（錨點捲動）
- 聯絡資訊：Email、LINE ID
- 認證徽章小圖：AS9100D／ISO 9001／Taiwan QMS
- Copyright：© 2026 AMPINTEC PLUS. All rights reserved.

---

## 4. 素材清單

| 素材 | 路徑 | 用途 |
|---|---|---|
| Logo | `AGCODE-TEST/Image/AMPINTEC LOGO.png` | Header／Footer（深色背景區塊需準備白色版，建議用去色或描邊處理） |
| 簡報全文 | `AGCODE-TEST/AMPINTEC PLUS– Sustainable & Cost-Effective Manufacturing with 3D Printing-Business F&GC.pdf` | 內容來源，已整理進本文件，Antigravity 無需重新解析 PDF |
| 工業/列印機照片、零件渲染圖、案例圖片 | **部分可用** | 更新版簡報 p.27（CASE1～4 渲染圖與實拍照）、p.28（鏡面拋光實拍照）已有可直接使用的真實圖例，列入 §3.10(b)；其餘區塊（Hero 背景、品牌故事等）仍缺乏正式商用照片，建議業主提供實際產線/零件照片，或先用免版權工業素材/AI生成示意圖佔位 |

---

## 5. 技術建議（供 Antigravity 參考，非強制）

- 純前端、無需框架的單頁也足夠（HTML/CSS/JS + 平滑滾動錨點），但若考慮未來擴充（i18n、表單串接後端），建議用輕量框架（如 Vite + React，或 Next.js 靜態匯出）較好維護。
- 中英文切換：建議用簡單的 i18n JSON（`zh.json` / `en.json`）+ 切換時更新 `data-i18n` 屬性內容，避免整頁重新載入。
- RWD 斷點：≥1200px Desktop、768–1199px Tablet、<768px Mobile（單欄堆疊，Header 漢堡選單）。
- 表單：使用原生 HTML5 驗證（`required`、`type=email`、`pattern`）+ JS 顯示成功訊息，**第一版不需後端/API**。
- 動畫：數字 count-up、區塊淡入可用輕量函式庫（如 AOS、或自寫 IntersectionObserver），避免過度炫技影響工業/B2B的專業感。

---

## 6. 上線前需業主再次確認的事項（風險提醒彙整）

1. §3.9(d) 台灣製造優勢比較：原簡報含具體報價金額與「中國製造」字樣，本規劃已改寫為風險分類呈現，**避免地緣敏感與未授權數字外流**，業主可決定是否要恢復原始具體數字。
2. §3.10(a) 產業趨勢案例（SpaceX／LEAP71／Apple）：**非 AMPINTEC 自製**，網站文案務必清楚標示「產業案例參考」並附來源，避免暗示與該品牌有合作或承製關係。
3. §3.10(b) AMPINTEC 實績案例：需業主確認數據真實性與是否可公開客戶/產業名稱。
4. §3.12 FAQ：目前為草稿，需業主審閱修改後才能正式發佈。
5. 缺少正式商用照片／影片素材，需業主後續提供或授權使用。
6. §3.10(a) 4 組「示意3D模型」目前無實際 CAD/3D 模型檔，僅為程式生成的簡易幾何示意；待業主提供實際零件的 3D 模型檔案（.step/.stl/.glb 皆可）後，需置換為真實模型。
7. §3.9(b) 三方比較條狀圖中「一般3D列印代工」之分數為依產業常見認知推估的示意性數據，非具名競品實測數據；圖表需標註「示意性產業比較」，若業主有具體競品資料欲呈現，需另行確認來源與授權。

---

本規劃文件已涵蓋業主要求的兩個重點：(1) 調用 AGCODE-TEST 簡報資料完整編排進各區塊；(2) 預留中英雙語聯絡表單，欄位為公司名稱、姓名、職稱、Email、聯絡電話、產品需求敘述。下一步可交付 Antigravity 依本文件進行頁面開發。
