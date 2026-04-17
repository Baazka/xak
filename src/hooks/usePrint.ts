"use client";

import { useCallback } from "react";

export type PrintMode = "portrait" | "landscape";

type UsePrintOptions = {
  targetId?: string;
  portraitMargin?: string;
  landscapeMargin?: string;
  styleElementId?: string;
  cleanupAfterPrint?: boolean;
};

export function usePrint({
  targetId = "print-area",
  portraitMargin = "20mm 15mm 20mm 30mm",
  landscapeMargin = "30mm 20mm 15mm 20mm",
  styleElementId = "dynamic-print-page-style",
  cleanupAfterPrint = true,
}: UsePrintOptions = {}) {
  const removeDynamicStyle = useCallback(() => {
    const oldStyle = document.getElementById(styleElementId);
    if (oldStyle) oldStyle.remove();
  }, [styleElementId]);

  const handlePrint = useCallback(
    (mode: PrintMode = "portrait") => {
      const target = document.getElementById(targetId);

      if (!target) {
        console.error(`Print target not found: #${targetId}`);
        return;
      }

      removeDynamicStyle();

      const style = document.createElement("style");
      style.id = styleElementId;
      style.innerHTML =
        mode === "portrait"
          ? `
            @media print {
              @page {
                size: A4 portrait;
                margin: ${portraitMargin};
              }
            }
          `
          : `
            @media print {
              @page {
                size: A4 landscape;
                margin: ${landscapeMargin};
              }
            }
          `;

      document.head.appendChild(style);

      const onAfterPrint = () => {
        if (cleanupAfterPrint) {
          removeDynamicStyle();
        }
        window.removeEventListener("afterprint", onAfterPrint);
      };

      window.addEventListener("afterprint", onAfterPrint);

      setTimeout(() => {
        window.print();
      }, 100);
    },
    [
      targetId,
      styleElementId,
      portraitMargin,
      landscapeMargin,
      cleanupAfterPrint,
      removeDynamicStyle,
    ]
  );

  return { handlePrint };
}
