const revealElements = document.querySelectorAll('.reveal');
const heroStage = document.querySelector('.hero-stage');
const toolTabs = document.querySelectorAll('.tool-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const heroQuickActions = document.querySelectorAll('[data-open-tab]');
const heroUploadBtn = document.querySelector('#heroUploadBtn');
const cookieBanner = document.querySelector('#cookieBanner');
const acceptCookiesBtn = document.querySelector('#acceptCookiesBtn');
const rejectCookiesBtn = document.querySelector('#rejectCookiesBtn');
const adContainers = document.querySelectorAll('[data-ad-slot]');
const adInsElements = document.querySelectorAll('.adsbygoogle');

let adsInitialized = false;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((element) => revealObserver.observe(element));

function hideCookieBanner() {
  if (!cookieBanner) return;
  cookieBanner.hidden = true;
}

function showCookieBanner() {
  if (!cookieBanner) return;
  cookieBanner.hidden = false;
}

function setCookieConsent(value) {
  localStorage.setItem('convertix_cookie_consent', value);
  hideCookieBanner();
  initAds();
}

function initCookieBanner() {
  const consent = localStorage.getItem('convertix_cookie_consent');

  if (consent === 'accepted' || consent === 'rejected') {
    hideCookieBanner();
    return;
  }

  showCookieBanner();
}

function getAdsClientId() {
  const meta = document.querySelector('meta[name="adsense-client"]');
  return (meta?.content || '').trim();
}

function toggleAdVisibility(visible) {
  adContainers.forEach((container) => {
    container.hidden = !visible;
  });
}

function applyAdsClient(clientId) {
  adInsElements.forEach((adIns) => {
    adIns.setAttribute('data-ad-client', clientId);
  });
}

function renderAdsWhenReady(attempt = 0) {
  if (typeof window.adsbygoogle === 'undefined') {
    if (attempt < 20) {
      setTimeout(() => renderAdsWhenReady(attempt + 1), 150);
    }
    return;
  }

  adInsElements.forEach(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
  adsInitialized = true;
}

function initAds() {
  const consent = localStorage.getItem('convertix_cookie_consent');
  const clientId = getAdsClientId();
  const canLoadAds = consent === 'accepted' && clientId.startsWith('ca-pub-');

  if (!canLoadAds) {
    toggleAdVisibility(false);
    return;
  }

  toggleAdVisibility(true);
  applyAdsClient(clientId);

  if (adsInitialized) {
    return;
  }

  renderAdsWhenReady();
}

function activateToolTab(tabName) {
  toolTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.panel === tabName);
  });
}

toolTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateToolTab(tab.dataset.tab));
});

const { jsPDF } = window.jspdf;

const pdfTitle = document.querySelector('#pdfTitle');
const pdfContent = document.querySelector('#pdfContent');
const generateTextPdf = document.querySelector('#generateTextPdf');
const textPdfFeedback = document.querySelector('#textPdfFeedback');
const heroPreviewTitle = document.querySelector('#heroPreviewTitle');
const heroPreviewDescription = document.querySelector('#heroPreviewDescription');
const heroFloatTextTitle = document.querySelector('#heroFloatTextTitle');
const heroFloatTextMeta = document.querySelector('#heroFloatTextMeta');
const heroTextStatus = document.querySelector('#heroTextStatus');
const heroImageStatus = document.querySelector('#heroImageStatus');
const heroExtractStatus = document.querySelector('#heroExtractStatus');
const heroCsvStatus = document.querySelector('#heroCsvStatus');
const heroFloatExtractTitle = document.querySelector('#heroFloatExtractTitle');
const heroFloatExtractMeta = document.querySelector('#heroFloatExtractMeta');

