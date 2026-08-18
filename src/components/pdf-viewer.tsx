import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  src: string;
  title: string;
};

export function PdfViewer({ src, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1.15);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const docRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setReady(false);
    setPage(1);
    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const response = await fetch(src, { credentials: "include" });
        if (!response.ok) throw new Error("Could not open this document");
        const data = await response.arrayBuffer();
        const doc = await pdfjs.getDocument({ data, disableRange: true, disableStream: true }).promise;
        if (cancelled) {
          void doc.destroy();
          return;
        }
        docRef.current = doc;
        setPages(doc.numPages);
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not open this document");
      }
    })();
    return () => {
      cancelled = true;
      void docRef.current?.destroy();
      docRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || !ready) return;
    let cancelled = false;
    void (async () => {
      const pdfPage = await doc.getPage(page);
      if (cancelled) return;
      const viewport = pdfPage.getViewport({ scale: zoom });
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pdfPage.render({ canvasContext: context, viewport }).promise;
    })();
    return () => {
      cancelled = true;
    };
  }, [page, zoom, ready, src]);

  if (error) {
    return (
      <div className="grid h-[70vh] place-items-center rounded-xl border border-line bg-elevated text-sm text-muted">
        {error}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-[#5c574e]"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="flex items-center justify-between gap-2 bg-header px-3 py-2 text-on-header">
        <p className="truncate text-xs font-medium">{title} · view only</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-on-header"
            disabled={page <= 1}
            onClick={() => setPage((n) => Math.max(1, n - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center text-xs tabular-nums">
            {pages ? `${page} / ${pages}` : "…"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-on-header"
            disabled={page >= pages}
            onClick={() => setPage((n) => Math.min(pages, n + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-on-header"
            onClick={() => setZoom((n) => Math.max(0.7, n - 0.15))}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-on-header"
            onClick={() => setZoom((n) => Math.min(2.2, n + 0.15))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div className="max-h-[75vh] overflow-auto">
        <canvas ref={canvasRef} className="mx-auto block max-w-full select-none" />
      </div>
    </div>
  );
}
