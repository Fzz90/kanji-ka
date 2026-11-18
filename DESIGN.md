# Kanji 可 (Tema Bulan & Matahari)

## Brief
Five interactive presentation slides in Indonesian for **Faiz Syihab, NIM 125241046, Kelas A** (`Kanji Jawir`). Presents Kanji **可** following every slide structure of `122_Raina sirvi falihah.pdf` (Cover, Meanings/Readings/Radicals + Stroke Order, Mnemonics `覚え方`, Compound Words & Sentences including **可愛い**, and Closing `ありがとう`), featuring an animated 5-stroke **KanjiVG** brush-writing player, toggleable ruby furigana, and a **Celestial Sun & Moon (*Nichigetsu / 日月*)** visual direction inspired by [bunpou-nodeshita](https://github.com/Fzz90/bunpou-nodeshita).

## Design Read & Dials
Reading this as: **interactive kanji study & stroke-animation presentation deck** for **university learners**, in a **Sun & Moon Japanese editorial almanac (*Nichigetsu*) visual language** following `bunpou-nodeshita`'s crisp ink-framed panel discipline, dial **ENERGY 3 / RHYTHM 3 / MOTION 2**.

## Direction Note (`cx-design-taste-frontend`)
Drawn direction: **`page-is-the-object`** (the presentation stage functions as an interactive Japanese celestial kanji sheet & stroke manuscript). Type (`Bricolage Grotesque` + `Zen Kaku Gothic New`) and flat palette were redrawn from the default draw sheet to honor the required `bunpou-nodeshita` theme lineage and the Moon & Sun brief while strictly avoiding gradients, blurred glass blobs, cream+terracotta, red hues, and violet/indigo hues.

## Visual System (Moon & Sun)
- **Midnight Ink (`--ink`)**: `#111625` (crisp `3px` frames & primary dark text; `16.64:1` on paper)
- **Slate Muted (`--muted`)**: `#464D61` (`7.77:1` on paper)
- **Starlight Paper (`--paper`)**: `#F3F6FB` (clean neutral daylight ground; `#E8ECF5` soft, `#DCE3F0` deep)
- **White (`--white`)**: `#FFFFFF` (daylight reading cards)
- **Solar Gold / Amber (`--sun-gold` / `--sun-amber` / `--sun-stroke` / `--sun-ink`)**: `#F7CA18` primary fill (`11.51:1` with `--ink`, `9.67:1` on `--moon-deep`), `#E5B600` hover (`9.46:1` with `--ink`), `#9A5F00` daylight text/kanji display (`4.83:1` on paper), `#B87400` active stroke highlight (`3.79:1` on white), `#6E4A00` mark/badge ink on `#FFF5C4` `--sun-soft` (`7.23:1` on `--sun-soft`, `7.95:1` on white)
- **Lunar Prussian Blue (`--moon` / `--moon-deep`)**: `#123A7A` / `#0C254D` (Bulan night sky fields & contrasting panels; `10.98:1` white on `--moon`, `9.67:1` `--sun-gold` on `--moon-deep`)
- **Type**: `Bricolage Grotesque` (`500;700;800` for Latin headings & Indonesian UI) + `Zen Kaku Gothic New` (`500;700;900` for Japanese kanji, readings, & furigana).

## Slide Map (Mirrors Reference PDF 1..5)
1. **Pembuka (`可`)**: Split cover pairing giant kanji **`可`**, presenter details (**Faiz Syihab · NIM 125241046 · Kelas A**), and custom dual-panel **Matahari & Bulan** sunrise/midnight SVG illustration with `Mulai materi`.
2. **Cara Menulis & Info (`書き順 · 読み`)**: Left Solar panel hosts the live animated 5-stroke **KanjiVG** brush writer (`Putar/Jeda`, `Ulang`, stroke-by-stroke pen nib path animation centered in a large calligraphy box). Right Lunar midnight panel displays **Onyomi (`音読み`)**, **Kunyomi (`訓読み`)**, and **Bushu (`部首`)**.
3. **Daftar Jukugo (`熟語一覧`)**: Full-width structured Moon & Sun comparison table listing every jukugo used in the Slide 4 example sentences (`可愛い`, `可能`, `許可`, `不可能`, `可塑`, `可決`) with hiragana/romaji readings and Indonesian meanings.
4. **Kosakata & Contoh (`熟語と例文`)**: Six contextual jukugo & sentence frames (`可愛い`, `可能`, `許可`, `不可能`, `可塑`, `可決`) with toggleable `<ruby><rt>` furigana and Indonesian translations.
5. **Penutup (`ありがとう`)**: Full-bleed midnight Lunar sky end-card with radiant Sun & Crescent Moon eclipse emblem, gold **`ありがとう。`** headline, signature, KanjiVG CC BY-SA 3.0 credit, and `Kembali ke awal` button.
