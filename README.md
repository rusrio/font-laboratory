# Local Font Laboratory 🎨🔤

<img width="1904" height="1064" alt="image" src="https://github.com/user-attachments/assets/02874357-d12d-440f-b6ed-ba1c85b171e0" />


An interactive local playground for testing, previewing, and experimenting with web fonts and variable fonts collected from around the web.

## Features

- 📁 **Automatic Font Discovery**: Powered by Vite's `import.meta.glob`, any font file (`.ttf`, `.otf`, `.woff`, `.woff2`) dropped into the root folder or subfolders is automatically detected and loaded into the selector.
- 🎛️ **Variable Font Controls**: Dynamic adjustment sliders for variable font axes (Weight, Width, etc.).
- 👁️ **Live Interactive Preview**: Real-time font size, line-height, and typography tweaking with instant feedback.
- 📋 **One-Click CSS Export**: Easily copy formatted CSS rules directly to your clipboard.
- 🌙 **Modern Dark Theme**: Aesthetic UI designed for maximum readability and visual focus.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/local-font-lab.git
   cd local-font-lab
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## Adding New Fonts

To add new fonts to your lab:

1. Drop your font folder (e.g. `fonts/Nohemi/`) into the `fonts/` directory.
2. Refresh your browser page. The new family and its variants will automatically appear in the selectors.

## Tech Stack

- **Vite** - Dev server & module bundler with instant glob import capabilities.
- **Vanilla JavaScript & CSS** - Lightweight, zero-framework architecture.
- **FontFace API** - Dynamic browser font registration.

## License

MIT
