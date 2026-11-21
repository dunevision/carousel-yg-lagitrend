# Video Suramadu (Remotion, tanpa suara dulu)

Vertikal 1080x1920, 30 fps, 14 adegan, sekitar 84 detik. Animasi 3D low-poly pakai `@remotion/three`.

## Perintah
- `npm install`
- `npm run studio` : preview
- `npm run render` : hasil di `out/suramadu.mp4`
  (flag `--browser-executable` dipakai karena Chromium bawaan session; di PC sendiri hapus flag itu)

## Nanti pasang suara ElevenLabs
1. Teks narasi per adegan ada di `src/script.ts` (field `phrases`).
2. Generate MP3 per adegan (atau satu file), taruh di `public/`.
3. Isi `src/align.json` dengan timing kata dari ElevenLabs (`with-timestamps`), format:
   `{"s01": {"dur": 4.8, "phrases": [{"words": [{"t":"Jembatan","s":0.4,"e":0.8}]}]}}`
   Caption karaoke otomatis ikut timing ini. Lalu tambah `<Audio>` di `Root.tsx`.

## Fakta yang dipakai (sudah dicek lewat web)
- Bentang utama tersambung 31 Maret 2009 (tengah malam, kembang api); dibuka umum 10 Juni 2009.
- Menara sekitar 140 m; ruang bebas kapal 35 m; bentang tengah dikerjakan sejak 19 Nov 2005.
- Sapu ranjau TNI AL tahap 1: 31 Jan-7 Feb 2004, 56 ranjau diledakkan.
- Asal ranjau (Belanda/Sekutu/PD II) beda-beda antar sumber, jadi di video ditulis "ranjau laut sisa perang".
- Detail pondasi tiang dan adegan tongkat/tukang pikul hanya perumpamaan, bukan klaim teknis Suramadu.
