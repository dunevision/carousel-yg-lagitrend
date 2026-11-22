# PLAYBOOK GAYA VIDEO: "Explainer Teknik 3D Low-Poly Vertikal" (contoh: Sejarah Jembatan Suramadu)

> Tema video: **explainer sejarah dan cara kerja konstruksi/teknik sipil, animasi 3D low-poly, vertikal 9:16, narasi cerita + caption karaoke.**
> Gaya referensi: akun @ceritateknik di TikTok (hanya ditiru GAYA visual dan alurnya; naskah, watermark, dan adegan dibuat sendiri). Brand sendiri: `@yg_lagitrend`.
> Dibuat dengan Remotion + Three.js. Dokumen ini disusun 22 Nov 2026 dari satu project panjang bersama Risqy.

## 0. CARA PAKAI DI PROJECT LAIN
1. Upload file ini ke project baru (Project knowledge, atau simpan sebagai `CLAUDE.md` di repo).
2. Upload juga `KODE-SUMBER_Video-Suramadu.zip` (kode jadi, tinggal ganti topik) atau clone repo `dunevision/carousel-yg-lagitrend`, folder `2026-11-21-video-suramadu`, branch `claude/ecstatic-ritchie-vubpzn`.
3. Cukup tulis: *"Bikin video gaya Explainer Teknik 3D Low-Poly tentang [TOPIK]."* Claude wajib mengikuti playbook ini tanpa diperintah ulang.

## 1. ATURAN KERJA RISQY (WAJIB, berlaku di semua chat/project)
- Bahasa Indonesia santai, jawaban simpel dan rapi, istilah teknis dijelaskan satu kalimat. Risqy ada di Indonesia.
- Kalau tugas punya SOP/skill wajib: **panggil skill lewat Skill tool dulu**, jangan diganti pengecekan manual. Melewati skill = kesalahan fatal.
- Setiap Risqy minta bikin video: panggil skill `pilih-tool-video` (kalau ada). Skill itu menyuruh memanggil `video-making` dulu; kalau skill itu tidak terpasang, laporkan jujur lalu lanjut. Risqy sudah memilih **Remotion** untuk gaya ini, jadi jangan tanya ulang soal tool.
- Cek riwayat konten sebelum membuat (file `dibuat.md` di repo): jangan ulang topik yang sama.
- **Jangan mengarang fakta/angka/kutipan/link/langkah menu.** Cek web dulu (WebSearch) untuk hal yang bisa berubah. Pisahkan "terverifikasi" dari "dugaan". Kalau tidak yakin, bilang tidak yakin.
- Kalau menyebut website/unduhan, beri link resmi yang bisa diklik.
- Hemat kuota: langsung eksekusi, tanpa basa-basi. Tapi hemat tidak boleh melewati langkah wajib.
- **Proyek baru: beri peringatan singkat, buat blueprint dulu sebelum eksekusi.**
- Kalau suatu langkah bisa Claude kerjakan sendiri, tawarkan dulu; jangan menyuruh Risqy mengerjakannya. Cek alat dulu sebelum bilang tidak bisa.
- **Jangan render panjang langsung.** Buat sampel 8 detik dulu, tunjukkan, baru render penuh sekali (hemat kuota dan waktu).
- Laporan akhir selalu jujur: skill apa yang dipanggil, bukti cek duplikat, langkah yang dilewati beserta alasannya. Verifikasi dulu (duplikat, pola tulisan AI, aturan konten) sebelum menjadwalkan/mengirim hasil.
- Boleh menyarankan tool/konektor/repo populer; Risqy yang menambahkannya.
- Aplikasi/web app: kolom input berlabel dan berplaceholder jelas dalam bahasa sederhana.
- Jangan membuat PR kecuali diminta. Commit dan push ke branch yang ditentukan sesi.
- Risqy bertanya soal kuota: render itu program biasa, **tidak memakai kuota Claude**; yang memakai kuota adalah percakapan, penulisan kode, dan membaca gambar. Render ulang di PC sendiri gratis (`npm run render`).

