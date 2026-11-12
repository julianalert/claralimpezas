import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { SPARK_PATH } from "../icons";

/**
 * A small schematic map of Lisbon: the north bank of the Tagus, a few well-known neighbourhoods
 * and Clara's base, all placed from real coordinates. The neighbourhoods light up outwards from
 * the base when the map comes on screen (`in-view`, set by PageMotion).
 */

// Area shown: about 13 km × 13 km around the city.
const WEST = -9.235;
const NORTH = 38.8;
const PX_PER_KM = 40;
const KM_PER_DEG_LON = 86.9; // at Lisbon's latitude
const KM_PER_DEG_LAT = 111;
const WIDTH = 521;
const HEIGHT = 511;

const project = (lat: number, lon: number) => ({
  x: Math.round((lon - WEST) * KM_PER_DEG_LON * PX_PER_KM),
  y: Math.round((NORTH - lat) * KM_PER_DEG_LAT * PX_PER_KM),
});

/** [name, latitude, longitude, where the label goes relative to the dot]. */
const places: [string, number, number, "top" | "left" | "right" | "below-left"][] = [
  ["Arroios", 38.728, -9.137, "right"],
  ["Avenidas Novas", 38.738, -9.15, "left"],
  ["Campolide", 38.73, -9.167, "left"],
  ["Lumiar", 38.77, -9.16, "top"],
  ["Olivais", 38.77, -9.117, "top"],
  ["Alfama", 38.712, -9.13, "right"],
  ["Chiado", 38.7105, -9.1425, "left"],
  ["Campo de Ourique", 38.718, -9.168, "left"],
  ["Benfica", 38.75, -9.2, "top"],
  ["Alcântara", 38.706, -9.176, "top"],
  ["Parque das Nações", 38.768, -9.094, "below-left"],
  ["Belém", 38.6975, -9.2064, "top"],
];

// North bank of the Tagus, west to east, then up the estuary.
const shore: [number, number][] = [
  [38.6935, -9.235], [38.6945, -9.215], [38.6955, -9.2], [38.6985, -9.185], [38.7015, -9.17],
  [38.7045, -9.155], [38.706, -9.145], [38.7075, -9.136], [38.71, -9.124], [38.717, -9.115],
  [38.728, -9.105], [38.745, -9.097], [38.762, -9.091], [38.78, -9.088], [38.8, -9.087],
];

const label = {
  top: { dx: 0, dy: -11, anchor: "middle" },
  left: { dx: -10, dy: 4, anchor: "end" },
  right: { dx: 10, dy: 4, anchor: "start" },
  "below-left": { dx: -2, dy: 20, anchor: "end" },
} as const;

export function LisbonMap({ title, river }: { title: string; river: string }) {
  const { latitude, longitude } = siteConfig.business.geo;
  const base = project(latitude, longitude);
  const water =
    shore.map(([lat, lon], i) => `${i ? "L" : "M"}${project(lat, lon).x} ${project(lat, lon).y}`).join(" ") +
    ` L${WIDTH} 0 L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`;
  // Light up in order of distance from the base.
  const dots = places
    .map(([name, lat, lon, side]) => ({ name, side, ...project(lat, lon) }))
    .sort((a, b) => Math.hypot(a.x - base.x, a.y - base.y) - Math.hypot(b.x - base.x, b.y - base.y));

  return (
    <div className="map" data-inview>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title}>
        <path className="map-water" d={water} />
        <text className="map-river" x={WIDTH - 86} y={HEIGHT - 42}>
          {river}
        </text>
        {[1, 2, 3].map((ring) => (
          <circle className="map-ring" key={ring} cx={base.x} cy={base.y} r={ring * 62} />
        ))}
        {dots.map(({ name, side, x, y }, i) => (
          <g className="map-dot" key={name} style={{ "--d": i + 1 } as CSSProperties}>
            <circle className="map-halo" cx={x} cy={y} r="10" />
            <circle cx={x} cy={y} r="4" />
            <text x={x + label[side].dx} y={y + label[side].dy} textAnchor={label[side].anchor}>
              {name}
            </text>
          </g>
        ))}
        <g className="map-base">
          <circle className="map-pulse" cx={base.x} cy={base.y} r="16" />
          <path d={SPARK_PATH} transform={`translate(${base.x - 13} ${base.y - 13}) scale(0.65)`} />
          <text x={base.x + 20} y={base.y + 5}>
            {siteConfig.name}
          </text>
        </g>
      </svg>
    </div>
  );
}
