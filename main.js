/*
Name: Carbon CCalc List
Version: V1.4
Author: AbdurNurPorag
Git: https://github.com/Abdur-Nur-Porag/ccalc-list

Changelog V1.4:
─────────────────────────────────────────────────────────────────
NEW SYNTAX
  • Full "- [ ] name = value" and "- name = value" syntax now
    supported inside clist-calc blocks identically to bare "name = value"
  • Prefix / suffix strings in list items:
      - [ ] Total = "৳" + Rice+Oil+Eggs     → prefix "৳"
      - [ ] Total = Rice+Oil+Eggs + " BDT"  → suffix " BDT"
      Both inline string quoting AND trailing-word unit are resolved.

NEW ROW DIRECTIVES
  • @del  / @strike     → strikethrough on the value cell
  • @u    / @underline  → underline on the value cell
  • @i    / @italic     → italic on the value cell
  • @color:xxx          → custom CSS color on the value cell (hex/name)
  • @dim                → dim / muted value (50 % opacity)
  • @success            → green semantic color on value
  • @warning            → orange semantic color on value
  • @danger             → red semantic color on value
  • @tag:Label          → colored badge tag shown in the Note column
  • @label-bold         → bold the label cell text
  • @label-del          → strikethrough the label cell text
  • @label-u            → underline the label cell text
  • @label-i            → italic the label cell text
  • @label-muted        → muted color on the label cell

COPY IMPROVEMENTS
  • "Copy Table" button now copies a clean human-readable
    "Label: Value" list (one row per line) to the clipboard
  • New "Copy CSV" button copies a proper comma-separated version
  • New "Copy MD" button copies a Markdown table to the clipboard
  • Row-level @copy directive still works for individual cell copy
  • Added "Copy Whole Table" button to copy full rich HTML layout.

Changelog V1.3:
─────────────────────────────────────────────────────────────────
NEW SYNTAX
  • Inline unit suffix in list items:
      - [ ] Pen = 10*10+170 BDT        → calculates 10*10+170, appends "BDT"
      - [ ] Total = Items.Pen+100 BDT  → path-reference inside list, appends "BDT"
  • Both checkbox (- [ ]) and plain dash (-) list items fully supported
  • Nested children resolved for path references (e.g. Items.Pen)

NEW FEATURES
  • @Copy row directive: adds a copy icon on that row's value cell
  • Global copy button copies full table (already existed, now also copies unit)
  • Horizontal scroll wrapper — long tables no longer overflow
  • Full Unicode label support (Arabic, CJK, Bangla, etc.) in all list items

Changelog V1.2:
─────────────────────────────────────────────────────────────────
VISUAL IMPROVEMENTS
  • Polished table design: accent bar, zebra rows, hover glow
  • Row types: ---header--- (section header / colspan), ---divider---
  • Column layout: supports 2-col (label|value) or 3-col (label|note|value)
  • Row-span via @span:N directive on consecutive same-label rows
  • Highlight row with @highlight or @highlight:color
  • Indent level shown visually with left-padding (sub-items)
  • Result-bar: colored progress bar behind value cell (percentage display)
  • Compact / Wide mode via block directive: #mode:compact | #mode:wide

NEW DIRECTIVES (top of block)
  • #title: My Budget           → table caption
  • #mode: compact | wide       → layout density
  • #cols: 2 | 3                → 2-col (default) or 3-col with note column
  • #currency: BDT              → global unit suffix shown on all numbers
  • #decimals: 0|1|2|3          → global decimal places
  • #theme: default|green|blue|purple|red → accent color

ROW DIRECTIVES (per line)
  • @h or ---Title---           → full-width section header (colspan)
  • @note: text                 → adds note/description in 3-col mode
  • @highlight or @hl:color     → color-highlight that row
  • @bar                        → show value as progress bar (needs @max:N)
  • @max: N                     → denominator for progress bar
  • @span: N                    → merge this + next N-1 rows (rowspan)
  • @indent: N                  → manually indent label N levels
  • @bold                       → bold the value
  • @separator                  → thin divider row
  • @del / @strike              → strikethrough value
  • @u / @underline             → underline value
  • @i / @italic                → italic value
  • @color: #hex                → custom value text color
  • @dim                        → dim value (muted opacity)
  • @success / @warning / @danger → semantic color on value
  • @tag: Label                 → badge tag in note column
  • @label-bold / @label-del / @label-u / @label-i / @label-muted → label cell styles

NEW CALCULATION FUNCTIONS
  • Pct(value, total)           → percentage value/total*100
  • Clamp(v, min, max)          → clamp value between min and max
  • Lerp(a, b, t)               → linear interpolation
  • GrowthRate(old, new)        → % growth rate
  • CompoundInterest(P,r,n,t)   → P*(1+r/n)^(n*t)
  • SimpleInterest(P,r,t)       → P*r*t/100
  • Round2(v)                   → round to 2 decimals
  • Round(v, n)                 → round to N decimals

BUG FIXES CARRIED FROM V1.1
  • If(true, false) 2-arg form works
  • Nested If fully resolved innermost-first
  • Smart value extraction: "10 BDT", "৳500", "$100", "100kg" → extracts number
  • List headers "- [ ] My List" skipped gracefully in calc blocks
─────────────────────────────────────────────────────────────────
*/

const { Plugin, MarkdownView, Notice, setIcon } = require("obsidian");

// ======================================================================================
// 1. CONSTANTS & CONFIGURATION
// ======================================================================================

const CONFIG = {
    PLUGIN_ID: 'clist-calc-pro',
    RENDER_DEBOUNCE_MS: 300,
    CHECKBOX_DELAY_MS: 150,
    MAX_RECURSION_DEPTH: 100,
    YIELD_INTERVAL_LINES: 400,
    CACHE_SIZE: 50,
    STYLES: {
        TABLE_CLASS:     'clist-table',
        ROW_CLASS:       'clist-row',
        CELL_LABEL:      'clist-label',
        CELL_NOTE:       'clist-note',
        CELL_VALUE:      'clist-value',
        CELL_HEADER:     'clist-header-cell',
        ROW_HEADER:      'clist-row-header',
        ROW_SEPARATOR:   'clist-row-sep',
        ERROR_CONTAINER: 'clist-error-box',
        TOOLBAR:         'clist-toolbar',
        BTN:             'clist-btn',
        WRAPPER:         'clist-wrapper',
        CAPTION:         'clist-caption',
        BAR_WRAP:        'clist-bar-wrap',
        BAR_FILL:        'clist-bar-fill',
    },
    THEMES: {
        default: '#6c8ebf',
        green:   '#5a9e6f',
        blue:    '#3a8fc9',
        purple:  '#8b6bbf',
        red:     '#c96060',
        orange:  '#c97840',
        teal:    '#3aab9e',
    }
};

