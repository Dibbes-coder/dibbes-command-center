"use client";

export default function DownloadButton({ value, filename, label = "Save .txt" }: { value: string; filename: string; label?: string }) {
  function download() {
    if (!value) return;

    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className="mini-button border border-ivory/10 bg-black/20">
      {label}
    </button>
  );
}
