const ASPECT_RATIOS = [
  {
    label: '1:1（正方形）',
    width: 1,
    height: 1
  },
  {
    label: '1.91:1（noteカバー）',
    width: 1.91,
    height: 1
  },
  {
    label: '4:3（旧テレビ）',
    width: 4,
    height: 3
  },
  {
    label: '16:9（一般横長）',
    width: 16,
    height: 9
  }
];

const fileInput = document.getElementById('fileInput');
const uploadLink = document.getElementById('uploadLink');
const ratioSelect = document.getElementById('ratioSelect');
const backgroundSelect = document.getElementById('backgroundSelect');
const sizeSelect = document.getElementById('sizeSelect');
const dropArea = document.getElementById('dropArea');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadButton = document.getElementById('downloadButton');

let sourceImage = null;
let sourceFileName = 'converted-image';

initRatioSelect();

/**
 * .controls 配下にある select 要素の状態を localStorage に保存・復元する機能
 */
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'image_resizer_settings';
  const selects = document.querySelectorAll('.controls select');

  /**
   * 現在のセレクトボックスの状態を localStorage に保存します
   */
  const saveSettings = () => {
    const settings = {};
    selects.forEach(select => {
      if (select.id) {
        settings[select.id] = select.value;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };

  /**
   * localStorage から保存された設定を読み込み、セレクトボックスに適用します
   */
  const loadSettings = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
      const settings = JSON.parse(savedData);
      selects.forEach(select => {
        // 保存された値が存在し、かつその要素に該当するオプションがある場合に適用
        if (select.id && settings[select.id]) {
          select.value = settings[select.id];
        }
      });
    } catch (error) {
      console.error('設定の復元に失敗しました:', error);
    }
  };

  // 1. ページ読み込み時に保存された設定を復元
  loadSettings();

  // 2. 各セレクトボックスの変更を監視し、変更があれば即座に保存
  selects.forEach(select => {
    select.addEventListener('change', saveSettings);
  });
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];

  if (file) {
    loadImageFile(file);
  }
});

uploadLink.addEventListener('click', event => {
  event.preventDefault();
  fileInput.click();
});

ratioSelect.addEventListener('change', renderCanvas);
backgroundSelect.addEventListener('change', renderCanvas);
sizeSelect.addEventListener('change', renderCanvas);

downloadButton.addEventListener('click', () => {
  const imageFormat = document.getElementById('formatSelect').value;
  const fmt = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/avif': 'avif'
  }
  const link = document.createElement('a');
  link.href = canvas.toDataURL(imageFormat);
  link.download = `${sourceFileName}.${fmt[imageFormat]}`;
  link.click();
});

dropArea.addEventListener('dragover', event => {
  event.preventDefault();
  dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', event => {
  event.preventDefault();
  dropArea.classList.remove('dragover');

  const file = [...event.dataTransfer.files].find(item => item.type.startsWith('image/'));

  if (file) {
    loadImageFile(file);
  }
});

document.addEventListener('paste', event => {
  const items = [...event.clipboardData.items];
  const imageItem = items.find(item => item.type.startsWith('image/'));

  if (!imageItem) {
    return;
  }

  const file = imageItem.getAsFile();

  if (file) {
    sourceFileName = 'pasted-image';
    loadImageFile(file);
  }
});

function initRatioSelect() {
  ASPECT_RATIOS.forEach((ratio, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = ratio.label;
    ratioSelect.appendChild(option);
  });
}

function loadImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを指定してください。');
    return;
  }

  sourceFileName = getBaseFileName(file.name);

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      sourceImage = image;
      downloadButton.disabled = false;
      renderCanvas();
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function renderCanvas() {
  if (!sourceImage) {
    return;
  }

  const ratio = ASPECT_RATIOS[Number(ratioSelect.value)];
  const longSide = Number(sizeSelect.value);
  const ratioValue = ratio.width / ratio.height;

  let outputWidth;
  let outputHeight;

  if (ratioValue >= 1) {
    outputWidth = longSide;
    outputHeight = Math.round(longSide / ratioValue);
  } else {
    outputHeight = longSide;
    outputWidth = Math.round(longSide * ratioValue);
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  drawBackground(outputWidth, outputHeight);
  drawContainedImage(outputWidth, outputHeight);
}

function drawBackground(outputWidth, outputHeight) {
  const mode = backgroundSelect.value;

  ctx.clearRect(0, 0, outputWidth, outputHeight);

  if (mode === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    return;
  }

  if (mode === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    return;
  }

  if (mode === 'topLeft') {
    ctx.fillStyle = getTopLeftPixelColor(sourceImage);
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    return;
  }

  if (mode === 'blur') {
    drawBlurredBackground(outputWidth, outputHeight);
  }
}

function drawContainedImage(outputWidth, outputHeight) {
  const imageRatio = sourceImage.width / sourceImage.height;
  const canvasRatio = outputWidth / outputHeight;

  let drawWidth;
  let drawHeight;

  if (imageRatio > canvasRatio) {
    drawWidth = outputWidth;
    drawHeight = outputWidth / imageRatio;
  } else {
    drawHeight = outputHeight;
    drawWidth = outputHeight * imageRatio;
  }

  const drawX = (outputWidth - drawWidth) / 2;
  const drawY = (outputHeight - drawHeight) / 2;

  ctx.filter = 'none';
  ctx.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);
}

function drawBlurredBackground(outputWidth, outputHeight) {
  const imageRatio = sourceImage.width / sourceImage.height;
  const canvasRatio = outputWidth / outputHeight;

  let drawWidth;
  let drawHeight;

  if (imageRatio > canvasRatio) {
    drawHeight = outputHeight;
    drawWidth = outputHeight * imageRatio;
  } else {
    drawWidth = outputWidth;
    drawHeight = outputWidth / imageRatio;
  }

  const drawX = (outputWidth - drawWidth) / 2;
  const drawY = (outputHeight - drawHeight) / 2;

  ctx.save();
  ctx.filter = 'blur(24px)';
  ctx.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(0, 0, outputWidth, outputHeight);
}

function getTopLeftPixelColor(image) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = 1;
  tempCanvas.height = 1;

  tempCtx.drawImage(image, 0, 0, 1, 1);

  const pixel = tempCtx.getImageData(0, 0, 1, 1).data;

  return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
}

function getBaseFileName(fileName) {
  return fileName.replace(/\.[^/.]+$/, '') || 'converted-image';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('Service Worker registered');
    }).catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  });
}