const REGEX = {
    CHECKBOX:         /^- \[(x| )\]/i,
    INDENT:           /^(\s*)/,
    // Captures: label = [prefix +] expression [+ suffix | unit]
    // Unit suffix is a trailing word like BDT, USD, kg, টাকা (Unicode word chars) after a space
    BLOCK_LINE:       /^(.+?)\s*=\s*(?:"(.+?)"\s*\+\s*)?(.+?)(?:\s*\+\s*"(.+?)")?$/i,
    // Unit suffix at end of expression: "10*5 BDT" → expr="10*5", unit="BDT"
    UNIT_SUFFIX:      /^([\s\S]+?)\s+([\p{L}\p{Script=Latin}\p{Script=Arabic}\p{Script=Bengali}%\/a-zA-Z\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF]{1,20})$/u,
    BANGLA_DIGITS:    /[০-৯]/,
    IS_MATH:          /[0-9.+\-*/%(),a-zA-Z\u0980-\u09FF]/,
    // Unicode word characters for label matching (supports all scripts)
    UNICODE_LABEL:    /[\p{L}\p{N}_]/u,
    AGGREGATION_FUNC: /\b(Sum|Avg|Max|Min|Count|StdDev|Var|Median|Mode|Range|MaxLabel|MinLabel|AscadingList|DscadingList|TotalChecked|TotalUnchecked|TotalCheckbox|Pct|GrowthRate)\((.+?)\)/gi,
    // Block-level directives: #title: ..., #mode: ..., etc.
    BLOCK_DIRECTIVE:  /^#(title|mode|cols|currency|decimals|theme|colwidth)\s*:\s*(.+)$/i,
    // Row-level directives: @note:, @highlight:, @bar, @max:, @span:, @indent:, @bold, @separator, @h,
    //   @del/@strike, @u/@underline, @i/@italic, @color:, @dim, @success, @warning, @danger,
    //   @tag:, @label-bold, @label-del, @label-u, @label-i, @label-muted
    ROW_DIRECTIVE:    /@(note|highlight|hl|bar|max|span|indent|bold|separator|sep|h|copy|del|strike|u|underline|i|italic|color|dim|success|warning|danger|tag|label-bold|label-del|label-u|label-i|label-muted)\s*(?::\s*([^\s@]+))?/gi,
    // Section header: ---Title--- or @h or @header
    SECTION_HEADER:   /^---(.+)---$/,
};

// ======================================================================================
// 2. UTILITIES & HELPERS
// ======================================================================================

class Utils {
    static hash(str) {
        let hash = 5381, i = str.length;
        while (i) hash = (hash * 33) ^ str.charCodeAt(--i);
        return (hash >>> 0).toString(16);
    }

    static debounce(func, wait) {
        let timeout;
        return function (...args) {
            const ctx = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(ctx, args), wait);
        };
    }

    static async yieldToMain() {
        if (typeof window.requestIdleCallback === 'function')
            return new Promise(resolve => window.requestIdleCallback(resolve));
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    static toBangla(input) {
        return (input + "").replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
    }

    static toEnglish(input) {
        return (input + "").replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
    }

    static isBangla(str) { return REGEX.BANGLA_DIGITS.test(str); }

    /** Format a number with given decimal places and optional Bangla conversion */
    static formatNumber(val, decimals = 2, bangla = false) {
        if (typeof val !== 'number' || isNaN(val)) return String(val);
        const fixed = Number(val.toFixed(decimals));
        let str = fixed.toLocaleString(undefined, {
            minimumFractionDigits: decimals === 0 ? 0 : undefined,
            maximumFractionDigits: decimals
        });
        return bangla ? Utils.toBangla(str) : str;
    }

    /** Parse @directive annotations from a line, returning cleaned line + directive map */
    static parseRowDirectives(rawLine) {
        const directives = {};
        REGEX.ROW_DIRECTIVE.lastIndex = 0;
        let match;
        while ((match = REGEX.ROW_DIRECTIVE.exec(rawLine)) !== null) {
            const key = match[1].toLowerCase();
            const val = match[2] !== undefined ? match[2] : true;
            directives[key] = val;
        }
        // Remove directives from the line
        const cleanLine = rawLine.replace(REGEX.ROW_DIRECTIVE, '').trim();
        REGEX.ROW_DIRECTIVE.lastIndex = 0;
        return { cleanLine, directives };
    }

    /** Parse block-level directives from source lines starting with # */
    static parseBlockDirectives(lines) {
        const opts = {
            title: null,
            mode: 'default',   // compact | wide | default
            cols: 2,           // 2 or 3
            currency: null,
            decimals: 2,
            theme: 'default',
            colwidth: null,
        };
        const remaining = [];
        for (const line of lines) {
            const trimmed = line.trim();
            REGEX.BLOCK_DIRECTIVE.lastIndex = 0;
            const m = trimmed.match(REGEX.BLOCK_DIRECTIVE);
            if (m) {
                const key = m[1].toLowerCase();
                const val = m[2].trim();
                if (key === 'cols') opts.cols = parseInt(val) || 2;
                else if (key === 'decimals') opts.decimals = parseInt(val) ?? 2;
                else if (key === 'theme') opts.theme = val.toLowerCase();
                else opts[key] = val;
            } else {
                remaining.push(line);
            }
        }
        return { opts, remaining };
    }

    /** Smart numeric extraction: "10 BDT" → 10, "৳500" → 500 */
    static extractNumber(expr) {
        if (expr === null || expr === undefined) return null;
        const eng = Utils.toEnglish(String(expr)).replace(/,/g, '');
        const hasMathOps = /[+\-*/%^()]/.test(eng);
        if (hasMathOps) return null; // Don't strip from math expressions
        const numMatch = eng.match(/^[^\d\-]*(-?\d+(?:\.\d+)?)[^\d]*$/);
        if (numMatch) return numMatch[1];
        return null;
    }
}

// ======================================================================================
// 3. LOGGING SERVICE
// ======================================================================================

const LogLevel = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 };

class Logger {
    constructor(level = LogLevel.ERROR) { this.level = level; }
    static getInstance() {
        if (!Logger.instance) Logger.instance = new Logger();
        return Logger.instance;
    }
    debug(msg, ...a) { if (this.level <= 0) console.log(`%c[ClistCalc:DEBUG] ${msg}`, 'color:#9E9E9E', ...a); }
    info(msg, ...a)  { if (this.level <= 1) console.log(`%c[ClistCalc:INFO] ${msg}`,  'color:#2196F3', ...a); }
    warn(msg, ...a)  { if (this.level <= 2) console.warn(`[ClistCalc:WARN] ${msg}`, ...a); }
    error(msg, ...a) { if (this.level <= 3) console.error(`[ClistCalc:ERROR] ${msg}`, ...a); }
}

// ======================================================================================
// 4. MATH KERNEL
// ======================================================================================

class MathKernel {
    constructor() {
        this.logger = Logger.getInstance();
        this.functions = {
            // Basic
            Abs: Math.abs, Root: Math.sqrt,
            nRoot: (x, n) => Math.pow(x, 1 / n),
            Power: Math.pow, Ceil: Math.ceil, Floor: Math.floor,
            Round: (v, n) => n !== undefined ? Number(v.toFixed(n)) : Math.round(v),
            Round2: v => Number(v.toFixed(2)),
            Clamp: (v, lo, hi) => Math.min(Math.max(v, lo), hi),
            Lerp: (a, b, t) => a + (b - a) * t,

            // Finance / percentages
            Pct: (v, total) => total !== 0 ? (v / total) * 100 : 0,
            GrowthRate: (oldV, newV) => oldV !== 0 ? ((newV - oldV) / oldV) * 100 : 0,
            CompoundInterest: (P, r, n, t) => P * Math.pow(1 + r / n, n * t),
            SimpleInterest: (P, r, t) => P * r * t / 100,
            PMT: (r, n, pv) => (r !== 0) ? (pv * r) / (1 - Math.pow(1 + r, -n)) : pv / n,

            // Logarithmic
            Log: Math.log10, Ln: Math.log,

            // Trig (degree-based)
            Sin: x => Math.sin(x * Math.PI / 180),
            Cos: x => Math.cos(x * Math.PI / 180),
            Tan: x => Math.tan(x * Math.PI / 180),
            Cot: x => 1 / Math.tan(x * Math.PI / 180),
            Sec: x => 1 / Math.cos(x * Math.PI / 180),
            Cosec: x => 1 / Math.sin(x * Math.PI / 180),
            ASin: x => Math.asin(x) * 180 / Math.PI,
            ACos: x => Math.acos(x) * 180 / Math.PI,
            ATan: x => Math.atan(x) * 180 / Math.PI,

            // Constants
            PI: Math.PI, E: Math.E,
        };
    }

