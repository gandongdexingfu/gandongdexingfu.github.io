# AGENTS.md：作品網站維護交接

給接手維護的 AI 代理（Codex 等）與人類維護者。開工前先讀完本檔，再讀 `README.md`。
最後更新：2026-10-22（以 main = `591b936`、PR #29 合併後為基準；最新狀態以 `git log origin/main` 為準）。

---

## 0. 站長的工作規則（必守）

1. **一律用中文回覆**（站長是台灣人；網站介面文字用繁體中文）。
2. **先問清需求，再動手**。改動前說明做法；做不到或沒把握，先做風險評估（可能的問題、替代方案、預估耗時），由站長決定。
3. **站長的要求有明顯錯誤時，必須指正**，並先提出最優方案，雙方確認後再執行。
4. **精品標準**：細節越細越好；任何「少做、簡化、改用近似」的取捨，動手前先告知；交付時列出「沒做到的部分」。
5. **每個改動開一個新分支、一個新 PR**，不要往已開的 PR 追加 commit。PR 描述寫清楚改了什麼、要站長在自己電腦上測什麼。由站長按 Merge。
6. 不往站長的電腦安裝無關軟體，不產生不必要的檔案。
7. 回覆要簡潔。
8. **一件事一個工作階段**：站長的需求和目前這個工作階段的任務無關，或者目前分支的 PR 還沒合併時，先提醒站長點左側欄倉庫旁的＋開新的工作階段，不要在原本的工作階段裡接著做。同一件事的追問和修正可以留在原本的工作階段。

## 1. 網站是什麼

- 網址：https://gandongdexingfu.github.io（GitHub Pages，`main` 分支根目錄直接發布，`.nojekyll`）。
- 用途：展示站長「每一幀都由代碼畫成」的短片作品；目前給大眾看，之後歡迎合作邀約。
- **純靜態網站，沒有建置步驟**：HTML、CSS、原生 JavaScript（不用框架、不用 npm）。唯一的產生器是 Python 腳本 `tools/build_pages.py`。
- 每支片的代碼、做法、素材都在另一個倉庫 **gandongdexingfu/lemo-opuscar**（`mine/films/<片名>/`）；本站只放網頁版影片和展示頁。

## 2. 目前收錄（5 支，`works.json` 的順序＝最新在前）

| id | 標題 | 畫幅 | 風格標籤 | 線稿章節圖（figure） | 片窗縮圖（thumb） |
|---|---|---|---|---|---|
| csk-ia | CSK-IA 標準試塊（Fig 1.5） | 16:9 | 等角拆解 | 無 | block |
| chongqing-hotpot | 重慶火鍋（Fig 1.4） | 9:16 | AI 擬人 | hotpot | hotpot |
| iphone-2007 | 初代 iPhone | 16:9 | 等角拆解 | 無 | phone |
| taiwan-sparrow | 小麻雀追袋記 | 9:16 | 照片塗鴉 | board | sparrow |
| light-evolution | 光的演變 | 9:16 | 寫實演變 | lamps | lamp |

- 《重慶火鍋》的畫面是 MiniMax 圖生視頻（非代碼畫面），所以有 `tagline`、`credit` 改寫分享標題和頁尾。
- 素材下載連結：iphone-2007、taiwan-sparrow、light-evolution 用 lemo-opuscar 的 **Release**；csk-ia、chongqing-hotpot 用 lemo-opuscar 的 **分支** `assets/csk-ia`、`assets/chongqing-hotpot`（雲端代理無權建立 Release，才用分支代替）。2026-10-22 已逐一核對，全部有效。

## 3. 檔案地圖

