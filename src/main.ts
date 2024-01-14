import { appWindow } from "@tauri-apps/api/window";
import { dialog } from "@tauri-apps/api";
import { fs } from "@tauri-apps/api";

// ファイルパス
let filePath: string | null = null;
// 画面の要素
const editor = <HTMLTextAreaElement>document.querySelector("#editor")!;
const lineNumArea = <HTMLElement>document.querySelector("#line_number")!;
// フォントを設定
const style = getComputedStyle(editor);
lineNumArea.style.fontFamily = style.fontFamily;
lineNumArea.style.fontSize = style.fontSize;
// スクロールバーの高さ分のパディングを設定する
const scrollBarHeight = editor.offsetHeight - editor.clientHeight;
lineNumArea.style.paddingBottom = `${scrollBarHeight}px`;
lineNumArea.innerHTML = toHtml(editor.value);
editor.focus();
appWindow.setTitle("無題");
// ダイアログオプション
const dialogOption = {
  filters: [
    {
      extensions: ["txt"],
      name: "テキストファイル",
    },
    {
      extensions: ["*"],
      name: "全てのファイル",
    },
  ],
};
// イベントを設定
appWindow.listen("open", async () => {
  const result = await dialog.open(dialogOption);
  if (typeof result == "string") {
    filePath = result;
    editor.value = await fs.readTextFile(filePath);
    editor.selectionStart = editor.selectionEnd = 0;
    lineNumArea.scrollTop = editor.scrollTop;
    lineNumArea.innerHTML = toHtml(editor.value);
    appWindow.setTitle(filePath.replace(/^.*\\/, ""));
  }
});
appWindow.listen("save", async () => {
  if (filePath == null) {
    // 名前を付けて保存
    const result = await dialog.save(dialogOption);
    if (typeof result == "string") {
      filePath = result;
      await fs.writeTextFile(filePath, editor.value);
      appWindow.setTitle(filePath.replace(/^.*\\/, ""));
    }
  } else {
    // 上書き保存
    await fs.writeTextFile(filePath, editor.value);
  }
});
editor.addEventListener("scroll", () => {
  lineNumArea.scrollTop = editor.scrollTop;
});
editor.addEventListener("input", (e: Event) => {
  const content = (e.target as HTMLInputElement).value;
  lineNumArea.innerHTML = toHtml(content);
});

function toHtml(text: string): string {
  const lines = text.split("\n");
  return lines.map((_, idx) => `<div>${pad(idx + 1)}</div>`).join("");
}

function pad(num: number): string {
  return String(num).padStart(3).replace(/ /g, "&nbsp;");
}