generateTextPdf?.addEventListener('click', () => {
  const title = (pdfTitle?.value || 'Documento').trim();
  const content = (pdfContent?.value || '').trim();

  if (!content) {
    textPdfFeedback.textContent = 'Digite algum conteúdo antes de gerar o PDF.';
    textPdfFeedback.style.color = '#b0442a';
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, maxWidth);
  doc.text(lines, margin, 30);

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase() || 'documento'}.pdf`);
  textPdfFeedback.textContent = 'PDF de texto gerado com sucesso.';
  textPdfFeedback.style.color = '#085f4a';
  if (heroTextStatus) heroTextStatus.textContent = 'PDF pronto para baixar';
});

const imageInput = document.querySelector('#imageInput');
const imagePreview = document.querySelector('#imagePreview');
const generateImagePdf = document.querySelector('#generateImagePdf');
const imagePdfFeedback = document.querySelector('#imagePdfFeedback');
const extractSelectedFile = document.querySelector('#extractSelectedFile');
const extractSelectedFileName = document.querySelector('#extractSelectedFileName');
const removeExtractFileBtn = document.querySelector('#removeExtractFileBtn');
let imageFiles = [];

function syncImageInputFiles() {
  if (!imageInput) return;

  const dataTransfer = new DataTransfer();
  imageFiles.forEach((file) => dataTransfer.items.add(file));
  imageInput.files = dataTransfer.files;
}

function renderImagePreview() {
  if (!imagePreview) return;

  imagePreview.innerHTML = '';

  imageFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-file-btn';
    removeBtn.setAttribute('aria-label', `Remover ${file.name}`);
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      imageFiles = imageFiles.filter((_, currentIndex) => currentIndex !== index);
      syncImageInputFiles();
      renderImagePreview();
      updateHeroPreview();
    });

    item.appendChild(img);
    item.appendChild(removeBtn);
    imagePreview.appendChild(item);
  });
}

function updateExtractFileBadge() {
  const selectedFile = pdfExtractInput?.files?.[0];

  if (!extractSelectedFile || !extractSelectedFileName) return;

  if (!selectedFile) {
    extractSelectedFile.style.display = 'none';
    extractSelectedFileName.textContent = '';
    return;
  }

  extractSelectedFileName.textContent = selectedFile.name;
  extractSelectedFile.style.display = 'flex';
}

function clearExtractFileSelection() {
  if (pdfExtractInput) {
    pdfExtractInput.value = '';
  }

  if (extractedText) {
    extractedText.value = '';
    extractedText.style.display = 'none';
  }

  if (copyExtractedBtn) {
    copyExtractedBtn.style.display = 'none';
  }

  extractPdfFeedback.textContent = 'Arquivo removido.';
  extractPdfFeedback.style.color = '#2d6f86';
  updateExtractFileBadge();
  updateHeroPreview();
}

heroQuickActions.forEach((action) => {
  action.addEventListener('click', () => {
    const targetTab = action.dataset.openTab;
    const focusSelector = action.dataset.focus;

    activateToolTab(targetTab);

    if (focusSelector) {
      const targetElement = document.querySelector(focusSelector);
      targetElement?.focus();
    }
  });
});

heroUploadBtn?.addEventListener('click', () => {
  activateToolTab('imagem');
  imageInput?.click();
});

imageInput?.addEventListener('change', (event) => {
  imageFiles = Array.from(event.target.files || []);
  renderImagePreview();

  updateHeroPreview();
});

function loadImageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler imagem.'));
    reader.readAsDataURL(file);
  });
}

generateImagePdf?.addEventListener('click', async () => {
  if (imageFiles.length === 0) {
    imagePdfFeedback.textContent = 'Selecione pelo menos uma imagem.';
    imagePdfFeedback.style.color = '#b0442a';
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  for (let index = 0; index < imageFiles.length; index += 1) {
    const file = imageFiles[index];
    const dataUrl = await loadImageData(file);
    const img = new Image();

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    if (index > 0) {
      doc.addPage();
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    doc.addImage(dataUrl, 'JPEG', x, y, width, height);
  }

  doc.save('imagens_para_pdf.pdf');
  imagePdfFeedback.textContent = 'PDF de imagens gerado com sucesso.';
  imagePdfFeedback.style.color = '#085f4a';
  if (heroImageStatus) heroImageStatus.textContent = `${imageFiles.length || 0} imagem(ns) prontas`;
});

// ===== PDF EXTRACT =====
const pdfExtractInput = document.querySelector('#pdfExtractInput');
const extractPdfBtn = document.querySelector('#extractPdfBtn');
const extractPdfFeedback = document.querySelector('#extractPdfFeedback');
const extractedText = document.querySelector('#extractedText');
const copyExtractedBtn = document.querySelector('#copyExtractedBtn');

extractPdfBtn?.addEventListener('click', async () => {
  if (!pdfExtractInput.files || pdfExtractInput.files.length === 0) {
    extractPdfFeedback.textContent = 'Selecione um PDF antes.';
    extractPdfFeedback.style.color = '#dc2626';
    return;
  }

  const file = pdfExtractInput.files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const pdf = await pdfjsLib.getDocument(event.target.result).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    extractedText.value = fullText;
    extractedText.style.display = 'block';
    copyExtractedBtn.style.display = 'block';
    extractPdfFeedback.textContent = `Texto extraído de ${pdf.numPages} página(s).`;
    extractPdfFeedback.style.color = '#16a085';
  };

  reader.onerror = () => {
    extractPdfFeedback.textContent = 'Erro ao ler o PDF.';
    extractPdfFeedback.style.color = '#dc2626';
  };

  reader.readAsArrayBuffer(file);
});

pdfExtractInput?.addEventListener('change', () => {
  updateExtractFileBadge();
  updateHeroPreview();
});

removeExtractFileBtn?.addEventListener('click', clearExtractFileSelection);

copyExtractedBtn?.addEventListener('click', () => {
  extractedText.select();
  document.execCommand('copy');
  extractPdfFeedback.textContent = 'Texto copiado para a área de transferência!';
  extractPdfFeedback.style.color = '#16a085';
  if (heroExtractStatus) heroExtractStatus.textContent = 'Texto copiado';
});

// ===== CSV TO PDF =====
const csvInput = document.querySelector('#csvInput');
const pdfTableTitle = document.querySelector('#pdfTableTitle');
const generateCsvPdfBtn = document.querySelector('#generateCsvPdfBtn');
const csvPdfFeedback = document.querySelector('#csvPdfFeedback');

generateCsvPdfBtn?.addEventListener('click', () => {
  const csvText = (csvInput?.value || '').trim();
  const tableTitle = (pdfTableTitle?.value || 'Tabela').trim();

  if (!csvText) {
    csvPdfFeedback.textContent = 'Cole dados CSV antes de gerar o PDF.';
    csvPdfFeedback.style.color = '#dc2626';
    return;
  }

  const lines = csvText.split('\n').filter((l) => l.trim());
  const rows = lines.map((line) =>
    line.split(',').map((cell) => cell.trim())
  );

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(tableTitle, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let yPos = 30;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = 180;
  const cellPadding = 2;
  const rowHeight = 7;

  rows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(22, 160, 133);
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 26, 46);
      if (rowIndex % 2 === 0) doc.setFillColor(240, 248, 245);
      else doc.setFillColor(255, 255, 255);
    }

    const colWidth = maxWidth / row.length;
    row.forEach((cell, colIndex) => {
      const xPos = 14 + colIndex * colWidth;
      doc.rect(xPos, yPos, colWidth, rowHeight, isHeader ? 'F' : 'F');
      doc.text(cell, xPos + cellPadding, yPos + 5);
    });

    yPos += rowHeight;

    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  doc.save(`${tableTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  csvPdfFeedback.textContent = 'PDF da tabela gerado com sucesso!';
  csvPdfFeedback.style.color = '#16a085';
  if (heroCsvStatus) heroCsvStatus.textContent = `${rows.length} linha(s) preparadas`;
});

