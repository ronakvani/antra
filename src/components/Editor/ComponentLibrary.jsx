import React, { useState } from 'react';
import {
  Heading,
  AlignLeft,
  MousePointer,
  FormInput,
  FileText,
  Square,
  Circle,
  Star,
  MoveRight,
  Diamond,
  Triangle,
  Hexagon,
  Tag,
  Quote,
  Minus,
  Image as ImageIcon,
  Search,
  LayoutGrid,
  Layers,
  Component as ComponentIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  Sliders,
  Type
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { createGrapesComponentRecord } from '../../utils/grapesEngine';

export const ComponentLibrary = () => {
  const {
    manifest,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    removeComponent,
    duplicateComponent,
    toggleLockComponent,
    toggleHideComponent,
    moveComponentOrder,
    currentTime
  } = useEditor();

  // Active left tab: 'layers' (File / Tree) or 'components' (Assets / Library)
  const [activeTab, setActiveTab] = useState('layers');
  const [searchTerm, setSearchTerm] = useState('');

  const componentGroups = [
    {
      group: 'Typography',
      blocks: [
        {
          type: 'heading',
          label: 'Heading Text',
          icon: Heading,
          defaultContent: 'Interactive Headline',
          style: {
            fontFamily: "'Belanosima', sans-serif",
            fontSize: 'clamp(22px, 3.2vw, 44px)',
            fontWeight: '700',
            color: '#111827',
            top: '25%',
            left: '25%'
          }
        },
        {
          type: 'paragraph',
          label: 'Paragraph Text',
          icon: AlignLeft,
          defaultContent: 'Add your interactive story or feature description here for your website visitors.',
          style: {
            fontFamily: "'Belanosima', sans-serif",
            fontSize: 'clamp(13px, 1.3vw, 17px)',
            color: '#4b5563',
            maxWidth: '42%',
            lineHeight: '1.6',
            top: '35%',
            left: '25%'
          }
        },
        {
          type: 'quote',
          label: 'Blockquote',
          icon: Quote,
          defaultContent: '"Antra redefined how we build video-first web experiences."',
          style: {
            fontFamily: "'Belanosima', sans-serif",
            borderLeft: '4px solid #4f46e5',
            paddingLeft: '16px',
            color: '#1f2937',
            fontStyle: 'italic',
            fontSize: 'clamp(14px, 1.5vw, 20px)',
            maxWidth: '45%',
            top: '45%',
            left: '25%'
          }
        }
      ]
    },
    {
      group: 'Shapes',
      blocks: [
        {
          type: 'vector-rect',
          label: 'Rectangle Shape',
          icon: Square,
          defaultContent: '',
          style: {
            width: '24%',
            height: '18%',
            backgroundColor: '#6366f1',
            borderRadius: '16px',
            top: '30%',
            left: '30%'
          }
        },
        {
          type: 'vector-circle',
          label: 'Circle Shape',
          icon: Circle,
          defaultContent: '',
          style: {
            width: '16%',
            height: '22%',
            backgroundColor: '#ec4899',
            borderRadius: '50%',
            top: '35%',
            left: '40%'
          }
        },
        {
          type: 'vector-star',
          label: 'Star Shape',
          icon: Star,
          defaultContent: '',
          style: {
            width: '14%',
            height: '20%',
            backgroundColor: '#f59e0b',
            top: '25%',
            left: '45%'
          }
        },
        {
          type: 'vector-arrow',
          label: 'Arrow Graphic',
          icon: MoveRight,
          defaultContent: '',
          style: {
            width: '16%',
            height: '15%',
            backgroundColor: '#10b981',
            top: '50%',
            left: '35%'
          }
        },
        {
          type: 'vector-diamond',
          label: 'Diamond Polygon',
          icon: Diamond,
          defaultContent: '',
          style: {
            width: '14%',
            height: '20%',
            backgroundColor: '#8b5cf6',
            top: '40%',
            left: '50%'
          }
        },
        {
          type: 'vector-triangle',
          label: 'Triangle Polygon',
          icon: Triangle,
          defaultContent: '',
          style: {
            width: '14%',
            height: '20%',
            backgroundColor: '#06b6d4',
            top: '30%',
            left: '40%'
          }
        },
        {
          type: 'vector-hexagon',
          label: 'Hexagon Polygon',
          icon: Hexagon,
          defaultContent: '',
          style: {
            width: '15%',
            height: '22%',
            backgroundColor: '#f43f5e',
            top: '35%',
            left: '45%'
          }
        }
      ]
    },
    {
      group: 'Elements',
      blocks: [
        {
          type: 'button',
          label: 'Button Element',
          icon: MousePointer,
          defaultContent: 'Get Started',
          style: {
            backgroundColor: '#111827',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: 'clamp(12px, 1.2vw, 15px)',
            top: '50%',
            left: '40%'
          }
        },
        {
          type: 'badge',
          label: 'Badge Tag',
          icon: Tag,
          defaultContent: '★ New Feature',
          style: {
            backgroundColor: '#e0e7ff',
            color: '#3730a3',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: 'clamp(11px, 1vw, 13px)',
            fontWeight: '600',
            top: '18%',
            left: '25%'
          }
        },
        {
          type: 'card',
          label: 'Card Container',
          icon: LayoutGrid,
          defaultContent: 'Card Title\nThis is a container box.',
          style: {
            backgroundColor: '#ffffff',
            color: '#111827',
            padding: '18px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
            width: '32%',
            top: '40%',
            left: '20%'
          }
        },
        {
          type: 'divider',
          label: 'Divider Line',
          icon: Minus,
          defaultContent: '',
          style: {
            borderTop: '2px dashed #cbd5e1',
            width: '35%',
            top: '55%',
            left: '30%'
          }
        }
      ]
    },
    {
      group: 'Forms',
      blocks: [
        {
          type: 'input',
          label: 'Text Input',
          icon: FormInput,
          defaultContent: 'Enter email address...',
          style: {
            backgroundColor: '#ffffff',
            color: '#111827',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            width: '28%',
            top: '60%',
            left: '35%'
          }
        },
        {
          type: 'textarea',
          label: 'Textarea Box',
          icon: FileText,
          defaultContent: 'Write your message here...',
          style: {
            backgroundColor: '#ffffff',
            color: '#111827',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            width: '32%',
            height: '16%',
            top: '65%',
            left: '35%'
          }
        }
      ]
    },
    {
      group: 'Media',
      blocks: [
        {
          type: 'image',
          label: 'Image Block',
          icon: ImageIcon,
          defaultContent:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
          style: {
            width: '30%',
            height: '24%',
            borderRadius: '12px',
            objectFit: 'cover',
            top: '30%',
            left: '35%'
          }
        }
      ]
    }
  ];

  const handleAdd = (block, groupName) => {
    const isWebComp = groupName !== 'Shapes';
    const grapesRecord = isWebComp
      ? createGrapesComponentRecord(block.type, block.defaultContent)
      : null;

    addComponent({
      type: block.type,
      content: block.defaultContent,
      startTime: Math.max(0, currentTime),
      endTime: Math.min(20, currentTime + 5.0),
      style: block.style,
      grapesEngine: grapesRecord
    });
  };

  // Helper icon for layer types
  const getLayerIcon = (type) => {
    switch (type) {
      case 'heading':
        return Heading;
      case 'paragraph':
        return AlignLeft;
      case 'quote':
        return Quote;
      case 'vector-rect':
        return Square;
      case 'vector-circle':
        return Circle;
      case 'vector-star':
        return Star;
      case 'vector-arrow':
        return MoveRight;
      case 'vector-diamond':
        return Diamond;
      case 'vector-triangle':
        return Triangle;
      case 'vector-hexagon':
        return Hexagon;
      case 'button':
        return MousePointer;
      case 'badge':
        return Tag;
      case 'card':
        return LayoutGrid;
      case 'input':
        return FormInput;
      case 'textarea':
        return FileText;
      case 'image':
        return ImageIcon;
      case 'divider':
        return Minus;
      default:
        return FileText;
    }
  };

  // Layers list sorted with highest z-index / top visual layer first
  const layersList = [...manifest.components].reverse();
  const filteredLayers = layersList.filter((comp) => {
    const text = `${comp.type} ${comp.content || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <aside className="h-full flex bg-white border-r border-zinc-200 select-none shadow-xs">
      {/* 1. Slim Left Activity Bar (Figma / VS Code / Penpot style) */}
      <div className="w-12 h-full bg-zinc-50 border-r border-zinc-200 flex flex-col items-center py-3 gap-2 flex-shrink-0">
        {/* Button 1: File / Layers Tree Tab */}
        <button
          onClick={() => setActiveTab('layers')}
          title="Layers (File Tree)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Button 2: Component Library Tab */}
        <button
          onClick={() => setActiveTab('components')}
          title="Components (Assets Library)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'components'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70'
          }`}
        >
          <ComponentIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Main Sidebar Content Area */}
      <div className="w-[260px] h-full flex flex-col p-3 overflow-hidden">
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder={activeTab === 'layers' ? 'Search layers...' : 'Search components...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* TAB 1: Live Layers Tree Panel */}
        {activeTab === 'layers' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with layer count */}
            <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-100 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Layers ({manifest.components.length})
              </span>
              {selectedComponentId && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveComponentOrder(selectedComponentId, 'up')}
                    title="Bring Forward"
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-900 transition"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveComponentOrder(selectedComponentId, 'down')}
                    title="Send Backward"
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-900 transition"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateComponent(selectedComponentId)}
                    title="Duplicate Layer"
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-900 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeComponent(selectedComponentId)}
                    title="Delete Layer"
                    className="p-1 hover:bg-red-50 text-zinc-500 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Layer Tree Items */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {filteredLayers.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-zinc-400">
                  <Layers className="w-8 h-8 stroke-[1.5] mb-2 text-zinc-300" />
                  <p className="text-xs font-medium text-zinc-600">No layers found</p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Add elements from the Components tab to build your site.
                  </p>
                </div>
              ) : (
                filteredLayers.map((comp) => {
                  const isSelected = selectedComponentId === comp.id;
                  const IconComp = getLayerIcon(comp.type);
                  const isHidden = !!comp.hidden;
                  const isLocked = !!comp.locked;

                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedComponentId(comp.id)}
                      className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 font-medium shadow-2xs'
                          : 'bg-white border-transparent hover:bg-zinc-100/70 text-zinc-700 hover:border-zinc-200/50'
                      }`}
                    >
                      {/* Left: Type Icon + Label */}
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
                        <IconComp
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isSelected ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-600'
                          }`}
                        />
                        <span className="truncate text-[11px]">
                          {comp.content ? comp.content.split('\n')[0] : comp.type}
                        </span>
                      </div>

                      {/* Right: Quick Action Toggles */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Hide / Unhide */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHideComponent(comp.id);
                          }}
                          className={`p-1 rounded hover:bg-zinc-200/60 transition ${
                            isHidden ? 'text-zinc-400 !opacity-100' : 'text-zinc-500'
                          }`}
                          title={isHidden ? 'Show Layer' : 'Hide Layer'}
                        >
                          {isHidden ? <EyeOff className="w-3 h-3 text-zinc-400" /> : <Eye className="w-3 h-3" />}
                        </button>

                        {/* Lock / Unlock */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLockComponent(comp.id);
                          }}
                          className={`p-1 rounded hover:bg-zinc-200/60 transition ${
                            isLocked ? 'text-amber-600 !opacity-100' : 'text-zinc-500'
                          }`}
                          title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
                        >
                          {isLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Persistent status icons if locked or hidden */}
                      {(isLocked || isHidden) && (
                        <div className="flex items-center gap-1 ml-1 group-hover:hidden">
                          {isHidden && <EyeOff className="w-3 h-3 text-zinc-400" />}
                          {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Component Library Panel */}
        {activeTab === 'components' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {componentGroups.map((group) => {
              const filteredBlocks = group.blocks.filter((b) =>
                b.label.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredBlocks.length === 0) return null;

              return (
                <div key={group.group}>
                  {/* Category Title */}
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                    {group.group}
                  </h3>

                  {/* 4-Column Compact Grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {filteredBlocks.map((block) => {
                      const IconComp = block.icon;
                      return (
                        <button
                          key={block.type}
                          onClick={() => handleAdd(block, group.group)}
                          title={`Add ${block.label}`}
                          className="group relative aspect-square bg-zinc-50 hover:bg-indigo-50 border border-zinc-200/80 hover:border-indigo-400 rounded-lg flex items-center justify-center transition shadow-2xs hover:scale-105 cursor-pointer"
                        >
                          <IconComp className="w-4 h-4 text-zinc-600 group-hover:text-indigo-600 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
