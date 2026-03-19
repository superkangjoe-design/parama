# n8n Blueprint Parama

Blueprint ini untuk `AI sales agent intermediate` menggunakan:

- WhatsApp Cloud API
- n8n
- OpenAI
- Google Sheets
- Admin takeover

## Tujuan

- menjawab chat awal otomatis
- menjelaskan produk, legalitas, cara pakai, dan paket
- mengarahkan calon pembeli ke paket yang cocok
- memberi skor lead
- menyimpan lead ke Google Sheets
- handoff ke admin saat lead hangat atau panas

## File

- `workflow-blueprint.md`
  Urutan node dan logika utama workflow.
- `google-sheets-columns.md`
  Struktur kolom Google Sheets.
- `prompt-template.md`
  Prompt AI untuk node OpenAI di n8n.
- `field-mapping.json`
  Mapping field antar node.
- `sample-payloads.md`
  Contoh payload masuk dan keluar.

## Outcome

Setelah mengikuti blueprint ini, Anda akan punya sistem yang:

1. menerima pesan WhatsApp
2. memproses intent pembeli
3. menjawab via AI
4. menyimpan data lead
5. melakukan handoff ke admin bila diperlukan
