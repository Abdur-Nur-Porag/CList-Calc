'use strict';

const { Plugin } = require('obsidian');

const DEPRECATION_MESSAGE =
  'This plugin is no longer support any operation and officially disconnected, ' +
  'please download brand new plugin "listsheet" from obsidian community plugin store ' +
  'which is more better, and powerful then it';

class ClistCalcPlugin extends Plugin {
  onload() {
    // Inject stylesheet
    this.injectStyles();

    // Register the clist-calc code block processor
    this.registerMarkdownCodeBlockProcessor('clist-calc', (source, el, ctx) => {
      this.renderDeprecationNotice(el);
    });

    console.log('[clist-calc] Plugin loaded — deprecation renderer active.');
  }

  onunload() {
    // Remove injected styles on unload
    const styleEl = document.getElementById('clist-calc-styles');
    if (styleEl) styleEl.remove();

    console.log('[clist-calc] Plugin unloaded.');
  }

  /* ── Renderer ─────────────────────────────────────────────────────────── */

  renderDeprecationNotice(container) {
    // Clear anything Obsidian may have pre-rendered
    container.empty();

    // Wrapper
    const wrapper = container.createEl('div', { cls: 'clist-calc-notice' });

    // Icon row
    const iconRow = wrapper.createEl('div', { cls: 'clist-calc-icon-row' });

    // Warning triangle (inline SVG — no external dep needed)
    iconRow.innerHTML = `
      <svg class="clist-calc-icon" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2L2.5 20h19L12 2Z" stroke="currentColor" stroke-width="2"
              stroke-linejoin="round" fill="rgba(255,180,0,0.15)"/>
        <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="17.5" r="1" fill="currentColor"/>
      </svg>
      <span class="clist-calc-title">Plugin Discontinued</span>
    `;

    // Message body
    const body = wrapper.createEl('p', { cls: 'clist-calc-body' });
    body.textContent = DEPRECATION_MESSAGE;

    // Call-to-action button
    const btn = wrapper.createEl('button', { cls: 'clist-calc-btn' });
    btn.textContent = '🔍 Find "listsheet" in Community Plugins';
    btn.addEventListener('click', () => {
      // Open Obsidian's community plugin browser if the API is available
      if (this.app && this.app.setting) {
        this.app.setting.open();
        this.app.setting.openTabById('community-plugins');
      }
    });

    wrapper.appendChild(body);
    wrapper.appendChild(btn);
  }

  /* ── Styles ───────────────────────────────────────────────────────────── */

  injectStyles() {
    if (document.getElementById('clist-calc-styles')) return;

    const style = document.createElement('style');
    style.id = 'clist-calc-styles';
    style.textContent = `
      /* ── Container ─────────────────────────────────────────── */
      .clist-calc-notice {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px 18px;
        border-radius: 8px;
        border: 1.5px solid #f0a500;
        background: linear-gradient(135deg, #fff8e6 0%, #fff3cd 100%);
        font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, sans-serif);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      /* Dark-mode override */
      .theme-dark .clist-calc-notice {
        background: linear-gradient(135deg, #2c2300 0%, #332900 100%);
        border-color: #c87f00;
      }

      /* ── Icon row ──────────────────────────────────────────── */
      .clist-calc-icon-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .clist-calc-icon {
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        color: #b86e00;
      }

      .theme-dark .clist-calc-icon {
        color: #f0a500;
      }

      .clist-calc-title {
        font-size: 1em;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: #7a4a00;
      }

      .theme-dark .clist-calc-title {
        color: #ffc940;
      }

      /* ── Message ───────────────────────────────────────────── */
      .clist-calc-body {
        margin: 0;
        font-size: 0.92em;
        line-height: 1.6;
        color: #5a3e00;
      }

      .theme-dark .clist-calc-body {
        color: #e0c070;
      }

      /* ── CTA button ────────────────────────────────────────── */
      .clist-calc-btn {
        align-self: flex-start;
        padding: 7px 14px;
        border-radius: 6px;
        border: 1.5px solid #c87f00;
        background: #f0a500;
        color: #fff;
        font-size: 0.88em;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s ease, transform 0.1s ease;
      }

      .clist-calc-btn:hover {
        background: #d48c00;
        transform: translateY(-1px);
      }

      .clist-calc-btn:active {
        transform: translateY(0);
      }

      .theme-dark .clist-calc-btn {
        background: #c87f00;
        border-color: #e09400;
        color: #fff;
      }

      .theme-dark .clist-calc-btn:hover {
        background: #e09400;
      }
    `;

    document.head.appendChild(style);
  }
}

module.exports = ClistCalcPlugin;