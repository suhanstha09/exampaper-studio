# ExamPaper Studio

Offline single-page Canva-style editor for creating school exam papers and printouts (with full Nepali **Preeti** font and transliteration support).

## Folder Structure
```text
exampaper-studio/
├── index.html          # Main single-page app
├── css/
│   └── styles.css      # Light theme, @font-face Preeti loader, exact A4 @media print CSS
├── js/
│   ├── preeti-map.js   # Single editable mapping file for Romanized / Unicode <-> Preeti rules
│   ├── nepali-engine.js# Short 'ि' reordering, Reph 'र्', Rakar '्र', half-letters & conjuncts
│   ├── templates.js    # Exam title block presets & full paper templates
│   └── app.js          # Canvas state, drag/resize/snap, undo/redo, JSON save/load
└── fonts/
    ├── Preeti.ttf      # Replace with your official Preeti.ttf file for authentic Nepali glyphs
    └── README-PREETI.txt
```

## How to Run (100% Offline)
1. Unzip the archive anywhere on your laptop or school desktop.
2. *(Optional)* Copy your official `Preeti.ttf` into `exampaper-studio/fonts/Preeti.ttf` (overwriting the bundled placeholder).
3. Double-click `index.html` to open it in Chrome, Edge, or Firefox — no server, internet connection, or login required.
