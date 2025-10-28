import { useEffect, useState } from "react";

export const useResponsiveScale = (
  rowHeight: number,
  gridGap: number,
  numCols: number,
  gridPadding: number
) => {
  const [bgScale, setBgScale] = useState(() => {
    const colWidth =
      (window.innerWidth - gridGap * numCols - gridPadding * 2) / numCols;
    return rowHeight / colWidth;
  });

  useEffect(() => {
    const handleResize = () => {
      const colWidth =
        (window.innerWidth - gridGap * numCols - gridPadding * 2) / numCols;
      setBgScale(rowHeight / colWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rowHeight, gridGap, numCols, gridPadding]);

  return bgScale;
};
