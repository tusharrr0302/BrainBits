import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";

const BRAINBITS_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment",     foreground: "2a3d52", fontStyle: "italic" },
    { token: "keyword",     foreground: "20a0c0" },
    { token: "string",      foreground: "7ee787" },
    { token: "number",      foreground: "8aaac8" },
    { token: "type",        foreground: "c8d6e5" },
    { token: "function",    foreground: "e2eaf4" },
    { token: "variable",    foreground: "c8d6e5" },
    { token: "operator",    foreground: "3a5472" },
    { token: "delimiter",   foreground: "3a5472" },
    { token: "tag",         foreground: "20a0c0" },
    { token: "attribute.name",  foreground: "8aaac8" },
    { token: "attribute.value", foreground: "7ee787" },
  ],
  colors: {
    "editor.background":           "#0b1118",
    "editor.foreground":           "#c8d6e5",
    "editor.lineHighlightBackground": "#0d1a28",
    "editor.selectionBackground":  "#1e2d3d",
    "editorLineNumber.foreground": "#2a3d52",
    "editorLineNumber.activeForeground": "#3a5472",
    "editorCursor.foreground":     "#20a0c0",
    "editorIndentGuide.background":"#1e2d3d",
    "editorIndentGuide.activeBackground": "#3a5472",
    "editorWidget.background":     "#0d1a28",
    "editorWidget.border":         "#1e2d3d",
    "editorSuggestWidget.background": "#0d1a28",
    "editorSuggestWidget.border":  "#1e2d3d",
    "editorSuggestWidget.selectedBackground": "#111d2a",
    "scrollbar.shadow":            "#00000000",
    "scrollbarSlider.background":  "#1e2d3d88",
    "scrollbarSlider.hoverBackground": "#3a5472aa",
    "minimap.background":          "#0b1118",
  },
};

export default function EditorPanel({ language, code, onChange }) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.defineTheme("brainbits", BRAINBITS_THEME);
    monaco.editor.setTheme("brainbits");
  }, [monaco]);

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={onChange}
      theme="brainbits"
      options={{
        fontSize: 13,
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 14, bottom: 14 },
        lineNumbersMinChars: 3,
        renderLineHighlight: "line",
        scrollbar: {
          verticalScrollbarSize: 4,
          horizontalScrollbarSize: 4,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        contextmenu: false,
      }}
    />
  );
}