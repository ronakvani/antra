import React from 'react';
import {
  computePenpotStrokeCss,
  getPenpotBackgroundStyle,
  parseCssNumber
} from '../../utils/penpotCodeEngine';

/**
 * High-precision Penpot Web Component & Vector Shape Renderer
 * Sourced from Penpot's Open-Source Render Architecture.
 * Renders shapes and web components with pixel-perfect box-sizing, stroke alignment, and vector SVG.
 */
export const PenpotComponentRenderer = ({ comp }) => {
  if (!comp) return null;

  const style = comp.style || {};
  const strokeCss = computePenpotStrokeCss(style);
  const strokeWidth = parseCssNumber(style.borderWidth || style.border, 0);
  const strokeColor = style.borderColor || '#111827';
  const strokeDash =
    style.borderStyle === 'dashed'
      ? '6 4'
      : style.borderStyle === 'dotted'
      ? '2 2'
      : undefined;
  const fill = style.backgroundColor || style.background || style.color || '#6366f1';
  const bgStyle = getPenpotBackgroundStyle(style);

  // 1. Vector Rectangle
  if (comp.type === 'vector-rect') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          backdropFilter: style.backdropFilter,
          ...bgStyle,
          ...strokeCss
        }}
      />
    );
  }

  // 2. Vector Circle / Ellipse
  if (comp.type === 'vector-circle') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: style.borderRadius || '50%',
          boxShadow: style.boxShadow,
          backdropFilter: style.backdropFilter,
          ...bgStyle,
          ...strokeCss
        }}
      />
    );
  }

  // 3. Vector 5-Point Star
  if (comp.type === 'vector-star') {
    return (
      <svg
        className="w-full h-full block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          filter: style.boxShadow && style.boxShadow !== 'none' ? `drop-shadow(${style.boxShadow})` : undefined
        }}
      >
        <polygon
          points="50,5 64,35 98,35 70,57 81,91 50,70 19,91 30,57 2,35 36,35"
          fill={fill}
          stroke={strokeWidth > 0 ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // 4. Vector Directional Arrow
  if (comp.type === 'vector-arrow') {
    return (
      <svg
        className="w-full h-full block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          filter: style.boxShadow && style.boxShadow !== 'none' ? `drop-shadow(${style.boxShadow})` : undefined
        }}
      >
        <path
          d="M 10,38 L 54,38 L 54,16 L 92,50 L 54,84 L 54,62 L 10,62 Z"
          fill={fill}
          stroke={strokeWidth > 0 ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // 5. Vector Diamond
  if (comp.type === 'vector-diamond') {
    return (
      <svg
        className="w-full h-full block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          filter: style.boxShadow && style.boxShadow !== 'none' ? `drop-shadow(${style.boxShadow})` : undefined
        }}
      >
        <polygon
          points="50,6 94,50 50,94 6,50"
          fill={fill}
          stroke={strokeWidth > 0 ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // 6. Vector Triangle
  if (comp.type === 'vector-triangle') {
    return (
      <svg
        className="w-full h-full block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          filter: style.boxShadow && style.boxShadow !== 'none' ? `drop-shadow(${style.boxShadow})` : undefined
        }}
      >
        <polygon
          points="50,8 94,90 6,90"
          fill={fill}
          stroke={strokeWidth > 0 ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // 7. Vector Hexagon
  if (comp.type === 'vector-hexagon') {
    return (
      <svg
        className="w-full h-full block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          filter: style.boxShadow && style.boxShadow !== 'none' ? `drop-shadow(${style.boxShadow})` : undefined
        }}
      >
        <polygon
          points="50,6 92,26 92,74 50,94 8,74 8,26"
          fill={fill}
          stroke={strokeWidth > 0 ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // 8. Typography: Heading
  if (comp.type === 'heading') {
    return (
      <h1
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          boxSizing: 'border-box',
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          textAlign: style.textAlign,
          lineHeight: style.lineHeight || 1.2,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          textDecoration: style.textDecoration,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          padding: style.padding,
          ...bgStyle,
          ...strokeCss
        }}
      >
        {comp.content}
      </h1>
    );
  }

  // 9. Typography: Paragraph
  if (comp.type === 'paragraph') {
    return (
      <p
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          boxSizing: 'border-box',
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          textAlign: style.textAlign,
          lineHeight: style.lineHeight || 1.5,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          textDecoration: style.textDecoration,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          maxWidth: style.maxWidth,
          padding: style.padding,
          ...bgStyle,
          ...strokeCss
        }}
      >
        {comp.content}
      </p>
    );
  }

  // 10. Web Component: Button
  if (comp.type === 'button') {
    const buttonBg = getPenpotBackgroundStyle(style, '#111827');
    return (
      <button
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: style.color || '#ffffff',
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight || '600',
          padding: style.padding || '10px 20px',
          borderRadius: style.borderRadius || '8px',
          boxShadow: style.boxShadow,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          textDecoration: style.textDecoration,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          ...buttonBg,
          ...strokeCss
        }}
      >
        {comp.content}
      </button>
    );
  }

  // 11. Web Component: Badge
  if (comp.type === 'badge') {
    const badgeBg = getPenpotBackgroundStyle(style, '#e0e7ff');
    return (
      <span
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: style.color || '#3730a3',
          fontFamily: style.fontFamily,
          fontSize: style.fontSize || '13px',
          fontWeight: style.fontWeight || '600',
          padding: style.padding || '6px 14px',
          borderRadius: style.borderRadius || '9999px',
          boxShadow: style.boxShadow,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...badgeBg,
          ...strokeCss
        }}
      >
        {comp.content}
      </span>
    );
  }

  // 12. Web Component: Card Container
  if (comp.type === 'card') {
    const cardBg = getPenpotBackgroundStyle(style, '#ffffff');
    const lines = (comp.content || '').split('\n');
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: style.color || '#111827',
          padding: style.padding || '16px',
          borderRadius: style.borderRadius || '12px',
          boxShadow: style.boxShadow || '0 10px 25px -5px rgba(0,0,0,0.08)',
          fontFamily: style.fontFamily,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          ...cardBg,
          ...strokeCss
        }}
      >
        <div className="font-semibold text-sm mb-1">{lines[0] || 'Card Title'}</div>
        <div className="text-xs text-zinc-600 leading-relaxed">
          {lines.slice(1).join(' ') || comp.content}
        </div>
      </div>
    );
  }

  // 13. Web Component: Quote
  if (comp.type === 'quote') {
    return (
      <blockquote
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          margin: 0,
          borderLeft: style.borderLeft || '4px solid #4f46e5',
          paddingLeft: style.paddingLeft || '16px',
          color: style.color || '#1f2937',
          fontStyle: style.fontStyle || 'italic',
          fontSize: style.fontSize || '18px',
          fontFamily: style.fontFamily,
          lineHeight: style.lineHeight || 1.6,
          letterSpacing: style.letterSpacing,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          ...bgStyle
        }}
      >
        {comp.content}
      </blockquote>
    );
  }

  // 14. Form: Input
  if (comp.type === 'input') {
    const inputBg = getPenpotBackgroundStyle(style, '#ffffff');
    return (
      <input
        type="text"
        placeholder={comp.content}
        readOnly
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: style.color || '#111827',
          fontFamily: style.fontFamily,
          fontSize: style.fontSize || '14px',
          borderRadius: style.borderRadius || '8px',
          boxShadow: style.boxShadow,
          ...inputBg,
          ...strokeCss
        }}
        className="pointer-events-none px-3 py-1.5"
      />
    );
  }

  // 15. Form: Textarea
  if (comp.type === 'textarea') {
    const textareaBg = getPenpotBackgroundStyle(style, '#ffffff');
    return (
      <textarea
        placeholder={comp.content}
        readOnly
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: style.color || '#111827',
          fontFamily: style.fontFamily,
          fontSize: style.fontSize || '13px',
          borderRadius: style.borderRadius || '8px',
          boxShadow: style.boxShadow,
          ...textareaBg,
          ...strokeCss
        }}
        className="pointer-events-none p-2 resize-none"
      />
    );
  }

  // 16. Media: Image
  if (comp.type === 'image') {
    return (
      <img
        src={comp.content}
        alt="Canvas Media"
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: style.borderRadius || '12px',
          objectFit: style.objectFit || 'cover',
          boxShadow: style.boxShadow,
          ...strokeCss
        }}
      />
    );
  }

  // 17. Divider
  if (comp.type === 'divider') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderTop: style.borderTop || '2px dashed #cbd5e1'
        }}
      />
    );
  }

  // Default fallback
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        fontFamily: style.fontFamily,
        color: style.color,
        borderRadius: style.borderRadius,
        ...bgStyle,
        ...strokeCss
      }}
    >
      {comp.content}
    </div>
  );
};
