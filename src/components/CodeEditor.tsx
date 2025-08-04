import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: string;
}

export const CodeEditor = ({ value, onChange, language, theme }: CodeEditorProps) => {
  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || "");
  };

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        language={language}
        value={value}
        theme={theme}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          renderWhitespace: "selection",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 17,
            horizontalScrollbarSize: 17,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
};