/**
 * ExamPaper Studio - Main Application Logic
 * Offline single-page Canva-style school exam paper editor.
 */

(function () {
  const STORAGE_KEY = 'exampaper_studio_doc_v1';
  const WELCOME_KEY = 'exampaper_studio_welcomed_v1';

  // A4 dimensions in px at 96 DPI (210mm x 297mm)
  const A4_PORTRAIT = { w: 794, h: 1123 };
  const A4_LANDSCAPE = { w: 1123, h: 794 };
  const MARGIN_PX = 56; // ~15mm margin guide
  const GRID_SNAP = 8;
  const PX_PER_MM = 3.7795275591;

  // Application State
  let doc = null;
  let activePageIndex = 0;
  let selectedElId = null;
  let activeTab = 'titles';
  let zoom = 1.0;
  let undoStack = [];
  let redoStack = [];
  let vkShift = false;
  let confirmCallback = null;

  // DOM References
  const canvasViewport = document.getElementById('canvasViewport');
  const tabDrawer = document.getElementById('tabDrawer');
  const rightSidebar = document.getElementById('rightSidebar');
  const floatingToolbar = document.getElementById('floatingToolbar');
  const nepaliPanel = document.getElementById('nepaliPanel');
  const docTitleInput = document.getElementById('docTitleInput');
  const saveStatus = document.getElementById('saveStatus');

  // -------------------------------------------------------
  // Initialization
  // -------------------------------------------------------
  function init() {
    loadFromLocalStorage();
    bindTopBarEvents();
    bindSidebarTabEvents();
    bindFloatingToolbarEvents();
    bindNepaliPanelEvents();
    bindKeyboardShortcuts();
    renderDrawer();
    renderCanvas();
    updateTopBarUI();

    if (!localStorage.getItem(WELCOME_KEY)) {
      document.getElementById('welcomeModal').classList.add('visible');
    }
    document.getElementById('btnCloseWelcome').addEventListener('click', () => {
      localStorage.setItem(WELCOME_KEY, '1');
      document.getElementById('welcomeModal').classList.remove('visible');
    });

    document.getElementById('btnConfirmCancel').addEventListener('click', closeConfirm);
    document.getElementById('btnConfirmOk').addEventListener('click', () => {
      if (confirmCallback) confirmCallback();
      closeConfirm();
    });
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        doc = JSON.parse(saved);
        if (doc && doc.pages && doc.pages.length > 0) {
          docTitleInput.value = doc.title || 'Untitled Exam Paper';
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load saved project:', e);
    }
    // Default start: Unit Test or Blank? Let's start with Unit Test template so user immediately sees a rich editable paper, or Blank.
    doc = window.EXAM_TEMPLATES.getDocumentTemplate('unittest');
    docTitleInput.value = doc.title;
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      saveStatus.textContent = 'Saved offline';
    } catch (e) {
      saveStatus.textContent = 'Save warning';
    }
  }

  function pushUndo() {
    undoStack.push(JSON.stringify(doc));
    if (undoStack.length > 40) undoStack.shift();
    redoStack = [];
    updateTopBarUI();
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(doc));
    doc = JSON.parse(undoStack.pop());
    if (activePageIndex >= doc.pages.length) activePageIndex = doc.pages.length - 1;
    selectedElId = null;
    docTitleInput.value = doc.title || 'Untitled Exam Paper';
    saveToLocalStorage();
    renderCanvas();
    renderRightSidebar();
    updateFloatingToolbar();
    updateTopBarUI();
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(doc));
    doc = JSON.parse(redoStack.pop());
    if (activePageIndex >= doc.pages.length) activePageIndex = doc.pages.length - 1;
    selectedElId = null;
    docTitleInput.value = doc.title || 'Untitled Exam Paper';
    saveToLocalStorage();
    renderCanvas();
    renderRightSidebar();
    updateFloatingToolbar();
    updateTopBarUI();
  }

  function openConfirm(title, message, onOk) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onOk;
    document.getElementById('confirmModal').classList.add('visible');
  }

  function closeConfirm() {
    confirmCallback = null;
    document.getElementById('confirmModal').classList.remove('visible');
  }

  function getActivePage() {
    return doc.pages[activePageIndex] || doc.pages[0];
  }

  function getSelectedElement() {
    if (!selectedElId) return null;
    for (const page of doc.pages) {
      const found = page.elements.find(el => el.id === selectedElId);
      if (found) return found;
    }
    return null;
  }

  function getPageForElement(elId) {
    return doc.pages.find(p => p.elements.some(e => e.id === elId));
  }

  // -------------------------------------------------------
  // Top Bar Events
  // -------------------------------------------------------
  function bindTopBarEvents() {
    docTitleInput.addEventListener('input', () => {
      doc.title = docTitleInput.value;
      saveToLocalStorage();
    });

    document.getElementById('btnUndo').addEventListener('click', undo);
    document.getElementById('btnRedo').addEventListener('click', redo);

    document.getElementById('btnOrientation').addEventListener('click', () => {
      pushUndo();
      const page = getActivePage();
      page.orientation = page.orientation === 'portrait' ? 'landscape' : 'portrait';
      saveToLocalStorage();
      renderCanvas();
      updateTopBarUI();
    });

    document.getElementById('btnAddPage').addEventListener('click', () => {
      pushUndo();
      doc.pages.push({
        id: 'page_' + Date.now(),
        orientation: 'portrait',
        elements: []
      });
      activePageIndex = doc.pages.length - 1;
      selectedElId = null;
      saveToLocalStorage();
      renderCanvas();
      renderRightSidebar();
      updateTopBarUI();
    });

    document.getElementById('btnZoomIn').addEventListener('click', () => {
      zoom = Math.min(1.6, +(zoom + 0.1).toFixed(2));
      renderCanvas();
      updateTopBarUI();
    });

    document.getElementById('btnZoomOut').addEventListener('click', () => {
      zoom = Math.max(0.5, +(zoom - 0.1).toFixed(2));
      renderCanvas();
      updateTopBarUI();
    });

    document.getElementById('btnPrint').addEventListener('click', () => {
      selectedElId = null;
      renderCanvas();
      updateFloatingToolbar();
      setTimeout(() => window.print(), 80);
    });

    document.getElementById('btnExportPdf').addEventListener('click', () => {
      selectedElId = null;
      renderCanvas();
      updateFloatingToolbar();
      alert('Tip: In the print dialog that opens next, select "Save as PDF" as your destination and ensure "Headers and footers" is unchecked for an exact A4 PDF.');
      setTimeout(() => window.print(), 80);
    });
  }

  function updateTopBarUI() {
    document.getElementById('btnUndo').disabled = undoStack.length === 0;
    document.getElementById('btnRedo').disabled = redoStack.length === 0;
    const page = getActivePage();
    document.getElementById('orientationLabel').textContent =
      page && page.orientation === 'landscape' ? 'Landscape' : 'Portrait';
    document.getElementById('zoomLabel').textContent = Math.round(zoom * 100) + '%';
  }

  // -------------------------------------------------------
  // Left Sidebar Tabs & Cards
  // -------------------------------------------------------
  function bindSidebarTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
        renderDrawer();
      });
    });
  }

  function renderDrawer() {
    if (activeTab === 'titles') {
      tabDrawer.innerHTML = `
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Exam Titles</h3>
            <p class="drawer-sub">Click to add header or restyle selected title</p>
          </div>
        </div>
        <div class="card-grid">
          <button class="item-card" data-add-title="classic">
            <div class="item-card-preview" style="text-align:center; border-bottom: 2px double #111;">
              <strong>SCHOOL NAME</strong><br/>Terminal Exam • Full Marks: 75
            </div>
            <div class="item-card-title">Add Classic Header</div>
            <div class="item-card-desc">Centered title with double bottom rule</div>
          </button>

          <button class="item-card" data-add-title="boxed">
            <div class="item-card-preview" style="text-align:center; border: 1.5px solid #111;">
              <strong>SCHOOL NAME</strong><br/>Exam Name • Class • Subject
            </div>
            <div class="item-card-title">Add Boxed Header</div>
            <div class="item-card-desc">Framed border around exam metadata</div>
          </button>

          <button class="item-card" data-add-title="twocolumn">
            <div class="item-card-preview" style="display:flex; justify-content:space-between; border-bottom:1.5px solid #111;">
              <span><strong>SCHOOL NAME</strong><br/>Exam</span>
              <span style="text-align:right;">Class 10<br/>FM: 75</span>
            </div>
            <div class="item-card-title">Add Two-Column Header</div>
            <div class="item-card-desc">Left school/exam, right marks & time</div>
          </button>
        </div>
      `;

      tabDrawer.querySelectorAll('[data-add-title]').forEach(card => {
        card.addEventListener('click', () => {
          const style = card.dataset.addTitle;
          const sel = getSelectedElement();
          pushUndo();
          if (sel && sel.type === 'titleBlock') {
            sel.style = style;
          } else {
            const page = getActivePage();
            const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
            const newTitle = window.EXAM_TEMPLATES.createTitleElement(style, MARGIN_PX, 48, dims.w - MARGIN_PX * 2);
            page.elements.push(newTitle);
            selectedElId = newTitle.id;
          }
          saveToLocalStorage();
          renderCanvas();
          renderRightSidebar();
          updateFloatingToolbar();
        });
      });
    }

    if (activeTab === 'text') {
      tabDrawer.innerHTML = `
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Text & Questions</h3>
            <p class="drawer-sub">Click to insert onto the active page</p>
          </div>
        </div>
        <div class="card-grid">
          <button class="item-card" id="btnAddQuestionText">
            <div class="item-card-preview">1. Write your question here... &nbsp;&nbsp;&nbsp;&nbsp; [5]</div>
            <div class="item-card-title">Add Question Block</div>
            <div class="item-card-desc">Editable text box for questions & instructions</div>
          </button>

          <button class="item-card" id="btnAddNepaliText">
            <div class="item-card-preview"><span class="font-preeti" style="font-size:15px;">!= ;a} k|Zgx? clgjfo{ 5g\\ .</span> (Nepali Preeti)</div>
            <div class="item-card-title">Add Nepali (Preeti) Text</div>
            <div class="item-card-desc">Preeti-locked box + Romanized/Unicode helper</div>
          </button>

          <button class="item-card" id="btnAddSectionHeader">
            <div class="item-card-preview"><strong><u>Section A: Very Short Questions [5×1=5]</u></strong></div>
            <div class="item-card-title">Add Section Heading</div>
            <div class="item-card-desc">Bold underlined group/section divider</div>
          </button>

          <button class="item-card" id="btnAddMcq">
            <div class="item-card-preview">
              1. Question stem goes here?<br/>
              (A) Option 1 &nbsp;&nbsp; (B) Option 2<br/>
              (C) Option 3 &nbsp;&nbsp; (D) Option 4
            </div>
            <div class="item-card-title">Add MCQ Question (A–D)</div>
            <div class="item-card-desc">Ready-formatted 4-option multiple choice</div>
          </button>
        </div>

        <div class="drawer-section-label">Quick Question Helpers</div>
        <div class="mini-btn-row">
          <button class="soft-btn" id="btnInsertRightMarks" title="Append right-aligned marks [5] to selected text">+ Marks [5]</button>
          <button class="soft-btn" id="btnInsertSubQ" title="Insert a., b., c., d. sub-questions">+ a. b. c. d.</button>
          <button class="soft-btn" id="btnAddBox" title="Insert a bordered instruction or diagram box">+ Border Box</button>
          <button class="soft-btn" id="btnAddTable" title="Insert an editable 2x3 question/matching table">+ Table (2×3)</button>
        </div>
      `;

      document.getElementById('btnAddQuestionText').addEventListener('click', () => {
        addTextElement('1. Type your question here.\t[5]', { preset: 'Question' });
      });

      document.getElementById('btnAddNepaliText').addEventListener('click', () => {
        const el = addTextElement('!= ;a} k|Zgx? clgjfo{ 5g\\ .', {
          isPreeti: true,
          fontFamily: 'Preeti',
          fontSize: 16,
          preset: 'Question'
        });
        openNepaliPanel();
      });

      document.getElementById('btnAddSectionHeader').addEventListener('click', () => {
        addTextElement('Section A: Very Short Questions [5 × 1 = 5]', {
          bold: true,
          underline: true,
          fontSize: 14,
          height: 32,
          preset: 'Section Heading'
        });
      });

      document.getElementById('btnAddMcq').addEventListener('click', () => {
        addTextElement(
          '1. Which of the following is a renewable source of energy?\t[1]\n' +
          '    (A) Coal          (B) Petroleum          (C) Solar Energy          (D) Natural Gas',
          { height: 58, preset: 'Question' }
        );
      });

      document.getElementById('btnInsertRightMarks').addEventListener('click', () => {
        const sel = getSelectedElement();
        if (sel && sel.type === 'text') {
          pushUndo();
          sel.content = (sel.content || '').trimEnd() + '\t[5]';
          saveToLocalStorage();
          renderCanvas();
        } else {
          addTextElement('1. Question text here\t[5]', { preset: 'Question' });
        }
      });

      document.getElementById('btnInsertSubQ').addEventListener('click', () => {
        const subText = 'a. First sub-question\nb. Second sub-question\nc. Third sub-question\nd. Fourth sub-question';
        const sel = getSelectedElement();
        if (sel && sel.type === 'text') {
          pushUndo();
          sel.content = (sel.content ? sel.content + '\n' : '') + subText;
          sel.height = Math.max(sel.height, 95);
          saveToLocalStorage();
          renderCanvas();
        } else {
          addTextElement(subText, { height: 95, preset: 'Question' });
        }
      });

      document.getElementById('btnAddBox').addEventListener('click', () => {
        pushUndo();
        const page = getActivePage();
        const el = {
          id: 'el_' + Date.now(),
          type: 'box',
          x: MARGIN_PX,
          y: 220,
          width: 682,
          height: 70,
          borderStyle: 'solid',
          borderWidth: 1.5,
          borderColor: '#111827',
          fillColor: '#ffffff',
          label: 'Note / Instructions Box (Click to edit)'
        };
        page.elements.push(el);
        selectedElId = el.id;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
      });

      document.getElementById('btnAddTable').addEventListener('click', () => {
        pushUndo();
        const page = getActivePage();
        const el = {
          id: 'el_' + Date.now(),
          type: 'table',
          x: MARGIN_PX,
          y: 240,
          width: 682,
          height: 110,
          rows: [
            ['Group A', 'Group B'],
            ['1. Item one', 'a. Match one'],
            ['2. Item two', 'b. Match two']
          ]
        };
        page.elements.push(el);
        selectedElId = el.id;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
      });
    }

    if (activeTab === 'lines') {
      tabDrawer.innerHTML = `
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Answer Lines</h3>
            <p class="drawer-sub">Insert blank lines & fill-in-the-blank rules</p>
          </div>
        </div>
        <div class="card-grid">
          <button class="item-card" data-add-line="solid">
            <div class="item-card-preview"><div style="border-bottom: 1.5px solid #111; margin: 6px 0;"></div></div>
            <div class="item-card-title">Add Answer Line (Solid)</div>
            <div class="item-card-desc">Full column width solid writing line</div>
          </button>

          <button class="item-card" data-add-line="dotted">
            <div class="item-card-preview"><div style="border-bottom: 2px dotted #374151; margin: 6px 0;"></div></div>
            <div class="item-card-title">Add Dotted Answer Line</div>
            <div class="item-card-desc">Clean dotted guide line for student answers</div>
          </button>

          <button class="item-card" data-add-line="dashed">
            <div class="item-card-preview"><div style="border-bottom: 1.5px dashed #374151; margin: 6px 0;"></div></div>
            <div class="item-card-title">Add Dashed Divider Line</div>
            <div class="item-card-desc">Dashed section separator or tear-off line</div>
          </button>

          <button class="item-card" id="btnAddBlankShort">
            <div class="item-card-preview" style="display:flex; justify-content:center;">
              <div style="width: 110px; border-bottom: 1.5px solid #111; margin: 6px 0;"></div>
            </div>
            <div class="item-card-title">Add Fill-in-the-Blank Underline</div>
            <div class="item-card-desc">Adjustable by exact mm or character count</div>
          </button>
        </div>
      `;

      tabDrawer.querySelectorAll('[data-add-line]').forEach(card => {
        card.addEventListener('click', () => {
          addLineElement(card.dataset.addLine, 180); // 180mm ~ full column width
        });
      });

      document.getElementById('btnAddBlankShort').addEventListener('click', () => {
        addLineElement('solid', 45); // 45mm short fill-in-the-blank
      });
    }

    if (activeTab === 'templates') {
      tabDrawer.innerHTML = `
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Exam Templates</h3>
            <p class="drawer-sub">Start fresh or load/save JSON projects</p>
          </div>
        </div>
        <div class="card-grid">
          <button class="item-card" data-tpl="blank">
            <div class="item-card-title">Blank A4 Page</div>
            <div class="item-card-desc">Clean A4 sheet with margin guides</div>
          </button>

          <button class="item-card" data-tpl="unittest">
            <div class="item-card-title">Unit Test (25 Marks)</div>
            <div class="item-card-desc">Classic header + Group A & Group B questions</div>
          </button>

          <button class="item-card" data-tpl="terminal">
            <div class="item-card-title">Terminal Exam (75 Marks)</div>
            <div class="item-card-desc">Boxed header + Reading, Grammar & Writing sections</div>
          </button>

          <button class="item-card" data-tpl="worksheet">
            <div class="item-card-title">Practice Worksheet</div>
            <div class="item-card-desc">Two-column header + Student name box & dotted lines</div>
          </button>
        </div>

        <div class="drawer-section-label">Project Backup (Offline File)</div>
        <div class="mini-btn-row">
          <button class="soft-btn" id="btnExportJson" title="Download exam paper as a JSON file">Export JSON</button>
          <button class="soft-btn" id="btnImportJson" title="Open a saved JSON exam paper">Import JSON</button>
        </div>
      `;

      tabDrawer.querySelectorAll('[data-tpl]').forEach(card => {
        card.addEventListener('click', () => {
          const tplKey = card.dataset.tpl;
          openConfirm(
            'Load Template?',
            'Loading this template will replace your current pages. You can press Undo (Ctrl+Z) to go back.',
            () => {
              pushUndo();
              doc = window.EXAM_TEMPLATES.getDocumentTemplate(tplKey);
              activePageIndex = 0;
              selectedElId = null;
              docTitleInput.value = doc.title;
              saveToLocalStorage();
              renderCanvas();
              renderRightSidebar();
              updateFloatingToolbar();
              updateTopBarUI();
            }
          );
        });
      });

      document.getElementById('btnExportJson').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (doc.title || 'exam-paper').replace(/[^a-z0-9_-]/gi, '_') + '.json';
        a.click();
        URL.revokeObjectURL(url);
      });

      document.getElementById('btnImportJson').addEventListener('click', () => {
        document.getElementById('jsonImportInput').click();
      });
    }
  }

  // JSON Import file handler
  document.getElementById('jsonImportInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported && Array.isArray(imported.pages)) {
          pushUndo();
          doc = imported;
          activePageIndex = 0;
          selectedElId = null;
          docTitleInput.value = doc.title || 'Imported Exam Paper';
          saveToLocalStorage();
          renderCanvas();
          renderRightSidebar();
          updateTopBarUI();
        } else {
          alert('Invalid ExamPaper Studio JSON file.');
        }
      } catch (err) {
        alert('Could not read JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // -------------------------------------------------------
  // Element Creation Helpers
  // -------------------------------------------------------
  function addTextElement(content, opts = {}) {
    pushUndo();
    const page = getActivePage();
    const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
    const offset = (page.elements.length % 6) * 24;
    const el = {
      id: 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      type: 'text',
      x: MARGIN_PX,
      y: 190 + offset,
      width: dims.w - MARGIN_PX * 2,
      height: opts.height || 44,
      content: content,
      fontFamily: opts.isPreeti ? 'Preeti' : (opts.fontFamily || 'Times New Roman'),
      fontSize: opts.fontSize || 13,
      color: opts.color || '#111827',
      bold: !!opts.bold,
      italic: !!opts.italic,
      underline: !!opts.underline,
      align: opts.align || 'left',
      isPreeti: !!opts.isPreeti,
      preset: opts.preset || 'Normal'
    };
    page.elements.push(el);
    selectedElId = el.id;
    saveToLocalStorage();
    renderCanvas();
    renderRightSidebar();
    updateFloatingToolbar();
    return el;
  }

  function addLineElement(lineStyle = 'solid', mmLength = 180) {
    pushUndo();
    const page = getActivePage();
    const offset = (page.elements.length % 8) * 24;
    const widthPx = Math.round(mmLength * PX_PER_MM);
    const el = {
      id: 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      type: 'line',
      x: MARGIN_PX,
      y: 260 + offset,
      width: widthPx,
      height: 16,
      lineStyle: lineStyle,
      thickness: 1.5,
      color: '#111827',
      mmLength: mmLength,
      charCount: Math.round(mmLength / 4)
    };
    page.elements.push(el);
    selectedElId = el.id;
    saveToLocalStorage();
    renderCanvas();
    renderRightSidebar();
  }

  // -------------------------------------------------------
  // Canvas Rendering (Multi-page A4 + Margin Guides + Direct Edit)
  // -------------------------------------------------------
  function renderCanvas() {
    canvasViewport.innerHTML = '';

    doc.pages.forEach((page, pIdx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'page-wrapper';

      const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
      const scaledW = Math.round(dims.w * zoom);
      const scaledH = Math.round(dims.h * zoom);

      // Page mini header bar
      const pBar = document.createElement('div');
      pBar.className = 'page-toolbar';
      pBar.style.width = scaledW + 'px';
      pBar.innerHTML = `
        <span><strong>Page ${pIdx + 1}</strong> (${page.orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'})</span>
        <div class="page-actions">
          <button class="page-pill-btn" data-flip-page="${pIdx}" title="Flip this page between Portrait and Landscape">Flip Orientation</button>
          ${doc.pages.length > 1 ? `<button class="page-pill-btn danger" data-del-page="${pIdx}" title="Delete this page">Delete Page</button>` : ''}
        </div>
      `;
      wrapper.appendChild(pBar);

      // Outer zoom container so scrollbars match visual size
      const zoomBox = document.createElement('div');
      zoomBox.style.width = scaledW + 'px';
      zoomBox.style.height = scaledH + 'px';
      zoomBox.style.position = 'relative';

      const pageEl = document.createElement('div');
      pageEl.className = `a4-page ${page.orientation}`;
      pageEl.style.transform = `scale(${zoom})`;
      pageEl.dataset.pageIndex = pIdx;

      // Margin Guide + Snap Alignment Lines
      pageEl.innerHTML = `
        <div class="margin-guide"></div>
        <div class="snap-line-v" id="snapV_${pIdx}"></div>
        <div class="snap-line-h" id="snapH_${pIdx}"></div>
      `;

      // Clicking blank page deselects element & sets active page
      pageEl.addEventListener('mousedown', (e) => {
        activePageIndex = pIdx;
        updateTopBarUI();
        if (e.target === pageEl || e.target.classList.contains('margin-guide')) {
          selectedElId = null;
          renderCanvas();
          renderRightSidebar();
          updateFloatingToolbar();
        }
      });

      // Render elements on this page
      page.elements.forEach(el => {
        const elNode = buildElementNode(el, page, pIdx);
        pageEl.appendChild(elNode);
      });

      zoomBox.appendChild(pageEl);
      wrapper.appendChild(zoomBox);
      canvasViewport.appendChild(wrapper);
    });

    // Bind per-page flip & delete buttons
    canvasViewport.querySelectorAll('[data-flip-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.flipPage);
        pushUndo();
        doc.pages[idx].orientation = doc.pages[idx].orientation === 'portrait' ? 'landscape' : 'portrait';
        activePageIndex = idx;
        saveToLocalStorage();
        renderCanvas();
        updateTopBarUI();
      });
    });

    canvasViewport.querySelectorAll('[data-del-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.delPage);
        openConfirm(
          `Delete Page ${idx + 1}?`,
          'All questions and items on this page will be removed. You can press Undo (Ctrl+Z) to restore it.',
          () => {
            pushUndo();
            doc.pages.splice(idx, 1);
            if (activePageIndex >= doc.pages.length) activePageIndex = doc.pages.length - 1;
            selectedElId = null;
            saveToLocalStorage();
            renderCanvas();
            renderRightSidebar();
            updateTopBarUI();
          }
        );
      });
    });
  }

  function buildElementNode(el, page, pIdx) {
    const node = document.createElement('div');
    node.className = 'canvas-el' + (el.id === selectedElId ? ' selected' : '');
    node.dataset.elId = el.id;
    node.style.left = el.x + 'px';
    node.style.top = el.y + 'px';
    node.style.width = el.width + 'px';
    if (el.height) node.style.height = el.height + 'px';

    // Resize Handles
    ['nw', 'ne', 'sw', 'se', 'e', 'w'].forEach(dir => {
      const h = document.createElement('div');
      h.className = `resize-handle handle-${dir}`;
      h.dataset.dir = dir;
      h.addEventListener('mousedown', (e) => startResize(e, el, page, pIdx, dir));
      node.appendChild(h);
    });

    // --- Type 1: Text Element ---
    if (el.type === 'text') {
      const body = document.createElement('div');
      body.className = 'el-text-body' + (el.isPreeti ? ' font-preeti' : '');
      body.contentEditable = 'true';
      body.spellcheck = false;
      body.style.fontFamily = el.isPreeti ? 'Preeti' : el.fontFamily;
      body.style.fontSize = el.fontSize + 'pt';
      body.style.color = el.color;
      body.style.fontWeight = el.bold ? 'bold' : 'normal';
      body.style.fontStyle = el.italic ? 'italic' : 'normal';
      body.style.textDecoration = el.underline ? 'underline' : 'none';
      body.style.textAlign = el.align || 'left';
      // Store plain Preeti-keyed text without Unicode normalization
      body.textContent = el.content;

      body.addEventListener('focus', () => {
        node.classList.add('editing');
        activePageIndex = pIdx;
        if (selectedElId !== el.id) {
          selectedElId = el.id;
          highlightSelectedOnly(el.id);
          renderRightSidebar();
        }
        updateFloatingToolbar();
        if (el.isPreeti) openNepaliPanel();
      });

      body.addEventListener('blur', () => {
        node.classList.remove('editing');
        if (el.content !== body.textContent) {
          pushUndo();
          el.content = body.textContent;
          // Auto-grow height if text wrapped taller
          el.height = Math.max(el.height, body.scrollHeight + 4);
          saveToLocalStorage();
        }
      });

      body.addEventListener('input', () => {
        el.content = body.textContent;
        saveToLocalStorage();
      });

      node.appendChild(body);
    }

    // --- Type 2: Title Block Element ---
    if (el.type === 'titleBlock') {
      const wrap = document.createElement('div');
      wrap.className = `title-block-wrap style-${el.style || 'classic'}` + (el.isPreeti ? ' font-preeti' : '');
      wrap.style.fontFamily = el.isPreeti ? 'Preeti' : el.fontFamily;
      wrap.style.fontSize = el.fontSize + 'pt';
      wrap.style.color = el.color;

      const f = el.fields;
      if (el.style === 'twocolumn') {
        wrap.innerHTML = `
          <div class="tb-twocol-grid">
            <div>
              <div class="tb-school" contenteditable="true" data-field="schoolName">${escapeHtml(f.schoolName)}</div>
              <div class="tb-exam" contenteditable="true" data-field="examName">${escapeHtml(f.examName)}</div>
              <div style="margin-top:4px; font-weight:600;">
                <span contenteditable="true" data-field="className">${escapeHtml(f.className)}</span> &nbsp;|&nbsp;
                <span contenteditable="true" data-field="subject">${escapeHtml(f.subject)}</span>
              </div>
            </div>
            <div class="tb-twocol-right">
              <div contenteditable="true" data-field="fullMarks">${escapeHtml(f.fullMarks)}</div>
              <div contenteditable="true" data-field="time">${escapeHtml(f.time)}</div>
              <div contenteditable="true" data-field="date">${escapeHtml(f.date)}</div>
            </div>
          </div>
        `;
      } else {
        wrap.innerHTML = `
          <div class="tb-school" contenteditable="true" data-field="schoolName">${escapeHtml(f.schoolName)}</div>
          <div class="tb-exam" contenteditable="true" data-field="examName">${escapeHtml(f.examName)}</div>
          <div class="tb-meta-row">
            <span contenteditable="true" data-field="className">${escapeHtml(f.className)}</span>
            <span contenteditable="true" data-field="subject">${escapeHtml(f.subject)}</span>
            <span contenteditable="true" data-field="fullMarks">${escapeHtml(f.fullMarks)}</span>
            <span contenteditable="true" data-field="time">${escapeHtml(f.time)}</span>
            <span contenteditable="true" data-field="date">${escapeHtml(f.date)}</span>
          </div>
        `;
      }

      wrap.querySelectorAll('[data-field]').forEach(span => {
        span.addEventListener('focus', () => {
          node.classList.add('editing');
          activePageIndex = pIdx;
          if (selectedElId !== el.id) {
            selectedElId = el.id;
            highlightSelectedOnly(el.id);
            renderRightSidebar();
          }
          updateFloatingToolbar();
        });
        span.addEventListener('blur', () => {
          node.classList.remove('editing');
          const key = span.dataset.field;
          if (el.fields[key] !== span.textContent) {
            pushUndo();
            el.fields[key] = span.textContent;
            saveToLocalStorage();
          }
        });
      });

      node.appendChild(wrap);
    }

    // --- Type 3: Answer Line Element ---
    if (el.type === 'line') {
      const wrap = document.createElement('div');
      wrap.className = 'el-line-wrap';
      const stroke = document.createElement('div');
      stroke.className = 'el-line-stroke';
      stroke.style.borderBottom = `${el.thickness || 1.5}px ${el.lineStyle || 'solid'} ${el.color || '#111827'}`;
      wrap.appendChild(stroke);
      node.appendChild(wrap);
    }

    // --- Type 4: Bordered Box Element ---
    if (el.type === 'box') {
      const wrap = document.createElement('div');
      wrap.className = 'el-box-wrap';
      wrap.contentEditable = 'true';
      wrap.style.border = `${el.borderWidth || 1.5}px ${el.borderStyle || 'solid'} ${el.borderColor || '#111827'}`;
      wrap.style.backgroundColor = el.fillColor || '#ffffff';
      wrap.style.fontSize = '12pt';
      wrap.textContent = el.label || '';
      wrap.addEventListener('blur', () => {
        if (el.label !== wrap.textContent) {
          pushUndo();
          el.label = wrap.textContent;
          saveToLocalStorage();
        }
      });
      node.appendChild(wrap);
    }

    // --- Type 5: Editable Table Element ---
    if (el.type === 'table') {
      const table = document.createElement('table');
      table.className = 'el-table';
      el.rows.forEach((row, rIdx) => {
        const tr = document.createElement('tr');
        row.forEach((cellVal, cIdx) => {
          const td = document.createElement(rIdx === 0 ? 'th' : 'td');
          td.contentEditable = 'true';
          td.textContent = cellVal;
          td.addEventListener('blur', () => {
            if (el.rows[rIdx][cIdx] !== td.textContent) {
              pushUndo();
              el.rows[rIdx][cIdx] = td.textContent;
              saveToLocalStorage();
            }
          });
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
      node.appendChild(table);
    }

    // Drag initiation (when clicking border or non-editing element)
    node.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('resize-handle')) return;
      activePageIndex = pIdx;
      if (selectedElId !== el.id) {
        selectedElId = el.id;
        highlightSelectedOnly(el.id);
        renderRightSidebar();
        updateFloatingToolbar();
        updateTopBarUI();
      }

      // Allow clicking directly into contentEditable without dragging unless grabbing border/non-text
      const isEditable = e.target.isContentEditable;
      if (isEditable && document.activeElement === e.target) return;

      startDrag(e, el, page, pIdx, isEditable);
    });

    return node;
  }

  function highlightSelectedOnly(id) {
    document.querySelectorAll('.canvas-el').forEach(n => {
      n.classList.toggle('selected', n.dataset.elId === id);
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // -------------------------------------------------------
  // Drag & Resize with Grid + Margin + Center Snapping
  // -------------------------------------------------------
  function startDrag(e, el, page, pIdx, startedOnEditable) {
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    let moved = false;

    const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
    const snapV = document.getElementById(`snapV_${pIdx}`);
    const snapH = document.getElementById(`snapH_${pIdx}`);

    function onMove(ev) {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      if (!moved) {
        moved = true;
        pushUndo();
        if (document.activeElement) document.activeElement.blur();
      }

      let nextX = Math.round((origX + dx) / GRID_SNAP) * GRID_SNAP;
      let nextY = Math.round((origY + dy) / GRID_SNAP) * GRID_SNAP;

      // Clamp within page
      nextX = Math.max(0, Math.min(dims.w - 30, nextX));
      nextY = Math.max(0, Math.min(dims.h - 20, nextY));

      // Snap to left/right margin or horizontal center
      let snappedV = null;
      const centerPageX = dims.w / 2;
      const elCenterX = nextX + el.width / 2;

      if (Math.abs(nextX - MARGIN_PX) < 8) {
        nextX = MARGIN_PX;
        snappedV = MARGIN_PX;
      } else if (Math.abs(nextX + el.width - (dims.w - MARGIN_PX)) < 8) {
        nextX = dims.w - MARGIN_PX - el.width;
        snappedV = dims.w - MARGIN_PX;
      } else if (Math.abs(elCenterX - centerPageX) < 8) {
        nextX = Math.round(centerPageX - el.width / 2);
        snappedV = centerPageX;
      }

      // Snap to top margin
      let snappedH = null;
      if (Math.abs(nextY - MARGIN_PX) < 8) {
        nextY = MARGIN_PX;
        snappedH = MARGIN_PX;
      }

      if (snapV) {
        snapV.style.display = snappedV !== null ? 'block' : 'none';
        if (snappedV !== null) snapV.style.left = snappedV + 'px';
      }
      if (snapH) {
        snapH.style.display = snappedH !== null ? 'block' : 'none';
        if (snappedH !== null) snapH.style.top = snappedH + 'px';
      }

      el.x = nextX;
      el.y = nextY;

      const node = document.querySelector(`.canvas-el[data-el-id="${el.id}"]`);
      if (node) {
        node.style.left = el.x + 'px';
        node.style.top = el.y + 'px';
      }
      updateFloatingToolbar();
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (snapV) snapV.style.display = 'none';
      if (snapH) snapH.style.display = 'none';
      if (moved) {
        saveToLocalStorage();
        renderRightSidebar();
      }
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function startResize(e, el, page, pIdx, dir) {
    e.stopPropagation();
    e.preventDefault();
    pushUndo();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    const origW = el.width;
    const origH = el.height || 32;
    const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;

    function onMove(ev) {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;

      if (dir.includes('e')) {
        let newW = Math.max(24, Math.round((origW + dx) / 4) * 4);
        // Snap right edge to right margin
        if (Math.abs(origX + newW - (dims.w - MARGIN_PX)) < 8) {
          newW = dims.w - MARGIN_PX - origX;
        }
        el.width = newW;
      }
      if (dir.includes('w')) {
        const newW = Math.max(24, Math.round((origW - dx) / 4) * 4);
        el.x = origX + (origW - newW);
        el.width = newW;
      }
      if (dir.includes('s')) {
        el.height = Math.max(14, Math.round((origH + dy) / 4) * 4);
      }
      if (dir.includes('n')) {
        const newH = Math.max(14, Math.round((origH - dy) / 4) * 4);
        el.y = origY + (origH - newH);
        el.height = newH;
      }

      if (el.type === 'line') {
        el.mmLength = Math.round(el.width / PX_PER_MM);
        el.charCount = Math.max(1, Math.round(el.mmLength / 4));
      }

      const node = document.querySelector(`.canvas-el[data-el-id="${el.id}"]`);
      if (node) {
        node.style.left = el.x + 'px';
        node.style.top = el.y + 'px';
        node.style.width = el.width + 'px';
        node.style.height = el.height + 'px';
      }
      updateFloatingToolbar();
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      saveToLocalStorage();
      renderRightSidebar();
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // -------------------------------------------------------
  // Right Sidebar (Shows ONLY when something is selected)
  // -------------------------------------------------------
  function renderRightSidebar() {
    const el = getSelectedElement();
    if (!el) {
      rightSidebar.classList.remove('visible');
      rightSidebar.innerHTML = '';
      return;
    }

    rightSidebar.classList.add('visible');

    // --- Answer Line Properties ---
    if (el.type === 'line') {
      rightSidebar.innerHTML = `
        <h3 class="drawer-title">Answer Line Settings</h3>

        <div class="prop-group">
          <span class="prop-label">Line Style</span>
          <select class="prop-select" id="propLineStyle">
            <option value="solid" ${el.lineStyle === 'solid' ? 'selected' : ''}>Solid Line</option>
            <option value="dotted" ${el.lineStyle === 'dotted' ? 'selected' : ''}>Dotted Line</option>
            <option value="dashed" ${el.lineStyle === 'dashed' ? 'selected' : ''}>Dashed Line</option>
          </select>
        </div>

        <div class="prop-group">
          <span class="prop-label">Thickness (px)</span>
          <input type="number" class="prop-input" id="propLineThick" min="1" max="8" step="0.5" value="${el.thickness || 1.5}" />
        </div>

        <div class="prop-group">
          <span class="prop-label">Length in Millimeters (mm)</span>
          <input type="number" class="prop-input" id="propLineMm" min="10" max="270" value="${el.mmLength || Math.round(el.width / PX_PER_MM)}" />
        </div>

        <div class="prop-group">
          <span class="prop-label">Length by Character Count</span>
          <input type="number" class="prop-input" id="propLineChars" min="2" max="80" value="${el.charCount || Math.round(el.width / (PX_PER_MM * 4))}" />
        </div>

        <div class="prop-group">
          <span class="prop-label">Line Color</span>
          <input type="color" class="prop-input" id="propElColor" style="height:36px; padding:2px;" value="${el.color || '#111827'}" />
        </div>

        <details class="more-dropdown">
          <summary>More (Align & Position) ▾</summary>
          <div class="more-content">
            <button class="soft-btn" id="btnFullColWidth">Fit Full Column Width</button>
            <button class="soft-btn" id="btnAlignCenterPage">Center on Page</button>
          </div>
        </details>

        <button class="delete-el-btn" id="btnDeleteSelected">Delete Answer Line</button>
      `;

      document.getElementById('propLineStyle').addEventListener('change', (e) => {
        pushUndo();
        el.lineStyle = e.target.value;
        saveToLocalStorage();
        renderCanvas();
      });

      document.getElementById('propLineThick').addEventListener('input', (e) => {
        el.thickness = parseFloat(e.target.value) || 1.5;
        saveToLocalStorage();
        renderCanvas();
      });

      document.getElementById('propLineMm').addEventListener('input', (e) => {
        const mm = Math.max(5, parseFloat(e.target.value) || 40);
        el.mmLength = mm;
        el.charCount = Math.max(1, Math.round(mm / 4));
        el.width = Math.round(mm * PX_PER_MM);
        document.getElementById('propLineChars').value = el.charCount;
        saveToLocalStorage();
        renderCanvas();
      });

      document.getElementById('propLineChars').addEventListener('input', (e) => {
        const chars = Math.max(1, parseInt(e.target.value, 10) || 10);
        el.charCount = chars;
        el.mmLength = chars * 4;
        el.width = Math.round(el.mmLength * PX_PER_MM);
        document.getElementById('propLineMm').value = el.mmLength;
        saveToLocalStorage();
        renderCanvas();
      });

      document.getElementById('propElColor').addEventListener('input', (e) => {
        el.color = e.target.value;
        saveToLocalStorage();
        renderCanvas();
      });

      document.getElementById('btnFullColWidth').addEventListener('click', () => {
        pushUndo();
        const page = getPageForElement(el.id);
        const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
        el.x = MARGIN_PX;
        el.width = dims.w - MARGIN_PX * 2;
        el.mmLength = Math.round(el.width / PX_PER_MM);
        el.charCount = Math.round(el.mmLength / 4);
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
      });

      bindCommonMoreAndDelete(el);
      return;
    }

    // --- Text & Title Block Properties (Basic controls + "More" dropdown) ---
    const isTextOrTitle = el.type === 'text' || el.type === 'titleBlock';
    rightSidebar.innerHTML = `
      <h3 class="drawer-title">${el.type === 'titleBlock' ? 'Header Properties' : 'Text Properties'}</h3>

      ${el.type === 'titleBlock' ? `
        <div class="prop-group">
          <span class="prop-label">Header Style</span>
          <select class="prop-select" id="propTitleStyle">
            <option value="classic" ${el.style === 'classic' ? 'selected' : ''}>Classic Centered</option>
            <option value="boxed" ${el.style === 'boxed' ? 'selected' : ''}>Boxed Header</option>
            <option value="twocolumn" ${el.style === 'twocolumn' ? 'selected' : ''}>Two-Column Split</option>
          </select>
        </div>
      ` : ''}

      ${isTextOrTitle ? `
        <div class="prop-group">
          <span class="prop-label">Language / Font Mode</span>
          <button class="soft-btn" id="propPreetiBtn" style="${el.isPreeti ? 'background:var(--accent); color:#fff; border-color:var(--accent);' : ''}">
            ${el.isPreeti ? '✓ Nepali (Preeti) Active' : 'Switch to Nepali (Preeti)'}
          </button>
        </div>

        <div class="prop-group">
          <span class="prop-label">Font Family</span>
          <select class="prop-select" id="propFontFamily" ${el.isPreeti ? 'disabled' : ''}>
            ${el.isPreeti
              ? `<option value="Preeti" selected>Preeti (Nepali Only)</option>`
              : ['Times New Roman', 'Arial', 'Calibri', 'Cambria', 'Georgia']
                  .map(f => `<option value="${f}" ${el.fontFamily === f ? 'selected' : ''}>${f}</option>`)
                  .join('')
            }
          </select>
        </div>

        <div class="prop-row">
          <div class="prop-group" style="flex:1;">
            <span class="prop-label">Size (pt)</span>
            <input type="number" class="prop-input" id="propFontSize" min="8" max="72" value="${el.fontSize || 13}" />
          </div>
          <div class="prop-group" style="width:72px;">
            <span class="prop-label">Color</span>
            <input type="color" class="prop-input" id="propElColor" style="height:35px; padding:2px;" value="${el.color || '#111827'}" />
          </div>
        </div>

        <div class="prop-group">
          <span class="prop-label">Style & Alignment</span>
          <div class="prop-row">
            <div class="prop-toggle-group" style="flex:1;">
              <button class="prop-toggle-btn ${el.bold ? 'active' : ''}" id="propBold" title="Bold">B</button>
              <button class="prop-toggle-btn ${el.italic ? 'active' : ''}" id="propItalic" style="font-style:italic;" title="Italic">I</button>
              <button class="prop-toggle-btn ${el.underline ? 'active' : ''}" id="propUnderline" style="text-decoration:underline;" title="Underline">U</button>
            </div>
            <div class="prop-toggle-group" style="flex:1;">
              <button class="prop-toggle-btn ${el.align === 'left' ? 'active' : ''}" data-align="left" title="Align Left">L</button>
              <button class="prop-toggle-btn ${el.align === 'center' ? 'active' : ''}" data-align="center" title="Align Center">C</button>
              <button class="prop-toggle-btn ${el.align === 'right' ? 'active' : ''}" data-align="right" title="Align Right">R</button>
            </div>
          </div>
        </div>
      ` : ''}

      <details class="more-dropdown">
        <summary>More (Presets, Align & Size) ▾</summary>
        <div class="more-content">
          ${el.type === 'text' ? `
            <div class="prop-group">
              <span class="prop-label">Saved Style Preset</span>
              <select class="prop-select" id="propPreset">
                <option value="Normal" ${el.preset === 'Normal' ? 'selected' : ''}>Normal Question (13pt)</option>
                <option value="Section Heading" ${el.preset === 'Section Heading' ? 'selected' : ''}>Section Heading (14pt Bold)</option>
                <option value="Title" ${el.preset === 'Title' ? 'selected' : ''}>Paper Title (18pt Bold Center)</option>
              </select>
            </div>
          ` : ''}
          <div class="mini-btn-row">
            <button class="soft-btn" id="btnAlignLeftMargin">Snap Left Margin</button>
            <button class="soft-btn" id="btnAlignCenterPage">Center on Page</button>
          </div>
          <div class="prop-row">
            <div class="prop-group">
              <span class="prop-label">X (px)</span>
              <input type="number" class="prop-input" id="propPosX" value="${Math.round(el.x)}" />
            </div>
            <div class="prop-group">
              <span class="prop-label">Y (px)</span>
              <input type="number" class="prop-input" id="propPosY" value="${Math.round(el.y)}" />
            </div>
          </div>
        </div>
      </details>

      <button class="delete-el-btn" id="btnDeleteSelected">Delete Selected Item</button>
    `;

    if (document.getElementById('propTitleStyle')) {
      document.getElementById('propTitleStyle').addEventListener('change', (e) => {
        pushUndo();
        el.style = e.target.value;
        saveToLocalStorage();
        renderCanvas();
      });
    }

    if (document.getElementById('propPreetiBtn')) {
      document.getElementById('propPreetiBtn').addEventListener('click', () => {
        togglePreetiMode(el);
      });
    }

    if (document.getElementById('propFontFamily')) {
      document.getElementById('propFontFamily').addEventListener('change', (e) => {
        pushUndo();
        el.fontFamily = e.target.value;
        saveToLocalStorage();
        renderCanvas();
        updateFloatingToolbar();
      });
    }

    if (document.getElementById('propFontSize')) {
      document.getElementById('propFontSize').addEventListener('input', (e) => {
        el.fontSize = Math.max(8, Math.min(72, parseInt(e.target.value, 10) || 13));
        saveToLocalStorage();
        renderCanvas();
        updateFloatingToolbar();
      });
    }

    if (document.getElementById('propElColor')) {
      document.getElementById('propElColor').addEventListener('input', (e) => {
        el.color = e.target.value;
        saveToLocalStorage();
        renderCanvas();
      });
    }

    if (document.getElementById('propBold')) {
      document.getElementById('propBold').addEventListener('click', () => {
        pushUndo();
        el.bold = !el.bold;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
        updateFloatingToolbar();
      });
    }

    if (document.getElementById('propItalic')) {
      document.getElementById('propItalic').addEventListener('click', () => {
        pushUndo();
        el.italic = !el.italic;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
        updateFloatingToolbar();
      });
    }

    if (document.getElementById('propUnderline')) {
      document.getElementById('propUnderline').addEventListener('click', () => {
        pushUndo();
        el.underline = !el.underline;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
        updateFloatingToolbar();
      });
    }

    rightSidebar.querySelectorAll('[data-align]').forEach(btn => {
      btn.addEventListener('click', () => {
        pushUndo();
        el.align = btn.dataset.align;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
      });
    });

    if (document.getElementById('propPreset')) {
      document.getElementById('propPreset').addEventListener('change', (e) => {
        pushUndo();
        const val = e.target.value;
        el.preset = val;
        if (val === 'Title') {
          el.fontSize = 18;
          el.bold = true;
          el.align = 'center';
        } else if (val === 'Section Heading') {
          el.fontSize = 14;
          el.bold = true;
          el.underline = true;
          el.align = 'left';
        } else {
          el.fontSize = 13;
          el.bold = false;
          el.underline = false;
          el.align = 'left';
        }
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
        updateFloatingToolbar();
      });
    }

    if (document.getElementById('btnAlignLeftMargin')) {
      document.getElementById('btnAlignLeftMargin').addEventListener('click', () => {
        pushUndo();
        el.x = MARGIN_PX;
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
      });
    }

    if (document.getElementById('propPosX')) {
      document.getElementById('propPosX').addEventListener('input', (e) => {
        el.x = parseInt(e.target.value, 10) || 0;
        saveToLocalStorage();
        renderCanvas();
      });
    }

    if (document.getElementById('propPosY')) {
      document.getElementById('propPosY').addEventListener('input', (e) => {
        el.y = parseInt(e.target.value, 10) || 0;
        saveToLocalStorage();
        renderCanvas();
      });
    }

    bindCommonMoreAndDelete(el);
  }

  function bindCommonMoreAndDelete(el) {
    const centerBtn = document.getElementById('btnAlignCenterPage');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        pushUndo();
        const page = getPageForElement(el.id);
        const dims = page.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
        el.x = Math.round((dims.w - el.width) / 2);
        saveToLocalStorage();
        renderCanvas();
        renderRightSidebar();
      });
    }

    const delBtn = document.getElementById('btnDeleteSelected');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        openConfirm(
          'Delete Selected Item?',
          'Are you sure you want to delete this item from the page? You can press Undo (Ctrl+Z) if needed.',
          () => {
            pushUndo();
            const page = getPageForElement(el.id);
            if (page) {
              page.elements = page.elements.filter(item => item.id !== el.id);
            }
            selectedElId = null;
            saveToLocalStorage();
            renderCanvas();
            renderRightSidebar();
            updateFloatingToolbar();
          }
        );
      });
    }
  }

  // -------------------------------------------------------
  // Floating Toolbar (Appears right above selected text)
  // -------------------------------------------------------
  function bindFloatingToolbarEvents() {
    document.getElementById('ftFontSelect').addEventListener('change', (e) => {
      const el = getSelectedElement();
      if (!el || el.isPreeti) return;
      pushUndo();
      el.fontFamily = e.target.value;
      saveToLocalStorage();
      renderCanvas();
      renderRightSidebar();
    });

    document.getElementById('ftSizeInput').addEventListener('input', (e) => {
      const el = getSelectedElement();
      if (!el) return;
      el.fontSize = Math.max(8, Math.min(72, parseInt(e.target.value, 10) || 13));
      saveToLocalStorage();
      renderCanvas();
      renderRightSidebar();
    });

    document.getElementById('ftBold').addEventListener('click', () => {
      const el = getSelectedElement();
      if (!el) return;
      pushUndo();
      el.bold = !el.bold;
      saveToLocalStorage();
      renderCanvas();
      renderRightSidebar();
      updateFloatingToolbar();
    });

    document.getElementById('ftItalic').addEventListener('click', () => {
      const el = getSelectedElement();
      if (!el) return;
      pushUndo();
      el.italic = !el.italic;
      saveToLocalStorage();
      renderCanvas();
      renderRightSidebar();
      updateFloatingToolbar();
    });

    document.getElementById('ftUnderline').addEventListener('click', () => {
      const el = getSelectedElement();
      if (!el) return;
      pushUndo();
      el.underline = !el.underline;
      saveToLocalStorage();
      renderCanvas();
      renderRightSidebar();
      updateFloatingToolbar();
    });

    document.getElementById('ftPreetiToggle').addEventListener('click', () => {
      const el = getSelectedElement();
      if (!el) return;
      togglePreetiMode(el);
    });
  }

  function togglePreetiMode(el) {
    pushUndo();
    el.isPreeti = !el.isPreeti;
    if (el.isPreeti) {
      el.fontFamily = 'Preeti';
      openNepaliPanel();
    } else {
      el.fontFamily = 'Times New Roman';
    }
    saveToLocalStorage();
    renderCanvas();
    renderRightSidebar();
    updateFloatingToolbar();
  }

  function updateFloatingToolbar() {
    const el = getSelectedElement();
    if (!el || (el.type !== 'text' && el.type !== 'titleBlock')) {
      floatingToolbar.classList.remove('visible');
      return;
    }

    const node = document.querySelector(`.canvas-el[data-el-id="${el.id}"]`);
    if (!node) {
      floatingToolbar.classList.remove('visible');
      return;
    }

    const rect = node.getBoundingClientRect();
    floatingToolbar.classList.add('visible');

    const topPos = Math.max(66, rect.top - 44);
    const leftPos = Math.max(360, Math.min(window.innerWidth - 620, rect.left));
    floatingToolbar.style.top = topPos + 'px';
    floatingToolbar.style.left = leftPos + 'px';

    const fontSel = document.getElementById('ftFontSelect');
    if (el.isPreeti) {
      fontSel.innerHTML = `<option value="Preeti" selected>Preeti</option>`;
      fontSel.disabled = true;
    } else {
      fontSel.disabled = false;
      fontSel.innerHTML = ['Times New Roman', 'Arial', 'Calibri', 'Cambria', 'Georgia']
        .map(f => `<option value="${f}" ${el.fontFamily === f ? 'selected' : ''}>${f}</option>`)
        .join('');
    }

    document.getElementById('ftSizeInput').value = el.fontSize || 13;
    document.getElementById('ftBold').classList.toggle('active', !!el.bold);
    document.getElementById('ftItalic').classList.toggle('active', !!el.italic);
    document.getElementById('ftUnderline').classList.toggle('active', !!el.underline);
    document.getElementById('ftPreetiToggle').classList.toggle('active', !!el.isPreeti);
  }

  // -------------------------------------------------------
  // Nepali (Preeti) Typing Helper Panel
  // -------------------------------------------------------
  function openNepaliPanel() {
    nepaliPanel.classList.add('visible');
  }

  function bindNepaliPanelEvents() {
    document.getElementById('btnCloseNepaliPanel').addEventListener('click', () => {
      nepaliPanel.classList.remove('visible');
    });

    // Sub-tabs inside Nepali helper
    document.querySelectorAll('.np-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.np-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.nptab;
        document.getElementById('npTabRoman').style.display = target === 'roman' ? 'flex' : 'none';
        document.getElementById('npTabConverter').style.display = target === 'converter' ? 'flex' : 'none';
        document.getElementById('npTabKeyboard').style.display = target === 'keyboard' ? 'flex' : 'none';
        document.getElementById('npTabTestWords').style.display = target === 'testwords' ? 'flex' : 'none';
      });
    });

    // 1. Romanized -> Live Unicode -> Preeti
    const romanInput = document.getElementById('npRomanInput');
    const romanUniOut = document.getElementById('npRomanUnicodePreview');
    const romanPreetiOut = document.getElementById('npRomanPreetiPreview');

    romanInput.addEventListener('input', () => {
      const val = romanInput.value.trim() || 'namaste';
      const uni = window.NepaliEngine.romanToUnicode(val);
      const preeti = window.NepaliEngine.unicodeToPreeti(uni);
      romanUniOut.textContent = uni;
      romanPreetiOut.textContent = preeti;
    });

    document.getElementById('btnInsertRoman').addEventListener('click', () => {
      const val = romanInput.value.trim() || 'namaste';
      const uni = window.NepaliEngine.romanToUnicode(val);
      const preeti = window.NepaliEngine.unicodeToPreeti(uni);
      insertPreetiIntoActiveBox(preeti + ' ');
      romanInput.value = '';
      romanUniOut.textContent = 'नमस्ते';
      romanPreetiOut.textContent = 'gd:t]';
    });

    // 2. Unicode <-> Preeti Converter
    const unicodePaste = document.getElementById('npUnicodePaste');
    const convertedPreetiOut = document.getElementById('npConvertedPreetiOut');
    unicodePaste.addEventListener('input', () => {
      convertedPreetiOut.textContent = window.NepaliEngine.unicodeToPreeti(unicodePaste.value);
    });

    document.getElementById('btnInsertConvertedPreeti').addEventListener('click', () => {
      const preeti = window.NepaliEngine.unicodeToPreeti(unicodePaste.value);
      if (preeti) {
        insertPreetiIntoActiveBox(preeti);
        unicodePaste.value = '';
        convertedPreetiOut.textContent = '';
      }
    });

    const preetiDecodeInput = document.getElementById('npPreetiDecodeInput');
    const decodedUnicodeOut = document.getElementById('npDecodedUnicodeOut');
    preetiDecodeInput.addEventListener('input', () => {
      decodedUnicodeOut.textContent = window.NepaliEngine.preetiToUnicode(preetiDecodeInput.value);
    });

    // 3. On-Screen Preeti Virtual Keyboard
    renderVirtualKeyboard();
    document.getElementById('btnVkShift').addEventListener('click', () => {
      vkShift = !vkShift;
      document.getElementById('btnVkShift').textContent = vkShift ? '⇧ Shift: ON' : '⇧ Shift: OFF';
      renderVirtualKeyboard();
    });

    document.getElementById('btnVkSpace').addEventListener('click', () => {
      insertPreetiIntoActiveBox(' ');
    });

    document.getElementById('btnVkBackspace').addEventListener('click', () => {
      const el = getSelectedElement();
      if (el && el.type === 'text' && el.content.length > 0) {
        pushUndo();
        el.content = el.content.slice(0, -1);
        saveToLocalStorage();
        renderCanvas();
      }
    });

    // 4. Sample Test Words Verification List
    const testList = document.getElementById('testWordsList');
    window.PREETI_MAPPING.sampleTestWords.forEach(item => {
      const converted = window.NepaliEngine.unicodeToPreeti(item.unicode);
      const btn = document.createElement('button');
      btn.className = 'test-word-btn';
      btn.title = `Unicode: ${item.unicode} → Preeti keys: ${converted}`;
      btn.innerHTML = `
        <span>${item.label}</span>
        <span class="font-preeti" style="font-size:16px; color:var(--accent);">${converted}</span>
      `;
      btn.addEventListener('click', () => {
        insertPreetiIntoActiveBox(converted + ' ');
      });
      testList.appendChild(btn);
    });
  }

  function renderVirtualKeyboard() {
    const grid = document.getElementById('vkGrid');
    grid.innerHTML = '';
    window.PREETI_MAPPING.keyboardRows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'vk-row';
      row.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'vk-key';
        const devChar = vkShift ? k.shift : k.normal;
        const preetiChar = vkShift ? k.preetiShift : k.preetiNorm;
        btn.title = `Key "${preetiChar}" → ${devChar}`;
        btn.innerHTML = `<span class="vk-dev">${devChar}</span><span class="vk-lat">${preetiChar}</span>`;
        btn.addEventListener('click', () => {
          insertPreetiIntoActiveBox(preetiChar);
        });
        rowDiv.appendChild(btn);
      });
      grid.appendChild(rowDiv);
    });
  }

  function insertPreetiIntoActiveBox(preetiStr) {
    let el = getSelectedElement();
    if (!el || (el.type !== 'text' && el.type !== 'titleBlock')) {
      el = addTextElement('', { isPreeti: true, fontFamily: 'Preeti', fontSize: 16 });
    }
    pushUndo();
    if (!el.isPreeti) {
      el.isPreeti = true;
      el.fontFamily = 'Preeti';
    }
    if (el.type === 'text') {
      el.content = (el.content || '') + preetiStr;
    } else if (el.type === 'titleBlock') {
      el.fields.schoolName = (el.fields.schoolName || '') + preetiStr;
    }
    saveToLocalStorage();
    renderCanvas();
    renderRightSidebar();
    updateFloatingToolbar();
  }

  // -------------------------------------------------------
  // Keyboard Shortcuts (Ctrl+Z, Ctrl+B, Ctrl+U, Ctrl+P)
  // -------------------------------------------------------
  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (isCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key.toLowerCase() === 'b') {
        const el = getSelectedElement();
        if (el && (el.type === 'text' || el.type === 'titleBlock')) {
          e.preventDefault();
          pushUndo();
          el.bold = !el.bold;
          saveToLocalStorage();
          renderCanvas();
          renderRightSidebar();
          updateFloatingToolbar();
        }
      } else if (isCtrl && e.key.toLowerCase() === 'u') {
        const el = getSelectedElement();
        if (el && (el.type === 'text' || el.type === 'titleBlock')) {
          e.preventDefault();
          pushUndo();
          el.underline = !el.underline;
          saveToLocalStorage();
          renderCanvas();
          renderRightSidebar();
          updateFloatingToolbar();
        }
      } else if (isCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        selectedElId = null;
        renderCanvas();
        updateFloatingToolbar();
        setTimeout(() => window.print(), 80);
      }
    });
  }

  // Boot app
  init();
})();
