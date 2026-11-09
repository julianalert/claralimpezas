// Inline stroke icons (24×24) and the Clara "spark" mark.
// Icons inherit `currentColor`; sizing comes from the `svg.i` rules in globals.css.
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export type IconComponent = () => ReactNode;

export const SPARK_PATH =
  "M20 0C23.6 13.4 26.6 16.4 40 20 26.6 23.6 23.6 26.6 20 40 16.4 26.6 13.4 23.6 0 20 13.4 16.4 16.4 13.4 20 0Z";

/** Four-point spark from the logo. Fill is set by CSS on the svg's class. */
export function Spark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d={SPARK_PATH} />
    </svg>
  );
}

export const ArrowIcon = () => (
  <Icon>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const MenuIcon = () => (
  <Icon>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

export const LockIcon = () => (
  <Icon>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icon>
);

/* trust bar */
export const CalendarCheckIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4" />
  </Icon>
);

export const ShieldCheckIcon = () => (
  <Icon>
    <path d="M12 2l8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-4Z" />
    <path d="m8.5 12 2.5 2.5 5-5" />
  </Icon>
);

export const BuildingIcon = () => (
  <Icon>
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4" />
  </Icon>
);

export const ClockIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const PinIcon = () => (
  <Icon>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

export const ChatIcon = () => (
  <Icon>
    <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1-5.2A8 8 0 1 1 21 12z" />
  </Icon>
);

/* services */
export const HouseIcon = () => (
  <Icon>
    <path d="m3 11 9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6" />
  </Icon>
);

export const OfficeIcon = () => (
  <Icon>
    <path d="M4 21V3h11v18M15 8h5v13M2 21h20M8 7h3M8 11h3M8 15h3M18 12h0M18 16h0" />
  </Icon>
);

export const RenovationIcon = () => (
  <Icon>
    <path d="M3 21h18M5 21V11l7-5 7 5v10" />
    <path d="M9 21v-5h6v5M14 3l1.5 1.5M18 4l-1 2M20 8h-2" />
  </Icon>
);

export const WindowIcon = () => (
  <Icon>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M12 3v18M4 12h16M15 6.5l2-1.5M15 9l3.5-2.5" />
  </Icon>
);

export const SofaIcon = () => (
  <Icon>
    <path d="M5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
    <path d="M3 18v-4a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4zM5 18v2M19 18v2" />
  </Icon>
);

export const KeyIcon = () => (
  <Icon>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.8 12.2 20 3M16 7l2.5 2.5M18.5 4.5 21 7" />
  </Icon>
);

/* why clara */
export const ChatLinesIcon = () => (
  <Icon>
    <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1-5.2A8 8 0 1 1 21 12z" />
    <path d="M8.5 12h7M8.5 9h4" />
  </Icon>
);

export const SearchCheckIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8 11l2 2 4-4" />
  </Icon>
);

export const HeartIcon = () => (
  <Icon>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  </Icon>
);

/* how it works */
export const PencilIcon = () => (
  <Icon>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </Icon>
);

export const DocumentIcon = () => (
  <Icon>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6M8 13h8M8 17h5" />
  </Icon>
);

export const SparklesIcon = () => (
  <Icon>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
  </Icon>
);

/* contact */
export const RoofIcon = () => (
  <Icon>
    <path d="m3 11 9-7 9 7M5 9.5V20h14V9.5" />
  </Icon>
);

export const RepeatIcon = () => (
  <Icon>
    <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
  </Icon>
);

/* quote funnel, client space, CRM */
export const ArrowLeftIcon = () => (
  <Icon>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

export const CameraIcon = () => (
  <Icon>
    <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);

export const SendIcon = () => (
  <Icon>
    <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </Icon>
);

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const BoardIcon = () => (
  <Icon>
    <rect x="3" y="4" width="5" height="16" rx="1.5" />
    <rect x="9.5" y="4" width="5" height="11" rx="1.5" />
    <rect x="16" y="4" width="5" height="7" rx="1.5" />
  </Icon>
);

export const BoltIcon = () => (
  <Icon>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Icon>
);

export const ListIcon = () => (
  <Icon>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </Icon>
);

export const LogoutIcon = () => (
  <Icon>
    <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />
  </Icon>
);

export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);

export const PhoneIcon = () => (
  <Icon>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </Icon>
);

export const ExternalIcon = () => (
  <Icon>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);

export const PrintIcon = () => (
  <Icon>
    <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
    <rect x="7" y="14" width="10" height="6" rx="1" />
  </Icon>
);
