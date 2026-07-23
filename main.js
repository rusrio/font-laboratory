import './style.css';

// Scan all fonts in the project. Vite handles this at build/dev time.
const fontModules = import.meta.glob('/**/*.{ttf,otf,woff,woff2}', { eager: true, query: '?url', import: 'default' });

const fontSelect = document.getElementById('font-select');
const previewText = document.getElementById('preview-text');
const sizeInput = document.getElementById('font-size');
const sizeVal = document.getElementById('size-val');
const lineHeightInput = document.getElementById('line-height');
const lineHeightVal = document.getElementById('line-height-val');
const copyBtn = document.getElementById('copy-css');
const variableAxesContainer = document.getElementById('variable-axes');

// State
let loadedFonts = new Map();
let currentFontFamily = '';
let currentFontAxes = {};

// Clean up paths for display. 
// Keys in fontModules look like '/Nohemi/Nohemi/Variable-TT/Nohemi-VF.ttf'
const fontsList = Object.entries(fontModules).map(([path, url]) => {
  const parts = path.split('/');
  const filename = parts.pop();
  const folder = parts.length > 1 ? parts[1] : 'Root'; // Usually parts[1] is the base folder because path starts with /
  return { path, filename, folder, url };
});

function init() {
  if (fontsList.length === 0) {
    fontSelect.innerHTML = '<option value="">No fonts found in directory</option>';
    return;
  }

  // Populate select
  fontSelect.innerHTML = '';
  fontsList.forEach((font, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${font.folder} - ${font.filename}`;
    fontSelect.appendChild(option);
  });

  // Events
  fontSelect.addEventListener('change', (e) => loadFont(fontsList[e.target.value]));
  sizeInput.addEventListener('input', updateStyles);
  lineHeightInput.addEventListener('input', updateStyles);
  copyBtn.addEventListener('click', copyCSS);

  // Load first font
  loadFont(fontsList[0]);
}

async function loadFont(fontInfo) {
  const familyName = `Font_${fontInfo.filename.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  if (!loadedFonts.has(familyName)) {
    const format = fontInfo.filename.split('.').pop().toLowerCase();
    let formatCss = format;
    if (format === 'ttf') formatCss = 'truetype';
    if (format === 'otf') formatCss = 'opentype';
    
    const font = new FontFace(familyName, `url(${fontInfo.url}) format('${formatCss}')`);
    try {
      const loadedFace = await font.load();
      document.fonts.add(loadedFace);
      loadedFonts.set(familyName, loadedFace);
    } catch (err) {
      console.error('Error loading font', err);
    }
  }

  currentFontFamily = familyName;
  updateStyles();
  renderVariableAxesMockup(fontInfo.filename);
}

// Native JS can't read internal font axes easily without opentype.js,
// so we provide standard weight/width axes for variable fonts.
function renderVariableAxesMockup(filename) {
  variableAxesContainer.innerHTML = '';
  
  // Basic heuristic: check if it's a variable font
  if (filename.toLowerCase().includes('variable') || filename.toLowerCase().includes('vf')) {
    const axes = [
      { id: 'wght', name: 'Weight', min: 100, max: 900, value: 400 },
      { id: 'wdth', name: 'Width', min: 50, max: 150, value: 100 }
    ];

    currentFontAxes = { wght: 400, wdth: 100 };

    axes.forEach(axis => {
      const group = document.createElement('div');
      group.className = 'control-group';
      group.innerHTML = `
        <label for="axis-${axis.id}">${axis.name} (<span id="val-${axis.id}">${axis.value}</span>)</label>
        <input type="range" id="axis-${axis.id}" data-axis="${axis.id}" min="${axis.min}" max="${axis.max}" value="${axis.value}">
      `;
      variableAxesContainer.appendChild(group);

      const input = group.querySelector('input');
      const valDisplay = group.querySelector(`#val-${axis.id}`);
      
      input.addEventListener('input', (e) => {
        valDisplay.textContent = e.target.value;
        currentFontAxes[axis.id] = e.target.value;
        updateStyles();
      });
    });
  } else {
     currentFontAxes = {};
  }
}

function updateStyles() {
  sizeVal.textContent = sizeInput.value;
  lineHeightVal.textContent = lineHeightInput.value;

  previewText.style.fontFamily = `"${currentFontFamily}", sans-serif`;
  previewText.style.fontSize = `${sizeInput.value}px`;
  previewText.style.lineHeight = lineHeightInput.value;

  if (Object.keys(currentFontAxes).length > 0) {
    const settings = Object.entries(currentFontAxes)
      .map(([axis, val]) => `"${axis}" ${val}`)
      .join(', ');
    previewText.style.fontVariationSettings = settings;
  } else {
    previewText.style.fontVariationSettings = 'normal';
  }
}

function copyCSS() {
  let css = `font-family: "${currentFontFamily}", sans-serif;\n`;
  css += `font-size: ${sizeInput.value}px;\n`;
  css += `line-height: ${lineHeightInput.value};\n`;
  
  if (Object.keys(currentFontAxes).length > 0) {
    const settings = Object.entries(currentFontAxes)
      .map(([axis, val]) => `"${axis}" ${val}`)
      .join(', ');
    css += `font-variation-settings: ${settings};\n`;
  }

  navigator.clipboard.writeText(css).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.backgroundColor = '#10b981'; // green
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.backgroundColor = '';
    }, 2000);
  });
}

init();
