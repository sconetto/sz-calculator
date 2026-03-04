import { useState, useEffect } from "react";

/**
 * Custom hook to dynamically manage the scaling of the calculator display font.
 * This ensures that large numbers fit entirely within the display area by
 * reducing the font size scale as the character count increases.
 *
 * @param display The current string value shown on the calculator display.
 * @returns The scale factor to apply to the font size (e.g., 1 for normal, 0.6 for small).
 */
export const useDisplayScaling = (display: string) => {
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    const len = display.length;
    // As the number of digits increases, we reduce the scale factor
    // to keep as many digits visible as possible.
    if (len > 12) {
      setDisplayScale(0.6);
    } else if (len > 10) {
      setDisplayScale(0.7);
    } else if (len > 8) {
      setDisplayScale(0.85);
    } else {
      setDisplayScale(1);
    }
  }, [display]);

  return displayScale;
};
