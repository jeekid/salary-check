# Salary Check

薪資驗算工具。核心流程是把排班 Excel 解析成班表，再依固定薪資規則計算薪俸、其他加款與所得稅，用來核對薪資單或試算表。

## Run

```sh
bun install
bun run build:web
```

產生的靜態網站會在 `web/`，可用任一靜態檔案伺服器預覽。

網頁目前支援：

- 上傳排班 `.xlsx`
- 選擇人員姓名
- 輸入薪資單的「薪俸 / 其他加款 / 所得稅」
- 顯示程式計算值、薪資單值、差額、時數拆分與解析出的班表

## GitHub Pages

靜態版會在瀏覽器本機解析 Excel 與計算薪資，不需要後端 API。

```sh
bun run build:web
```

部署使用 `.github/workflows/pages.yml`。push 到 `main` 會自動 typecheck、產生 `web/assets/client.js`，並發布 `web/`。

## Notes

- 規則與測試資料保留在私有 repo。
- 公開版只應包含靜態網頁與必要的計算程式，不應包含原始班表、薪資單或個人資料。