## 2. IDENTITAS GAYA (yang harus terlihat sama di video baru)
**Format:** 1080x1920, 30 fps, 60 sampai 90 detik, 12 sampai 14 adegan, durasi adegan 2 sampai 8 detik. Tanpa musik/suara dulu (suara ElevenLabs menyusul).

**Alur cerita (pola yang berhasil):**
1. **Hook flash-forward**: mulai dari momen puncak (di Suramadu: tengah malam 31 Maret 2009, potongan terakhir naik ke celah, kembang api). 2 sampai 3 adegan.
2. **Mundur ke awal** ("Tapi ceritanya mulai lima tahun sebelumnya"), dengan kotak angka tahun yang menghitung mundur ("MUNDUR KE 2004") dan jembatan tenggelam.
3. **Rintangan dan tahap awal** (ranjau laut, pondasi).
4. **Adegan PERUMPAMAAN** (analogi sehari-hari: tongkat di lumpur sawah, tukang pikul). Wajib ada tag "PERUMPAMAAN". 2 adegan.
5. **Cara kerja inti** (menara naik, lantai dipasang satu-satu digantung kabel, ruang bebas kapal 35 m).
6. **Dua ujung makin dekat**, lalu **penutup yang kembali ke hook** (tengah malam, bertemu, tanggal dibuka untuk umum, kotak tanggal).

**Elemen layar tetap (semua adegan):**
- Latar header krem `#EDEBE0` setinggi 320 px, memudar ke kanvas 3D di bawahnya. Kanvas 3D 1080x1600 mulai dari y=320.
- Header kiri: **kicker** font mono kapital kecil abu (mis. `FEBRUARI 2004`) lalu **judul** Plus Jakarta Sans 700, 62 px, kata penting diwarnai hijau `#2f8f6b` (di kode: `*kata*`). Kanan atas: lencana gelap `@yg_lagitrend`.
- **Caption karaoke** di y=1440 (kotak gelap `rgba(12,42,34,.9)` radius 26, teks putih 56 px, 600). Kata yang sedang diucapkan berwarna hijau muda `#9be8bd` dengan garis bawah hijau. Satu frasa tampil per waktu, maksimal 2 baris. Zona aman TikTok: jauhi 340 px dari bawah dan 140 px dari kanan untuk elemen penting.
- **Label penunjuk (Callout)**: chip bulat berwarna + garis tipis + titik yang menempel ke titik 3D asli (diproyeksikan dari kamera). Warna: oranye `#e0532b` (objek penting), putih berbingkai (kapal/benda), biru `#2f6fe0` (info), merah `#d8344a` (bahaya/ujung), hijau (status baik).
- **Tag** kotak berbingkai mono (`PERUMPAMAAN`, `DIPUTAR MUNDUR`, `ILUSTRASI · SELAT DIBELAH`) di kiri atas kanvas.
- **StatBox** putih berbingkai tebal dengan bayangan keras, angka oranye besar (tahun, "56", "10 Juni 2009").
- Transisi: potongan keras dengan kilat krem 7 frame di awal adegan, teks header fade-in 10 frame.

**Visual 3D:** low-poly bersih, warna pastel cerah di siang hari (laut turquoise `#139c93`, langit biru ke krem), malam navy dengan lampu hangat, sorotan lampu kerucut, bloom, dan kembang api bulat bercahaya. Satu unit dunia = 10 m (lantai jembatan 3,5 unit = 35 m; menara 14 unit = 140 m).

## 3. ALUR PRODUKSI (urut, jangan loncat)
1. Panggil skill sesuai aturan (bagian 1). Baca `dibuat.md` dan `CLAUDE.md` project.
2. **Peringatan singkat + blueprint** (proyek baru): topik, jumlah adegan, tool, aset.
3. **Riset fakta** lewat WebSearch (min. 2 sumber; tandai klaim yang sumbernya beda-beda dan tulis netral, mis. "ranjau laut sisa perang" bukan "ranjau PD II").
4. **Naskah per adegan** (lihat bagian 4) dan daftar visual 3D per adegan. Minta persetujuan Risqy bila topik/naskah baru.
5. Bangun project dari kode sumber (bagian 5), ganti `src/script.ts` dan adegan di `src/scenes.tsx`.
6. **Sampel 8 detik** (satu adegan paling berat visualnya) -> `npx remotion still` untuk cek frame -> render sampel -> kirim ke Risqy (`SendUserFile`) -> tunggu penilaian.
7. Setelah disetujui: render penuh **sekali** (di cloud 30 sampai 45 menit; di PC Risqy gratis).
8. Suara: lihat bagian 4 (ElevenLabs).
9. Catat di `dibuat.md` (tanggal | sumber | ringkasan | folder). Commit + push ke branch sesi. Kirim MP4 ke Risqy (file besar tidak masuk git).
10. Laporan jujur (skill, cek duplikat, verifikasi, yang dilewati).

