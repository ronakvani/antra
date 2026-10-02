/**
 * GrapesJS Engine Utility Module for Antra
 * Powers Web Component creation, HTML/CSS generation, headless GrapesJS instance, and site publishing spec.
 */

import grapesjs from 'grapesjs';

let grapesEditorInstance = null;

/**
 * Returns or initializes a headless GrapesJS Editor instance.
 */
export const getGrapesEditor = () => {
  if (grapesEditorInstance) return grapesEditorInstance;
  try {
    const dummyContainer = document.createElement('div');
    dummyContainer.style.display = 'none';
    document.body.appendChild(dummyContainer);

    grapesEditorInstance = grapesjs.init({
      container: dummyContainer,
      height: '100%',
      width: '100%',
      storageManager: false,
      noticeOnUnload: false,
      telemetry: false
    });
  } catch (err) {
    console.warn('GrapesJS Headless Init Warning (fallback active):', err);
  }
  return grapesEditorInstance;
};

/**
 * GrapesJS Web Component Type Definitions & HTML Templates
 */
export const GRAPES_COMPONENT_SPECS = {
  heading: {
    grapesType: 'text',
    tagName: 'h1',
    attributes: { class: 'antra-grapes-heading' },
    renderHtml: (content) => `<h1>${content || 'Interactive Headline'}</h1>`
  },
  paragraph: {
    grapesType: 'text',
    tagName: 'p',
    attributes: { class: 'antra-grapes-paragraph' },
    renderHtml: (content) => `<p>${content || 'Add your interactive story here.'}</p>`
  },
  button: {
    grapesType: 'link',
    tagName: 'button',
    attributes: { class: 'antra-grapes-button', role: 'button' },
    renderHtml: (content) => `<button>${content || 'Get Started'}</button>`
  },
  badge: {
    grapesType: 'text',
    tagName: 'span',
    attributes: { class: 'antra-grapes-badge' },
    renderHtml: (content) => `<span>${content || '★ New Feature'}</span>`
  },
  card: {
    grapesType: 'default',
    tagName: 'div',
    attributes: { class: 'antra-grapes-card' },
    renderHtml: (content) => {
      const parts = (content || 'Card Title\nThis is a container box.').split('\n');
      return `<div class="antra-grapes-card">
  <div class="card-title">${parts[0]}</div>
  <div class="card-body">${parts.slice(1).join(' ') || ''}</div>
</div>`;
    }
  },
  quote: {
    grapesType: 'text',
    tagName: 'blockquote',
    attributes: { class: 'antra-grapes-quote' },
    renderHtml: (content) => `<blockquote>${content || '"Antra redefined video sites."'}</blockquote>`
  },
  input: {
    grapesType: 'input',
    tagName: 'input',
    attributes: { class: 'antra-grapes-input', type: 'text' },
    renderHtml: (content) => `<input type="text" placeholder="${content || 'Enter email...'}" />`
  },
  textarea: {
    grapesType: 'textarea',
    tagName: 'textarea',
    attributes: { class: 'antra-grapes-textarea' },
    renderHtml: (content) => `<textarea placeholder="${content || 'Write your message...'}"></textarea>`
  },
  image: {
    grapesType: 'image',
    tagName: 'img',
    attributes: { class: 'antra-grapes-image' },
    renderHtml: (content) => `<img src="${content || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}" alt="Media Block" />`
  },
  divider: {
    grapesType: 'default',
    tagName: 'hr',
    attributes: { class: 'antra-grapes-divider' },
    renderHtml: () => `<hr className="antra-grapes-divider" />`
  }
};

/**
 * Creates a GrapesJS Web Component record backing a new component.
 */
export const createGrapesComponentRecord = (type, content, targetUrl) => {
  const spec = GRAPES_COMPONENT_SPECS[type];
  if (!spec) return null;

  const html = spec.renderHtml(content);
  return {
    engine: 'GrapesJS',
    grapesType: spec.grapesType,
    tagName: spec.tagName,
    attributes: {
      ...spec.attributes,
      ...(targetUrl ? { 'data-target-url': targetUrl } : {})
    },
    grapesHtml: html,
    grapesCss: `.${spec.attributes.class} { box-sizing: border-box; }`
  };
};

/**
 * Compiles full GrapesJS HTML and CSS manifest for published website content.json.
 */
export const compileGrapesPublishPackage = (manifest) => {
  const webComponents = manifest.components.filter((c) => !c.type.startsWith('vector-'));

  const grapesHtmlBlocks = webComponents.map((c) => {
    const grapesRecord = c.grapesEngine || createGrapesComponentRecord(c.type, c.content, c.targetUrl);
    return `<!-- GrapesJS Component: ${c.id} (${c.type}) -->\n<div id="${c.id}" class="grapes-node-${c.type}">\n  ${grapesRecord?.grapesHtml || c.content}\n</div>`;
  });

  const fullGrapesHtml = grapesHtmlBlocks.join('\n\n');

  return {
    grapesVersion: grapesjs.version || '0.21.10',
    totalWebComponents: webComponents.length,
    html: fullGrapesHtml,
    css: `/* GrapesJS Global Web Component Styles */\n.antra-grapes-card { font-family: inherit; }\n.antra-grapes-button { cursor: pointer; }`
  };
};
