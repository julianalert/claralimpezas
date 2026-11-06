import { Spark } from "./icons";

/** "clara." wordmark with the mint spark. `variant` picks the nav or footer size. */
export function WordmarkText({ variant }: { variant: "nav" | "foot" }) {
  return (
    <span className={`wordmark wm-${variant}`}>
      clara.
      <Spark className="spark" />
    </span>
  );
}