## 4. NASKAH DAN SUARA
- Kalimat pendek, santai, bahasa lisan ("kayak", "nyatu", "naik ke celah"). Angka ditulis dengan huruf agar TTS benar ("tiga puluh satu Maret dua ribu sembilan").
- Kecepatan: sekitar 14 huruf/detik. Di kode: durasi kata = `0.062 x jumlah huruf + 0.07` detik, jeda antar frasa 0.14 s (koma) atau 0.3 s (titik), jeda awal 0.45 s, akhir 0.55 s.
- Satu adegan = 1 sampai 3 frasa, tiap frasa muat 2 baris caption.
- Setiap adegan punya: `id`, `kicker` (kapital, mono), `title` (dengan `*sorotan*`), `phrases[]`.
- **Pola judul:** pernyataan pendek yang menggoda ("Mulainya di *dasar laut*", "Kayak tongkat di *lumpur sawah*").
- **ElevenLabs (belum terpasang):** jaringan cloud memblokir `api.elevenlabs.io`. Jalur: (a) buka host itu di environment + simpan key lewat `request_credential`, atau (b) Risqy generate MP3 sendiri dan kirim. Setelah itu isi `src/align.json` dengan timing kata (`{"s01":{"dur":4.8,"phrases":[{"words":[{"t":"Jembatan","s":0.4,"e":0.8}]}]}}`); caption otomatis memakainya. Lalu tambahkan `<Audio>` di `Root.tsx`.

## 5. TEKNIS (stack dan struktur kode)
**Paket:** `remotion`, `@remotion/cli`, `@remotion/three`, `three`, `@react-three/fiber`, `react`, `react-dom`, `postprocessing`, `@fontsource/plus-jakarta-sans`, `@fontsource/jetbrains-mono`, dev: `typescript`, `@types/react`, `@types/three`. (Paket `@react-three/postprocessing` terpasang tapi TIDAK dipakai, lihat jebakan.)

**Perintah render (cloud, Chromium bawaan):**
`npx remotion render src/index.ts <IdKomposisi> out/x.mp4 --browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing --gl=angle --concurrency=4`
Cek satu frame: `npx remotion still src/index.ts Suramadu out/f.png --frame=N --scale=0.45 <flag yang sama>`
Di PC Risqy hapus flag `--browser-executable` dan `--chrome-mode`. Kecepatan di cloud: sekitar 0,75 detik/frame (84 detik video = 32 menit dengan air+bloom+bayangan).

**File inti (`src/`):**
| File | Isi |
|---|---|
| `script.ts` | Naskah, timing kata otomatis, baca `align.json`, `TIMED`, `TOTAL` |
| `Root.tsx` | Komposisi `Suramadu` (penuh), `Sampel8`, `SampelKota` |
| `scenes.tsx` | 14 adegan (`S01`..`S14`), `SCENE_COMPONENTS` |
| `sample.tsx` | Sampel 8 detik dengan model GLB/FBX |
| `ui.tsx` | `SceneFrame`, `Header`, `Caption`, `Callout`, `Chip`, `Tag`, `StatBox` |
| `kit.tsx` | `Stage` (kanvas+lampu+bayangan+sky+post), `Box`, `Cyl`, `Person`, `Burst`, `Sea`, `Sky`, `Clouds`, `Glow`, `RiceField`, `Palm`, `drift`, `project` |
| `bridge.tsx` | `Bridge`, `TowerAt`, `DeckSeg`, `CablesAt`, `Gantry`, `Segment`, `Searchlight`, `CityLights`, `Ship` |
| `fx.tsx` | `RealSea` (Water three.js), `Env`, `Post` (bloom manual), tekstur prosedural `tex()` |
| `Model.tsx` | Pemuat GLB/FBX: `usePreload`, `Model` (normalisasi ukuran) |
| `fonts.ts` | Font lewat `@fontsource` + `delayRender` |

