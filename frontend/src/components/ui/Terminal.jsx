import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { CornerDownLeft, ChevronRight } from "lucide-react";
import styles from "./Terminal.module.css";

const Terminal = forwardRef(function Terminal({ output, isRunning, onRun }, ref) {
  const [stdin, setStdin]     = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef  = useRef(null);
  const inputRef   = useRef(null);

  // Expose focusOutput to parent
  useImperativeHandle(ref, () => ({
    focusOutput: () => outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight }),
  }));

  // Auto-scroll when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!stdin.trim() && !isRunning) return;
    setHistory((prev) => [stdin, ...prev].slice(0, 50));
    setHistIdx(-1);
    onRun(stdin);
    setStdin("");
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setStdin(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setStdin(next === -1 ? "" : history[next]);
    }
  }

  // Parse output into lines with type annotation
  const lines = output
    ? output.split("\n").map((line, i) => ({
        text: line,
        key: i,
        isError: /error|exception|traceback|fatal/i.test(line),
      }))
    : [];

  return (
    <div className={styles.terminal}>
      {/* Output area */}
      <div className={styles.output} ref={outputRef}>
        {lines.length === 0 && !isRunning && (
          <span className={styles.placeholder}>
            Run your code to see output...
          </span>
        )}
        {isRunning && lines.length === 0 && (
          <span className={styles.running}>Running...</span>
        )}
        {lines.map((line) => (
          <div
            key={line.key}
            className={`${styles.line} ${line.isError ? styles.lineError : ""}`}
          >
            {line.text || " "}
          </div>
        ))}
      </div>

      {/* Stdin input */}
      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <ChevronRight size={12} className={styles.prompt} />
        <input
          ref={inputRef}
          className={styles.stdinInput}
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="stdin / run with input..."
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          className={styles.runBtn}
          disabled={isRunning}
          title="Run (Enter)"
        >
          <CornerDownLeft size={12} />
        </button>
      </form>
    </div>
  );
});

export default Terminal;