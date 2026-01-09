import Editor from '@monaco-editor/react';

export default function EditorPanel({ language, code, onChange }) {
  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={onChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 10 }
      }}
    />
  );
}