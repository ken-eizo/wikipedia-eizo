"use client";
import { useRef } from "react";

export default function CustomEditor({ content, onChange }) {
  const editorRef = useRef(null);

  // 選択テキストを装飾する関数
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // リンクを追加
  const addLink = () => {
    const url = prompt("リンクURLを入力してください:");
    if (url) formatText("createLink", url);
  };

  // HTML出力を取得
  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="p-4 border rounded-lg">
      {/* コントロールボタン */}
      <div className="mb-4 space-x-2">
        <button onClick={() => formatText("bold")} className="btn">太字</button>
        <button onClick={() => formatText("italic")} className="btn">斜体</button>
        <button onClick={() => formatText("underline")} className="btn">下線</button>
        <button onClick={addLink} className="btn">リンク</button>
      </div>

      {/* エディター本体 */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] border p-2 rounded"
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