    evaluate(expr) {
        try {
            let working = Utils.toEnglish(expr);

            // Mask string literals
            const placeholders = [];
            let masked = working.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, m => {
                placeholders.push(m);
                return `__STR${placeholders.length - 1}__`;
            });

            // Syntax sugar
            masked = masked
                .replace(/\band\b/gi, " && ").replace(/\bor\b/gi,  " || ")
                .replace(/\bnot\b/gi, " !")
                .replace(/(\d|\)|\s)x(\d|\(|\s)/gi, "$1*$2")
                .replace(/(?<![=!<>])={1}(?!=)/g, m => m === '=' ? '===' : m) // bare = → ===, skip == already
                .replace(/==/g, "===").replace(/!=/g, "!==")
                .replace(/(\d)\s*%\s*(?!\d)/g, '$1/100'); // trailing % as /100

            // Restore strings
            const clean = masked.replace(/__STR(\d+)__/g, (_, i) => placeholders[i]);

            // Short-circuit string literals
            if (/^["'].*["']$/.test(clean.trim()))
                return clean.trim().replace(/^["']|["']$/g, "");

            const filtered = clean.replace(/[^0-9.+\-*/%() !&|=<>,a-zA-Z\u0980-\u09FF_'"]/g, "");
            const keys = Object.keys(this.functions);
            const vals = Object.values(this.functions);
            const fn = new Function(...keys, `"use strict"; return (${filtered})`);
            return fn(...vals);
        } catch (err) {
            this.logger.debug(`Eval failed: ${expr}`, err);
            return expr.trim().replace(/^["']|["']$/g, "");
        }
    }
}

// ======================================================================================
// 5. DATA MODELS
// ======================================================================================

class CalculationNode {
    constructor(name, value = 0) {
        this.name             = name;
        this.value            = value;
        this.children         = {};
        this.isChecked        = false;
        this.isEffectiveChecked = false;
        this.hasCheckbox      = false;
        this.rawExpression    = "";
        this.lineNumber       = -1;
    }
    addChild(key, node) { this.children[key] = node; }
    getDescendants() {
        let d = [];
        for (const k in this.children) {
            d.push(this.children[k]);
            d = d.concat(this.children[k].getDescendants());
        }
        return d;
    }
}

class QueryResult {
    constructor() { this.roots = []; this.all = []; }
    get values() { return this.all.map(n => { const v = Number(n.value); return isNaN(v) ? 0 : v; }); }
    get count() { return this.all.length; }
}

// ======================================================================================
// 6. PARSER ENGINE
// ======================================================================================

class ParserEngine {
    constructor() { this.mathKernel = new MathKernel(); }

    async parse(text) {
        if (!text) return new CalculationNode("Root");
        const root = new CalculationNode("Root");
        const stack = [{ indent: -1, node: root }];
        const lines = text.split("\n");
        let counter = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (++counter >= CONFIG.YIELD_INTERVAL_LINES) { await Utils.yieldToMain(); counter = 0; }

            const trimmed = line.trim();
            // Support both "- [ ]" checkbox items and plain "- " list items
            if (!trimmed || !trimmed.startsWith("-")) continue;

            const indent = (line.match(REGEX.INDENT) || [''])[0].length;
            while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
            const parent = stack[stack.length - 1];

            const cbMatch = trimmed.match(REGEX.CHECKBOX);
            const hasCheckbox = !!cbMatch;
            const isChecked = cbMatch ? cbMatch[1].toLowerCase() === 'x' : false;
            const isEffective = isChecked || parent.node.isEffectiveChecked;
            const isActive = isEffective || !hasCheckbox;

            // Strip "- [ ] " or "- [x] " or "- "
            let content = trimmed.replace(/^-\s*(?:\[[ xX]\]\s*)?/, "");
            let namePart = content.split("=")[0].replace(/[✅].*$/, "").trim();

            const mathMatch = content.match(/=\s*([\s\S]+)$/i);
            let value = 0, rawExpr = "", unitSuffix = "";

            if (mathMatch) {
                let exprRaw = mathMatch[1].trim();

                // NEW: detect and strip trailing unit suffix e.g. "10*10+170 BDT"
                // Unit suffix = trailing word that isn't a math operand
                const unitMatch = exprRaw.match(REGEX.UNIT_SUFFIX);
                if (unitMatch) {
                    const candidate = unitMatch[2];
                    // Only treat as unit if it doesn't look like a variable name used in math
                    // (i.e. not followed by math operators — it's at the very end)
                    const testExpr = unitMatch[1].trim();
                    const looksLikeMath = /[+\-*/%^()]/.test(testExpr) || /^\d/.test(testExpr);
                    if (looksLikeMath || /^\d+(\.\d+)?$/.test(testExpr)) {
                        exprRaw = testExpr;
                        unitSuffix = candidate;
                    }
                }

                rawExpr = exprRaw;
                const extracted = Utils.extractNumber(rawExpr);
                if (extracted !== null) rawExpr = extracted;
                value = this.mathKernel.evaluate(rawExpr);
            }

            const node = new CalculationNode(namePart, isActive ? value : 0);
            node.isChecked = isChecked;
            node.isEffectiveChecked = isEffective;
            node.hasCheckbox = hasCheckbox;
            node.lineNumber = i;
            node.rawExpression = rawExpr;
            node.unitSuffix = unitSuffix; // store for rendering

            parent.node.addChild(namePart, node);
            stack.push({ indent, node });
        }
        return root;
    }
}

// ======================================================================================
// 7. QUERY ENGINE
// ======================================================================================

class QueryEngine {
    constructor() { this.mathKernel = new MathKernel(); }

    query(tree, path) {
        const result = new QueryResult();
        const segs = path.split(".");
        let current = [tree];
        for (const seg of segs) {
            const next = [];
            for (const n of current) { if (n.children[seg]) next.push(n.children[seg]); }
            if (!next.length) return result;
            current = next;
        }
        result.roots = current;
        const traverse = nodes => nodes.forEach(n => { result.all.push(n); traverse(Object.values(n.children)); });
        traverse(current);
        return result;
    }

    getSum(tree, path) {
        const { roots } = this.query(tree, path);
        const sum = n => (Number(n.value) || 0) + Object.values(n.children).reduce((a, c) => a + sum(c), 0);
        return roots.reduce((a, r) => a + sum(r), 0);
    }

    getStdDev(values) {
        if (!values.length) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(values.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / values.length);
    }
    getMedian(values) {
        if (!values.length) return 0;
        const s = [...values].sort((a, b) => a - b);
        const m = Math.floor(s.length / 2);
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }
    getMode(values) {
        if (!values.length) return 0;
        const c = {}; values.forEach(v => c[v] = (c[v] || 0) + 1);
        return Number(Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]);
    }
}

// ======================================================================================
// 8. CACHE LAYER
// ======================================================================================

class CacheService {
    constructor() { this.cache = new Map(); }
    static getInstance() {
        if (!CacheService.instance) CacheService.instance = new CacheService();
        return CacheService.instance;
    }
    get(path, content) {
        const e = this.cache.get(path);
        return (e && e.hash === Utils.hash(content)) ? e.tree : null;
    }
    set(path, content, tree) {
        if (this.cache.size >= CONFIG.CACHE_SIZE) this.cache.delete(this.cache.keys().next().value);
        this.cache.set(path, { hash: Utils.hash(content), tree, timestamp: Date.now() });
    }
    clear() { this.cache.clear(); }
}

// ======================================================================================
// 9. UI COMPONENTS
// ======================================================================================

class Component {
    constructor(tag, classes = []) {
        this.el = document.createElement(tag);
        if (classes.length) this.el.classList.add(...classes);
    }
    setText(t) { this.el.textContent = t; return this; }
    setHTML(h) { this.el.innerHTML = h; return this; }
    append(c) { this.el.appendChild(c instanceof Component ? c.el : c); return this; }
    attr(k, v) { this.el.setAttribute(k, v); return this; }
    style(k, v) { this.el.style[k] = v; return this; }
    mount(p) { p.appendChild(this.el); }
    empty() { this.el.innerHTML = ''; }
}

class Button extends Component {
    constructor(icon, onClick, tooltip) {
        super('button', [CONFIG.STYLES.BTN]);
        if (icon) setIcon(this.el, icon);
        if (tooltip) this.el.setAttribute('aria-label', tooltip);
        this.el.onclick = onClick;
    }
}

class EnhancedTable extends Component {
    constructor(opts = {}) {
        super('table', [CONFIG.STYLES.TABLE_CLASS]);
        if (opts.mode)  this.el.classList.add(`clist-mode-${opts.mode}`);
        if (opts.theme) this.el.dataset.theme = opts.theme;
        if (opts.cols)  this.el.dataset.cols = opts.cols;

        this.opts = opts;
        this.colCount = opts.cols || 2;

        if (opts.title) {
            const caption = document.createElement('caption');
            caption.className = CONFIG.STYLES.CAPTION;
            caption.textContent = opts.title;
            this.el.appendChild(caption);
        }

        // thead
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        const thLabel = document.createElement('th');
        thLabel.className = 'clist-th-label';
        thLabel.textContent = 'Item';
        headRow.appendChild(thLabel);

        if (this.colCount >= 3) {
            const thNote = document.createElement('th');
            thNote.className = 'clist-th-note';
            thNote.textContent = 'Note';
            headRow.appendChild(thNote);
        }

        const thValue = document.createElement('th');
        thValue.className = 'clist-th-value';
        thValue.textContent = 'Value';
        headRow.appendChild(thValue);

        thead.appendChild(headRow);
        this.el.appendChild(thead);

        this.tbody = document.createElement('tbody');
        this.el.appendChild(this.tbody);
        this._rowIndex = 0;
    }

    /**
     * Add a section header row spanning all columns
     */
    addHeader(text, accentColor) {
        const tr = document.createElement('tr');
        tr.className = CONFIG.STYLES.ROW_HEADER;
        const td = document.createElement('td');
        td.className = CONFIG.STYLES.CELL_HEADER;
        td.colSpan = this.colCount;
        td.textContent = text;
        if (accentColor) td.style.borderLeftColor = accentColor;
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        return tr;
    }

    /** Thin divider row */
    addSeparator() {
        const tr = document.createElement('tr');
        tr.className = CONFIG.STYLES.ROW_SEPARATOR;
        const td = document.createElement('td');
        td.colSpan = this.colCount;
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        return tr;
    }

    /**
     * Main data row.
     * @param {string} label
     * @param {string} value
     * @param {object} opts  { note, highlight, bar, barMax, indent, bold, rowspan, zebra,
     * del, underline, italic, color, dim, success, warning, danger, tag,
     * labelBold, labelDel, labelUnderline, labelItalic, labelMuted }
     */
    addRow(label, value, opts = {}) {
        const tr = document.createElement('tr');
        tr.className = CONFIG.STYLES.ROW_CLASS;
        if (this._rowIndex++ % 2 === 0) tr.classList.add('clist-row-even');
        else tr.classList.add('clist-row-odd');

        if (opts.highlight) {
            const color = (opts.highlight === true || opts.highlight === 'true')
                ? (CONFIG.THEMES[this.opts.theme] || CONFIG.THEMES.default)
                : opts.highlight;
            tr.style.setProperty('--row-hl', color + '22');
            tr.classList.add('clist-row-highlighted');
        }

        // Label cell
        const tdLabel = document.createElement('td');
        tdLabel.className = CONFIG.STYLES.CELL_LABEL;
        if (opts.indent) tdLabel.style.paddingLeft = `${12 + opts.indent * 16}px`;
        if (opts.rowspan > 1) tdLabel.rowSpan = opts.rowspan;
        tdLabel.textContent = label;
        // Label cell style directives
        if (opts.labelBold)       tdLabel.classList.add('clist-label-bold');
        if (opts.labelDel)        tdLabel.classList.add('clist-label-del');
        if (opts.labelUnderline)  tdLabel.classList.add('clist-label-u');
        if (opts.labelItalic)     tdLabel.classList.add('clist-label-i');
        if (opts.labelMuted)      tdLabel.classList.add('clist-label-muted');
        tr.appendChild(tdLabel);

        // Note cell (3-col mode) — also used for @tag badge
        if (this.colCount >= 3) {
            const tdNote = document.createElement('td');
            tdNote.className = CONFIG.STYLES.CELL_NOTE;
            if (opts.tag) {
                const badge = document.createElement('span');
                badge.className = 'clist-tag';
                badge.textContent = opts.tag;
                tdNote.appendChild(badge);
            } else {
                tdNote.textContent = opts.note || '';
            }
            tr.appendChild(tdNote);
        }

        // Value cell
        const tdValue = document.createElement('td');
        tdValue.className = CONFIG.STYLES.CELL_VALUE;
        if (opts.bold) tdValue.classList.add('clist-value-bold');

        if (opts.bar && opts.barMax) {
            const pct = Math.min(100, Math.max(0, (parseFloat(value) / opts.barMax) * 100));
            const wrap = document.createElement('div');
            wrap.className = CONFIG.STYLES.BAR_WRAP;
            const fill = document.createElement('div');
            fill.className = CONFIG.STYLES.BAR_FILL;
            fill.style.width = `${pct}%`;
            const label_ = document.createElement('span');
            label_.className = 'clist-bar-label';
            label_.textContent = value;
            wrap.appendChild(fill);
            wrap.appendChild(label_);
            tdValue.appendChild(wrap);
        } else {
            const valueSpan = document.createElement('span');
            valueSpan.textContent = value;

            // Text style directives on value span
            if (opts.del)       valueSpan.classList.add('clist-value-del');
            if (opts.underline) valueSpan.classList.add('clist-value-u');
            if (opts.italic)    valueSpan.classList.add('clist-value-i');
            if (opts.dim)       valueSpan.classList.add('clist-value-dim');
            if (opts.success)   valueSpan.classList.add('clist-value-success');
            if (opts.warning)   valueSpan.classList.add('clist-value-warning');
            if (opts.danger)    valueSpan.classList.add('clist-value-danger');
            if (opts.color)     valueSpan.style.color = opts.color;

            tdValue.appendChild(valueSpan);

            // @Copy button: inline copy icon next to value
            if (opts.copyBtn) {
                const copyIcon = document.createElement('button');
                copyIcon.className = 'clist-row-copy-btn';
                copyIcon.title = 'Copy value';
                copyIcon.innerHTML = '⧉';
                copyIcon.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(opts.copyValue || value);
                    copyIcon.innerHTML = '✓';
                    setTimeout(() => { copyIcon.innerHTML = '⧉'; }, 1200);
                };
                tdValue.appendChild(copyIcon);
            }
        }

        tr.appendChild(tdValue);
        this.tbody.appendChild(tr);
        return tr;
    }
}

class Toolbar extends Component {
    constructor() {
        super('div', [CONFIG.STYLES.TOOLBAR]);
        this.el.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:6px;gap:6px;align-items:center;';
    }
}

// ======================================================================================
// 10. RENDER ENGINE
// ======================================================================================

class RenderEngine {
    constructor() {
        this.queryEngine = new QueryEngine();
        this.mathKernel  = new MathKernel();
    }

    /**
     * Resolve If(cond [,tVal [,fVal]]) — innermost-first, nested-safe.
     */
    solveIfs(input, vars) {
        let str = input;
        let safety = 0;
        while (safety++ < CONFIG.MAX_RECURSION_DEPTH) {
            const lower = str.toLowerCase();
            let startIdx = -1, searchFrom = 0;
            while (searchFrom < lower.length) {
                const idx = lower.indexOf("if(", searchFrom);
                if (idx === -1) break;
                let bc = 0, endI = -1;
                for (let i = idx + 3; i < str.length; i++) {
                    if (str[i] === '(') bc++;
                    else if (str[i] === ')') { if (bc === 0) { endI = i; break; } bc--; }
                }
                if (endI === -1) { searchFrom = idx + 3; continue; }
                if (!str.substring(idx + 3, endI).toLowerCase().includes("if(")) {
                    startIdx = idx; break;
                }
                searchFrom = idx + 3;
            }
            if (startIdx === -1) break;

            let bc = 0, endIdx = -1;
            for (let i = startIdx + 3; i < str.length; i++) {
                if (str[i] === '(') bc++;
                else if (str[i] === ')') { if (bc === 0) { endIdx = i; break; } bc--; }
            }
            if (endIdx === -1) break;

            const inner = str.substring(startIdx + 3, endIdx);
            const args = []; let cur = "", bl = 0;
            for (const ch of inner) {
                if (ch === ',' && bl === 0) { args.push(cur); cur = ''; }
                else { if (ch === '(') bl++; if (ch === ')') bl--; cur += ch; }
            }
            args.push(cur);
            if (args.length < 2) break;

            let cond = args[0].trim();
            const tVal = args[1].trim();
            const fVal = args.length >= 3 ? args[2].trim() : '""';
            Object.keys(vars).sort((a,b) => b.length - a.length).forEach(k => {
                const ek = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                cond = cond.replace(new RegExp(`(?<=^|[^\\u0980-\\u09FF\\w])${ek}(?=[^\\u0980-\\u09FF\\w]|$)`, 'g'), ` ${vars[k]} `);
            });
            const chosen = (!!this.mathKernel.evaluate(cond) ? tVal : fVal).trim();
            str = str.substring(0, startIdx) + chosen + str.substring(endIdx + 1);
        }
        return str;
    }

    /** Replace aggregation function calls with their computed values. */
    solveAggregations(expression, dataTree) {
        REGEX.AGGREGATION_FUNC.lastIndex = 0;
        return expression.replace(REGEX.AGGREGATION_FUNC, (m, func, path) => {
            const { roots, all } = this.queryEngine.query(dataTree, path.trim());
            const values = all.map(n => Number(n.value) || 0);
            const safeName = n => n.name.replace(/"/g, '\\"');
            switch (func.toLowerCase()) {
                case "sum":          return this.queryEngine.getSum(dataTree, path.trim());
                case "avg":          return values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
                case "max":          return values.length ? Math.max(...values) : 0;
                case "min":          return values.length ? Math.min(...values) : 0;
                case "count":        return values.length;
                case "stddev":       return this.queryEngine.getStdDev(values);
                case "median":       return this.queryEngine.getMedian(values);
                case "mode":         return this.queryEngine.getMode(values);
                case "range":        return values.length ? Math.max(...values) - Math.min(...values) : 0;
                case "totalchecked": return all.filter(n => n.isEffectiveChecked && !roots.includes(n)).length;
                case "totalunchecked": return all.filter(n => n.hasCheckbox && !n.isEffectiveChecked && !roots.includes(n)).length;
                case "totalcheckbox": return all.filter(n => n.hasCheckbox && !roots.includes(n)).length;
                case "pct": {
                    const pts = path.split(',').map(s => s.trim());
                    if (pts.length >= 2) {
                        const v = this.queryEngine.getSum(dataTree, pts[0]);
                        const t = this.queryEngine.getSum(dataTree, pts[1]);
                        return t !== 0 ? (v / t * 100) : 0;
                    }
                    return 0;
                }
                case "growthrate": {
                    const pts = path.split(',').map(s => s.trim());
                    if (pts.length >= 2) {
                        const oldV = this.queryEngine.getSum(dataTree, pts[0]);
                        const newV = this.queryEngine.getSum(dataTree, pts[1]);
                        return oldV !== 0 ? ((newV - oldV) / oldV * 100) : 0;
                    }
                    return 0;
                }
                case "maxlabel": {
                    if (!all.length) return '"None"';
                    const maxV = Math.max(...values);
                    return `"${all.filter(n=>(Number(n.value)||0)===maxV).map(safeName).join(', ')}"`;
                }
                case "minlabel": {
                    if (!all.length) return '"None"';
                    const minV = Math.min(...values);
                    return `"${all.filter(n=>(Number(n.value)||0)===minV).map(safeName).join(', ')}"`;
                }
                case "ascadinglist": {
                    return `"${[...all].filter(n=>!roots.includes(n)).sort((a,b)=>(Number(a.value)||0)-(Number(b.value)||0)).map(safeName).join(', ')}"`;
                }
                case "dscadinglist": {
                    return `"${[...all].filter(n=>!roots.includes(n)).sort((a,b)=>(Number(b.value)||0)-(Number(a.value)||0)).map(safeName).join(', ')}"`;
                }
                default: return "0";
            }
        });
    }

    render(blockContext, dataTree) {
        const { source, el } = blockContext;
        const fragment = document.createDocumentFragment();

        // 1. Parse block directives
        const allLines = source.split("\n").filter(l => l.trim().length > 0);
        const { opts, remaining: lines } = Utils.parseBlockDirectives(allLines);
        const accentColor = CONFIG.THEMES[opts.theme] || CONFIG.THEMES.default;

        // 2. Toolbar
        const toolbar = new Toolbar();

        // ── Copy Rich Text (Whole HTML Table) ────────────────────────────────
        const btnRichCopy = new Button('clipboard', async () => {
            try {
                // Clone table so we don't accidentally wipe inline styling buttons from the live UI
                const clone = table.el.cloneNode(true);
                // Strip away inline action buttons from the copied format
                clone.querySelectorAll('.clist-row-copy-btn').forEach(b => b.remove());
                
                const htmlStr = clone.outerHTML;
                const textStr = clone.innerText;
                
                const item = new ClipboardItem({
                    'text/html': new Blob([htmlStr], { type: 'text/html' }),
                    'text/plain': new Blob([textStr], { type: 'text/plain' })
                });
                await navigator.clipboard.write([item]);
                new Notice("✓ Copied whole table (Rich Text)!");
            } catch (err) {
                console.error(err);
                // Fallback for browsers that don't support the Clipboard API objects fully
                navigator.clipboard.writeText(table.el.innerText);
                new Notice("✓ Copied table text!");
            }
        }, "Copy Whole Table");

        // ── Copy as Text (Label: Value pairs) ──────────────────────────────
        const btnCopy = new Button('copy', () => {
            const lines = [];
            // Title
            const caption = el.querySelector('caption');
            if (caption) lines.push(`# ${caption.textContent.trim()}`, '');
            // Data rows only (skip thead and separator rows)
            el.querySelectorAll('tbody tr').forEach(tr => {
                if (tr.classList.contains('clist-row-sep')) return;
                if (tr.classList.contains('clist-row-header')) {
                    const hCell = tr.querySelector('td');
                    if (hCell) lines.push('', `── ${hCell.textContent.trim()} ──`);
                    return;
                }
                const cells = Array.from(tr.querySelectorAll('td'));
                if (!cells.length) return;
                const labelText = cells[0]?.textContent.trim() || '';
                const valueText = cells[cells.length - 1]?.textContent.trim() || '';
                if (labelText) lines.push(`${labelText}: ${valueText}`);
            });
            navigator.clipboard.writeText(lines.join('\n'));
            new Notice("✓ Copied as text!");
        }, "Copy as Text");

        // ── Copy as CSV ─────────────────────────────────────────────────────
        const btnCsv = new Button('download', () => {
            const rows = [];
            el.querySelectorAll('tr').forEach(tr => {
                if (tr.classList.contains('clist-row-sep')) return;
                const cells = Array.from(tr.querySelectorAll('td,th'))
                    .map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`);
                if (cells.length) rows.push(cells.join(','));
            });
            const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${opts.title || 'clist-calc'}.csv`;
            a.click();
        }, "Export CSV");

        // ── Copy as Markdown table ──────────────────────────────────────────
        const btnMD = new Button('table', () => {
            const mdRows = [];
            let headerDone = false;
            el.querySelectorAll('tr').forEach(tr => {
                if (tr.classList.contains('clist-row-sep')) return;
                if (tr.classList.contains('clist-row-header')) return;
                const cells = Array.from(tr.querySelectorAll('td,th'))
                    .map(c => c.textContent.trim().replace(/\|/g, '\\|'));
                if (!cells.length) return;
                mdRows.push('| ' + cells.join(' | ') + ' |');
                if (!headerDone && tr.closest('thead')) {
                    mdRows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
                    headerDone = true;
                }
            });
            // Insert separator after first row if no thead detected
            if (mdRows.length > 1 && !headerDone) {
                const cols = (mdRows[0].match(/\|/g) || []).length - 1;
                mdRows.splice(1, 0, '| ' + Array(cols).fill('---').join(' | ') + ' |');
            }
            navigator.clipboard.writeText(mdRows.join('\n'));
            new Notice("✓ Copied as Markdown table!");
        }, "Copy as Markdown");

        toolbar.append(btnRichCopy).append(btnCopy).append(btnMD).append(btnCsv);
        
        // 3. Build table
        const table = new EnhancedTable({
            title:  opts.title,
            mode:   opts.mode,
            theme:  opts.theme,
            cols:   opts.cols,
        });

        const vars = {};
        const globalCurrency = opts.currency || '';
        const globalDecimals = opts.decimals;

        try {
            lines.forEach(rawLine => {
                const rawTrimmed = rawLine.trim();

                // a) Skip empty
                if (!rawTrimmed) return;

                // b) Hidden line (//)
                const isHidden = rawTrimmed.startsWith("//");
                const lineForParsing = isHidden ? rawTrimmed.substring(2).trim() : rawTrimmed;

                // c) Parse row directives (@note, @highlight, @bar, etc.)
                const { cleanLine, directives } = Utils.parseRowDirectives(lineForParsing);

                // d) Section header: ---Title--- or @h
                const headerMatch = cleanLine.match(REGEX.SECTION_HEADER);
                if (headerMatch || directives.h !== undefined || directives.header !== undefined) {
                    if (!isHidden) {
                        const text = headerMatch ? headerMatch[1].trim() : (cleanLine || '');
                        table.addHeader(text, accentColor);
                    }
                    return;
                }

                // e) Separator: @separator or @sep
                if (directives.separator !== undefined || directives.sep !== undefined) {
                    if (!isHidden) table.addSeparator();
                    return;
                }

                // f) Skip pure list-header lines (no = sign, not a data row)
                // Support both "- [ ] Label" and "- Label" (no value) as list headers
                if (!cleanLine.includes("=")) return;

                // g) Match label = expression
                // Also handle "- [ ] Label = expr" and "- Label = expr" forms (strip the list prefix)
                let lineForMatch = cleanLine
                    .replace(/^-\s*(?:\[[ xX]\]\s*)?/, "") // strip list prefix inside clist block
                    .trim();
                const match = lineForMatch.match(REGEX.BLOCK_LINE);
                if (!match) return;

                let label      = match[1].trim();
                const prefix   = match[2] || "";
                let expression = match[3].trim();
                let suffix     = match[4] || "";

                // NEW: extract inline unit suffix from expression (e.g. "10*10+170 BDT" → expr="10*10+170", unit="BDT")
                if (!suffix) {
                    const unitMatch = expression.match(REGEX.UNIT_SUFFIX);
                    if (unitMatch) {
                        const candidateUnit = unitMatch[2];
                        const candidateExpr = unitMatch[1].trim();
                        // Only treat as unit if the left side looks like math or a number/path
                        const looksLikeMath = /[+\-*/%^()]/.test(candidateExpr) || /^\d/.test(candidateExpr) || /\./.test(candidateExpr);
                        if (looksLikeMath) {
                            expression = candidateExpr;
                            suffix = candidateUnit;
                        }
                    }
                }

                const useBangla = Utils.isBangla(expression);

                // Smart unit stripping for bare numbers
                const hasMathOps  = /[+\-*/%^()]/.test(expression);
                const hasFunctions = /\b(Sum|Avg|Max|Min|If|Count|StdDev|Median|Mode|Range|Pct|GrowthRate)\s*\(/i.test(expression);
                if (!hasMathOps && !hasFunctions) {
                    const extracted = Utils.extractNumber(expression);
                    if (extracted !== null) expression = extracted;
                }

                // A. Aggregations
                expression = this.solveAggregations(expression, dataTree);

                // B. IF logic
                expression = this.solveIfs(expression, vars);

                // C. Variable substitution (supports Unicode label names + dot-path e.g. Items.Pen)
                // First resolve dot-path references: Items.Pen → sum of Items > Pen node
                expression = expression.replace(
                    /\b([\p{L}\p{N}_][\p{L}\p{N}_\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF]*)(?:\.([\p{L}\p{N}_][\p{L}\p{N}_\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF]*(?:\.[\p{L}\p{N}_][\p{L}\p{N}_\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF]*)*))\b/gu,
                    (m, parent_, childPath) => {
                        const fullPath = `${parent_}.${childPath}`;
                        const sum = this.queryEngine.getSum(dataTree, fullPath);
                        return isNaN(sum) ? m : ` ${sum} `;
                    }
                );

                Object.keys(vars).sort((a,b) => b.length - a.length).forEach(v => {
                    const ev = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    try {
                        expression = expression.replace(
                            new RegExp(`(?<![\\p{L}\\p{N}_\\u0980-\\u09FF\\u0600-\\u06FF\\u4E00-\\u9FFF])${ev}(?![\\p{L}\\p{N}_\\u0980-\\u09FF\\u0600-\\u06FF\\u4E00-\\u9FFF])`, 'gu'),
                            ` ${vars[v]} `
                        );
                    } catch (e) {
                        // fallback for labels that can't form valid regex
                    }
                });

                // D. Evaluate
                vars[label] = this.mathKernel.evaluate(expression);

                // E. Render
                if (!isHidden) {
                    let val = vars[label];
                    let displayString = "";

                    if (typeof val === 'number') {
                        displayString = Utils.formatNumber(val, globalDecimals, useBangla);
                    } else {
                        displayString = String(val);
                    }

                    // Assemble display: prefix + value + suffix + global currency
                    const unitSuffix = suffix || (globalCurrency ? ` ${globalCurrency}` : "");
                    const fullText   = `${prefix}${displayString}${unitSuffix ? ' ' + unitSuffix : ''}`.trim();

                    // Bar options
                    const barMax = directives.max ? parseFloat(directives.max) : null;

                    // Indent: from directive or auto-detect from leading spaces
                    const indentLevel = directives.indent ? parseInt(directives.indent) :
                        Math.floor((rawLine.match(/^\s*/)[0].length) / 2);

                    const tr = table.addRow(label, fullText, {
                        note:           directives.note || '',
                        highlight:      directives.highlight || directives.hl,
                        bar:            directives.bar !== undefined,
                        barMax:         barMax || (typeof val === 'number' ? Math.abs(val) * 1.2 : null),
                        indent:         indentLevel,
                        bold:           directives.bold !== undefined,
                        rowspan:        directives.span ? parseInt(directives.span) : 1,
                        copyBtn:        directives.copy !== undefined,
                        copyValue:      fullText,
                        // Text style directives (new in V1.4)
                        del:            directives.del !== undefined || directives.strike !== undefined,
                        underline:      directives.u !== undefined || directives.underline !== undefined,
                        italic:         directives.i !== undefined || directives.italic !== undefined,
                        color:          directives.color || null,
                        dim:            directives.dim !== undefined,
                        success:        directives.success !== undefined,
                        warning:        directives.warning !== undefined,
                        danger:         directives.danger !== undefined,
                        tag:            directives.tag || null,
                        // Label cell style directives (new in V1.4)
                        labelBold:      directives['label-bold'] !== undefined,
                        labelDel:       directives['label-del'] !== undefined,
                        labelUnderline: directives['label-u'] !== undefined,
                        labelItalic:    directives['label-i'] !== undefined,
                        labelMuted:     directives['label-muted'] !== undefined,
                    });
                }
            });

            // Wrap table in horizontal scroll container
            const scrollWrap = document.createElement('div');
            scrollWrap.className = 'clist-scroll-wrap';
            scrollWrap.appendChild(table.el);
            
            // Wrap both the toolbar and table inside clist-wrapper to fix hover UI trigger
            const wrapper = document.createElement('div');
            wrapper.className = CONFIG.STYLES.WRAPPER;
            wrapper.appendChild(toolbar.el);
            wrapper.appendChild(scrollWrap);
            
            fragment.appendChild(wrapper);

            requestAnimationFrame(() => {
                el.innerHTML = '';
                el.appendChild(fragment);
            });

        } catch (err) {
            console.error(err);
            el.innerHTML = '';
            const box = document.createElement('div');
            box.className = CONFIG.STYLES.ERROR_CONTAINER;
            box.innerHTML = `<strong>⚠️ CList-Calc Error</strong><br><code>${err.message}</code>`;
            el.appendChild(box);
        }
    }
}

// ======================================================================================
// 11. PLUGIN CORE
// ======================================================================================

module.exports = class ClistCalcPlugin extends Plugin {
    onload() {
        console.log(`Loading ${CONFIG.PLUGIN_ID} v1.4.0`);
        this.parser    = new ParserEngine();
        this.renderer  = new RenderEngine();
        this.cache     = CacheService.getInstance();
        this.activeBlocks = new Set();

        this.addStyles();
        this.registerMarkdownCodeBlockProcessor("clist-calc", async (source, el, ctx) => {
            const block = { source, el, ctx, id: Utils.hash(Math.random().toString()) };
            this.activeBlocks.add(block);
            await this.processBlock(block);
        });

        this.debouncedUpdate = Utils.debounce(this.triggerUpdate.bind(this), CONFIG.RENDER_DEBOUNCE_MS);
        this.registerEvent(this.app.workspace.on("editor-change", (editor, view) => {
            if (view.file) this.debouncedUpdate(view);
        }));
        this.registerDomEvent(document, "click", evt => {
            if (evt.target?.classList.contains("task-list-item-checkbox"))
                setTimeout(() => this.debouncedUpdate(), CONFIG.CHECKBOX_DELAY_MS);
        });
    }

    onunload() {
        console.log(`Unloading ${CONFIG.PLUGIN_ID}`);
        this.activeBlocks.clear();
        this.cache.clear();
    }

    async processBlock(block) {
        const file = this.app.vault.getAbstractFileByPath(block.ctx.sourcePath);
        if (!file) return;
        const content = await this.app.vault.read(file);
        let tree = this.cache.get(block.ctx.sourcePath, content);
        if (!tree) {
            tree = await this.parser.parse(content);
            this.cache.set(block.ctx.sourcePath, content, tree);
        }
        this.renderer.render(block, tree);
    }

    async triggerUpdate(activeView = null) {
        for (const block of this.activeBlocks)
            if (!block.el.isConnected) this.activeBlocks.delete(block);

        const view = activeView || this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view?.file) return;
        const filePath = view.file.path;

        const content = view.getMode() === "source"
            ? view.editor.getValue()
            : await this.app.vault.read(view.file);

        let tree = this.cache.get(filePath, content);
        if (!tree) {
            tree = await this.parser.parse(content);
            this.cache.set(filePath, content, tree);
        }

        for (const block of this.activeBlocks)
            if (block.ctx.sourcePath === filePath) this.renderer.render(block, tree);
    }

    addStyles() {
        const id = 'clist-calc-styles-v14';
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
/* ─── Wrapper ────────────────────────────────── */
.clist-wrapper {
    margin: 12px 0;
}

/* ─── Horizontal Scroll Wrapper ───────────────── */
.clist-scroll-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 8px;
}
/* thin custom scrollbar */
.clist-scroll-wrap::-webkit-scrollbar { height: 5px; }
.clist-scroll-wrap::-webkit-scrollbar-track { background: transparent; }
.clist-scroll-wrap::-webkit-scrollbar-thumb {
    background: var(--background-modifier-border);
    border-radius: 3px;
}

/* ─── Table Shell ─────────────────────────────── */
.clist-table {
    width: 100%;
    min-width: 320px;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--background-primary);
    font-size: 0.88em;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.clist-table caption.clist-caption {
    caption-side: top;
    text-align: left;
    padding: 8px 14px 4px;
    font-size: 0.95em;
    font-weight: 700;
    color: var(--text-accent);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--background-modifier-border);
}

/* ─── Thead ───────────────────────────────────── */
.clist-table thead tr {
    background: var(--background-secondary);
}
.clist-table thead th {
    padding: 7px 12px;
    font-size: 0.78em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-muted);
    border-bottom: 2px solid var(--background-modifier-border);
}
.clist-table .clist-th-value { text-align: right; }
.clist-table .clist-th-note  { text-align: center; width: 25%; }
.clist-table .clist-th-label { text-align: left; }

/* ─── Tbody rows ──────────────────────────────── */
.clist-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--background-modifier-border);
    vertical-align: middle;
    transition: background 0.12s;
}
.clist-table tr:last-child td { border-bottom: none; }
.clist-table .clist-row-even td { background: var(--background-primary); }
.clist-table .clist-row-odd  td { background: var(--background-secondary-alt, var(--background-secondary)); }
.clist-table tr.clist-row:hover td { background: var(--background-modifier-hover); }

/* Highlighted rows */
.clist-table tr.clist-row-highlighted td {
    background: var(--row-hl, rgba(108,142,191,0.12)) !important;
}

/* ─── Label cell ──────────────────────────────── */
.clist-label {
    font-weight: 500;
    color: var(--text-normal);
    width: 55%;
}

/* ─── Note cell (3-col) ──────────────────────── */
.clist-note {
    color: var(--text-muted);
    font-size: 0.85em;
    font-style: italic;
    text-align: center;
    width: 20%;
}

/* ─── Value cell ──────────────────────────────── */
.clist-value {
    text-align: right;
    font-family: var(--font-monospace);
    color: var(--text-normal);
    font-weight: 600;
    white-space: nowrap;
}
.clist-value-bold { font-weight: 800 !important; color: var(--text-accent) !important; }

/* ─── Value text-style directives (V1.4) ─────── */
.clist-value-del  { text-decoration: line-through; opacity: 0.7; }
.clist-value-u    { text-decoration: underline; }
.clist-value-i    { font-style: italic; }
.clist-value-dim  { opacity: 0.45; }
.clist-value-success { color: var(--color-green,  #5a9e6f) !important; font-weight: 700; }
.clist-value-warning { color: var(--color-orange, #c97840) !important; font-weight: 700; }
.clist-value-danger  { color: var(--color-red,    #c96060) !important; font-weight: 700; }

/* ─── Label cell style directives (V1.4) ─────── */
.clist-label-bold  { font-weight: 800 !important; }
.clist-label-del   { text-decoration: line-through; opacity: 0.7; }
.clist-label-u     { text-decoration: underline; }
.clist-label-i     { font-style: italic; }
.clist-label-muted { color: var(--text-muted) !important; }

/* ─── Tag badge (@tag:) ───────────────────────── */
.clist-tag {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 10px;
    background: var(--text-accent);
    color: var(--background-primary);
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.03em;
    opacity: 0.88;
    white-space: nowrap;
}

/* ─── Section header row ──────────────────────── */
.clist-row-header td.clist-header-cell {
    background: var(--background-secondary) !important;
    font-weight: 700;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-accent);
    border-left: 3px solid var(--text-accent);
    padding: 6px 12px;
}

/* ─── Separator row ───────────────────────────── */
.clist-row-sep td {
    height: 1px;
    padding: 0 !important;
    background: var(--background-modifier-border) !important;
}

/* ─── Progress bar ────────────────────────────── */
.clist-bar-wrap {
    position: relative;
    height: 20px;
    background: var(--background-secondary);
    border-radius: 4px;
    overflow: hidden;
    min-width: 80px;
}
.clist-bar-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: var(--text-accent);
    opacity: 0.35;
    border-radius: 4px;
    transition: width 0.4s ease;
}
.clist-bar-label {
    position: absolute;
    right: 6px; top: 50%;
    transform: translateY(-50%);
    font-size: 0.82em;
    font-family: var(--font-monospace);
    font-weight: 700;
    color: var(--text-normal);
}

/* ─── Compact mode ────────────────────────────── */
.clist-table.clist-mode-compact td,
.clist-table.clist-mode-compact th { padding: 4px 10px; font-size: 0.83em; }
.clist-table.clist-mode-compact caption { padding: 5px 10px 2px; }

/* ─── Wide mode ───────────────────────────────── */
.clist-table.clist-mode-wide td,
.clist-table.clist-mode-wide th { padding: 12px 16px; }

/* ─── Theme accent overrides ──────────────────── */
.clist-table[data-theme="green"] .clist-row-header td,
.clist-table[data-theme="green"] caption { color: #5a9e6f; border-color: #5a9e6f; }
.clist-table[data-theme="green"] .clist-bar-fill { background: #5a9e6f; }
.clist-table[data-theme="blue"] .clist-row-header td,
.clist-table[data-theme="blue"] caption { color: #3a8fc9; border-color: #3a8fc9; }
.clist-table[data-theme="blue"] .clist-bar-fill { background: #3a8fc9; }
.clist-table[data-theme="purple"] .clist-row-header td,
.clist-table[data-theme="purple"] caption { color: #8b6bbf; border-color: #8b6bbf; }
.clist-table[data-theme="purple"] .clist-bar-fill { background: #8b6bbf; }
.clist-table[data-theme="red"] .clist-row-header td,
.clist-table[data-theme="red"] caption { color: #c96060; border-color: #c96060; }
.clist-table[data-theme="red"] .clist-bar-fill { background: #c96060; }
.clist-table[data-theme="orange"] .clist-row-header td,
.clist-table[data-theme="orange"] caption { color: #c97840; border-color: #c97840; }
.clist-table[data-theme="orange"] .clist-bar-fill { background: #c97840; }
.clist-table[data-theme="teal"] .clist-row-header td,
.clist-table[data-theme="teal"] caption { color: #3aab9e; border-color: #3aab9e; }
.clist-table[data-theme="teal"] .clist-bar-fill { background: #3aab9e; }

/* ─── Toolbar ─────────────────────────────────── */
.clist-toolbar {
    opacity: 0;
    transition: opacity 0.18s;
    height: 0;
    overflow: hidden;
}
.clist-wrapper:hover .clist-toolbar,
.clist-toolbar:focus-within {
    opacity: 1;
    height: auto;
}
.clist-btn {
    background: transparent;
    border: 1px solid var(--background-modifier-border);
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.8em;
    transition: background 0.12s;
}
.clist-btn:hover {
    background: var(--background-modifier-hover);
    color: var(--text-normal);
}

/* ─── Error box ───────────────────────────────── */
.clist-error-box {
    padding: 10px 14px;
    background: rgba(255,60,60,0.08);
    border: 1px solid var(--text-error);
    border-left: 4px solid var(--text-error);
    color: var(--text-error);
    border-radius: 5px;
    font-size: 0.85em;
    line-height: 1.6;
}
.clist-error-box code {
    display: block;
    margin-top: 4px;
    font-size: 0.9em;
    opacity: 0.85;
}

/* ─── Row copy button (@Copy) ─────────────────── */
.clist-row-copy-btn {
    display: inline-block;
    margin-left: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.85em;
    padding: 0 2px;
    border-radius: 3px;
    vertical-align: middle;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
    line-height: 1;
}
.clist-table tr:hover .clist-row-copy-btn {
    opacity: 1;
}
.clist-row-copy-btn:hover {
    color: var(--text-accent);
    background: var(--background-modifier-hover);
}
        `;
        document.head.appendChild(style);
    }
};
/* nosourcemap */