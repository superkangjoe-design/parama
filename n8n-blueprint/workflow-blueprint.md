# Workflow Blueprint

## Ringkasan Alur

1. WhatsApp masuk ke webhook n8n
2. Ambil data pengirim dan isi pesan
3. Cek apakah pesan duplikat
4. Ambil riwayat lead dari Google Sheets atau Data Store
5. Deteksi intent dan lead stage
6. Jika perlu, panggil OpenAI
7. Simpan/update lead
8. Kirim balasan ke WhatsApp
9. Jika lead panas, kirim notifikasi ke admin

## Node by Node

### 1. Webhook Trigger

- Tipe: `Webhook`
- Method: `POST`
- Fungsi: menerima event dari WhatsApp Cloud API

Field penting:

- `entry[0].changes[0].value.messages[0].from`
- `entry[0].changes[0].value.messages[0].text.body`
- `entry[0].changes[0].value.contacts[0].profile.name`

### 2. Verify Event Type

- Tipe: `IF`
- Fungsi: hanya lanjut jika event benar-benar berisi message masuk

Kondisi:

- message exists
- text exists

### 3. Normalize Incoming Data

- Tipe: `Set`
- Fungsi: rapikan data jadi format internal

Output:

- `wa_number`
- `customer_name`
- `message_text`
- `timestamp`
- `channel`
- `source`

### 4. Duplicate Guard

- Tipe: `Data Store` atau `Code`
- Fungsi: hindari balas ganda bila webhook duplikat

Kunci yang disimpan:

- `message_id`

### 5. Lookup Lead

- Tipe: `Google Sheets` atau `Data Store`
- Fungsi: cari apakah nomor ini sudah pernah masuk

Cari berdasarkan:

- `wa_number`

### 6. Build Conversation Context

- Tipe: `Set`
- Fungsi: gabungkan data lead lama + pesan baru

Context yang dibentuk:

- nama
- paket terakhir
- kota
- skor lead sebelumnya
- status handoff
- last messages ringkas

### 7. Intent Router

- Tipe: `Switch`
- Fungsi: bagi jalur cepat sebelum ke AI

Rule awal:

- jika user hanya kirim sapaan: route `greeting`
- jika user tanya harga/paket: route `pricing`
- jika user bilang mau order/pesan/beli: route `hot`
- jika user tanya legalitas/cara pakai/fungsi: route `faq`
- jika user marah/komplain/sensitif: route `handoff`

### 8. Qualification Logic

- Tipe: `Code` atau `Set + IF`
- Fungsi: ambil data penting dari chat

Ekstrak:

- nama
- paket
- kota

Stage:

- `cold`
- `warm`
- `hot`

### 9. OpenAI Response

- Tipe: `HTTP Request` ke OpenAI
- Fungsi: generate jawaban AI

Dipakai jika:

- route `faq`
- route `pricing`
- route `warm`
- route `hot` sebelum handoff

Tidak dipakai jika:

- message invalid
- duplicate
- handoff langsung diperlukan

### 10. Lead Scoring

- Tipe: `Code`
- Fungsi: tentukan skor lead

Aturan sederhana:

- `cold`
  sapaan, tanya fungsi umum
- `warm`
  tanya harga, paket, legalitas, cara pakai
- `hot`
  bilang mau order, pilih paket, tanya stok, pembayaran, pengiriman

### 11. Save / Update Lead

- Tipe: `Google Sheets`
- Fungsi: simpan lead baru atau update row existing

Update field:

- nama
- nomor
- kota
- paket
- last_intent
- lead_score
- last_message
- ai_reply
- handoff_status
- updated_at

### 12. Send WhatsApp Reply

- Tipe: `HTTP Request`
- Fungsi: kirim balasan ke WhatsApp Cloud API

Endpoint:

- `POST /{PHONE_NUMBER_ID}/messages`

### 13. Admin Notification

- Tipe: `IF` lalu `HTTP Request` atau `Google Sheets/Telegram/Email`
- Fungsi: kirim notifikasi jika lead panas

Kondisi:

- `lead_score = hot`
- atau `handoff_status = yes`

### 14. Handoff Marker

- Tipe: `Set`
- Fungsi: tandai lead sudah diarahkan ke admin

Field:

- `handoff_status = handed_to_admin`

## Jalur Singkat

### Jalur FAQ

Webhook -> Normalize -> Lookup Lead -> OpenAI -> Save Update -> Reply

### Jalur Pricing

Webhook -> Normalize -> Lookup Lead -> Qualification -> OpenAI -> Save Update -> Reply

### Jalur Hot Lead

Webhook -> Normalize -> Lookup Lead -> Qualification -> Lead Scoring -> OpenAI short closing -> Save Update -> Reply -> Admin Notification

### Jalur Sensitive / Complaint

Webhook -> Normalize -> Lookup Lead -> Save Update -> Reply handoff -> Admin Notification

## Rekomendasi Node n8n

- `Webhook`
- `IF`
- `Switch`
- `Set`
- `Code`
- `HTTP Request`
- `Google Sheets`
- `Data Store`

## Rekomendasi Output AI

- singkat
- sopan
- menjual
- tidak medis
- arahkan ke paket
- handoff jika perlu
