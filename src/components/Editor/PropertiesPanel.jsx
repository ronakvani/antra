import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Clock,
  Trash2,
  Copy,
  Code,
  Layers,
  Palette,
  Type,
  Maximize2,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sun,
  Sparkles,
  Check,
  Zap,
  Box,
  LayoutGrid,
  Square,
  CornerDownRight,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Move,
  Lock,
  Unlock,
  ShieldAlert,
  FileCode,
  Code2
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import {
  PENPOT_COLOR_PRESETS,
  PENPOT_GRADIENT_PRESETS,
  PENPOT_FONTS,
  PENPOT_SHADOW_PRESETS,
  PENPOT_BLEND_MODES,
  PENPOT_STROKE_ALIGNMENTS,
  PENPOT_STROKE_STYLES,
  generatePenpotCss,
  generatePenpotSvg,
  generatePenpotJsx,
  generatePenpotSpecJson
} from '../../utils/penpotCodeEngine';
import {
  OPENREEL_ANIMATION_IN_PRESETS,
  OPENREEL_ANIMATION_OUT_PRESETS
} from '../../utils/openreelAnimationEngine';

/**
 * Reusable Figma / Penpot-Style Scrubbable Numeric Matrix Input
 */
const ScrubInput = ({
  label,
  value,
  onChange,
  unit = '',
  min,
  max,
  step = 1,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value ?? 0));
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startValRef = useRef(0);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(value ?? 0));
    }
  }, [value, isEditing]);

  const parseNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startValRef.current = parseNumber(value);

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - startXRef.current;
      const speed = moveEvent.shiftKey ? 10 : 1;
      let newVal = Math.round(startValRef.current + dx * speed * step);
      if (min !== undefined) newVal = Math.max(min, newVal);
      if (max !== undefined) newVal = Math.min(max, newVal);
      onChange(newVal);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      let num = parseNumber(inputValue);
      if (min !== undefined) num = Math.max(min, num);
      if (max !== undefined) num = Math.min(max, num);
      onChange(num);
      setIsEditing(false);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const delta = e.shiftKey ? 10 : 1;
      let num = parseNumber(inputValue) + delta;
      if (max !== undefined) num = Math.min(max, num);
      setInputValue(String(num));
      onChange(num);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const delta = e.shiftKey ? 10 : 1;
      let num = parseNumber(inputValue) - delta;
      if (min !== undefined) num = Math.max(min, num);
      setInputValue(String(num));
      onChange(num);
    } else if (e.key === 'Escape') {
      setInputValue(String(value ?? 0));
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`flex items-center bg-zinc-50 border border-zinc-200/90 rounded-md px-2 py-1 text-xs focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all ${className}`}
    >
      <span
        onMouseDown={handleMouseDown}
        className="text-[11px] font-mono text-zinc-400 select-none cursor-ew-resize mr-1.5 hover:text-indigo-600 font-semibold uppercase"
        title="Click & Drag to scrub value"
      >
        {label}
      </span>
      <input
        type="text"
        value={inputValue}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          setIsEditing(false);
          let num = parseNumber(inputValue);
          if (min !== undefined) num = Math.max(min, num);
          if (max !== undefined) num = Math.min(max, num);
          onChange(num);
        }}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent font-mono text-zinc-900 focus:outline-none text-[11px] p-0"
      />
      {unit && (
        <span className="text-[10px] font-mono text-zinc-400 select-none ml-0.5">
          {unit}
        </span>
      )}
    </div>
  );
};

/**
 * Collapsible Inspector Section Component
 */
const InspectorSection = ({ title, children, defaultOpen = true, extraHeader = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-100 last:border-b-0 py-2.5">
      <div className="flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 hover:text-zinc-950 transition cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span>{title}</span>
        </button>
        {extraHeader}
      </div>
      {isOpen && <div className="px-3 pt-2 space-y-2.5">{children}</div>}
    </div>
  );
};

