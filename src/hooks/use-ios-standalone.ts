import { useState, useEffect } from 'react';

/**
 * Returns true if the app is running in iOS standalone mode (installed as a PWA).
 * 
 * This check relies on the non-standard `window.navigator.standalone` property.
 * This is the only reliable iOS installed-PWA detection method because standard 
 * APIs like `matchMedia('(display-mode: standalone)')` can sometimes be flaky 
 * on iOS Safari or return false in certain navigation states.
 */
export function useIosStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone = (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    }
  }, []);

  return isStandalone;
}