**Resep penting:**
- Semua animasi digerakkan `useCurrentFrame()`. **Dilarang** `useFrame()` untuk animasi, CSS transition/animation.
- `Stage` memakai `drift()` (goyang kamera halus) dan `Callout` memakai `project(titik3D, cam, frame)` dengan drift yang sama, supaya label tetap menempel.
- Setiap adegan: hitung `cam` (pos, look, fov) dari `p = frame/dur` dengan `lerp3`/`ease`, kirim ke `Stage` dan `Callout`.
- Efek post (bloom, tone mapping ACES, vignette, saturasi) dirender manual di `Post` (`PP.EffectComposer` + `useFrame(..., 1)`, `multisampling: 4`).
- Air: `RealSea` (shader Water) dengan normal map yang dibuat dari kode; `size` kecil (2,4) agar riak besar dan tidak berkedip.
- Model 3D: `usePreload([...file])` di komponen adegan dan baru render `<Stage>` setelah siap; `<Model file p length rotY />` menormalkan ukuran, alas di y=0.

## 6. JEBAKAN YANG SUDAH DIALAMI (jangan ulangi)
1. `@react-three/postprocessing` membuat layar KOSONG di Remotion -> pakai composer manual (di atas).
2. Model dimuat async di dalam kanvas -> render kosong. Muat dulu (`usePreload`), baru buat kanvas, dan panggil `continueRender` setelah state ter-commit (di `useEffect`).
3. Paket Kenney punya `Textures/colormap.png` BERBEDA isinya tapi namanya sama -> simpan tiap paket di foldernya sendiri (`public/models/car/`, `public/models/watercraft/`) beserta `Textures/`.
4. FBX sering membawa material transparan (gedung jadi tembus) -> paksa `transparent=false, opacity=1, depthWrite=true`.
5. Layar vertikal sempit: kamera di samping jembatan hanya menampung sebagian. Lihat sepanjang sumbu jembatan, atau mundur jauh. Kamera jangan berada di sisi luar menara.
6. Gerakan "getar": penyebab = riak air kecil+cepat, tanpa anti-aliasing di jalur post, goyang objek terlalu cepat. Solusi: riak besar-lambat, MSAA 4x, `bob` lambat.
7. Panggilan `delayRender` di tingkat modul untuk font itu aman; jangan `useFrame` untuk animasi.
8. `npm run render -- --output=...` bentrok dengan argumen posisi; ubah langsung nama file di `package.json`.
9. File upload Drive lewat konektor dibatasi ~3 MB per panggilan dan 10 MB per file. Unduh Kenney otomatis lewat curl dengan menyamar browser DITOLAK sistem keamanan (jangan dicoba lagi); minta Risqy mengunduh sendiri.
10. Bayangan, air nyata, dan bloom membuat render lambat; selalu cek lewat `still` dulu.

## 7. ASET 3D
- Folder Google Drive Risqy: **Aset 3D Video** -> https://drive.google.com/drive/folders/1ftDkNhyI1wRJKuISobd7nz6UYlJAw0PZ
- Isi: Kenney watercraft-pack (CC0), Kenney car-kit (CC0), City Builder Bits (FBX), City Pack (FBX/OBJ), CUTES Part One (FBX karakter), Stylized Nature MegaKit (88 MB, belum dipakai).
- **Lisensi:** hanya Kenney yang terverifikasi CC0. City Builder Bits, City Pack, CUTES: lisensi BELUM DIVERIFIKASI (Risqy memutuskan tetap dipakai untuk sampel). Cek sebelum publikasi.
- Aturan: aset baru yang Risqy download -> arahkan/beri link folder Drive di atas, jangan menumpuk ZIP di repo. Di repo hanya file kecil yang dipakai (`public/models/...`).
- Risqy sudah memasang Google Drive desktop (mode stream); Claude Code di PC bisa membaca folder itu langsung. Claude di cloud tidak bisa melihat PC Risqy, hanya konektor Drive (batas ukuran).
- Model yang sudah terpakai: Kenney kapal kargo/tunda/perahu/pelampung/mobil; City Builder Bits 8 gedung, taxi, station wagon, mobil polisi, hatchback, lampu jalan, semak, menara air; CUTES 8 karakter.