function updateHeroPreview() {
  if (!heroPreviewTitle || !heroPreviewDescription || !heroFloatTextTitle || !heroFloatTextMeta || !heroFloatExtractTitle || !heroFloatExtractMeta) {
    return;
  }

  const currentTitle = (pdfTitle?.value || '').trim();
  const currentContent = (pdfContent?.value || '').trim();
  const csvText = (csvInput?.value || '').trim();
  const csvRows = csvText ? csvText.split('\n').filter((line) => line.trim()).length : 0;
  const currentTableTitle = (pdfTableTitle?.value || '').trim();
  const selectedPdf = pdfExtractInput?.files?.[0]?.name || '';

  heroPreviewTitle.textContent = currentTitle || '';

  if (currentContent) {
    const compact = currentContent.replace(/\s+/g, ' ').slice(0, 86);
    heroPreviewDescription.textContent = compact + (currentContent.length > 86 ? '...' : '');
  } else if (currentTableTitle) {
    heroPreviewDescription.textContent = `Tabela ${currentTableTitle} pronta para virar PDF com acabamento visual.`;
  } else {
    heroPreviewDescription.textContent = 'Crie documentos em segundos com uma interface simples e eficiente.';
  }

  heroFloatTextTitle.textContent = currentTitle || 'Texto';
  heroFloatTextMeta.textContent = currentContent ? `${currentContent.length} caracteres prontos` : 'Rascunhos e propostas';
  if (heroTextStatus) heroTextStatus.textContent = currentTitle ? 'Título configurado' : 'Gerar agora';

  if (heroImageStatus) heroImageStatus.textContent = imageFiles.length > 0 ? `${imageFiles.length} imagem(ns) selecionadas` : 'Merge visual';
  if (heroExtractStatus) heroExtractStatus.textContent = selectedPdf ? 'Arquivo anexado' : 'OCR limpo';
  if (heroCsvStatus) heroCsvStatus.textContent = csvRows > 0 ? `${csvRows} linha(s) detectadas` : 'Tabela elegante';

  heroFloatExtractTitle.textContent = selectedPdf ? 'PDF lido' : 'OCR';
  heroFloatExtractMeta.textContent = selectedPdf ? selectedPdf.slice(0, 26) : 'Extração de conteúdo';
}

pdfTitle?.addEventListener('input', updateHeroPreview);
pdfContent?.addEventListener('input', updateHeroPreview);
csvInput?.addEventListener('input', updateHeroPreview);
pdfTableTitle?.addEventListener('input', updateHeroPreview);

heroStage?.addEventListener('pointermove', (event) => {
  const bounds = heroStage.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  heroStage.style.setProperty('--stage-shift-x', `${x * 10}px`);
  heroStage.style.setProperty('--stage-shift-y', `${y * 10}px`);
});

heroStage?.addEventListener('pointerleave', () => {
  heroStage.style.setProperty('--stage-shift-x', '0px');
  heroStage.style.setProperty('--stage-shift-y', '0px');
});

acceptCookiesBtn?.addEventListener('click', () => setCookieConsent('accepted'));
rejectCookiesBtn?.addEventListener('click', () => setCookieConsent('rejected'));

updateHeroPreview();
initCookieBanner();
initAds();