```
index.html                 首頁：開場捲動敘事＋作品區（幻燈機／手機卡片）＋關於。首頁的互動邏輯寫在檔尾的 <script>
works.json                 唯一的資料來源（首頁、作品頁都讀它）
works/<id>/index.html      作品頁，由 tools/build_pages.py 產生 —— 不要手改
404.html                   空片盤（reel 線稿）
assets/site.css            全站樣式與色票（:root 變數，含深色模式）
assets/site.js             共用工具：SITE.ratio（畫幅規則）、影片指紋元件、plateHTML…
assets/tilt.js             懸浮傾斜
assets/figures.js          把 hairline 線稿掛到頁面（FIG.mount / FIG.load），讀數翻成中文
assets/hairline/kernel.js  hairline 引擎（MIT，© Lucas Marques）—— 原封不動，授權見同資料夾 LICENSE
assets/hairline/*.js       本站自己畫的線稿：frame（首頁一幀的五層）、carousel（幻燈片轉盤＋片窗縮圖 PICS）、
                           board（小麻雀）、lamps（光的演變）、hotpot（重慶火鍋）、reel（404）
media/<id>.mp4|.jpg|.webp  網頁版影片、封面
media/fingerprints.json    影片指紋（音量波形＋安靜段），由 tools/fingerprint.py 產生
media/bts/*.webp           作品頁「代碼 → 畫面」配圖（720×900）
media/og.jpg               首頁分享卡片
tools/build_pages.py       works.json → works/<id>/index.html
tools/fingerprint.py       media/<id>.mp4 → fingerprints.json
```

## 4. `works.json` 欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| id | ✓ | 網址與檔名用，英文小寫加連字號 |
| fig | ✓ | 圖號，例 `Fig 1.5` |
| style | ✓ | 風格標籤；首頁篩選按鈕自動從這裡長出來 |
| date, title, en, blurb | ✓ | 日期（`2026.10`）、中文標題、英文標題、簡介 |
| ratio | | 畫幅，`"16:9"`、`"1:1"`、`"4:5"`、`"2.39:1"` 都行；不寫＝9:16。寬高比 >1.25 算橫版、0.8–1.25 方形、其餘直版（`site.js` 與 `build_pages.py` 同一套規則，改一邊要改兩邊） |
| spec | ✓ | `[[名稱, 值], …]` 規格表 |
| chapters | ✓ | `[[秒數, 章節名], …]` |
| how, code, release | ✓ | 做法、原始碼、素材下載的連結（通常指向 lemo-opuscar） |
| bts | ✓ | 三組「代碼 → 畫面」：`title, note, file, code, img, at`（img＝`media/bts/<img>.webp`，at＝影片秒數） |
| thumb | | 轉盤片窗的線稿縮圖名，要在 `assets/hairline/carousel.js` 的 `PICS` 裡有定義 |
| figure | | 線稿章節圖：`name, title, label, rest, cap`；圖檔放 `assets/hairline/<name>.js`，讀數寫成 `01 · <章節名>`，名字要和 chapters 一致（點圖跳段、播放時跟著走） |
| tagline, credit | | 畫面不是代碼生成的作品才寫，改寫分享標題與頁尾 |

## 5. 新增一支作品（標準流程）

1. 壓網頁版影片：直版 `scale=540:960`、橫版 `scale=960:540`（其他畫幅等比例），
   `ffmpeg -i 成片.mp4 -vf scale=960:540 -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 96k media/<id>.mp4`
2. 封面：`ffmpeg -ss <秒> -i media/<id>.mp4 -frames:v 1 -q:v 3 media/<id>.jpg`，再轉 `media/<id>.webp`。
3. 指紋：`python3 tools/fingerprint.py <id>`（需要 ffmpeg、numpy）。
4. 在 `works.json` **最前面**加一筆（見第 4 節）。bts 配圖放 `media/bts/`，720×900 webp。
5. （可選）片窗縮圖：在 `carousel.js` 的 `PICS` 加一組 `open`／`shut` 線條；線稿章節圖：用 hairline 的畫法畫一張放 `assets/hairline/`。
6. `python3 tools/build_pages.py` 產生作品頁。
7. 檢查連結（how／code／release 都要存在）→ 新分支 → PR → 請站長合併後在自己的電腦和手機上測「播放（有聲）」與「滑過拖動」。

## 6. 設計系統（不要偏離）

- 方向：乾淨、整潔、清爽、通透、有科技感，而且要獨特；借鑑可以，不照抄。
- 底：天光漸層＋三團極淡的漂移色光＋極淡點陣；所有板子是磨砂玻璃；頂部導覽固定成一條玻璃。
- 色票（`site.css :root`）：page `#E9ECEC`、plate `#F7F8F8`、ink `#1D2125`、dim `#69737A`、line `#C3CACE`、faint `#DCE1E3`、edge `#98A1A7`；**唯一的強調色：訊號藍 `#2F5BFF`**（深色模式 `#7C98FF`）。不要加第二個強調色。
- 字體：IBM Plex Sans／Mono＋Noto Sans TC（Google Fonts）。
- 線稿：全部照 hairline 的十條規則自己畫，細線、等角、讀數用等寬字。
- 介面文字：繁體中文為主，英文為輔。

