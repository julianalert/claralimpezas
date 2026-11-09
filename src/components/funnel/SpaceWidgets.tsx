"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import {
  acceptQuote,
  confirmPhotoUpload,
  deletePhoto,
  requestPhotoUpload,
  sendClientMessage,
  setChecklistItem,
  updatePreference,
} from "@/actions/client-space";
import type { FunnelDictionary } from "@/i18n/funnel";
import { fill } from "@/lib/funnel/format";
import { limits, todayInLisbon } from "@/lib/funnel/quiz";
import { checklistIds, slots, type ChecklistId, type LeadPhoto, type Slot } from "@/lib/funnel/types";
import { ArrowIcon, CameraIcon, CheckIcon, PrintIcon, SendIcon } from "../icons";

// Interactive parts of the client space. Each one calls a server action with the secret token
// from the URL; the page re-renders with fresh data when the action refreshes the router.

type Space = FunnelDictionary["space"];

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-outline btn-sm no-print" onClick={() => window.print()}>
      <PrintIcon />
      <span>{label}</span>
    </button>
  );
}

export function AcceptQuote({ token, t }: { token: string; t: Space["price"] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setFailed(false);
    startTransition(async () => {
      const result = await acceptQuote(token).catch(() => ({ ok: false }));
      if (result.ok) dialog.current?.close();
      else setFailed(true);
    });
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => dialog.current?.showModal()}>
        <CheckIcon />
        <span>{t.accept}</span>
      </button>
      <dialog
        ref={dialog}
        className="modal modal-sm"
        aria-labelledby="accept-title"
        onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
      >
        <div className="modal-body">
          <h2 id="accept-title">{t.confirmTitle}</h2>
          <p>{t.confirmText}</p>
          <p className={`status status-error${failed ? " show" : ""}`} role="alert">
            {failed ? t.error : null}
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => dialog.current?.close()}>
              {t.cancel}
            </button>
            <button type="button" className="btn btn-primary" disabled={pending} onClick={confirm}>
              {t.confirm}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function Checklist({
  token,
  initial,
  t,
}: {
  token: string;
  initial: ChecklistId[];
  t: Space["checklist"];
}) {
  const [checked, setChecked] = useState<ChecklistId[]>(initial);

  function toggle(id: ChecklistId, on: boolean) {
    setChecked((current) => (on ? [...current, id] : current.filter((item) => item !== id)));
    // Optimistic: put the box back if the server couldn't save it.
    setChecklistItem(token, id, on)
      .catch(() => ({ ok: false }))
      .then((result) => {
        if (!result.ok) setChecked((current) => (on ? current.filter((item) => item !== id) : [...current, id]));
      });
  }

  return (
    <>
      <div className="card-head">
        <h2>{t.title}</h2>
        <span className="tag">
          {checked.length} / {checklistIds.length}
        </span>
      </div>
      <div className="checks checks-col">
        {checklistIds.map((id) => (
          <label key={id} className="check">
            <input type="checkbox" checked={checked.includes(id)} onChange={(e) => toggle(id, e.target.checked)} />
            <span>{t.items[id]}</span>
          </label>
        ))}
      </div>
    </>
  );
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function Photos({
  token,
  photos,
  max,
  t,
}: {
  token: string;
  photos: LeadPhoto[];
  max: number;
  t: Space["photos"];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /** Sends one file straight to storage with a one-off URL, then attaches it to the request. */
  async function upload(file: File): Promise<"ok" | "type" | "max" | "error"> {
    if (!PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) return "type";
    const ticket = await requestPhotoUpload(token, { type: file.type, size: file.size });
    if (!ticket.ok) return ticket.reason;
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    const response = await fetch(ticket.url, { method: "PUT", body });
    if (!response.ok) return "error";
    const saved = await confirmPhotoUpload(token, ticket.path, file.name);
    return saved.ok ? "ok" : "error";
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of files) {
        const outcome = await upload(file).catch(() => "error" as const);
        if (outcome === "ok") continue;
        setError(
          outcome === "type" ? t.errors.type : outcome === "max" ? fill(t.errors.max, { max }) : t.errors.upload,
        );
        if (outcome === "max") break;
      }
      input.value = "";
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deletePhoto(token, id).catch(() => null);
    });
  }

  return (
    <>
      <div className="card-head">
        <h2>{t.title}</h2>
        <span className="tag">
          {photos.length} / {max}
        </span>
      </div>
      <p className="card-text">{t.text}</p>
      {photos.length > 0 && (
        <ul className="photos">
          {photos.map((photo) => (
            <li key={photo.id}>
              {/* Signed, short-lived URL from a private bucket: not something next/image can optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.name} loading="lazy" />
              <button type="button" className="photo-remove no-print" disabled={pending} onClick={() => remove(photo.id)}>
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      )}
      {photos.length < max && (
        <label className={`btn btn-outline btn-sm no-print${pending ? " is-busy" : ""}`}>
          <CameraIcon />
          <span>{pending ? t.uploading : t.add}</span>
          <input
            type="file"
            className="sr-only"
            accept={PHOTO_TYPES.join(",")}
            multiple
            disabled={pending}
            onChange={handleFiles}
          />
        </label>
      )}
      <p className="hint">{fill(t.hint, { max })}</p>
      <p className={`status status-error${error ? " show" : ""}`} role="alert">
        {error}
      </p>
    </>
  );
}

export function MessageForm({ token, t }: { token: string; t: Space["message"] }) {
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();
    if (!message) return;
    startTransition(async () => {
      const result = await sendClientMessage(token, message).catch(() => ({ ok: false }));
      setState(result.ok ? "sent" : "error");
      if (result.ok) form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="no-print">
      <h2>{t.title}</h2>
      <div className="field">
        <label htmlFor="space-message">{t.label}</label>
        <textarea id="space-message" name="message" required maxLength={limits.details} placeholder={t.placeholder} />
      </div>
      <button type="submit" className="btn btn-outline btn-sm" disabled={pending}>
        <SendIcon />
        <span>{pending ? t.sending : t.send}</span>
      </button>
      <p className={`status${state === "error" ? " status-error" : ""}${state !== "idle" ? " show" : ""}`} role="status">
        {state === "sent" ? t.sent : state === "error" ? t.error : null}
      </p>
    </form>
  );
}

export function PreferenceForm({
  token,
  initial,
  t,
  labels,
  slotLabels,
}: {
  token: string;
  initial: { date: string; slot: Slot; flexible: boolean };
  t: Space["schedule"];
  labels: { date: string; slot: string; flexible: string };
  slotLabels: Record<Slot, string>;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slot, setSlot] = useState<Slot>(initial.slot);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updatePreference(token, {
        date: String(data.get("date") ?? ""),
        slot,
        flexible: data.get("flexible") === "on",
      }).catch(() => ({ ok: false }));
      if (result.ok) {
        setSaved(true);
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <>
        <button type="button" className="link no-print" onClick={() => setOpen(true)}>
          <span>{t.change}</span>
          <ArrowIcon />
        </button>
        <p className={`status${saved ? " show" : ""}`} role="status">
          {saved ? t.saved : null}
        </p>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="fields fields-1 no-print">
      <div className="field">
        <label htmlFor="pref-date">{labels.date}</label>
        <input id="pref-date" name="date" type="date" min={todayInLisbon()} defaultValue={initial.date} />
      </div>
      <fieldset className="field">
        <legend>{labels.slot}</legend>
        <div className="pills">
          {slots.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={slot === option}
              className={slot === option ? "pill selected" : "pill"}
              onClick={() => setSlot(option)}
            >
              {slotLabels[option]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="check">
        <input type="checkbox" name="flexible" defaultChecked={initial.flexible} />
        <span>{labels.flexible}</span>
      </label>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {t.save}
      </button>
    </form>
  );
}