## 8. FAKTA SURAMADU (terverifikasi lewat web 21 Nov 2026)
- Bentang utama tersambung **31 Maret 2009** (upacara tengah malam, kembang api); dibuka untuk umum **10 Juni 2009**.
- Menara sekitar **140 m**; ruang bebas kapal **35 m** dengan lebar sekitar 400 m; konstruksi bentang tengah dimulai **19 November 2005** (pencanangan 2 Juli 2004).
- Sapu ranjau TNI AL tahap 1: **31 Jan sampai 7 Feb 2004**, **56 ranjau** diledakkan. Asal ranjau beda antar sumber (Belanda/Sekutu/PD II) -> tulis "ranjau laut sisa perang".
- Catatan: tidak ditemukan sumber yang menyebut potongan mana yang dipasang terakhir; di video ditulis "potongan lantai terakhir naik ke celah" sebagai narasi visual.
- Sumber: https://en.wikipedia.org/wiki/Suramadu_Bridge , https://www.detik.com/jatim/berita/d-7594806/menelusuri-sejarah-jembatan-suramadu-dan-fakta-uniknya , https://id.china-embassy.gov.cn/indo/sgdt/200904/t20090402_2039859.htm , https://www.antaranews.com/berita/111398/tni-al-latihan-sapu-ranjau-di-selat-madura , https://www.liputan6.com/news/read/68288/puluhan-ranjau-laut-sisa-belanda-diledakkan
- Perumpamaan (tongkat di lumpur, tukang pikul) hanya analogi, bukan klaim teknis Suramadu.

## 9. STATUS PROJECT SURAMADU (per 22 Nov 2026)
- Repo `dunevision/carousel-yg-lagitrend`, branch `claude/ecstatic-ritchie-vubpzn`. Commit penting: `a70f320` (v3 air bercermin + bloom), `d58cadb` (CLAUDE.md aset 3D), `22d6551` (sampel model Kenney), `c171313` (sampel kota FBX + anti-getar).
- Selesai: 14 adegan 84 detik (v3 tanpa model jadi, render penuh 32 menit), sampel 8 detik kapal-di-bawah-jembatan, sampel 8 detik kota Surabaya.
- **Belum:** suara ElevenLabs; model jadi di seluruh 14 adegan; adegan petani pakai Nature MegaKit + karakter; label "potongan terakhir" di adegan 1 tertutup caption; adegan menara (09) terpotong di tepi; karakter CUTES statis; air dekat kamera masih kasar.
- Langkah berikut yang disarankan: terapkan model jadi ke semua adegan, lalu render penuh sekali.

## 10. BLOK UNTUK DITEMPEL KE PREFERENCES/MEMORY CLAUDE (opsional, biar berlaku global)
> Gaya video favorit saya: "Explainer Teknik 3D Low-Poly Vertikal" (contoh Sejarah Jembatan Suramadu). Kalau saya minta video gaya ini, ikuti file GAYA-VIDEO_Explainer-Teknik-3D-LowPoly_Suramadu_PLAYBOOK.md tanpa saya perintah ulang. Pakai Remotion + Three.js, 1080x1920, caption karaoke, label penunjuk, kicker + judul dengan kata hijau, sampel 8 detik dulu sebelum render penuh. Aset 3D ada di Google Drive folder "Aset 3D Video" (https://drive.google.com/drive/folders/1ftDkNhyI1wRJKuISobd7nz6UYlJAw0PZ).

## 11. PROMPT PEMBUKA UNTUK PROJECT BARU
> "Ikuti PLAYBOOK gaya video yang terlampir. Topik: [ISI]. Durasi sasaran: [60-90 dtk]. Riset fakta dulu, buat naskah + daftar adegan, minta persetujuan, lalu sampel 8 detik sebelum render penuh. Aset 3D ambil dari Drive 'Aset 3D Video'."