export const PropertiesPanel = () => {
  const {
    manifest,
    selectedComponentId,
    updateComponent,
    removeComponent,
    duplicateComponent,
    toggleLockComponent,
    toggleHideComponent
  } = useEditor();

  const [activeTab, setActiveTab] = useState('design'); // 'design' | 'interactivity' | 'code'
  const [codeSubTab, setCodeSubTab] = useState('css'); // 'css' | 'svg' | 'jsx' | 'json'
  const [copiedCode, setCopiedCode] = useState(false);
  const [showIndividualRadius, setShowIndividualRadius] = useState(false);

  const selectedComp = manifest.components.find((c) => c.id === selectedComponentId);

  if (!selectedComp) {
    return (
      <aside className="w-[300px] h-full bg-white border-l border-zinc-200 p-6 flex flex-col items-center justify-center text-center text-zinc-500 select-none shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-3 text-zinc-400 shadow-2xs">
          <Sliders className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-800 mb-1">No Selection</h3>
        <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[200px]">
          Select an element or layer on canvas to inspect and edit design properties.
        </p>
      </aside>
    );
  }

  const style = selectedComp.style || {};

  const updateStyle = (newStyleFields) => {
    const nextStyle = { ...selectedComp.style, ...newStyleFields };

    // Prevent React shorthand collision warnings by explicitly removing conflicting keys
    if ('backgroundColor' in newStyleFields && newStyleFields.backgroundColor) {
      delete nextStyle.background;
    } else if ('background' in newStyleFields && newStyleFields.background) {
      delete nextStyle.backgroundColor;
    }

    if ('borderWidth' in newStyleFields) {
      delete nextStyle.border;
    }

    // Clean any keys set to undefined
    Object.keys(nextStyle).forEach((k) => {
      if (nextStyle[k] === undefined) {
        delete nextStyle[k];
      }
    });

    updateComponent(selectedComp.id, {
      style: nextStyle
    });
  };

  const parseNum = (val, fallback = 0) => {
    if (typeof val === 'number') return val;
    if (!val) return fallback;
    const matched = String(val).match(/-?\d+(\.\d+)?/);
    return matched ? parseFloat(matched[0]) : fallback;
  };

  // Rotation Helper
  const getRotationDeg = () => {
    const transform = style.transform || '';
    const match = transform.match(/rotate\(([-?\d.]+)deg\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const setRotationDeg = (deg) => {
    const currentTransform = style.transform || '';
    let newTransform = currentTransform.replace(/rotate\([^)]+\)/, '').trim();
    newTransform = `${newTransform} rotate(${deg}deg)`.trim();
    updateStyle({ transform: newTransform });
  };

  // Border Radius Parsing (supports '8px' or '8px 12px 8px 12px')
  const getRadii = () => {
    const raw = String(style.borderRadius || '0px').replace(/px/g, '').trim();
    const parts = raw.split(/\s+/).map((n) => parseFloat(n) || 0);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 4) return parts;
    return [0, 0, 0, 0];
  };

  const setAllRadius = (r) => {
    updateStyle({ borderRadius: `${r}px` });
  };

  const setCornerRadius = (index, val) => {
    const radii = [...getRadii()];
    radii[index] = val;
    updateStyle({ borderRadius: `${radii[0]}px ${radii[1]}px ${radii[2]}px ${radii[3]}px` });
  };

  const isTextElement = [
    'heading',
    'paragraph',
    'quote',
    'button',
    'badge',
    'card',
    'input',
    'textarea'
  ].includes(selectedComp.type);

  const getActiveCodeContent = () => {
    if (codeSubTab === 'css') return generatePenpotCss(selectedComp);
    if (codeSubTab === 'svg') return generatePenpotSvg(selectedComp);
    if (codeSubTab === 'jsx') return generatePenpotJsx(selectedComp);
    return generatePenpotSpecJson(selectedComp);
  };

  const handleCopyCode = () => {
    const code = getActiveCodeContent();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isLocked = !!selectedComp.locked;
  const isHidden = !!selectedComp.hidden;
  const currentStrokeWidth = parseNum(style.borderWidth || style.border, 0);

  return (
    <aside className="w-[300px] h-full bg-white border-l border-zinc-200 flex flex-col select-none overflow-hidden text-zinc-900 shadow-xs">
      {/* 1. Top Figma / Penpot Header */}
      <div className="h-11 px-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
            {selectedComp.type[0].toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-zinc-800 truncate max-w-[130px]">
            {selectedComp.content ? selectedComp.content.split('\n')[0] : selectedComp.type}
          </span>
        </div>

        {/* Quick Actions (Lock, Hide, Duplicate, Delete) */}
        <div className="flex items-center gap-0.5 text-zinc-500">
          <button
            onClick={() => toggleHideComponent(selectedComp.id)}
            title={isHidden ? 'Unhide Layer' : 'Hide Layer'}
            className="p-1 hover:text-zinc-950 hover:bg-zinc-200/60 rounded transition cursor-pointer"
          >
            {isHidden ? <EyeOff className="w-3.5 h-3.5 text-zinc-400" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => toggleLockComponent(selectedComp.id)}
            title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
            className="p-1 hover:text-zinc-950 hover:bg-zinc-200/60 rounded transition cursor-pointer"
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => duplicateComponent(selectedComp.id)}
            title="Duplicate (⌘D)"
            className="p-1 hover:text-zinc-950 hover:bg-zinc-200/60 rounded transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeComponent(selectedComp.id)}
            title="Delete Layer (Del)"
            className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Tabs: Design | Motion | Code */}
      <div className="grid grid-cols-3 p-1 bg-zinc-100/70 border-b border-zinc-200 text-[11px] font-medium text-zinc-500 flex-shrink-0">
        <button
          onClick={() => setActiveTab('design')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'design'
              ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
              : 'hover:text-zinc-800'
          }`}
        >
          Design
        </button>
        <button
          onClick={() => setActiveTab('interactivity')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'interactivity'
              ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
              : 'hover:text-zinc-800'
          }`}
        >
          Motion
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`py-1 rounded text-center transition cursor-pointer ${
            activeTab === 'code'
              ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
              : 'hover:text-zinc-800'
          }`}
        >
          Inspect
        </button>
      </div>

      {/* 3. Main Inspector Scrollable Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 scrollbar-thin">
        {activeTab === 'design' && (
          <>
            {/* SECTION: Layout & Transform 2x3 Matrix */}
            <InspectorSection title="Layout & Transform">
              {/* Row 1: X and Y */}
              <div className="grid grid-cols-2 gap-2">
                <ScrubInput
                  label="X"
                  value={parseNum(style.left, 30)}
                  onChange={(v) =>
                    updateStyle({
                      left: (style.left || '').includes('%') ? `${v}%` : `${v}px`
                    })
                  }
                  unit={(style.left || '').includes('%') ? '%' : 'px'}
                />
                <ScrubInput
                  label="Y"
                  value={parseNum(style.top, 30)}
                  onChange={(v) =>
                    updateStyle({
                      top: (style.top || '').includes('%') ? `${v}%` : `${v}px`
                    })
                  }
                  unit={(style.top || '').includes('%') ? '%' : 'px'}
                />
              </div>

              {/* Row 2: W and H */}
              <div className="grid grid-cols-2 gap-2">
                <ScrubInput
                  label="W"
                  value={parseNum(style.width, 220)}
                  min={10}
                  onChange={(v) => updateStyle({ width: `${v}px` })}
                  unit="px"
                />
                <ScrubInput
                  label="H"
                  value={parseNum(style.height, 120)}
                  min={10}
                  onChange={(v) => updateStyle({ height: `${v}px` })}
                  unit="px"
                />
              </div>

              {/* Row 3: Rotation & Corner Radius */}
              <div className="grid grid-cols-2 gap-2">
                <ScrubInput
                  label="∠"
                  value={getRotationDeg()}
                  onChange={(v) => setRotationDeg(v)}
                  unit="°"
                />
                <div className="flex items-center gap-1">
                  <ScrubInput
                    label="◲"
                    value={getRadii()[0]}
                    min={0}
                    onChange={(v) => setAllRadius(v)}
                    unit="px"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowIndividualRadius(!showIndividualRadius)}
                    title="Independent Corner Radii"
                    className={`p-1.5 rounded border transition cursor-pointer ${
                      showIndividualRadius
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                        : 'border-zinc-200 text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded 4-Corner Radii */}
              {showIndividualRadius && (
                <div className="grid grid-cols-4 gap-1 pt-1 animate-in fade-in duration-100">
                  <ScrubInput
                    label="TL"
                    value={getRadii()[0]}
                    min={0}
                    onChange={(v) => setCornerRadius(0, v)}
                  />
                  <ScrubInput
                    label="TR"
                    value={getRadii()[1]}
                    min={0}
                    onChange={(v) => setCornerRadius(1, v)}
                  />
                  <ScrubInput
                    label="BR"
                    value={getRadii()[2]}
                    min={0}
                    onChange={(v) => setCornerRadius(2, v)}
                  />
                  <ScrubInput
                    label="BL"
                    value={getRadii()[3]}
                    min={0}
                    onChange={(v) => setCornerRadius(3, v)}
                  />
                </div>
              )}

              {/* Opacity & Blend Mode */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <ScrubInput
                  label="Op"
                  value={Math.round((style.opacity !== undefined ? parseFloat(style.opacity) : 1) * 100)}
                  min={0}
                  max={100}
                  onChange={(v) => updateStyle({ opacity: v / 100 })}
                  unit="%"
                />
                <select
                  value={style.mixBlendMode || 'normal'}
                  onChange={(e) => updateStyle({ mixBlendMode: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] font-mono text-zinc-800 focus:outline-none focus:border-indigo-500"
                >
                  {PENPOT_BLEND_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </InspectorSection>

            {/* SECTION: Typography (if text-bearing) */}
            {isTextElement && (
              <InspectorSection title="Typography">
                {/* Text Content */}
                <div>
                  <textarea
                    rows={2}
                    value={selectedComp.content || ''}
                    onChange={(e) => updateComponent(selectedComp.id, { content: e.target.value })}
                    placeholder="Component text..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <select
                    value={style.fontFamily || PENPOT_FONTS[0].value}
                    onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-2xs"
                  >
                    {['Display', 'Sans-Serif', 'Serif', 'Monospace', 'System'].map((cat) => {
                      const fontsInCat = PENPOT_FONTS.filter((f) => f.category === cat);
                      if (!fontsInCat.length) return null;
                      return (
                        <optgroup key={cat} label={cat} className="font-sans font-semibold text-zinc-500">
                          {fontsInCat.map((f) => (
                            <option
                              key={f.label}
                              value={f.value}
                              style={{ fontFamily: f.value }}
                              className="text-zinc-900 py-1"
                            >
                              {f.label}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <ScrubInput
                    label="Size"
                    value={parseNum(style.fontSize, 16)}
                    min={8}
                    max={180}
                    onChange={(v) => updateStyle({ fontSize: `${v}px` })}
                    unit="px"
                  />
                  <select
                    value={style.fontWeight || '400'}
                    onChange={(e) => updateStyle({ fontWeight: e.target.value })}
                    className="bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] text-zinc-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="300">Light 300</option>
                    <option value="400">Regular 400</option>
                    <option value="500">Medium 500</option>
                    <option value="600">Semibold 600</option>
                    <option value="700">Bold 700</option>
                    <option value="800">ExtraBold 800</option>
                  </select>
                </div>

                {/* Text Align Buttons */}
                <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-md">
                  {['left', 'center', 'right', 'justify'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateStyle({ textAlign: align })}
                      className={`flex-1 py-1 rounded flex items-center justify-center transition cursor-pointer ${
                        (style.textAlign || 'left') === align
                          ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </InspectorSection>
            )}

            {/* SECTION: Fills (Figma / Penpot Standard Swatch Row & Gradients) */}
            <InspectorSection
              title="Fill"
              extraHeader={
                <button
                  type="button"
                  onClick={() => updateStyle({ backgroundColor: '#6366f1', background: undefined })}
                  title="Add Fill"
                  className="p-0.5 hover:text-zinc-950 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              }
            >
              {/* Fill Row */}
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-1.5">
                {/* 16x16 Color Preview Swatch */}
                <div className="relative w-5 h-5 rounded border border-zinc-300 overflow-hidden flex-shrink-0 shadow-2xs">
                  <input
                    type="color"
                    value={
                      (style.backgroundColor || style.color || '#6366f1').startsWith('#')
                        ? style.backgroundColor || style.color || '#6366f1'
                        : '#6366f1'
                    }
                    onChange={(e) => {
                      if (isTextElement) {
                        updateStyle({ color: e.target.value });
                      } else {
                        updateStyle({ backgroundColor: e.target.value, background: undefined });
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div
                    className="w-full h-full"
                    style={{
                      background: isTextElement
                        ? style.color || '#111827'
                        : style.background || style.backgroundColor || '#6366f1'
                    }}
                  />
                </div>

                {/* Hex Text Input */}
                <input
                  type="text"
                  value={
                    (isTextElement ? style.color : style.backgroundColor) || '#6366F1'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isTextElement) updateStyle({ color: val });
                    else updateStyle({ backgroundColor: val, background: undefined });
                  }}
                  className="w-24 bg-transparent font-mono text-[11px] text-zinc-900 focus:outline-none uppercase"
                />

                <span className="flex-1" />

                {/* Quick Presets Swatches */}
                <div className="flex items-center gap-1">
                  {['#111827', '#6366f1', '#ec4899', '#10b981', '#ffffff'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        if (isTextElement) updateStyle({ color: hex });
                        else updateStyle({ backgroundColor: hex, background: undefined });
                      }}
                      style={{ backgroundColor: hex }}
                      className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Gradient Quick Presets */}
              {!isTextElement && (
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-1">Gradients</span>
                  <div className="grid grid-cols-6 gap-1">
                    {PENPOT_GRADIENT_PRESETS.map((grad) => (
                      <button
                        key={grad.label}
                        type="button"
                        onClick={() => updateStyle({ background: grad.value, backgroundColor: undefined })}
                        style={{ background: grad.value }}
                        className="h-5 rounded border border-zinc-300 hover:scale-105 transition-transform shadow-2xs cursor-pointer"
                        title={grad.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </InspectorSection>

            {/* SECTION: Stroke / Border (Penpot Code Engine Sourced) */}
            <InspectorSection
              title="Stroke"
              extraHeader={
                <div className="flex items-center gap-1">
                  {currentStrokeWidth > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStyle({
                          borderWidth: '0px',
                          border: 'none',
                          borderColor: undefined,
                          borderStyle: undefined
                        })
                      }
                      title="Remove Stroke"
                      className="p-0.5 text-zinc-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      updateStyle({
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: '#111827',
                        strokeAlignment: 'inside'
                      })
                    }
                    title="Add Stroke"
                    className="p-0.5 hover:text-zinc-950 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            >
              {/* Stroke Width & Style */}
              <div className="grid grid-cols-2 gap-2">
                <ScrubInput
                  label="Width"
                  value={currentStrokeWidth}
                  min={0}
                  max={40}
                  onChange={(v) =>
                    updateStyle({
                      borderWidth: `${v}px`,
                      borderStyle: style.borderStyle || 'solid',
                      borderColor: style.borderColor || '#111827',
                      strokeAlignment: style.strokeAlignment || 'inside',
                      border: undefined // Clean legacy border string to avoid clash
                    })
                  }
                  unit="px"
                />
                <select
                  value={style.borderStyle || 'solid'}
                  onChange={(e) => updateStyle({ borderStyle: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] text-zinc-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {PENPOT_STROKE_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stroke Alignment Segmented Control (Inside / Center / Outside) */}
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Stroke Alignment
                </span>
                <div className="grid grid-cols-3 p-0.5 bg-zinc-100 rounded-md text-[11px] font-medium text-zinc-600">
                  {PENPOT_STROKE_ALIGNMENTS.map((align) => (
                    <button
                      key={align.value}
                      type="button"
                      onClick={() => updateStyle({ strokeAlignment: align.value })}
                      className={`py-1 rounded text-center transition cursor-pointer ${
                        (style.strokeAlignment || 'inside') === align.value
                          ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                          : 'hover:text-zinc-900'
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Color */}
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-1.5">
                <input
                  type="color"
                  value={
                    (style.borderColor || '#111827').startsWith('#')
                      ? style.borderColor || '#111827'
                      : '#111827'
                  }
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                  className="w-5 h-5 rounded border border-zinc-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={style.borderColor || '#111827'}
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                  className="w-24 bg-transparent font-mono text-[11px] text-zinc-900 focus:outline-none uppercase"
                />
                <span className="flex-1" />
                <div className="flex items-center gap-1">
                  {['#000000', '#6366f1', '#f43f5e', '#ffffff'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => updateStyle({ borderColor: hex })}
                      style={{ backgroundColor: hex }}
                      className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </InspectorSection>

            {/* SECTION: Effects & Shadows */}
            <InspectorSection title="Effects">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Shadow Preset
                </label>
                <select
                  value={style.boxShadow || 'none'}
                  onChange={(e) => updateStyle({ boxShadow: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] text-zinc-800 focus:outline-none focus:border-indigo-500"
                >
                  {PENPOT_SHADOW_PRESETS.map((p) => (
                    <option key={p.label} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </InspectorSection>
          </>
        )}

        {/* TAB 2: Interactivity & OpenReel Motion */}
        {activeTab === 'interactivity' && (
          <div className="p-3 space-y-4 text-xs">
            {/* Motion Timing Range */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Timeline Occurrence
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ScrubInput
                  label="Start"
                  value={selectedComp.startTime || 0}
                  min={0}
                  max={20}
                  step={0.1}
                  onChange={(v) => updateComponent(selectedComp.id, { startTime: v })}
                  unit="s"
                />
                <ScrubInput
                  label="End"
                  value={selectedComp.endTime || 20}
                  min={0.1}
                  max={20}
                  step={0.1}
                  onChange={(v) => updateComponent(selectedComp.id, { endTime: v })}
                  unit="s"
                />
              </div>
            </div>

            {/* Entrance Animation Preset */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Entrance Transition
              </label>
              <select
                value={selectedComp.animationIn || 'fade-in'}
                onChange={(e) => updateComponent(selectedComp.id, { animationIn: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500"
              >
                {OPENREEL_ANIMATION_IN_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exit Animation Preset */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Exit Transition
              </label>
              <select
                value={selectedComp.animationOut || 'fade-out'}
                onChange={(e) => updateComponent(selectedComp.id, { animationOut: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500"
              >
                {OPENREEL_ANIMATION_OUT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transition Duration */}
            <div>
              <ScrubInput
                label="Duration"
                value={selectedComp.animationDuration !== undefined ? selectedComp.animationDuration : 0.5}
                min={0.1}
                max={5}
                step={0.1}
                onChange={(v) => updateComponent(selectedComp.id, { animationDuration: v })}
                unit="s"
              />
            </div>

            {/* Target URL Link for button/card */}
            {['button', 'card', 'image'].includes(selectedComp.type) && (
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                  Click URL Link
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={selectedComp.targetUrl || ''}
                  onChange={(e) => updateComponent(selectedComp.id, { targetUrl: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Penpot Code Engine & Inspect */}
        {activeTab === 'code' && (
          <div className="p-3 space-y-3">
            {/* Sub-tabs for Code Format */}
            <div className="grid grid-cols-4 p-1 bg-zinc-100 rounded-lg text-[10px] font-mono font-medium text-zinc-600">
              {[
                { id: 'css', label: 'CSS' },
                { id: 'svg', label: 'SVG' },
                { id: 'jsx', label: 'JSX' },
                { id: 'json', label: 'AST' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCodeSubTab(tab.id)}
                  className={`py-1 rounded text-center transition cursor-pointer ${
                    codeSubTab === tab.id
                      ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                      : 'hover:text-zinc-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Header & Copy Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase text-zinc-600">
                Penpot {codeSubTab.toUpperCase()} Output
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : `Copy ${codeSubTab.toUpperCase()}`}</span>
              </button>
            </div>

            {/* Code Box */}
            <pre className="bg-zinc-950 text-emerald-400 p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-h-72 border border-zinc-800 leading-relaxed scrollbar-thin">
              {getActiveCodeContent()}
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
};
