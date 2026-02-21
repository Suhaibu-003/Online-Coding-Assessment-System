import Editor from "@monaco-editor/react";

export default function CodeEditor({ language, code, setCode }) {
  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div style={{ borderRadius: "8px", overflow: "hidden" }}>
      <Editor
        height="450px"
        language={language === "cpp" ? "cpp" : language}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
          formatOnType: true,
          formatOnPaste: true
        }}
      />
    </div>
  );
}