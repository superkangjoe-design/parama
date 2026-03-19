# Sample Payloads

## Incoming WhatsApp Example

```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "contacts": [
              {
                "profile": {
                  "name": "Budi"
                }
              }
            ],
            "messages": [
              {
                "from": "6281234567890",
                "id": "wamid.HBgM...",
                "text": {
                  "body": "Berapa harga paket 3 tube?"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Lead Row Example

```json
{
  "timestamp": "2026-03-18T07:30:00.000Z",
  "wa_number": "6281234567890",
  "customer_name": "Budi",
  "city": "Bandung",
  "selected_package": "Best Seller - 3 tube",
  "last_intent": "pricing",
  "lead_score": "warm",
  "handoff_status": "qualified",
  "last_message": "Berapa harga paket 3 tube?",
  "ai_reply": "Saat ini paket 3 tube Rp675.000 dan biasanya jadi pilihan hemat untuk pemakaian rutin.",
  "notes": "Lead dari WhatsApp",
  "source": "whatsapp",
  "created_at": "2026-03-18T07:30:00.000Z",
  "updated_at": "2026-03-18T07:30:00.000Z"
}
```

## Handoff Reply Example

```text
Siap, saya bantu arahkan ke admin untuk lanjut order ya. Paket yang Anda pilih sudah saya catat. Admin akan bantu konfirmasi stok dan detail pengiriman.
```
