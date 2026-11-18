import type { Announcement } from "../hooks/useAnnouncer";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";

export function LiveRegion({ announcement }: { announcement: Announcement }) {
  return (
    <VisuallyHidden>
      <span role="status" aria-live="polite" aria-atomic="true">
        <span key={announcement.id}>{announcement.text}</span>
      </span>
    </VisuallyHidden>
  );
}
