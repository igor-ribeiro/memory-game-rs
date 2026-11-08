# cardsprite

A small tool for building the image sprites used by the memory game.

Each **theme** (NBA teams, Harry Potter characters, flags…) is one deck of cards. Instead of assembling the sprite by hand in an image editor, you add the images to a theme, crop and scale each one to a square cell, and cardsprite concatenates them into a single sprite plus a JSON map of where every card lives.

The interface is in Brazilian Portuguese (pt-BR).

## Features

- **Themes** — create, list and search themes from the home page; each card shows a preview of its sprite.
- **Add images** — drop, browse or paste (`Ctrl/⌘ + V`) png, jpg, svg or webp files.
- **Crop & scale** — fixed 1:1 crop box with scale, x/y offset, 90° rotation and quick *ajustar / preencher / redefinir* (fit / fill / reset).
- **Generate sprite** — exports a transparent PNG and a JSON cell map, or both as a `.zip`.
- **Autosave** — work is saved as you go.

## Flow

```
Home (themes) ──select──▶ Editor (crop & scale) ──Gerar sprite──▶ Export
      │                         ▲
      └──Novo tema──────────────┘  (empty theme → drop zone)
```

| Screen | Purpose |
| --- | --- |
| Home — empty state | First run: create the first theme |
| Home — with themes | Theme cards with sprite preview, search |
| Editor — empty state | Theme with no images: drop zone |
| Editor — with images | Image list, crop stage, scale/offset/rotation |
| Export — sprite | Sprite preview with grid & index, downloads, JSON/CSS snippets |

## Sprite format

The sprite settings are fixed and shared by every theme, so they always match what the game expects:

| Setting | Value |
| --- | --- |
| Cell size | 256 × 256 px |
| Columns | 6 |
| Gap | 0 |
| Format | PNG, transparent background |

Cards are placed left to right, top to bottom, in the order of the image list. For card index `i` (0-based):

```
x = (i % 6) * 256
y = Math.floor(i / 6) * 256
```

Sprite size is `1536 × ceil(count / 6) * 256` — e.g. 12 cards → `1536 × 512`.

### Theme names

Theme names are lowercase with dashes and are also the output file names (`times-nba` → `times-nba.png`, `times-nba.json`). Accents and other characters are normalized when typing (`Seleção Brasileira` → `selecao-brasileira`).

### JSON map

```json
{
  "image": "times-nba.png",
  "cell": 256,
  "columns": 6,
  "cards": [
    { "id": "lakers", "x": 0, "y": 0 },
    { "id": "celtics", "x": 256, "y": 0 },
    { "id": "bulls", "x": 512, "y": 0 }
  ]
}
```

`id` is the image file name without its extension.

### Rendering a card in the game

```css
.card {
  width: 128px;
  height: 128px;
  background-image: url(times-nba.png);
  background-size: 768px 256px; /* sprite size ÷ 2, because 128 = 256 ÷ 2 */
}

/* card i → col = i % 6, row = ⌊i / 6⌋ */
.card[data-i="3"] {
  background-position: -384px 0;
}
```

When rendering at a different size, scale `background-size` and `background-position` by `displaySize / 256`.

## Design

Dark theme, monospace, square corners, one accent color. Tokens live in `cardsprite-theme.css` (Tailwind v4 `@theme`).

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#0b0c0e` | App background, inputs |
| `panel` | `#111215` | Control bars, code blocks |
| `raised` | `#181a1f` | Selected rows, active tabs |
| `line` | `#25282f` | Borders and dividers (default border color) |
| `line-strong` | `#3a3e47` | Dashed drop zones, secondary buttons |
| `fg` | `#e7e8ea` | Primary text |
| `muted` | `#8d929b` | Labels, meta text |
| `accent` | `#c6f35a` | Primary actions, selection, crop box |
| `on-accent` | `#0b0c0e` | Text on accent |

- Font: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — 13px body, 11px labels, 12px code.
- Extra utilities: `bg-checker` (transparency checkerboard), `label` (uppercase section headers), `range-accent` (slider).
- Icon: `cardsprite-icon.svg` / `favicon.ico`.

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/cardsprite-icon.svg" type="image/svg+xml">
```

## Getting started

```bash
npm install
npm run dev
```

<!-- Adjust the commands above to match the project's package manager and scripts. -->

## License

<!-- Add a license. -->
