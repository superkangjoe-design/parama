# Google Sheets Webhook Parama

Folder ini berisi Google Apps Script untuk menerima lead dari backend Parama dan menyimpannya ke Google Sheets.

## File

- `Code.gs`
  Script webhook Google Apps Script.

## Langkah Setup

1. Buka Google Sheets baru.
2. Beri nama sheet, misalnya `Parama Leads`.
3. Buka `Extensions > Apps Script`.
4. Hapus isi default, lalu tempel isi dari `Code.gs`.
5. Simpan project.
6. Klik `Deploy > New deployment`.
7. Pilih type `Web app`.
8. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
9. Deploy dan salin URL web app.

## Hubungkan ke Backend Parama

Di PowerShell:

```powershell
$env:GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/WEB_APP_ID/exec"
```

Lalu jalankan server:

```powershell
& "C:\laragon\bin\nodejs\node-v22\node.exe" server.js
```

## Data yang Dikirim

Backend Parama mengirim field:

- `timestamp`
- `name`
- `package`
- `city`
- `source`
- `notes`

## Hasil

Saat lead qualified dari widget AI, data akan:

1. disimpan ke `data/leads.json`
2. disimpan ke `data/leads.csv`
3. dikirim ke Google Sheets jika `GOOGLE_SHEETS_WEBHOOK_URL` sudah diisi
