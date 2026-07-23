# Local Font Laboratory

<img width="1904" height="1064" alt="image" src="https://github.com/user-attachments/assets/02874357-d12d-440f-b6ed-ba1c85b171e0" />

A web-based local playground to preview and test web fonts (`.ttf`, `.otf`, `.woff`, `.woff2`).

## Features

- **Font Family & Variant Selectors**: Organize fonts by family subfolders inside `fonts/` and select variants.
- **Variable Font Controls**: Dynamic adjustment sliders for variable font axes (Weight, Width).
- **Interactive Preview**: Editable text preview with real-time size and line-height controls.
- **CSS Export**: Copy CSS properties directly to clipboard.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Setup

```bash
git clone https://github.com/rusrio/font-laboratory.git
cd font-laboratory
npm install
npm run dev
```

Open `http://localhost:5173`.

## Adding Fonts

Add any font folder inside `fonts/`:

```
fonts/
└── FamilyName/
    └── Variant.ttf
```

Refresh the browser to load newly added fonts.

## Tech Stack

- Vite
- Vanilla JavaScript & CSS
- FontFace API

## License

MIT
