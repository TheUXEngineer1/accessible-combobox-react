import { useCallback, useState } from "react";

export interface Announcement {
  text: string;
  id: number;
}

/**
 * Each announcement gets a new id. Rendering it with the id as a key replaces
 * the live region's content, so repeating the same text is announced again.
 */
export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState<Announcement>({
    text: "",
    id: 0,
  });

  const announce = useCallback((text: string) => {
    setAnnouncement((previous) => ({ text, id: previous.id + 1 }));
  }, []);

  return { announcement, announce };
}
