import './style.css';

// Scan all fonts in the /fonts/ directory.
const fontModules = import.meta.glob('/fonts/**/*.{ttf,otf,woff,woff2}', { eager: true, query: '?url', import: 'default' });

const familySelect = document.getElementById('family-select');
const variantList = document.getElementById('variant-list');
const previewText = document.getElementById('preview-text');

const sizeInput = document.getElementById('font-size');
const sizeNum = document.getElementById('size-num');

const lineHeightInput = document.getElementById('line-height');
const lineHeightNum = document.getElementById('line-height-num');

const letterSpacingInput = document.getElementById('letter-spacing');
const letterSpacingNum = document.getElementById('letter-spacing-num');

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
let currentVariantIndex = 0;

// Group fonts by family (first folder inside /fonts/)
Object.entries(fontModules).forEach(([path, url]) => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 3 && parts[0] === 'fonts') {
    const family = parts[1];
    const filename = parts[parts.length - 1];
    let subParts = parts.slice(2);
    if (subParts.length > 1 && subParts[0].toLowerCase() === family.toLowerCase()) {
      subParts = subParts.slice(1);
    }
    const label = subParts.join(' › ');

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
    variantList.innerHTML = '<div class="variant-item">-</div>';
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

  // Bidirectional binding between range sliders and numeric inputs
  bindSliderAndNum(sizeInput, sizeNum);
  bindSliderAndNum(lineHeightInput, lineHeightNum);
  bindSliderAndNum(letterSpacingInput, letterSpacingNum);

  bgColorPicker.addEventListener('input', updateStyles);
  textColorPicker.addEventListener('input', updateStyles);
  copyBtn.addEventListener('click', copyCSS);

  // Keyboard navigation for variant list (ArrowUp / ArrowDown)
  variantList.addEventListener('keydown', (e) => {
    const family = familySelect.value;
    const variants = fontFamilies[family] || [];
    if (variants.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(currentVariantIndex + 1, variants.length - 1);
      selectVariantItem(nextIndex, true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(currentVariantIndex - 1, 0);
      selectVariantItem(prevIndex, true);
    }
  });

  // Initialize with first family
  onFamilyChange(families[0]);
}

function bindSliderAndNum(sliderEl, numEl) {
  sliderEl.addEventListener('input', () => {
    numEl.value = sliderEl.value;
    updateStyles();
  });

  numEl.addEventListener('input', () => {
    sliderEl.value = numEl.value;
    updateStyles();
  });
}

function onFamilyChange(family) {
  const variants = fontFamilies[family] || [];
  variantList.innerHTML = '';
  currentVariantIndex = 0;

  if (variants.length === 0) {
    variantList.innerHTML = '<div class="variant-item">No variants found</div>';
    return;
  }

  variants.forEach((variant, index) => {
    const item = document.createElement('div');
    item.className = 'variant-item' + (index === 0 ? ' selected' : '');
    item.textContent = variant.label;
    item.dataset.index = index;

    // Hover event -> Instant preview!
    item.addEventListener('mouseenter', () => {
      selectVariantItem(index, false);
    });

    // Click event -> Confirm selection
    item.addEventListener('click', () => {
      selectVariantItem(index, true);
    });

    variantList.appendChild(item);
  });

  // When mouse leaves the list container, revert preview to currently selected item
  variantList.addEventListener('mouseleave', () => {
    selectVariantItem(currentVariantIndex, false);
  });

  selectVariantItem(0, true);
}

function selectVariantItem(index, setAsActive = true) {
  const items = variantList.querySelectorAll('.variant-item');
  items.forEach((el, idx) => {
    if (idx === index) {
      el.classList.add('selected');
      el.scrollIntoView({ block: 'nearest' });
    } else {
      el.classList.remove('selected');
    }
  });

  const family = familySelect.value;
  const variants = fontFamilies[family] || [];
  if (variants[index]) {
    if (setAsActive) {
      currentVariantIndex = index;
    }
    loadFont(variants[index]);
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
        <label for="axis-${axis.id}">
          <span>${axis.name}</span>
          <div class="num-wrapper">
            <input type="number" id="num-${axis.id}" min="${axis.min}" max="${axis.max}" value="${axis.value}" class="num-input">
          </div>
        </label>
        <input type="range" id="axis-${axis.id}" data-axis="${axis.id}" min="${axis.min}" max="${axis.max}" value="${axis.value}">
      `;
      variableAxesContainer.appendChild(group);

      const sliderInput = group.querySelector(`input[type="range"]`);
      const numInput = group.querySelector(`input[type="number"]`);
      
      sliderInput.addEventListener('input', () => {
        numInput.value = sliderInput.value;
        currentFontAxes[axis.id] = sliderInput.value;
        updateStyles();
      });

      numInput.addEventListener('input', () => {
        sliderInput.value = numInput.value;
        currentFontAxes[axis.id] = numInput.value;
        updateStyles();
      });
    });
  } else {
     currentFontAxes = {};
  }
}

function updateStyles() {
  previewArea.style.background = bgColorPicker.value;
  previewText.style.color = textColorPicker.value;
  previewText.style.fontFamily = `"${currentFontFamily}", sans-serif`;
  previewText.style.fontSize = `${sizeInput.value}px`;
  previewText.style.lineHeight = lineHeightInput.value;
  previewText.style.letterSpacing = `${letterSpacingInput.value}px`;

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
  css += `letter-spacing: ${letterSpacingInput.value}px;\n`;
  
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
