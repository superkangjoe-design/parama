# AI CS Hybrid Parama

Dokumen ini menyiapkan fondasi `AI Customer Service Hybrid` untuk penjualan Parama.

## Model Kerja

- AI menangani pertanyaan awal di landing page dan WhatsApp.
- AI menjawab FAQ, legalitas, cara pakai, paket, dan keberatan umum.
- Jika lead sudah hangat atau menanyakan hal sensitif/detail pembayaran, AI langsung handoff ke admin manusia.
- Admin mengambil alih untuk closing, follow-up, pembayaran, dan repeat order.

## File

- `knowledge-base.md`
  Sumber fakta resmi yang boleh dipakai AI saat menjawab.
- `system-prompt.txt`
  Prompt utama untuk AI CS.
- `handoff-rules.md`
  Aturan kapan AI harus menyerahkan percakapan ke admin.
- `whatsapp-templates.md`
  Template chat untuk WhatsApp AI dan admin.
- `widget-config.json`
  Konfigurasi dasar jika nanti dipasang ke chat widget atau backend AI.
- `../server.js`
  Backend lokal untuk endpoint chat AI dan penyimpanan lead.
- `../data/leads.json`
  Penyimpanan lead dalam format JSON.
- `../data/leads.csv`
  Penyimpanan lead dalam format CSV, mudah dibuka di Excel/Sheets.

## Flow Singkat

1. Visitor masuk landing page.
2. AI chat membuka percakapan dengan 3 intent utama:
   - tanya produk
   - tanya legalitas/cara pakai
   - minta paket harga
3. Jika visitor menunjukkan minat beli, AI arahkan ke paket paling cocok.
4. Jika visitor siap order, AI kumpulkan:
   - nama
   - paket
   - kota/alamat singkat
5. Setelah itu AI handoff ke admin WhatsApp `6285216667297`.

## Rekomendasi Implementasi

- Web:
  pakai widget chat dengan knowledge base dari file ini.
- WhatsApp:
  pakai WhatsApp API / gateway + orchestrator AI untuk balasan awal.
- Hybrid:
  AI hanya handle top-of-funnel dan warm leads, admin handle payment dan closing akhir.

## Logging Lead

Saat user sudah qualified, widget akan mengirim lead ke backend dan menyimpan:

- nama
- paket
- kota
- source
- catatan

Lead akan masuk ke:

- `data/leads.json`
- `data/leads.csv`

## Google Sheets

Jika ingin kirim lead ke Google Sheets, set environment variable:

`GOOGLE_SHEETS_WEBHOOK_URL`

Nilai ini bisa berupa URL webhook dari Apps Script atau automation tool.

Contoh PowerShell:

```powershell
$env:GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/XXXXX/exec"
```

## Catatan Penting

- Hindari AI membuat klaim medis yang tidak tertulis di materi produk.
- Hindari AI menjanjikan hasil pasti.
- Untuk pertanyaan sensitif, komplain, atau permintaan konsultasi pribadi, langsung handoff ke admin.
