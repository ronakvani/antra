/**
 * Penpot Open Source Code Engine & Vector Rendering Utilities
 * Sourced from Penpot's Open-Source Architecture.
 * Converts component model properties to clean CSS, SVG, JSX, and Penpot AST specs.
 */

export const PENPOT_COLOR_PRESETS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Slate', hex: '#64748b' },
  { name: 'Dark', hex: '#111827' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Transparent', hex: 'transparent' }
];

export const PENPOT_GRADIENT_PRESETS = [
  { label: 'Violet Indigo', value: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' },
  { label: 'Sunset Glow', value: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' },
  { label: 'Cyber Neon', value: 'linear-gradient(135deg, #ec4899 0%, #06b6d4 100%)' },
  { label: 'Emerald Breeze', value: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
  { label: 'Dark Velvet', value: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' },
  { label: 'Glass Soft', value: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)' }
];

export const PENPOT_FONTS = [
  { label: 'Belanosima', value: "'Belanosima', sans-serif", category: 'Display' },
  { label: 'Inter', value: "'Inter', sans-serif", category: 'Sans-Serif' },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif", category: 'Sans-Serif' },
  { label: 'Outfit', value: "'Outfit', sans-serif", category: 'Display' },
  { label: 'Syne', value: "'Syne', sans-serif", category: 'Display' },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", category: 'Display' },
  { label: 'Poppins', value: "'Poppins', sans-serif", category: 'Sans-Serif' },
  { label: 'Montserrat', value: "'Montserrat', sans-serif", category: 'Sans-Serif' },
  { label: 'DM Sans', value: "'DM Sans', sans-serif", category: 'Sans-Serif' },
  { label: 'Roboto', value: "'Roboto', sans-serif", category: 'Sans-Serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif", category: 'Serif' },
  { label: 'Cinzel', value: "'Cinzel', serif", category: 'Serif' },
  { label: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
  { label: 'Fira Code', value: "'Fira Code', monospace", category: 'Monospace' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif', category: 'System' }
];

export const PENPOT_SHADOW_PRESETS = [
  { label: 'None', value: 'none' },
  { label: 'Subtle', value: '0 2px 4px 0 rgba(0, 0, 0, 0.05)' },
  { label: 'Soft Drop', value: '0 4px 12px 0 rgba(0, 0, 0, 0.1)' },
  { label: 'Elevated', value: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' },
  { label: 'Deep Floating', value: '0 20px 35px -10px rgba(0, 0, 0, 0.25)' },
  { label: 'Neon Glow', value: '0 0 20px 2px rgba(99, 102, 241, 0.5)' },
  { label: 'Inner Shadow', value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.15)' }
];

export const PENPOT_BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'luminosity'
];

export const PENPOT_STROKE_ALIGNMENTS = [
  { label: 'Inside', value: 'inside' },
  { label: 'Center', value: 'center' },
  { label: 'Outside', value: 'outside' }
];

export const PENPOT_STROKE_STYLES = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' }
];

/**
 * Parses numeric value from css strings like '16px' or 16
 */
export const parseCssNumber = (val, fallback = 0) => {
  if (typeof val === 'number') return val;
  if (!val) return fallback;
  const match = String(val).match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : fallback;
};

/**
 * Computes crisp Penpot stroke CSS styles based on alignment (inside, center, outside)
 */
export const computePenpotStrokeCss = (style = {}) => {
  const borderWidth = parseCssNumber(style.borderWidth || style.border, 0);
  const borderStyle = style.borderStyle || 'solid';
  const borderColor = style.borderColor || '#111827';
  const strokeAlignment = style.strokeAlignment || 'inside';

  if (!borderWidth || borderWidth <= 0) {
    return {
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent'
    };
  }

  if (strokeAlignment === 'outside') {
    return {
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent',
      outline: `${borderWidth}px ${borderStyle} ${borderColor}`,
      outlineOffset: '0px'
    };
  }

  if (strokeAlignment === 'center') {
    const halfWidth = Math.max(1, Math.round(borderWidth / 2));
    return {
      borderWidth: `${halfWidth}px`,
      borderStyle,
      borderColor,
      outline: `${halfWidth}px ${borderStyle} ${borderColor}`,
      outlineOffset: '0px'
    };
  }

  // 'inside' (Default Penpot and Figma border-box stroke)
  return {
    borderWidth: `${borderWidth}px`,
    borderStyle,
    borderColor
  };
};

/**
 * Resolves a clean single background property without mixing shorthand & non-shorthand
 */
export const getPenpotBackgroundStyle = (style = {}, defaultColor = undefined) => {
  if (style.background) {
    return { background: style.background };
  }
  const color = style.backgroundColor || defaultColor;
  if (color) {
    return { backgroundColor: color };
  }
  return {};
};

/**
 * Extracts ONLY layout & transform styles for the outer canvas positioning container.
 * This guarantees the container DOES NOT render visual borders, fills or double-strokes.
 */
export const getPenpotNodeLayoutStyle = (comp = {}) => {
  const style = comp.style || {};
  return {
    position: 'absolute',
    top: style.top || '0%',
    left: style.left || '0%',
    width: style.width || (comp.type.startsWith('vector-') ? '160px' : 'auto'),
    height: style.height || (comp.type.startsWith('vector-') ? '100px' : 'auto'),
    transform: style.transform || undefined,
    zIndex: style.zIndex !== undefined ? style.zIndex : undefined,
    opacity: style.opacity !== undefined ? style.opacity : undefined,
    mixBlendMode: style.mixBlendMode && style.mixBlendMode !== 'normal' ? style.mixBlendMode : undefined
  };
};

/**
 * Extracts ONLY the visual styling for the inner component body.
 */
export const getPenpotNodeContentStyle = (comp = {}) => {
  const style = comp.style || {};
  const strokeCss = computePenpotStrokeCss(style);
  const bgStyle = getPenpotBackgroundStyle(style);

  return {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow && style.boxShadow !== 'none' ? style.boxShadow : undefined,
    backdropFilter: style.backdropFilter || undefined,
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textAlign: style.textAlign,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    textDecoration: style.textDecoration,
    padding: style.padding,
    display: style.display,
    flexDirection: style.flexDirection,
    justifyContent: style.justifyContent,
    alignItems: style.alignItems,
    gap: style.gap,
    ...bgStyle,
    ...strokeCss
  };
};

/**
 * High-Precision Vector Shape Metadata Sourced from Penpot Engine
 */
export const PENPOT_VECTOR_SHAPES = {
  'vector-rect': {
    name: 'Rectangle',
    type: 'rect'
  },
  'vector-circle': {
    name: 'Ellipse / Circle',
    type: 'ellipse'
  },
  'vector-star': {
    name: '5-Point Star',
    type: 'polygon',
    points: '50,5 64,35 98,35 70,57 81,91 50,70 19,91 30,57 2,35 36,35'
  },
  'vector-arrow': {
    name: 'Directional Arrow',
    type: 'path',
    d: 'M 10,38 L 54,38 L 54,16 L 92,50 L 54,84 L 54,62 L 10,62 Z'
  },
  'vector-diamond': {
    name: 'Diamond / Rhombus',
    type: 'polygon',
    points: '50,6 94,50 50,94 6,50'
  },
  'vector-triangle': {
    name: 'Triangle',
    type: 'polygon',
    points: '50,8 94,90 6,90'
  },
  'vector-hexagon': {
    name: 'Hexagon',
    type: 'polygon',
    points: '50,6 92,26 92,74 50,94 8,74 8,26'
  }
};

/**
 * Generates formatted CSS code from component properties.
 */
export const generatePenpotCss = (comp) => {
  if (!comp) return '';

  const className = `penpot-${comp.type}-${comp.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const style = comp.style || {};

  const cssLines = [];
  cssLines.push(`/* Penpot Code Engine output for ${comp.id} */`);
  cssLines.push(`.${className} {`);
  cssLines.push(`  position: absolute;`);
  cssLines.push(`  box-sizing: border-box;`);

  // Transform & Bounds
  if (style.top) cssLines.push(`  top: ${style.top};`);
  if (style.left) cssLines.push(`  left: ${style.left};`);
  if (style.width) cssLines.push(`  width: ${style.width};`);
  if (style.height) cssLines.push(`  height: ${style.height};`);
  if (style.transform) cssLines.push(`  transform: ${style.transform};`);
  if (style.zIndex !== undefined) cssLines.push(`  z-index: ${style.zIndex};`);

  // Fill & Colors
  if (style.backgroundColor) cssLines.push(`  background-color: ${style.backgroundColor};`);
  if (style.background) cssLines.push(`  background: ${style.background};`);
  if (style.color) cssLines.push(`  color: ${style.color};`);

  // Borders & Corner Radius
  if (style.borderRadius) cssLines.push(`  border-radius: ${style.borderRadius};`);
  if (style.border) cssLines.push(`  border: ${style.border};`);
  if (style.borderColor) cssLines.push(`  border-color: ${style.borderColor};`);
  if (style.borderWidth) cssLines.push(`  border-width: ${style.borderWidth};`);
  if (style.borderStyle) cssLines.push(`  border-style: ${style.borderStyle};`);

  // Effects & Opacity
  if (style.opacity !== undefined) cssLines.push(`  opacity: ${style.opacity};`);
  if (style.mixBlendMode && style.mixBlendMode !== 'normal') {
    cssLines.push(`  mix-blend-mode: ${style.mixBlendMode};`);
  }
  if (style.boxShadow && style.boxShadow !== 'none') {
    cssLines.push(`  box-shadow: ${style.boxShadow};`);
  }
  if (style.backdropFilter) cssLines.push(`  backdrop-filter: ${style.backdropFilter};`);

  // Typography
  if (style.fontFamily) cssLines.push(`  font-family: ${style.fontFamily};`);
  if (style.fontSize) cssLines.push(`  font-size: ${style.fontSize};`);
  if (style.fontWeight) cssLines.push(`  font-weight: ${style.fontWeight};`);
  if (style.textAlign) cssLines.push(`  text-align: ${style.textAlign};`);
  if (style.lineHeight) cssLines.push(`  line-height: ${style.lineHeight};`);
  if (style.letterSpacing) cssLines.push(`  letter-spacing: ${style.letterSpacing};`);
  if (style.textTransform) cssLines.push(`  text-transform: ${style.textTransform};`);
  if (style.textDecoration) cssLines.push(`  text-decoration: ${style.textDecoration};`);

  // Flex Layout
  if (style.display) cssLines.push(`  display: ${style.display};`);
  if (style.flexDirection) cssLines.push(`  flex-direction: ${style.flexDirection};`);
  if (style.justifyContent) cssLines.push(`  justify-content: ${style.justifyContent};`);
  if (style.alignItems) cssLines.push(`  align-items: ${style.alignItems};`);
  if (style.gap) cssLines.push(`  gap: ${style.gap};`);
  if (style.padding) cssLines.push(`  padding: ${style.padding};`);

  cssLines.push(`}`);

  return cssLines.join('\n');
};

/**
 * Generates Standalone SVG code for vector shapes
 */
export const generatePenpotSvg = (comp) => {
  if (!comp) return '<svg></svg>';
  const style = comp.style || {};
  const width = parseCssNumber(style.width, 160);
  const height = parseCssNumber(style.height, 100);
  const fill = style.backgroundColor || style.color || '#6366f1';
  const strokeWidth = parseCssNumber(style.borderWidth || style.border, 0);
  const strokeColor = style.borderColor || '#000000';
  const strokeDash = style.borderStyle === 'dashed' ? '6 4' : style.borderStyle === 'dotted' ? '2 2' : 'none';
  const strokeAttr = strokeWidth > 0 ? `stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}"` : '';

  if (comp.type === 'vector-rect') {
    const rx = parseCssNumber(style.borderRadius, 0);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${width - strokeWidth}" height="${height - strokeWidth}" rx="${rx}" fill="${fill}" ${strokeAttr} />\n</svg>`;
  }

  if (comp.type === 'vector-circle') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <ellipse cx="${width / 2}" cy="${height / 2}" rx="${(width - strokeWidth) / 2}" ry="${(height - strokeWidth) / 2}" fill="${fill}" ${strokeAttr} />\n</svg>`;
  }

  if (comp.type === 'vector-star') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">\n  <polygon points="50,5 64,35 98,35 70,57 81,91 50,70 19,91 30,57 2,35 36,35" fill="${fill}" ${strokeAttr} stroke-linejoin="round" />\n</svg>`;
  }

  if (comp.type === 'vector-arrow') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">\n  <path d="M 10,38 L 54,38 L 54,16 L 92,50 L 54,84 L 54,62 L 10,62 Z" fill="${fill}" ${strokeAttr} stroke-linejoin="round" />\n</svg>`;
  }

  if (comp.type === 'vector-diamond') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">\n  <polygon points="50,6 94,50 50,94 6,50" fill="${fill}" ${strokeAttr} stroke-linejoin="round" />\n</svg>`;
  }

  if (comp.type === 'vector-triangle') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">\n  <polygon points="50,8 94,90 6,90" fill="${fill}" ${strokeAttr} stroke-linejoin="round" />\n</svg>`;
  }

  if (comp.type === 'vector-hexagon') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">\n  <polygon points="50,6 92,26 92,74 50,94 8,74 8,26" fill="${fill}" ${strokeAttr} stroke-linejoin="round" />\n</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;
};

/**
 * Generates JSX representation for React/Web components
 */
export const generatePenpotJsx = (comp) => {
  if (!comp) return '<div />';
  const styleStr = JSON.stringify(comp.style || {}, null, 2);

  if (comp.type === 'vector-rect') {
    return `<div style={${styleStr}} className="penpot-rect" />`;
  }
  if (comp.type === 'heading') {
    return `<h1 style={${styleStr}}>${comp.content || 'Interactive Headline'}</h1>`;
  }
  if (comp.type === 'button') {
    return `<button style={${styleStr}}>${comp.content || 'Get Started'}</button>`;
  }
  if (comp.type === 'badge') {
    return `<span style={${styleStr}}>${comp.content || 'Badge'}</span>`;
  }
  return `<div style={${styleStr}}>${comp.content || ''}</div>`;
};

/**
 * Generates Penpot JSON AST specification.
 */
export const generatePenpotSpecJson = (comp) => {
  if (!comp) return '{}';
  const style = comp.style || {};
  return JSON.stringify(
    {
      penpotVersion: '2.0.0',
      nodeType: comp.type.startsWith('vector-') ? 'shape' : 'frame',
      id: comp.id,
      name: comp.content || comp.type,
      timecodeRange: { start: comp.startTime, end: comp.endTime },
      targetUrl: comp.targetUrl || null,
      geometry: {
        x: style.left || '0%',
        y: style.top || '0%',
        width: style.width || 'auto',
        height: style.height || 'auto',
        rotation: style.transform || 'rotate(0deg)'
      },
      fills: [
        {
          type: style.background?.includes('gradient') ? 'gradient' : 'solid',
          color: style.backgroundColor || style.color || '#6366f1',
          gradient: style.background || null,
          opacity: style.opacity !== undefined ? parseFloat(style.opacity) : 1
        }
      ],
      strokes: [
        {
          width: parseCssNumber(style.borderWidth || style.border, 0),
          style: style.borderStyle || 'solid',
          color: style.borderColor || '#111827',
          alignment: style.strokeAlignment || 'inside'
        }
      ],
      effects: {
        boxShadow: style.boxShadow || 'none',
        blendMode: style.mixBlendMode || 'normal',
        backdropFilter: style.backdropFilter || 'none'
      },
      typography: {
        fontFamily: style.fontFamily || "'Belanosima', sans-serif",
        fontSize: style.fontSize || '16px',
        fontWeight: style.fontWeight || '400',
        textAlign: style.textAlign || 'left',
        lineHeight: style.lineHeight || '1.5',
        letterSpacing: style.letterSpacing || 'normal'
      },
      style: comp.style || {}
    },
    null,
    2
  );
};