## 7. 主要互動（電腦版首頁）

- **開場**：捲動敘事。右側主圖「一幀的五層」（frame）黏著，捲過五段文字時逐層亮起；捲完那一幀**一次性**飛進轉盤（約 1.1 秒，落地前淡出，中途停下不留殘影）。
- **幻燈機**：
  - 左邊懸浮的幻燈片轉盤（`carousel.js`），共 6 格（`N = 6`），空格顯示「製作中」。
  - 滑過片子會亮；按一下就轉到閱讀位置並送上幕；可以拖著轉。**只有點「幕」才進入作品頁**。
  - 閱讀位置的片射出光束（三層體積光＋灰塵粒子，顏色取自畫面）打到右邊的幕；幕上無聲播放，有顆粒、暗角、閃爍；換片先暗再亮。
  - **幕跟著畫幅變形**：寬高同時變（約 0.58 秒），在固定位子裡長邊撐滿，幕靠左。
  - **說明欄跟著幕**：永遠離幕右緣 26px（含透視補償）；直版字距鬆、橫版緊；畫幅改變時字先淡出（約 0.4 秒）、換好位置再回來。
  - 點幕進入時，幕用 View Transitions 直接變形成作品頁的播放器。
- **手機版**：卡片列表，照各自畫幅顯示，有懸浮傾斜。
- **作品頁**：直版＝左片右字；方形放寬片欄；橫版＝片在上、字在下。中央一顆大播放鍵（下附「有聲」），播放中點畫面暫停；影片指紋＋章節；線稿章節圖（有 figure 的作品）；「代碼 → 畫面」三組幕後對照。
- **關於**：三欄（標籤｜自我介紹｜聯絡），複製信箱按鈕、小紅書（Perseverance）、GitHub 做法連結。

## 8. 已定案的決定（不要擅自推翻）

- 轉盤片窗**不**跟著畫幅變形（PR #23 已關閉）：直版縮圖會太小。畫幅的差別只由幕來呈現。
- 網站**不放站長照片**；「關於」**不提站長的本職工作**（作品內容可以和專業相關，例如 CSK-IA）。
- 不加代碼線稿頭像（暫緩）。
- 作品多到 6 支以上時：每個類別一個轉盤（每個轉盤最多 10 格）。**目前 5 支，轉盤 6 格只剩 1 格**，再加兩支就要處理這件事；動手前先和站長討論方案。

## 9. 技術陷阱與教訓

- 同一頁放兩張 hairline 圖要用 `FIG.load()`，否則圖檔裡的 `const` 會撞名。
- 轉盤選片用 `pointerdown`，**不要用 `click`**：按下到放開之間 DOM 重排會吃掉 click。
- `assets/hairline/kernel.js` 不改；要改行為就在 `figures.js` 或圖檔裡處理。
- `works/<id>/index.html` 不手改，改 `works.json` 或 `tools/build_pages.py` 再重產生（2026-10-22 驗證：重跑結果與 main 完全一致）。
- 雲端的 headless 瀏覽器播不了 H.264：幕上播放、光束變色、轉場效果，只能請站長在自己的電腦上測。
- 測不同畫幅時用假資料（在瀏覽器裡攔截 `works.json`），不要把測試資料提交進倉庫。
- 截整頁圖時，bts 配圖是 lazy load，會顯示灰底，不是壞圖。

## 10. 待辦與可選項目

- [ ] 初代 iPhone、CSK-IA 的線稿章節圖（figure）。
- [ ] 第 6、7 支作品上架前：決定多轉盤（按類別）方案。
- [ ] 補上旅行海報動圖、科普短片（等站長提供檔案）。
- [x] 修正 `tools/fingerprint.py` 說明中的過時文字（章節現在寫在 `works.json`）。
- [ ] 可選：訪客統計、自訂網域。

## 11. 授權

網站代碼 MIT。線稿引擎 `assets/hairline/kernel.js` © Lucas Marques，MIT。影片中的照片由 AI 生成（ChatGPT）；《重慶火鍋》畫面由 MiniMax 圖生視頻生成；其餘作品的畫面，以及所有作品的剪接、音效與配樂由代碼生成，配樂取樣來自 CC0 樂器庫。iFixit 拆機照片是 CC BY-NC-SA，網站上不直接使用。
