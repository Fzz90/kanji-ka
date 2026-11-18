# Kanji 可 (Tema Bulan & Matahari)

Presentasi interaktif 5 slide untuk **Faiz Syihab · NIM 125241046 · Kelas A**, membahas Kanji **可** dengan tema **Bulan dan Matahari (*Nichigetsu*)**, terinspirasi dari struktur tema [bunpou-nodeshita](https://github.com/Fzz90/bunpou-nodeshita) serta dilengkapi animasi urutan guratan (`書き順`).

## Cara Membuka

Buka `index.html` langsung di Chrome, Edge, atau Firefox, atau jalankan server lokal:

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

Lalu buka `http://127.0.0.1:4174`.

## Struktur 5 Slide

1. **Pembuka (`可`):** Kanji utama `可`, identitas presenter, serta ilustrasi panel kembar Matahari & Bulan.
2. **Cara Menulis & Profil:**
   - Panel kiri: Animasi urutan 5 guratan `可` secara berurutan dengan kuas penunjuk arah serta tombol `Putar / Jeda` dan `Ulang`.
   - Panel kanan: Onyomi (`音読み`), Kunyomi (`訓読み`), dan Bushu (`部首`).
3. **Cara Mengingat (`覚え方`):** Penguraian komponen `一 + 口 + 亅` (`丁 + 口`) menjadi `可` lengkap dengan sorotan guratan interaktif.
4. **Kosakata & Contoh (`熟語と例文`):** Enam kata dan kalimat contoh kontekstual (`可愛い`, `可能`, `許可`, `不可能`, `可能性`, `可決`) lengkap dengan furigana (dapat ditampilkan/disembunyikan) dan terjemahan Indonesia.
5. **Penutup (`ありがとう`):** Kartu penutup bertema gerhana Bulan & Matahari beserta tombol kembali ke awal.

## Kontrol

- Dek otomatis mengisi viewport desktop 16:9 dan masuk layar penuh (*fullscreen*) pada klik atau tombol ketuk pertama.
- `<-` / `->`, `PageUp` / `PageDown`, `Space` / `Shift+Space`: berpindah slide.
- `Home` / `End`: lompat ke slide pertama atau terakhir.
- `F`: masuk atau keluar layar penuh kapan saja.
- Tombol `ふりがな` di header: menampilkan atau menyembunyikan furigana pada seluruh slide.

## Kredit & Lisensi Data Guratan

- Data koordinat SVG urutan guratan Kanji `可` (`053ef.svg`) berasal dari proyek [KanjiVG](https://kanjivg.tagaini.net) oleh Ulrich Apel, berlisensi [Creative Commons Attribution-Share Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

## GitHub Pages

Repository: [Fzz90/kanji-ka](https://github.com/Fzz90/kanji-ka)

Situs: [fzz90.github.io/kanji-ka](https://fzz90.github.io/kanji-ka/)

Situs berupa HTML/CSS/JavaScript statis dari root branch `main` via `.github/workflows/pages.yml`, lengkap dengan CSS cetak 5 halaman 16:9 (`320 x 180 mm`).
