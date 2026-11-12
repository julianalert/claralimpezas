"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import type { ServiceId } from "@/lib/services";
import { ArrowIcon } from "../icons";

/** The examples, in tab order. Photos: public/images/compare/<id>-before.jpg and -after.jpg. */
const examples = ["domestica", "posobra", "estofos"] as const satisfies readonly ServiceId[];

/** Where the handle goes to show that it can be dragged, the first time the section is seen (%). */
const HINT = [50, 66, 36, 50];
const HINT_MS = 1700;

/**
 * Before/after comparison: one large photo with a handle to drag (mouse, finger, or arrow keys
 * through the visually hidden range input), and a tab per example. The "before" photo sits on
 * top of the "after" one and is clipped at the handle (`--pos`).
 */
export function BeforeAfter({
  t,
  services,
  link,
  quoteHref,
}: {
  t: Dictionary["compare"];
  services: Dictionary["services"]["items"];
  link: string;
  quoteHref: string;
}) {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);
  const stageRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const id = examples[active];

  // First time the comparison is on screen, sweep the handle once, unless it has been used.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const started = performance.now();
        const legs = HINT.length - 1;
        const play = (now: number) => {
          if (touched.current) return;
          // (the frame timestamp can be a hair earlier than `started`, hence the lower bound)
          const at = Math.min(Math.max((now - started) / HINT_MS, 0), 1) * legs;
          const leg = Math.min(Math.floor(at), legs - 1);
          const local = at - leg;
          const eased = local < 0.5 ? 2 * local * local : 1 - (-2 * local + 2) ** 2 / 2;
          setPos(HINT[leg] + (HINT[leg + 1] - HINT[leg]) * eased);
          if (at < legs) raf = requestAnimationFrame(play);
        };
        raf = requestAnimationFrame(play);
      },
      { threshold: 0.6 },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    touched.current = true;
    setPos(Math.min(Math.max(((event.clientX - box.left) / box.width) * 100, 0), 100));
  };

  return (
    <section className="sect sect-surface" id="antes-depois">
      <div className="wrap">
        <div className="sect-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="h2">{t.title}</h2>
            <p className="lead">{t.description}</p>
          </div>
          <div className="pills" role="tablist" aria-label={t.tabs}>
            {examples.map((example, i) => (
              <button
                key={example}
                type="button"
                role="tab"
                id={`ba-tab-${example}`}
                aria-selected={i === active}
                aria-controls="ba-stage"
                className={i === active ? "pill selected" : "pill"}
                onClick={() => setActive(i)}
              >
                {services[example].name}
              </button>
            ))}
          </div>
        </div>

        <div
          className="ba-stage"
          id="ba-stage"
          role="tabpanel"
          aria-labelledby={`ba-tab-${id}`}
          ref={stageRef}
          style={{ "--pos": `${pos}%` } as CSSProperties}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            moveTo(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event);
          }}
        >
          {examples.map((example, i) => (
            <div className={i === active ? "ba-pair on" : "ba-pair"} key={example} aria-hidden={i !== active}>
              <Image
                src={`/images/compare/${example}-after.jpg`}
                alt={`${services[example].name} — ${t.after}`}
                fill
                quality={90}
                sizes="(max-width: 767px) 100vw, 1200px"
                draggable={false}
              />
              <div className="ba-before">
                <Image
                  src={`/images/compare/${example}-before.jpg`}
                  alt={`${services[example].name} — ${t.before}`}
                  fill
                  quality={90}
                  sizes="(max-width: 767px) 100vw, 1200px"
                  draggable={false}
                />
              </div>
            </div>
          ))}
          <span className={pos > 14 ? "ba-tag" : "ba-tag off"}>{t.before}</span>
          <span className={pos < 86 ? "ba-tag ba-tag-after" : "ba-tag ba-tag-after off"}>{t.after}</span>
          <input
            className="ba-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(pos)}
            aria-label={t.drag}
            onChange={(event) => {
              touched.current = true;
              setPos(Number(event.target.value));
            }}
          />
          <div className="ba-handle" aria-hidden="true">
            <span>
              <svg viewBox="0 0 24 24" className="i">
                <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
              </svg>
            </span>
          </div>
        </div>

        <div className="ba-foot">
          <div>
            <h3>{services[id].name}</h3>
            <p>{t.items[id]}</p>
          </div>
          {/* Opens the quiz with this service already chosen */}
          <Link className="link" href={`${quoteHref}?service=${id}`}>
            <span>{link}</span>
            <ArrowIcon />
          </Link>
        </div>
        <p className="ba-note">{t.note}</p>
      </div>
    </section>
  );
}
