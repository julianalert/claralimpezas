import { Fragment } from "react";

/** Renders an array of strings as lines separated by <br />. */
export function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}
