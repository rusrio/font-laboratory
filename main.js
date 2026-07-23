import './style.css';

// Scan all fonts in the /fonts/ directory.
const fontModules = import.meta.glob('/fonts/**/*.{ttf,otf,woff,woff2}', { eager: true, query: '?url', import: 'default' });

const familySelect = document.getElementById('family-select');
const variantSelect = document.getElementById('variant-select');
const previewText = document.getElementById('preview-text');
const sizeInput = document.getElementById('font-size');
const sizeVal = document.getElementById('size-val');
const lineHeightInput = document.getElementById('line-height');
const lineHeightVal = document.getElementById('line-height-val');
const copyBtn = document.getElementById('copy-css');
const variableAxesContainer = document.getElementById('variable-axes');
const previewArea = document.querySelector('.preview-area');
const bgColorPicker = document.getElementById('bg-color-picker');
const textColorPicker = document.getElementById('text-color-picker');

// State
let loadedFonts = new Map();
let currentFontFamily = '';
let currentFontAxes = {};
let fontFamilies = {};

// Group fonts by family (first folder inside /fonts/)
Object.entries(fontModules).forEach(([path, url]) => {
  const parts = path.split('/').filter(Boolean);
  // Expected path format: ['fonts', 'FamilyName', ...]
  if (parts.length >= 3 && parts[0] === 'fonts') {
    const family = parts[1];
    const filename = parts[parts.length - 1];
    // Create readable label from relative path inside family folder
    const label = parts.slice(2).join(' › ');

    if (!fontFamilies[family]) {
      fontFamilies[family] = [];
    }

    fontFamilies[family].push({
      path,
      url,
      filename,
      label
    });
  }
});

function init() {
  const families = Object.keys(fontFamilies);

  if (families.length === 0) {
    familySelect.innerHTML = '<option value="">No fonts found in /fonts</option>';
    variantSelect.innerHTML = '<option value="">-</option>';
    return;
  }

  // Populate Family select
  familySelect.innerHTML = '';
  families.forEach((family) => {
    const option = document.createElement('option');
    option.value = family;
    option.textContent = family;
    familySelect.appendChild(option);
  });

  // Event Listeners
  familySelect.addEventListener('change', (e) => onFamilyChange(e.target.value));
  variantSelect.addEventListener('change', (e) => {
    const family = familySelect.value;
    const selectedVariantIndex = e.target.value;
    if (fontFamilies[family] && fontFamilies[family][selectedVariantIndex]) {
      loadFont(fontFamilies[family][selectedVariantIndex]);
    }
  });

  sizeInput.addEventListener('input', updateStyles);
  lineHeightInput.addEventListener('input', updateStyles);
  bgColorPicker.addEventListener('input', updateStyles);
  textColorPicker.addEventListener('input', updateStyles);
  copyBtn.addEventListener('click', copyCSS);

  // Initialize with first family
  onFamilyChange(families[0]);
}

function onFamilyChange(family) {
  const variants = fontFamilies[family] || [];
  variantSelect.innerHTML = '';

  variants.forEach((variant, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = variant.label;
    variantSelect.appendChild(option);
  });

  if (variants.length > 0) {
    loadFont(variants[0]);
  }
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

// Variable font controls heuristic
function renderVariableAxesMockup(filename) {
  variableAxesContainer.innerHTML = '';
  
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

  previewArea.style.background = bgColorPicker.value;
  previewText.style.color = textColorPicker.value;
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
  css += `color: ${textColorPicker.value};\n`;
  css += `background-color: ${bgColorPicker.value};\n`;
  
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
