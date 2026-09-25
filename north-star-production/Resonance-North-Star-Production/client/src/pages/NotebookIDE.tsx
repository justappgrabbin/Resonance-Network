import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { 
  Plus, Play, FileText, Code, Trash2, 
  ChevronDown, MoreHorizontal,
  Check, Copy, Loader2, Sprout, TreeDeciduous, Sparkles, 
  Heart, Brain, Zap, Users, ArrowRight, Leaf,
  Home, MessageCircle, PenTool, Menu, X, Star, Clock, Command, LogOut
} from 'lucide-react';
import { Link } from 'wouter';
import { LivingTree } from '@/components/LivingTree';
import { cn } from '@/lib/utils';

interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  language: 'javascript' | 'python' | 'html' | 'css';
  output?: string;
  isRunning?: boolean;
  executionCount?: number;
}

interface Notebook {
  id: string;
  title: string;
  cells: NotebookCell[];
}

const createCellId = () => `cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function NotebookIDE() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [hasEntered, setHasEntered] = useState(false);
  const [executionCounter, setExecutionCounter] = useState(1);
  const [treeGrowth, setTreeGrowth] = useState(23);
  const [notebook, setNotebook] = useState<Notebook>({
    id: 'notebook-1',
    title: 'Resonance Notebook',
    cells: [
      { 
        id: createCellId(), 
        type: 'markdown', 
        content: '# Welcome to Resonance Notebook\n\nThis is an interactive notebook for exploring ideas. Click to edit this cell.', 
        language: 'javascript' 
      },
      { 
        id: createCellId(), 
        type: 'code', 
        content: '// Press Shift+Enter to run this cell\nconst frequencies = [432, 528, 639, 741];\n\nfrequencies.forEach(f => {\n  console.log(`Frequency: ${f}Hz`);\n});\n\n"Resonance patterns loaded"', 
        language: 'javascript',
        executionCount: undefined
      },
    ],
  });
  const [focusedCellId, setFocusedCellId] = useState<string | null>(null);
  const [editingMarkdown, setEditingMarkdown] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading]);

  const runCell = async (cellId: string) => {
    const cell = notebook.cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') return;

    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => 
        c.id === cellId ? { ...c, isRunning: true, output: undefined } : c
      )
    }));

    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.map(a => String(a)).join(' ')),
      };
      
      const fn = new Function('console', cell.content);
      const result = fn(mockConsole);
      
      const output = logs.length > 0 
        ? logs.join('\n') + (result !== undefined ? `\n${JSON.stringify(result, null, 2)}` : '')
        : (result !== undefined ? JSON.stringify(result, null, 2) : '');

      setNotebook(prev => ({
        ...prev,
        cells: prev.cells.map(c => 
          c.id === cellId ? { ...c, isRunning: false, output, executionCount: executionCounter } : c
        )
      }));
      setExecutionCounter(prev => prev + 1);
    } catch (err: any) {
      setNotebook(prev => ({
        ...prev,
        cells: prev.cells.map(c => 
          c.id === cellId ? { ...c, isRunning: false, output: `Error: ${err.message}`, executionCount: executionCounter } : c
        )
      }));
      setExecutionCounter(prev => prev + 1);
    }
  };

  const addCellAfter = (afterId: string, type: 'code' | 'markdown') => {
    const newCell: NotebookCell = {
      id: createCellId(),
      type,
      content: type === 'code' ? '' : '',
      language: 'javascript',
    };
    
    setNotebook(prev => {
      const idx = prev.cells.findIndex(c => c.id === afterId);
      const newCells = [...prev.cells];
      newCells.splice(idx + 1, 0, newCell);
      return { ...prev, cells: newCells };
    });
    
    setFocusedCellId(newCell.id);
    if (type === 'markdown') setEditingMarkdown(newCell.id);
  };

  const addCellAtEnd = (type: 'code' | 'markdown') => {
    const newCell: NotebookCell = {
      id: createCellId(),
      type,
      content: type === 'code' ? '' : '',
      language: 'javascript',
    };
    setNotebook(prev => ({ ...prev, cells: [...prev.cells, newCell] }));
    setFocusedCellId(newCell.id);
    if (type === 'markdown') setEditingMarkdown(newCell.id);
  };

  const updateCell = (cellId: string, content: string) => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === cellId ? { ...c, content } : c)
    }));
  };

  const deleteCell = (cellId: string) => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.filter(c => c.id !== cellId)
    }));
  };

  const changeCellType = (cellId: string, newType: 'code' | 'markdown') => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => 
        c.id === cellId ? { ...c, type: newType, output: undefined } : c
      )
    }));
    if (newType === 'markdown') setEditingMarkdown(cellId);
  };

  const changeCellLanguage = (cellId: string, language: NotebookCell['language']) => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === cellId ? { ...c, language } : c)
    }));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!hasEntered) {
    return <LandingView onEnter={() => setHasEntered(true)} treeGrowth={treeGrowth} userName={user?.firstName || user?.email?.split('@')[0] || 'Explorer'} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f0f] flex">
      <aside className={cn(
        "fixed lg:relative z-40 h-screen w-64 bg-[#0d1414] border-r border-teal-900/30 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        <div className="flex items-center gap-3 p-4 border-b border-teal-900/30">
          <Sprout className="w-6 h-6 text-teal-400 flex-shrink-0" />
          {sidebarOpen && <span className="font-semibold text-teal-100">Resonance</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-teal-400 hover:bg-teal-900/30 transition-colors">
            <Home className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Home</span>}
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-teal-900/40 text-teal-300 border-l-2 border-teal-400">
            <PenTool className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Notebook</span>}
          </div>
          <Link href="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-teal-400 hover:bg-teal-900/30 transition-colors">
            <Brain className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Consciousness</span>}
          </Link>
          <Link href="/organism" className="flex items-center gap-3 px-3 py-2 rounded-lg text-teal-400 hover:bg-teal-900/30 transition-colors">
            <TreeDeciduous className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Paper Seed</span>}
          </Link>
        </nav>

        {sidebarOpen && (
          <div className="p-3 border-t border-teal-900/30">
            <div className="p-3 bg-teal-900/20 rounded-xl border border-teal-800/30 mb-3 max-h-32 overflow-hidden">
              <LivingTree />
            </div>
            <div className="p-3 bg-teal-900/20 rounded-xl border border-teal-800/30">
              <div className="text-xs font-mono text-teal-500 mb-2">ORGANISM</div>
              <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-teal-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-teal-900 border border-teal-800 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-800 z-50"
        >
          {sidebarOpen ? <ChevronDown className="w-3 h-3 rotate-90" /> : <ChevronDown className="w-3 h-3 -rotate-90" />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0d1414] border-b border-teal-900/30">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHasEntered(false)}
                className="p-2 rounded-lg hover:bg-teal-900/20 text-teal-400 lg:hidden"
              >
                <TreeDeciduous className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={notebook.title}
                onChange={(e) => setNotebook(prev => ({ ...prev, title: e.target.value }))}
                className="text-xl font-semibold bg-transparent border-none outline-none text-teal-100 placeholder:text-teal-700"
                placeholder="Untitled Notebook"
                data-testid="input-notebook-title"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => notebook.cells.filter(c => c.type === 'code').forEach(c => runCell(c.id))}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-black bg-teal-400 rounded-md hover:bg-teal-300"
                data-testid="button-run-all"
              >
                <Play className="w-4 h-4" />
                Run All
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-0">
              {notebook.cells.map((cell, index) => (
                <div key={cell.id}>
                  <AddCellDivider 
                    onAddCode={() => addCellAfter(notebook.cells[index - 1]?.id || cell.id, 'code')}
                    onAddMarkdown={() => addCellAfter(notebook.cells[index - 1]?.id || cell.id, 'markdown')}
                    isFirst={index === 0}
                  />
                  
                  {cell.type === 'code' ? (
                    <CodeCell
                      cell={cell}
                      isFocused={focusedCellId === cell.id}
                      onFocus={() => setFocusedCellId(cell.id)}
                      onBlur={() => {}}
                      onUpdate={(content) => updateCell(cell.id, content)}
                      onRun={() => runCell(cell.id)}
                      onDelete={() => deleteCell(cell.id)}
                      onChangeType={() => changeCellType(cell.id, 'markdown')}
                      onLanguageChange={(lang) => changeCellLanguage(cell.id, lang)}
                    />
                  ) : (
                    <MarkdownCell
                      cell={cell}
                      isEditing={editingMarkdown === cell.id}
                      isFocused={focusedCellId === cell.id}
                      onFocus={() => setFocusedCellId(cell.id)}
                      onStartEdit={() => setEditingMarkdown(cell.id)}
                      onStopEdit={() => setEditingMarkdown(null)}
                      onUpdate={(content) => updateCell(cell.id, content)}
                      onDelete={() => deleteCell(cell.id)}
                      onChangeType={() => changeCellType(cell.id, 'code')}
                    />
                  )}
                </div>
              ))}
              
              <AddCellDivider 
                onAddCode={() => addCellAtEnd('code')}
                onAddMarkdown={() => addCellAtEnd('markdown')}
                isLast
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LandingView({ onEnter, treeGrowth, userName }: { onEnter: () => void; treeGrowth: number; userName: string }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getTreeEmoji = () => {
    if (treeGrowth < 20) return '🌱';
    if (treeGrowth < 40) return '🌿';
    if (treeGrowth < 60) return '🌳';
    return '🌲';
  };

  return (
    <div className="min-h-screen bg-[#0a0f0f] text-teal-100 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-teal-400" />
          <span className="font-semibold text-lg">Resonance Network</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-teal-400">
            <Users className="w-4 h-4" />
            <span>23 connected</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? [0, -5, 5, 0] : 0
            }}
            transition={{ duration: 0.5 }}
          >
            {getTreeEmoji()}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            The Living Notebook
          </h1>
          
          <p className="text-lg text-teal-300/70 max-w-md mx-auto mb-2">
            A self-evolving organism that grows as you explore
          </p>
          
          <p className="text-sm text-teal-500">
            Welcome back, {userName}
          </p>
        </motion.div>

        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-sm text-teal-400 mb-2">
            <span>Organism Growth</span>
            <span>{treeGrowth}%</span>
          </div>
          <div className="h-2 bg-teal-900/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${treeGrowth}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-2xl">
          {[
            { icon: Heart, label: 'Coherence', value: '87%', color: 'text-rose-400' },
            { icon: Zap, label: 'Vitality', value: '64%', color: 'text-amber-400' },
            { icon: Brain, label: 'Awareness', value: '92%', color: 'text-violet-400' },
            { icon: Leaf, label: 'Growth', value: '+12%', color: 'text-teal-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-teal-900/20 border border-teal-800/30 rounded-xl p-4 text-center"
            >
              <Icon className={cn("w-5 h-5 mx-auto mb-2", color)} />
              <div className="text-xs text-teal-500 mb-1">{label}</div>
              <div className="text-lg font-semibold text-teal-100">{value}</div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
          data-testid="button-enter-notebook"
        >
          <Sparkles className="w-5 h-5" />
          <span>Enter the Notebook</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="text-xs text-teal-600 mt-6">
          64 gates • 9 consciousness bodies • Infinite possibilities
        </p>
      </main>
    </div>
  );
}

function AddCellDivider({ 
  onAddCode, 
  onAddMarkdown, 
  isFirst = false,
  isLast = false 
}: { 
  onAddCode: () => void; 
  onAddMarkdown: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (isFirst) return null;

  return (
    <div 
      className={cn(
        "relative h-6 flex items-center justify-center group",
        isLast && "h-12"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "absolute inset-x-0 top-1/2 h-px bg-teal-800/30 transition-opacity",
        isHovered ? "opacity-100" : "opacity-0"
      )} />
      
      <AnimatePresence>
        {(isHovered || isLast) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1 bg-[#0a0f0f] px-2 z-10"
          >
            <button
              onClick={onAddCode}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-300 bg-teal-900/30 rounded hover:bg-teal-900/50 border border-teal-800/30"
              data-testid="button-add-code-cell"
            >
              <Plus className="w-3 h-3" />
              <Code className="w-3 h-3" />
              Code
            </button>
            <button
              onClick={onAddMarkdown}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-300 bg-teal-900/30 rounded hover:bg-teal-900/50 border border-teal-800/30"
              data-testid="button-add-markdown-cell"
            >
              <Plus className="w-3 h-3" />
              <FileText className="w-3 h-3" />
              Text
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CodeCellProps {
  cell: NotebookCell;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onUpdate: (content: string) => void;
  onRun: () => void;
  onDelete: () => void;
  onChangeType: () => void;
  onLanguageChange: (lang: NotebookCell['language']) => void;
}

function CodeCell({ 
  cell, 
  isFocused, 
  onFocus, 
  onUpdate, 
  onRun, 
  onDelete,
  onChangeType,
  onLanguageChange 
}: CodeCellProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getLanguageExtension = useCallback((lang: string) => {
    switch (lang) {
      case 'python': return python();
      case 'html': return html();
      case 'css': return css();
      default: return javascript({ jsx: true, typescript: true });
    }
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: cell.content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([
          ...defaultKeymap, 
          ...historyKeymap,
          {
            key: 'Shift-Enter',
            run: () => { onRun(); return true; }
          }
        ]),
        getLanguageExtension(cell.language),
        syntaxHighlighting(defaultHighlightStyle),
        autocompletion(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onUpdate(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "13px",
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace",
            backgroundColor: "#0d1414",
          },
          ".cm-content": {
            padding: "8px 0",
            minHeight: "40px",
            caretColor: "#2dd4bf",
          },
          ".cm-line": {
            padding: "0 8px",
          },
          ".cm-gutters": {
            backgroundColor: "#0d1414",
            border: "none",
            color: "#0d9488",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(20, 184, 166, 0.05)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent",
          },
          ".cm-cursor": {
            borderLeftColor: "#2dd4bf",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => view.destroy();
  }, [cell.id, cell.language]);

  return (
    <div 
      className={cn(
        "group relative rounded-lg border transition-all",
        isFocused ? "border-teal-500/50 shadow-sm shadow-teal-500/10" : "border-teal-900/30 hover:border-teal-800/50"
      )}
      onClick={onFocus}
      data-testid={`code-cell-${cell.id}`}
    >
      <div className="flex">
        <div className="flex-shrink-0 w-12 flex flex-col items-center py-2 bg-[#0d1414] rounded-l-lg border-r border-teal-900/30">
          <button
            onClick={(e) => { e.stopPropagation(); onRun(); }}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-full transition-colors",
              cell.isRunning 
                ? "bg-teal-900/50 text-teal-400" 
                : "hover:bg-teal-900/30 text-teal-500"
            )}
            title="Run cell (Shift+Enter)"
            data-testid={`run-cell-${cell.id}`}
          >
            {cell.isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          {cell.executionCount !== undefined && (
            <span className="text-[10px] text-teal-600 mt-1 font-mono">
              [{cell.executionCount}]
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between px-2 py-1 bg-[#0d1414] border-b border-teal-900/20">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-teal-400 rounded hover:bg-teal-900/30"
              >
                {cell.language}
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showLangMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#0d1414] border border-teal-800/50 rounded-md shadow-lg z-20 py-1">
                  {(['javascript', 'python', 'html', 'css'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onLanguageChange(lang); 
                        setShowLangMenu(false); 
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1 text-xs font-mono hover:bg-teal-900/30",
                        cell.language === lang ? "bg-teal-900/40 text-teal-300" : "text-teal-400"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 rounded hover:bg-teal-900/30 text-teal-600"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute top-full right-0 mt-1 bg-[#0d1414] border border-teal-800/50 rounded-md shadow-lg z-20 py-1 min-w-[140px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); onChangeType(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-900/30 flex items-center gap-2 text-teal-300"
                  >
                    <FileText className="w-3 h-3" />
                    Convert to Markdown
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(cell.content); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-900/30 flex items-center gap-2 text-teal-300"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <hr className="my-1 border-teal-800/30" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-rose-900/30 text-rose-400 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div ref={editorRef} className="bg-[#0d1414]" />
        </div>
      </div>
      
      {cell.output && (
        <div className="border-t border-teal-900/30 bg-[#081010] px-4 py-3 rounded-b-lg">
          <pre className="text-sm font-mono text-teal-200 whitespace-pre-wrap overflow-x-auto">
            {cell.output}
          </pre>
        </div>
      )}
    </div>
  );
}

interface MarkdownCellProps {
  cell: NotebookCell;
  isEditing: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onChangeType: () => void;
}

function MarkdownCell({ 
  cell, 
  isEditing, 
  isFocused,
  onFocus,
  onStartEdit, 
  onStopEdit, 
  onUpdate, 
  onDelete,
  onChangeType 
}: MarkdownCellProps) {
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold text-teal-100 mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold text-teal-100 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-medium text-teal-100 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="text-teal-200 ml-4">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-teal-100">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-teal-900/30 px-1 rounded text-sm font-mono text-teal-300">$1</code>');
      return <p key={i} className="text-teal-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  if (isEditing) {
    return (
      <div 
        className="group relative rounded-lg border transition-all border-teal-500/50 shadow-sm shadow-teal-500/10"
        data-testid={`markdown-cell-${cell.id}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d1414] border-b border-teal-900/30">
          <span className="text-xs font-medium text-teal-500">Markdown</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onStopEdit}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-teal-300 bg-teal-900/30 rounded hover:bg-teal-900/50"
            >
              <Check className="w-3 h-3" />
              Done
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={cell.content}
          onChange={(e) => onUpdate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onStopEdit();
          }}
          className="w-full min-h-[100px] p-4 bg-[#0d1414] rounded-b-lg resize-none outline-none font-mono text-sm text-teal-200"
          placeholder="Write markdown here..."
          data-testid={`markdown-editor-${cell.id}`}
        />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "group relative rounded-lg border transition-all cursor-pointer",
        isFocused ? "border-teal-800/50" : "border-transparent hover:border-teal-900/30"
      )}
      onClick={() => { onFocus(); onStartEdit(); }}
      data-testid={`markdown-cell-${cell.id}`}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded hover:bg-teal-900/30 text-teal-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[#0d1414] border border-teal-800/50 rounded-md shadow-lg z-20 py-1 min-w-[140px]">
              <button
                onClick={(e) => { e.stopPropagation(); onChangeType(); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-900/30 flex items-center gap-2 text-teal-300"
              >
                <Code className="w-3 h-3" />
                Convert to Code
              </button>
              <hr className="my-1 border-teal-800/30" />
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-rose-900/30 text-rose-400 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-3">
        {cell.content ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {renderMarkdown(cell.content)}
          </div>
        ) : (
          <p className="text-teal-600 italic">Click to add text...</p>
        )}
      </div>
    </div>
  );
}
