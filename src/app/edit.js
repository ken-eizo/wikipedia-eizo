import { useState } from "react";
import CustomEditor from "@/components/CustomEditor";

export default function EditPage() {
  const [content, setContent] = useState("<p>ここに入力してください。</p>");

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Wikipedia風編集モード</h1>
      <CustomEditor content={content} onChange={setContent} />

      <h2 className="mt-8 text-xl font-semibold">出力プレビュー</h2>
      <div dangerouslySetInnerHTML={{ __html: content }} className="p-4 border rounded" />
    </div>
  );
}
