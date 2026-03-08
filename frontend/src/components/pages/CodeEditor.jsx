import { useState, useRef, useEffect } from "react";
import { Play, Square, ToggleLeft, ToggleRight, Plus, X, ChevronDown, Pencil, Check } from "lucide-react";
import EditorPanel from "../ui/EditorPanel";
import LivePreview from "../ui/LivePreview";
import Terminal from "../ui/Terminal";
import SpaceBackground from "../ui/SpaceBackground";
import { runCode } from "../helpers/CodeEditorAPI";
import { DEFAULT_CODE } from "../helpers/CodeEditorConstants";
import Sidebar from "../ui/Sidebar";
import styles from "./CodeEditor.module.css";

const LANGUAGES = [
  { value: "html",       label: "HTML" },
  { value: "css",        label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python",     label: "Python" },
  { value: "java",       label: "Java" },
  { value: "c",          label: "C" },
  { value: "cpp",        label: "C++" },
  { value: "go",         label: "Go" },
  { value: "rust",       label: "Rust" },
  { value: "php",        label: "PHP" },
  { value: "ruby",       label: "Ruby" },
];

let fileCounter = 2;

export default function CodeEditor() {
  const [open, setOpen]                 = useState(true);
  const [files, setFiles]               = useState([
    { id: "1", name: "index.html", language: "html", code: DEFAULT_CODE.html },
  ]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [output, setOutput]             = useState("");
  const [isRunning, setIsRunning]       = useState(false);
  const [showPreview, setShowPreview]   = useState(true);
  const [langDropOpen, setLangDropOpen] = useState(false);
  const [renamingId, setRenamingId]     = useState(null);
  const [renameValue, setRenameValue]   = useState("");

  const terminalRef    = useRef(null);
  const renameInputRef = useRef(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  function updateCode(newCode) {
    setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, code: newCode } : f)));
  }

  function changeLanguage(lang) {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, language: lang, code: DEFAULT_CODE[lang] ?? f.code }
          : f
      )
    );
    setLangDropOpen(false);
  }

  function addFile() {
    const id   = String(fileCounter++);
    const name = `file${id}.js`;
    setFiles((prev) => [...prev, { id, name, language: "javascript", code: DEFAULT_CODE.javascript }]);
    setActiveFileId(id);
  }

  function closeFile(id) {
    const remaining = files.filter((f) => f.id !== id);
    if (remaining.length === 0) return;
    setFiles(remaining);
    if (activeFileId === id) setActiveFileId(remaining[remaining.length - 1].id);
  }

  function startRename(id, currentName) {
    setRenamingId(id);
    setRenameValue(currentName);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed) {
      setFiles((prev) =>
        prev.map((f) => (f.id === renamingId ? { ...f, name: trimmed } : f))
      );
    }
    setRenamingId(null);
    setRenameValue("");
  }

  function handleRenameKey(e) {
    if (e.key === "Enter")  commitRename();
    if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
  }

  async function handleRun(stdin = "") {
    if (isRunning) return;
    setIsRunning(true);
    setOutput("Running...");
    terminalRef.current?.focusOutput();

    try {
      const result = await runCode(activeFile.language, activeFile.code, stdin);
      setOutput(result.output || "(no output)");
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }

  const currentLang = LANGUAGES.find((l) => l.value === activeFile?.language);

  return (
    <>
      {/* Full-page space background */}
      <div className={styles.bgLayer}>
        <SpaceBackground />
      </div>

      <Sidebar open={open} setOpen={setOpen} />

      <div className={`${styles.shell} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>

        {/* ── Top Bar ── */}
        <div className={styles.topBar}>
          <span className={styles.breadcrumb}>
            Home Page / <span>Coding Lab</span>
          </span>

          <div className={styles.topBarRight}>

            {/* Preview Toggle */}
            <button
              className={`${styles.toggleBtn} ${showPreview ? styles.toggleActive : ""}`}
              onClick={() => setShowPreview((v) => !v)}
              title="Toggle Live Preview"
            >
              {showPreview ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              <span>Preview</span>
            </button>

            {/* Language Selector */}
            <div className={styles.langWrap}>
              <button
                className={styles.langBtn}
                onClick={() => setLangDropOpen((v) => !v)}
              >
                <span>{currentLang?.label ?? "Language"}</span>
                <ChevronDown size={12} />
              </button>
              {langDropOpen && (
                <>
                  {/* Click-away overlay */}
                  <div
                    className={styles.dropOverlay}
                    onClick={() => setLangDropOpen(false)}
                  />
                  <div className={styles.langDropdown}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        className={`${styles.langOption} ${
                          activeFile?.language === l.value ? styles.langOptionActive : ""
                        }`}
                        onClick={() => changeLanguage(l.value)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Run Button */}
            <button
              className={`${styles.runBtn} ${isRunning ? styles.runBtnRunning : ""}`}
              onClick={() => handleRun()}
              disabled={isRunning}
            >
              {isRunning
                ? <Square size={12} fill="currentColor" />
                : <Play   size={12} fill="currentColor" />}
              <span>{isRunning ? "Running" : "Run"}</span>
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className={styles.tabBar}>
          <div className={styles.tabs}>
            {files.map((f) => (
              <div
                key={f.id}
                className={`${styles.tab} ${f.id === activeFileId ? styles.tabActive : ""}`}
                onClick={() => setActiveFileId(f.id)}
              >
                {/* Rename inline input */}
                {renamingId === f.id ? (
                  <input
                    ref={renameInputRef}
                    className={styles.renameInput}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKey}
                    onBlur={commitRename}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={styles.tabName}
                    onDoubleClick={(e) => { e.stopPropagation(); startRename(f.id, f.name); }}
                    title="Double-click to rename"
                  >
                    {f.name}
                  </span>
                )}

                {/* Rename icon (active tab only, not while renaming) */}
                {f.id === activeFileId && renamingId !== f.id && (
                  <button
                    className={styles.tabRename}
                    onClick={(e) => { e.stopPropagation(); startRename(f.id, f.name); }}
                    title="Rename file"
                  >
                    <Pencil size={9} />
                  </button>
                )}

                {/* Confirm rename */}
                {renamingId === f.id && (
                  <button
                    className={styles.tabRename}
                    onClick={(e) => { e.stopPropagation(); commitRename(); }}
                    title="Confirm rename"
                  >
                    <Check size={9} />
                  </button>
                )}

                {/* Close */}
                {files.length > 1 && renamingId !== f.id && (
                  <button
                    className={styles.tabClose}
                    onClick={(e) => { e.stopPropagation(); closeFile(f.id); }}
                    title="Close file"
                  >
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}

            <button className={styles.tabAdd} onClick={addFile} title="New file">
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className={styles.main}>

          {/* Editor */}
          <div className={styles.editorCol}>
            <EditorPanel
              language={activeFile?.language}
              code={activeFile?.code}
              onChange={updateCode}
            />
          </div>

          {/* Right Panel */}
          <div className={styles.rightCol}>

            {/* Terminal */}
            <div className={`${styles.terminalPane} ${showPreview ? styles.terminalHalf : styles.terminalFull}`}>
              <div className={styles.paneHeader}>
                <span className={styles.paneLabel}>Terminal</span>
                {isRunning && <span className={styles.runningDot} />}
              </div>
              <div className={styles.paneBody}>
                <Terminal
                  ref={terminalRef}
                  output={output}
                  isRunning={isRunning}
                  onRun={handleRun}
                />
              </div>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className={styles.previewPane}>
                <div className={styles.paneHeader}>
                  <span className={styles.paneLabel}>Live Preview</span>
                  <span className={styles.paneHint}>
                    {activeFile?.language === "html" ? "HTML" : "N/A for " + activeFile?.language}
                  </span>
                </div>
                <div className={styles.paneBody}>
                  <LivePreview files={files} activeFile={activeFile} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}